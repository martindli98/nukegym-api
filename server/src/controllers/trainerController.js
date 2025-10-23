import { pool } from "../config/db.js";


async function getUsuarioTrainerColumn() {
  const [col1] = await pool.query("SHOW COLUMNS FROM Usuario LIKE 'id_entrenador'")
  if (col1.length > 0) return "id_entrenador";
  const [col2] = await pool.query("SHOW COLUMNS FROM Usuario LIKE 'id_trainer'")
  if (col2.length > 0) return "id_trainer";
  return null;
}

export const getAllTrainers = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        e.id AS id_entrenador,
        u.id AS id_usuario,
        u.nombre,
        u.apellido,
        u.email,
        e.especialidad,
        e.turno,
        e.cupos
      FROM Entrenador e
      INNER JOIN Usuario u ON e.id_usuario = u.id
    `);
    res.json(rows);
  } catch (error) {
    console.error("getAllTrainers error:", error);
    res.status(500).json({ message: "Error al obtener los entrenadores" })
  }
};

export const assignTrainer = async (req, res) => {
  const { id } = req.params
  const { id_trainer } = req.body

  try {
    const [trainerRows] = await pool.query(
      "SELECT id, id_usuario FROM Entrenador WHERE id = ?",
      [id_trainer]
    );

    if (trainerRows.length === 0) {
      return res.status(404).json({ message: "El entrenador no existe" });
    }

    const usuarioTrainerCol = await getUsuarioTrainerColumn();
    if (!usuarioTrainerCol) {
      console.error("No se encontró columna id_entrenador ni id_trainer en Usuario");
      return res.status(500).json({ message: "Configuración de base de datos incorrecta" });
    }

    const [result] = await pool.query(
      `UPDATE Usuario SET \`${usuarioTrainerCol}\` = ? WHERE id = ? AND id_rol = 2`,
      [id_trainer, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "No se pudo asignar: usuario no existe o no es cliente (rol 2)" });
    }

    res.json({ message: "Entrenador asignado correctamente" });
  } catch (error) {
    console.error("assignTrainer error:", error);
    res.status(500).json({ message: "Error al asignar el entrenador" });
  }
};

export const getStudentsByTrainer = async (req, res) => {
  const { id } = req.params

  try {
    const [trainerRows] = await pool.query(
      "SELECT id FROM Entrenador WHERE id_usuario = ?",
      [id]
    );

    if (trainerRows.length === 0) {
      return res.status(404).json({ message: "No se encontró el entrenador para este usuario" });
    }

    const trainerId = trainerRows[0].id

    const usuarioTrainerCol = await getUsuarioTrainerColumn();
    if (!usuarioTrainerCol) {
      return res.status(500).json({ message: "Configuración de base de datos incorrecta" });
    }

    const [rows] = await pool.query(
      `SELECT id, nombre, apellido, email 
       FROM Usuario 
       WHERE \`${usuarioTrainerCol}\` = ? AND id_rol = 2`,
      [trainerId]
    );

    res.json(rows);
  } catch (error) {
    console.error("getStudentsByTrainer error:", error);
    res.status(500).json({ message: "Error al obtener alumnos" });
  }
};
