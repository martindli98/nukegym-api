import { mpPreference } from "../config/mercadoPago.js";
import { pool } from "../config/db.js";

export const createPreference = async (req, res) => {
  try {
    const { title, quantity, price, userId, tipo_plan } = req.body;

    console.log("📦 Datos recibidos del frontend:", req.body);

    const body = {
      items: [
        {
          title,
          quantity: Number(quantity),
          unit_price: Number(price),
          currency_id: "ARS",
        },
      ],
      back_urls: {
        success: "http://localhost:3001/membership",
        failure: "http://localhost:3001/membership",
        pending: "http://localhost:3001/membership",
      },
      // ⚠️ Sin auto_return en modo local
      notification_url: "https://unpoignantly-unretrogressive-dong.ngrok-free.dev/api/payments/webhook", // <-- acá llega MP
      metadata: { userId, tipo_plan },
    };

    const result = await mpPreference.create({ body });

    // Guardar el pago en la base (en estado "pendiente")
    await pool.query(
      `INSERT INTO pago (valor, fecha_pago, descuento, tipo_plan, estado, id_preference, id_usuario)
       VALUES (?, NOW(), ?, ?, ?, ?, ?)`,
      [price, 0, tipo_plan, "pendiente", result.id, userId]
    );

    res.json({ preferenceId: result.id });
  } catch (error) {
    console.error("❌ Error creando preferencia:", error);
    res.status(500).json({ error: "Error al crear la preferencia" });
  }
};

export const paymentWebhook = async (req, res) => {
  try {
    console.log("📨 Webhook recibido:", req.body, req.query);

    // Si Mercado Pago manda con ?topic=merchant_order en query params
    const topic = req.query.topic || req.body.topic;
    const id = req.query.id || req.body.data?.id || req.body.id;

    if (!topic || !id) {
      console.log("⚠️ Webhook sin datos válidos");
      return res.sendStatus(200);
    }

    // 🔹 Caso 1: notificación de pago directo
    if (topic === "payment") {
      
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
        headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
      });
      const paymentData = await response.json();
      await processPayment(paymentData);
    }

    // 🔹 Caso 2: notificación de merchant_order
else if (topic === "merchant_order") {
  const response = await fetch(`https://api.mercadopago.com/merchant_orders/${id}`, {
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
  });
  const orderData = await response.json();

  if (orderData.payments && orderData.payments.length > 0) {
    for (const pay of orderData.payments) {
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${pay.id}`, {
        headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
      });
      const paymentData = await paymentResponse.json();

      // 🔹 Agregar fallback de datos
      paymentData.preference_id = paymentData.preference_id || orderData.preference_id;
      paymentData.metadata = paymentData.metadata || orderData.metadata;

      await processPayment(paymentData);
    }
  } else {
    console.log("⚠️ Merchant order sin pagos asociados todavía");
  }
}


    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Error en webhook:", error);
    res.sendStatus(500);
  }
};
// 🔧 Función auxiliar para procesar el pago y actualizar la BD
async function processPayment(paymentData) {
  if (!paymentData || typeof paymentData !== "object") {
    console.log("⚠️ paymentData inválido:", paymentData);
    return;
  }

  const { status, metadata = {}, preference_id } = paymentData;

  console.log("💳 Procesando pago:", { status, preference_id, metadata });

  if (!preference_id) {
    console.log("⚠️ Pago sin preference_id, se omite");
    return;
  }

  try {
    // 🔹 Actualizar el estado del pago en la base
    await pool.query(
      `UPDATE pago SET estado = ? WHERE id_preference = ?`,
      [status, preference_id]
    );

    console.log("📦 Estado del pago actualizado en la base:", status);

    // 🔹 Verificar si el pago fue aprobado y hay datos de usuario
    const userId = metadata.userId || metadata.user_id;
    const tipoPlan = metadata.tipo_plan;

    if (status === "approved" && userId) {
      console.log("✅ Pago aprobado para usuario:", userId);

      const [pago] = await pool.query(
        `SELECT id_pago FROM pago WHERE id_preference = ?`,
        [preference_id]
      );

      if (pago.length === 0) {
        console.warn("⚠️ No se encontró el pago asociado a la preferencia:", preference_id);
        return;
      }

      // 🔹 Evitar crear membresías duplicadas
      const [existing] = await pool.query(
        `SELECT * FROM membresia WHERE id_pago = ?`,
        [pago[0].id_pago]
      );

      if (existing.length > 0) {
        console.log("ℹ️ Membresía ya existente para este pago:", pago[0].id_pago);
        return;
      }

      // 🔹 Crear la membresía
      await pool.query(
        `INSERT INTO membresia (id_usuario, id_pago, fechaInicio, fechaFin, tipo, estado)
         VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 MONTH), ?, 'activo')`,
        [userId, pago[0].id_pago, tipoPlan]
      );

      console.log("🎉 Membresía creada para el usuario:", userId);
    } else {
      console.log("ℹ️ El pago no fue aprobado o falta metadata del usuario");
    }
  } catch (error) {
    console.error("❌ Error procesando el pago:", error);
  }
}
