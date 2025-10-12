import { pool } from "../config/db.js";

export const classModel = {
  // Obtener todas las clases con información del entrenador
  getAll: async () => {
    const [rows] = await pool.query(`
      SELECT 
        c.id as id_clase,
        c.nombre,
        c.descripcion,
        CONCAT(c.fecha, ' ', c.horario_inicio) as horario,
        c.cant_personas as cupo_maximo,
        c.id_entrenador,
        u.nombre as entrenador_nombre,
        u.apellido as entrenador_apellido
      FROM Clase c
      LEFT JOIN Usuario u ON c.id_entrenador = u.id
      ORDER BY c.fecha DESC, c.horario_inicio ASC
    `);
    return rows;
  },

  // Obtener clases disponibles con cupos
  getAvailable: async () => {
    const [rows] = await pool.query(`
      SELECT 
        c.id as id_clase,
        c.nombre,
        c.descripcion,
        CONCAT(c.fecha, ' ', c.horario_inicio) as horario,
        c.cant_personas as cupo_maximo,
        c.id_entrenador,
        u.nombre as entrenador_nombre,
        u.apellido as entrenador_apellido,
        (c.cant_personas - COALESCE(reservas.total_reservas, 0)) as cupos_disponibles
      FROM Clase c
      LEFT JOIN Usuario u ON c.id_entrenador = u.id
      LEFT JOIN (
        SELECT id_clase, COUNT(*) as total_reservas 
        FROM Reserva 
        WHERE estado = 'reservado' 
        GROUP BY id_clase
      ) reservas ON c.id = reservas.id_clase
      WHERE CONCAT(c.fecha, ' ', c.horario_inicio) >= NOW()
      HAVING cupos_disponibles > 0
      ORDER BY c.fecha ASC, c.horario_inicio ASC
    `);
    return rows;
  },

  // Crear nueva clase
  create: async (classData) => {
    const {
      nombre,
      descripcion,
      fecha,
      horario_inicio,
      horario_fin,
      cant_personas,
      id_entrenador,
    } = classData;
    const [result] = await pool.query(
      `
      INSERT INTO Clase (nombre, descripcion, fecha, horario_inicio, horario_fin, cant_personas, id_entrenador)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        nombre,
        descripcion,
        fecha,
        horario_inicio,
        horario_fin,
        cant_personas,
        id_entrenador,
      ]
    );
    return result.insertId;
  },

  // Actualizar clase
  update: async (id, classData) => {
    const {
      nombre,
      descripcion,
      fecha,
      horario_inicio,
      horario_fin,
      cant_personas,
      id_entrenador,
    } = classData;
    const [result] = await pool.query(
      `
      UPDATE Clase 
      SET nombre = ?, descripcion = ?, fecha = ?, horario_inicio = ?, horario_fin = ?, cant_personas = ?, id_entrenador = ?
      WHERE id = ?
    `,
      [
        nombre,
        descripcion,
        fecha,
        horario_inicio,
        horario_fin,
        cant_personas,
        id_entrenador,
        id,
      ]
    );
    return result.affectedRows;
  },

  // Eliminar clase
  delete: async (id) => {
    // Primero eliminar reservas asociadas
    await pool.query("DELETE FROM Reserva WHERE id_clase = ?", [id]);
    // Luego eliminar la clase
    const [result] = await pool.query("DELETE FROM Clase WHERE id = ?", [id]);
    return result.affectedRows;
  },

  // Verificar cupos disponibles
  checkAvailability: async (id_clase) => {
    const [rows] = await pool.query(
      `
      SELECT 
        c.cant_personas,
        COALESCE(reservas.total_reservas, 0) as reservas_actuales,
        CONCAT(c.fecha, ' ', c.horario_inicio) as horario_completo
      FROM Clase c
      LEFT JOIN (
        SELECT id_clase, COUNT(*) as total_reservas 
        FROM Reserva 
        WHERE estado = 'reservado' 
        GROUP BY id_clase
      ) reservas ON c.id = reservas.id_clase
      WHERE c.id = ?
    `,
      [id_clase]
    );
    return rows[0];
  },

  // Crear reserva
  createReservation: async (id_usuario, id_clase) => {
    const [result] = await pool.query(
      `
      INSERT INTO Reserva (id_usuario, id_clase, estado, fecha_inicio, fecha_fin)
      VALUES (?, ?, 'reservado', NOW(), NOW())
    `,
      [id_usuario, id_clase]
    );
    return result.insertId;
  },

  // Verificar si el usuario ya tiene reserva para esta clase
  checkExistingReservation: async (id_usuario, id_clase) => {
    const [rows] = await pool.query(
      `
      SELECT id FROM Reserva 
      WHERE id_usuario = ? AND id_clase = ? AND estado = 'reservado'
    `,
      [id_usuario, id_clase]
    );
    return rows.length > 0;
  },

  // Obtener reservas del usuario
  getUserReservations: async (id_usuario) => {
    const [rows] = await pool.query(
      `
      SELECT 
        r.*, 
        c.nombre, 
        c.descripcion,
        c.cant_personas as cupo_maximo,
        CONCAT(c.fecha, ' ', c.horario_inicio) as horario,
        u.nombre as entrenador_nombre,
        u.apellido as entrenador_apellido
      FROM Reserva r
      JOIN Clase c ON r.id_clase = c.id
      LEFT JOIN Usuario u ON c.id_entrenador = u.id
      WHERE r.id_usuario = ?
      ORDER BY c.fecha DESC, c.horario_inicio ASC
    `,
      [id_usuario]
    );
    return rows;
  },
};
