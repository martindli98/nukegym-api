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

  async updateRoutineName(id_rutina, id_usuario, objetivo) {
    // Primero verificamos si el usuario es el dueño o el entrenador asignado
    const [rutina] = await pool.query(
      "SELECT id_usuario, id_entrenador FROM rutina WHERE id = ?",
      [id_rutina]
    );

    if (!rutina.length) return false;

    const { id_usuario: owner, id_entrenador } = rutina[0];

    // Permitir si es el dueño o si es el entrenador asignado
    if (id_usuario === owner || id_usuario === id_entrenador) {
      const [result] = await pool.query(
        "UPDATE rutina SET objetivo = ? WHERE id = ?",
        [objetivo, id_rutina]
      );
      return result.affectedRows > 0;
    }

    return false;
  },

  async updateExercise(id_rutina, id_ejercicio, series, repeticiones) {
    const [result] = await pool.query(
      "UPDATE rutina_ejercicio SET series = ?, repeticiones = ? WHERE id_rutina = ? AND id_ejercicio = ?",
      [series, repeticiones, id_rutina, id_ejercicio]
    );
    return result.affectedRows > 0;
  },

  async addExercises(id_rutina, ejercicios) {
    for (const ejercicio of ejercicios) {
      const { id_ejercicio, series, repeticiones } = ejercicio;
      await pool.query(
        "INSERT INTO rutina_ejercicio (id_rutina, id_ejercicio, series, repeticiones) VALUES (?,?,?,?)",
        [id_rutina, id_ejercicio, series, repeticiones]
      );
    }
    return true;
  },

  async deleteExercise(id_rutina, id_ejercicio) {
    const [result] = await pool.query(
      "DELETE FROM rutina_ejercicio WHERE id_rutina = ? AND id_ejercicio = ?",
      [id_rutina, id_ejercicio]
    );
    return result.affectedRows > 0;
  },

  async deleteRutine(id_rutina, id_usuario) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Verificar si el usuario tiene permisos
      const [rutina] = await connection.query(
        "SELECT id_usuario, id_entrenador FROM rutina WHERE id = ?",
        [id_rutina]
      );

      if (!rutina.length) {
        await connection.rollback();
        return {
          success: false,
          message: "Rutina no encontrada",
        };
      }

      const { id_usuario: owner, id_entrenador } = rutina[0];

      // Permitir si es el dueño o el entrenador asignado
      if (id_usuario !== owner && id_usuario !== id_entrenador) {
        await connection.rollback();
        return {
          success: false,
          message: "No tienes permisos para eliminar esta rutina",
        };
      }

      // 1. Obtener todos los IDs de progreso asociados a esta rutina
      const [progresos] = await connection.query(
        "SELECT id FROM progreso WHERE id_rutina = ?",
        [id_rutina]
      );

      // 2. Eliminar detalles de progreso para cada progreso encontrado
      if (progresos.length > 0) {
        const progressIds = progresos.map((p) => p.id);
        await connection.query(
          "DELETE FROM progreso_detalle WHERE id_progreso IN (?)",
          [progressIds]
        );
      }

      // 3. Eliminar registros de progreso
      await connection.query("DELETE FROM progreso WHERE id_rutina = ?", [
        id_rutina,
      ]);

      // 4. Eliminar ejercicios de la rutina
      await connection.query(
        "DELETE FROM rutina_ejercicio WHERE id_rutina = ?",
        [id_rutina]
      );

      // 5. eliminar la rutina
      await connection.query("DELETE FROM rutina WHERE id = ?", [id_rutina]);

      await connection.commit();

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
