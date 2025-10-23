import { pool } from "../config/db.js";

export const TrainerModel = {
  async list() {
    const [rows] = await pool.query(
      `SELECT e.*, u.nombre AS nombre_usuario
       FROM entrenador e
       JOIN usuario u ON e.id_usuario = u.id`
    );
    return rows;
  },

  async createTrainer({ id_usuario, especialidad }) {
    const [result] = await pool.query(
      "INSERT INTO entrenador (id_usuario, especialidad) VALUES (?, ?)",
      [id_usuario, especialidad]
    );
    return result.insertId;
  },
};
