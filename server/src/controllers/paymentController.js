import { mpPreference } from "../config/mercadoPago.js";
import { pool } from "../config/db.js";

// 🧩 CONTROLADOR 1: CREAR UNA PREFERENCIA DE PAGO EN MERCADO PAGO
export const createPreference = async (req, res) => {
  try {
    // Extraemos los datos que vienen del frontend
    const { title, quantity, price, userId, tipo_plan } = req.body;

    console.log("📦 Datos recibidos del frontend:", req.body);

    // Estructura del cuerpo que pide Mercado Pago
    const body = {
      items: [
        {
          title,                          // título del producto o plan
          quantity: Number(quantity),     // cantidad
          unit_price: Number(price),      // precio por unidad
          currency_id: "ARS",             // moneda (pesos argentinos)
        },
      ],
      back_urls: {                       // URLs a donde redirige después del pago
        success: "http://localhost:3001/membership",
        failure: "http://localhost:3001/membership",
        pending: "http://localhost:3001/membership",
      },
      // URL donde Mercado Pago enviará la notificación del pago (webhook)
      notification_url: "https://nonnutritious-nonremedially-kylah.ngrok-free.dev/api/payments/webhook",
      
      // Metadata: info adicional que se envía junto con la preferencia
      metadata: { userId, tipo_plan },
    };

    // Creamos la preferencia en Mercado Pago
    const result = await mpPreference.create({ body });

    // Guardamos el pago en la base de datos como "pendiente"
    await pool.query(
      `INSERT INTO pago (valor, fecha_pago, descuento, tipo_plan, estado, id_preference, id_usuario)
       VALUES (?, NOW(), ?, ?, ?, ?, ?)`,
      [price, 0, tipo_plan, "pendiente", result.id, userId]
    );

    // Devolvemos al frontend el ID de la preferencia
    res.json({ preferenceId: result.id });
  } catch (error) {
    console.error("❌ Error creando preferencia:", error);
    res.status(500).json({ error: "Error al crear la preferencia" });
  }
};

// 🧩 CONTROLADOR 2: WEBHOOK QUE RECIBE NOTIFICACIONES DE MERCADO PAGO
export const paymentWebhook = async (req, res) => {
  try {
    console.log("📨 Webhook recibido:", req.body, req.query);

    // Mercado Pago puede mandar los datos por query o por body
    const topic = req.query.topic || req.body.topic;
    const id = req.query.id || req.body.data?.id || req.body.id;

    if (!topic || !id) {
      console.log("⚠️ Webhook sin datos válidos");
      return res.sendStatus(200); // Respondemos igual para que MP no reintente
    }

    // 🔹 Caso 1: Si el webhook es de tipo "payment" (pago directo)
    if (topic === "payment") {
      // Pedimos los detalles del pago a la API de MP
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
        headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
      });
      const paymentData = await response.json();
      await processPayment(paymentData); // Procesamos el pago
    }

    // 🔹 Caso 2: Si el webhook es de tipo "merchant_order"
    else if (topic === "merchant_order") {
      // Pedimos los detalles de la orden a la API de MP
      const response = await fetch(`https://api.mercadopago.com/merchant_orders/${id}`, {
        headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
      });
      const orderData = await response.json();

      // Si la orden tiene pagos asociados
      if (orderData.payments && orderData.payments.length > 0) {
        // Recorremos todos los pagos asociados
        for (const pay of orderData.payments) {
          const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${pay.id}`, {
            headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
          });
          const paymentData = await paymentResponse.json();

          // Aseguramos que haya metadata y preference_id (fallback)
          paymentData.preference_id = paymentData.preference_id || orderData.preference_id;
          paymentData.metadata = paymentData.metadata || orderData.metadata;

          // Procesamos cada pago
          await processPayment(paymentData);
        }
      } else {
        console.log("⚠️ Merchant order sin pagos asociados todavía");
      }
    }

    // Respondemos OK a Mercado Pago (si no, reintenta)
    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Error en webhook:", error);
    res.sendStatus(500);
  }
};

// 🔧 FUNCIÓN AUXILIAR: PROCESA EL PAGO Y ACTUALIZA LA BASE DE DATOS
async function processPayment(paymentData) {
  // Verificamos que el objeto sea válido
  if (!paymentData || typeof paymentData !== "object") {
    console.log("⚠️ paymentData inválido:", paymentData);
    return;
  }

  // Extraemos datos importantes del pago
  const { status, metadata = {}, preference_id } = paymentData;

  console.log("💳 Procesando pago:", {
    status,
    preference_id,
    metadata,
  });

  // Si no tiene preference_id, no podemos asociarlo a la base
  if (!preference_id) {
    console.log("⚠️ Pago sin preference_id, se omite");
    return;
  }

  // Convertimos el estado de MP a uno entendible para nosotros
  let estadoPago = "pendiente"; // valor por defecto

  switch (status) {
    case "approved":
      estadoPago = "aprobado";
      break;
    case "rejected":
      estadoPago = "rechazado";
      break;
    case "in_process":
      estadoPago = "en proceso";
      break;
    case "pending":
      estadoPago = "pendiente";
      break;
    default:
      console.log("⚠️ Estado desconocido recibido:", status);
      break;
  }

  try {
    // 🔹 Actualizamos el estado del pago en la base de datos
    const [updateResult] = await pool.query(
      `UPDATE pago SET estado = ? WHERE id_preference = ?`,
      [estadoPago, preference_id]
    );

    if (updateResult.affectedRows === 0) {
      console.warn("⚠️ No se encontró pago con esa preferencia:", preference_id);
      return;
    }

    console.log("📦 Estado del pago actualizado en la base:", estadoPago);

    // 🔹 Si el pago fue aprobado, creamos la membresía del usuario
    const userId = metadata.userId || metadata.user_id;
    const tipoPlan = metadata.tipo_plan || metadata.tipoPlan;

    if (estadoPago === "aprobado" && userId) {
      console.log("✅ Pago aprobado para usuario:", userId);

      // Buscamos el ID del pago en la base
      const [pago] = await pool.query(
        `SELECT id_pago FROM pago WHERE id_preference = ?`,
        [preference_id]
      );

      if (pago.length === 0) {
        console.warn("⚠️ No se encontró el pago asociado a la preferencia:", preference_id);
        return;
      }

      // Verificamos si ya existe una membresía con ese pago
      const [existing] = await pool.query(
        `SELECT * FROM membresia WHERE id_pago = ?`,
        [pago[0].id_pago]
      );

      if (existing.length > 0) {
        console.log("ℹ️ Membresía ya existente para este pago:", pago[0].id_pago);
        return;
      }
      console.log('------------------------------------------------------')
      console.log(tipoPlan);
      // 🔹 Creamos una nueva membresía por 1 mes
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
