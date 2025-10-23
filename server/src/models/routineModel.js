import { pool } from "../config/db.js";

export const RoutineModel = {
  async createRutine({
    id_usuario,
    id_entrenador,
    fecha,
    objetivo,
    ejercicios,
  }) {
    try {
      const [result] = await pool.query(
        "INSERT INTO rutina (id_usuario, id_entrenador, fecha, objetivo) VALUES (?,?,?,?)",
        [id_usuario, id_entrenador, fecha, objetivo]
      );
      const rutinaId = result.insertId;
      for (const ejercicio of ejercicios) {
        const { id_ejercicio } = ejercicio;
        const series = Number(ejercicio.series);
        const repeticiones = Number(ejercicio.repeticiones);
        console.log("📦 Insertando ejercicio:", ejercicio);
        await pool.query(
          "INSERT INTO rutina_ejercicio (id_rutina, id_ejercicio, series, repeticiones) VALUES (?,?,?,?)",
          [rutinaId, id_ejercicio, series, repeticiones]
        );
      }

      return rutinaId;
    } catch (error) {
      console.error("❌ Error al crear rutina:", error);
      throw error;
    }
  },

  async listByUser(id_usuario) {
    const [rutinas] = await pool.query(
      "SELECT * FROM rutina WHERE id_usuario = ?",
      [id_usuario]
    );

    for (const rutina of rutinas) {
      const [ejercicios] = await pool.query(
        `SELECT e.*, re.series, re.repeticiones
         FROM rutina_ejercicio re 
         JOIN ejercicio e ON re.id_ejercicio = e.id 
         WHERE re.id_rutina = ?`,
        [rutina.id]
      );
      rutina.ejercicios = ejercicios;
    }

    return rutinas;
  },

  async getRutine(id_rutina) {
    const [rutina] = await pool.query("SELECT * FROM rutina WHERE id = ?", [
      id_rutina,
    ]);
    const [ejercicios] = await pool.query(
      `SELECT e.*, re.series, re.repeticiones
       FROM rutina_ejercicio re 
       JOIN ejercicio e ON re.id_ejercicio = e.id 
       WHERE re.id_rutina = ?`,
      [id_rutina]
    );
    return { ...rutina[0], ejercicios };
  },

  async deleteRutine(id_rutina, id_usuario) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        "DELETE FROM rutina_ejercicio WHERE id_rutina = ?",
        [id_rutina]
      );

      const [result] = await connection.query(
        "DELETE FROM rutina WHERE id = ? AND id_usuario = ?",
        [id_rutina, id_usuario]
      );

      await connection.commit();

      if (result.affectedRows === 0) {
        return {
          success: false,
          message: "Rutina no encontrada o no autorizada",
        };
      }

      return { success: true, message: "Rutina eliminada correctamente" };
    } catch (error) {
      await connection.rollback();
      console.error("❌ Error al eliminar rutina:", error);
      throw error;
    } finally {
      connection.release();
    }
  },
};
