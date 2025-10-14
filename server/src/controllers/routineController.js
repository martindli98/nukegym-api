import { pool } from "../config/db.js";

// Obtener la rutina más reciente asignada a un usuario
export const getRoutineByUser = async (req, res) => {
  try {
    const userId = req.user.id; // ID del usuario autenticado

    // 1️⃣ Obtener la rutina más reciente del usuario
    const [routineRows] = await pool.query(
      `SELECT id, fecha, objetivo
       FROM rutina
       WHERE id_usuario = ?
       ORDER BY fecha DESC
       LIMIT 1`,
      [userId]
    );

    if (routineRows.length === 0) {
      return res.json({
        success: true,
        routineExists: false,
        message: "El usuario no tiene una rutina asignada",
      });
    }

    const routine = routineRows[0];

    // 2️⃣ Obtener los ejercicios asociados a esa rutina
    const [exerciseRows] = await pool.query(
      `SELECT e.id, e.nombre, e.url_media, e.descripcion
       FROM rutina_ejercicio re
       INNER JOIN ejercicio e ON re.id_ejercicio = e.id
       WHERE re.id_rutina = ?`,
      [routine.id]
    );

    // 3️⃣ Respuesta completa
    return res.json({
      success: true,
      routineExists: true,
      data: {
        id: routine.id,
        fecha: routine.fecha,
        objetivo: routine.objetivo,
        id_usuario: userId,
        ejercicios: exerciseRows,
      },
    });
  } catch (error) {
    console.error("❌ Error en getRoutineByUser:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener la rutina del usuario",
    });
  }
};
