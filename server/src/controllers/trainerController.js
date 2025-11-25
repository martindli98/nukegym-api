import { pool } from "../config/db.js";

async function getUsuarioTrainerColumn() {
  const [col1] = await pool.query(
    "SHOW COLUMNS FROM Usuario LIKE 'id_entrenador'"
  );
  if (col1.length > 0) return "id_entrenador";
  const [col2] = await pool.query(
    "SHOW COLUMNS FROM Usuario LIKE 'id_trainer'"
  );
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
    res.status(500).json({ message: "Error al obtener los entrenadores" });
  }
};

export const getTrainersByTurn = async (req, res) => {
  try {
    const { turno } = req.query;
    const [rows] = await pool.query(
      `SELECT e.id AS id_entrenador, u.nombre, u.apellido, u.email, e.turno, e.cupos
       FROM Entrenador e
       INNER JOIN Usuario u ON e.id_usuario = u.id
       WHERE e.turno = ?`,
      [turno]
    );

    res.json({ success: true, entrenadores: rows });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error al obtener entrenadores en ese horario",
      });
  }
};

export const assignTrainer = async (req, res) => {
  const { id } = req.params; // ID del usuario (cliente)
  const { id_trainer: newTrainerId } = req.body;

  try {
    // 1) Determinar columna correcta (id_entrenador o id_trainer)
    const usuarioTrainerCol = await getUsuarioTrainerColumn();
    if (!usuarioTrainerCol) {
      return res
        .status(500)
        .json({ message: "Columna de entrenador no encontrada en Usuario" });
    }

    // 2) Obtener el entrenador actual del usuario
    const [userRows] = await pool.query(
      `SELECT ${usuarioTrainerCol} AS currentTrainer FROM Usuario WHERE id = ?`,
      [id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const oldTrainerId = userRows[0].currentTrainer || null;

    // 3) Evitar reasignar al mismo entrenador
    if (oldTrainerId === newTrainerId) {
      return res
        .status(400)
        .json({ message: "Este entrenador ya está asignado" });
    }

    // 4) Verificar que el nuevo entrenador exista
    const [trainerRows] = await pool.query(
      "SELECT cupos FROM Entrenador WHERE id = ?",
      [newTrainerId]
    );

    if (trainerRows.length === 0) {
      return res.status(404).json({ message: "El entrenador no existe" });
    }

    const newTrainerCupos = trainerRows[0].cupos;

    // 5) Validar cupo disponible
    if (newTrainerCupos <= 0) {
      return res
        .status(400)
        .json({ message: "Este entrenador no tiene cupos disponibles" });
    }

    // 6) SUMAR cupo al entrenador anterior (si tenía)
    if (oldTrainerId) {
      await pool.query("UPDATE Entrenador SET cupos = cupos + 1 WHERE id = ?", [
        oldTrainerId,
      ]);
    }

    // 7) RESTAR cupo al nuevo entrenador
    await pool.query("UPDATE Entrenador SET cupos = cupos - 1 WHERE id = ?", [
      newTrainerId,
    ]);

    // 8) Actualizar usuario → asignar entrenador nuevo
    const [result] = await pool.query(
      `UPDATE Usuario SET \`${usuarioTrainerCol}\` = ? WHERE id = ? AND id_rol = 2`,
      [newTrainerId, id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(400)
        .json({
          message:
            "No se pudo asignar: usuario no existe o no es cliente (rol 2)",
        });
    }

    return res.json({
      message: "Entrenador asignado correctamente",
      oldTrainerId,
      newTrainerId,
    });
  } catch (error) {
    console.error("assignTrainer error:", error);
    return res.status(500).json({ message: "Error al asignar el entrenador" });
  }
};

export const updateTrainerTurn = async (req, res) => {
  const trainerUserId = req.user.id;
  const { turno } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT id FROM Entrenador WHERE id_usuario = ?",
      [trainerUserId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "No sos entrenador" });
    }

    const idEntrenador = rows[0].id;

    await pool.query("UPDATE Entrenador SET turno = ? WHERE id = ?", [
      turno,
      idEntrenador,
    ]);

    return res.json({ success: true, message: "Turno actualizado" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error al actualizar turno" });
  }
};

export const updateTrainerAdmin = async (req, res) => {
  const { id } = req.params;
  const { turno, cupos } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT id FROM Entrenador WHERE id_usuario = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Este usuario no es entrenador" });
    }

    const idEntrenador = rows[0].id;

    await pool.query(
      "UPDATE Entrenador SET turno = ?, cupos = ? WHERE id = ?",
      [turno, cupos, idEntrenador]
    );

    return res.json({
      success: true,
      message: "Entrenador actualizado correctamente",
    });
  } catch (error) {
    console.error("updateTrainerAdmin error:", error);
    return res.status(500).json({ message: "Error al actualizar entrenador" });
  }
};

export const getStudentsByTrainer = async (req, res) => {
  const { id } = req.params;

  try {
    const [trainerRows] = await pool.query(
      "SELECT id FROM Entrenador WHERE id_usuario = ?",
      [id]
    );

    if (trainerRows.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontró el entrenador para este usuario" });
    }

    const trainerId = trainerRows[0].id;

    const usuarioTrainerCol = await getUsuarioTrainerColumn();
    if (!usuarioTrainerCol) {
      return res
        .status(500)
        .json({ message: "Configuración de base de datos incorrecta" });
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
