// import { pool } from "../config/db.js";

// // Obtener la rutina más reciente asignada a un usuario
// export const getRoutineByUser = async (req, res) => {
//   try {
//     const userId = req.user.id; // ID del usuario autenticado

//     // 1️⃣ Obtener la rutina más reciente del usuario
//     const [routineRows] = await pool.query(
//       `SELECT id, fecha, objetivo
//        FROM rutina
//        WHERE id_usuario = ?
//        ORDER BY fecha DESC
//        LIMIT 1`,
//       [userId]
//     );

//     if (routineRows.length === 0) {
//       return res.json({
//         success: true,
//         routineExists: false,
//         message: "El usuario no tiene una rutina asignada",
//       });
//     }

//     const routine = routineRows[0];

//     // 2️⃣ Obtener los ejercicios asociados a esa rutina
//     const [exerciseRows] = await pool.query(
//       `SELECT e.id, e.nombre, e.url_media, e.descripcion
//        FROM rutina_ejercicio re
//        INNER JOIN ejercicio e ON re.id_ejercicio = e.id
//        WHERE re.id_rutina = ?`,
//       [routine.id]
//     );

//     // 3️⃣ Respuesta completa
//     return res.json({
//       success: true,
//       routineExists: true,
//       data: {
//         id: routine.id,
//         fecha: routine.fecha,
//         objetivo: routine.objetivo,
//         id_usuario: userId,
//         ejercicios: exerciseRows,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Error en getRoutineByUser:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error al obtener la rutina del usuario",
//     });
//   }
// };

import { RoutineModel } from "../models/routineModel.js";

export const createRutine = async (req, res) => {
  try {
    const { id_usuario, id_entrenador, fecha, objetivo, ejercicios } = req.body;

    if (!id_usuario || !ejercicios?.length)
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    console.log(
      "🟢 createRutine - body incoming:",
      JSON.stringify(req.body, null, 2)
    );
    const id = await RoutineModel.createRutine({
      id_usuario,
      id_entrenador,
      fecha,
      objetivo,
      ejercicios,
    });

    res.status(201).json({ message: "Rutina creada", id });
  } catch (error) {
    console.error("Error al crear rutina:", error);
    res.status(500).json({ message: "Error al crear rutina" });
  }
};

export const getRoutineByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const rutinas = await RoutineModel.listByUser(userId);

    return res.json({
      success: true,
      routines: rutinas,
    });
  } catch (error) {
    console.error("Error al obtener rutinas:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al obtener rutinas" });
  }
};

export const getRoutineDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const rutina = await RoutineModel.getRutine(id);
    res.json(rutina);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener detalle" });
  }
};

export const deleteRutine = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await RoutineModel.deleteRutine(id, userId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Error al eliminar rutina:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al eliminar rutina" });
  }
};
