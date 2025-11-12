import { pool } from "../config/db.js";
import { RoutineModel } from "../models/routineModel.js";
import { ProgressModel } from "../models/progressModel.js";


export const insertProgress = async (req, res) => {
  console.log('llego a insertttttt paaaaaaaaaaaaaaaaaaa')
  

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const id_usuario = req.user.id;
    const id_rutina = req.body.id_rutina;

    const { progresos } = req.body;

    if (!progresos || !Array.isArray(progresos) || progresos.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No se enviaron progresos válidos." });
    }

    // 1️⃣ Crear nuevo progreso general
   const [result] = await connection.query(
  `INSERT INTO Progreso (id_usuario, id_rutina, fecha_uno) VALUES (?, ?, NOW())`,
  [id_usuario, id_rutina]
);
    const id_progreso = result.insertId;

    // 2️⃣ Insertar detalles
    const insertPromises = progresos.map((p) =>
      connection.query(
        `INSERT INTO Progreso_detalle (id_progreso, id_ejercicio, peso, repeticiones)
         VALUES (?, ?, ?, ?)`,
        [id_progreso, p.id_ejercicio, p.peso || null, p.repeticiones || null]
      )
    );

    await Promise.all(insertPromises);

    await connection.commit();

    res.json({
      success: true,
      message: "Progreso guardado correctamente",
      id_progreso,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error al guardar progreso:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al guardar progreso" });
  } finally {
    if (connection) connection.release();
  }
};



export const getRoutineUser = async (req, res) => { 
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
}

export const getRoutineDetails = async (req,res) => {

    try {
        const {id} = req.params.id_rutina;
        const rutina = await RoutineModel.getRutine(id);
        res.json(rutina);
    }catch(error){
        res.status(500).json({message:"Error al obtener detalle"})
    }
}

export const getProgressId = async (req, res) => {
  console.log('llega al controller progresssssssssssssssssssss')
  console.log(req.params.id_rutina)
  try {
    const { id_rutina } = req.params;
    const progreso = await ProgressModel.getProgressIdModel(id_rutina);
    
    res.json({
      success: true,
      data: progreso,
    });
  } catch (error) {
    console.error("Error al obtener progreso con id:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener progreso con id",
    });
  }
};
