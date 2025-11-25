import { pool } from "../config/db.js";

export const getMembership = async (req, res) => {
  try {
    const userId = req.user.id;

    // Obtener rol
    const [roleRows] = await pool.query(
      "SELECT id_rol FROM Usuario WHERE id = ?",
      [userId]
    );

    if (roleRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    const role = roleRows[0].id_rol;

    // Admins y entrenadores SIEMPRE tienen acceso
    if (role === 1 || role === 3) {
      return res.json({
        success: true,
        membershipActive: true,
        message: "Acceso permitido por rol (admin/entrenador)",
        data: { tipo: 3 },
      });
    }

    // === CLIENTE: requiere membresía ===
    const [rows] = await pool.query(
      `SELECT id, fechaInicio, fechaFin, tipo, estado
       FROM Membresia
       WHERE id_usuario = ?
       ORDER BY id DESC
       LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.json({
        success: true,
        membershipActive: false,
        message: "El usuario no tiene membresía registrada",
      });
    }

    const membership = rows[0];

    const today = new Date();
    const inicio = new Date(membership.fechaInicio);
    const fin = new Date(membership.fechaFin);

    const isActive =
      membership.estado === "activo" && inicio <= today && fin >= today;

    return res.json({
      success: true,
      membershipActive: isActive,
      data: membership,
    });
  } catch (error) {
    console.error("❌ Error en getMembership:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener la membresía",
    });
  }
};

export const getMembershipList = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
            m.id,
            m.fechaInicio,
            m.fechaFin,
            m.tipo,
            m.estado,
            u.nombre AS nombre,
            u.apellido AS apellido,
            u.email AS emailUsuario
        FROM Membresia AS m
        JOIN Usuario AS u ON m.id_usuario = u.id
        ORDER BY id DESC`
    );

    if (rows.length === 0) {
      return res.json({
        success: true,
        membershipList: [],
        message: "No hay membresías registradas",
      });
    }

    return res.json({
      success: true,
      membershipList: rows,
    });
  } catch (error) {
    console.error("❌ Error en getMembershipList:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener la lista de membresías",
    });
  }
};

export const getPlans = async (req, res) => {
  try {
    console.log("entra a getplanssssssssssssssssssssssssssss");
    const [rows] = await pool.query(
      `SELECT id, nombre, descripcion, precio
        FROM Planes`
    );

    if (rows.length === 0) {
      return res.json({
        success: true,
        plansList: [],
        message: "No hay planes registrados",
      });
    }

    return res.json({
      success: true,
      plansList: rows,
    });
  } catch (error) {
    console.error("❌ Error en getMembershipList:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener la lista de planes",
    });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio } = req.body;

    await pool.query(
      `UPDATE Planes SET nombre = ?, descripcion = ?, precio = ? WHERE id = ?`,
      [nombre, descripcion, precio, id]
    );

    return res.json({
      success: true,
      message: "Plan actualizado correctamente",
    });
  } catch (error) {
    console.error("❌ Error en updatePlan:", error);
    return res.status(500).json({
      success: false,
      message: "Error al actualizar el plan",
    });
  }
};
