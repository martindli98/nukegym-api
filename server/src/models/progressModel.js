import { pool } from "../config/db.js";

export const ProgressModel = {
  async getProgressIdModel(id_rutina) {
    console.log("llega al model progresssssssssssssssssssss");
    console.log(id_rutina);
    const [rows] = await pool.query(
      `
      SELECT 
      p.id AS id_progreso,
      p.fecha_uno,
      e.id AS id_ejercicio,
      e.nombre AS nombre_ejercicio,
      pd.peso,
      pd.repeticiones,
      r.objetivo AS objetivo_rutina
    FROM progreso p
    JOIN progreso_detalle pd ON p.id = pd.id_progreso
    JOIN ejercicio e ON pd.id_ejercicio = e.id
    JOIN rutina r ON p.id_rutina = r.id
    WHERE p.id_rutina = ? 
    ORDER BY p.fecha_uno ASC;

      `,
      [id_rutina]
    );
    return rows;
  },
};
