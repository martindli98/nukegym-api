import { pool } from "../config/db.js";

export const getAllTrainers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nombre, apellido, email FROM Usuario WHERE id_rol = ?",
      [3]
    );
    res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener los entrenadores" });
  }
};

export const assignTrainer = async (req, res) => {
  const { id } = req.params;
  const { id_trainer } = req.body;

  try {
    const [trainerRows] = await pool.query(
      "SELECT id FROM Usuario WHERE id = ? AND id_rol = 3",
      [id_trainer]
    );
    if (trainerRows.length === 0) {
      return res.status(404).json({ message: "El entrenador no existe o no tiene el rol adecuado" });
    }

    await pool.query("UPDATE Usuario SET id_trainer = ? WHERE id = ?", [id_trainer, id]);
    res.json({ message: "Entrenador asignado correctamente" });
  } catch (error) {
    return res.status(500).json({ message: "Error al asignar el entrenador" });
  }
};

export const getStudentsByTrainer = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT id, nombre, apellido, email 
       FROM Usuario 
       WHERE id_trainer = ? AND id_rol = 2`,
      [id]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener alumnos:", error);
    res.status(500).json({ message: "Error al obtener alumnos" });
  }
};
