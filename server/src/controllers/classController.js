import { pool } from "../config/db.js";

// Obtener todas las clases (para admin/entrenador)
export const getAllClasses = async (req, res) => {
  try {
    const [classes] = await pool.query(`
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

    res.json(classes);
  } catch (error) {
    console.error("Error al obtener clases:", error);
    res.status(500).json({ message: "Error al obtener las clases" });
  }
};

// Obtener clases disponibles (para clientes)
export const getAvailableClasses = async (req, res) => {
  try {
    const [classes] = await pool.query(`
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

    res.json(classes);
  } catch (error) {
    console.error("Error al obtener clases disponibles:", error);
    res
      .status(500)
      .json({ message: "Error al obtener las clases disponibles" });
  }
};

// Crear nueva clase (solo admin/entrenador)
export const createClass = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      fecha,
      horario_inicio,
      horario_fin,
      cupo_maximo,
      id_entrenador,
    } = req.body;

    // Validaciones básicas
    if (!nombre || !fecha || !horario_inicio || !horario_fin || !cupo_maximo) {
      return res.status(400).json({
        message: "Nombre, fecha, horarios y cupo máximo son requeridos",
      });
    }

    // Validar que la fecha no sea anterior al día actual
    const fechaActual = new Date().toISOString().split("T")[0];
    if (fecha < fechaActual) {
      return res
        .status(400)
        .json({
          message:
            "No se puede crear una clase en una fecha anterior al día actual",
        });
    }

    // Verificar permisos
    if (req.user.id_rol === 1 && req.user.id_rol === 3) {
      return res
        .status(403)
        .json({ message: "No tienes permisos para crear clases" });
    }

    // Validar que no haya solapamiento de horarios en el mismo día
    const [existingClass] = await pool.query(
      `SELECT id, nombre, horario_inicio, horario_fin 
       FROM Clase 
       WHERE fecha = ? 
       AND (
         (horario_inicio < ? AND horario_fin > ?) OR
         (horario_inicio < ? AND horario_fin > ?) OR
         (horario_inicio >= ? AND horario_fin <= ?)
       )`,
      [
        fecha,
        horario_inicio,
        horario_inicio,
        horario_fin,
        horario_fin,
        horario_inicio,
        horario_fin,
      ]
    );

    if (existingClass.length > 0) {
      return res.status(400).json({
        message: `Ya existe una clase "${existingClass[0].nombre}" programada que se superpone con ese horario (${existingClass[0].horario_inicio} - ${existingClass[0].horario_fin})`,
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO Clase (nombre, descripcion, fecha, horario_inicio, horario_fin, cant_personas, id_entrenador)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        nombre,
        descripcion || "",
        fecha,
        horario_inicio,
        horario_fin,
        cupo_maximo,
        id_entrenador || req.user.id,
      ]
    );

    res.status(201).json({
      message: "Clase creada exitosamente",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error al crear clase:", error);
    res.status(500).json({ message: "Error al crear la clase" });
  }
};

// Actualizar clase (solo admin/entrenador)
export const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      fecha,
      horario_inicio,
      horario_fin,
      cupo_maximo,
      id_entrenador,
    } = req.body;

    // Verificar permisos
    if (req.user.id_rol === 2) {
      return res
        .status(403)
        .json({ message: "No tienes permisos para modificar clases" });
    }

    // Validar que la fecha no sea anterior al día actual
    const fechaActual = new Date().toISOString().split("T")[0];
    if (fecha < fechaActual) {
      return res
        .status(400)
        .json({
          message:
            "No se puede programar una clase en una fecha anterior al día actual",
        });
    }

    // Validar que no haya solapamiento de horarios en el mismo día (excluyendo la clase actual)
    const [existingClass] = await pool.query(
      `SELECT id, nombre, horario_inicio, horario_fin 
       FROM Clase 
       WHERE fecha = ? 
       AND id != ?
       AND (
         (horario_inicio < ? AND horario_fin > ?) OR
         (horario_inicio < ? AND horario_fin > ?) OR
         (horario_inicio >= ? AND horario_fin <= ?)
       )`,
      [
        fecha,
        id,
        horario_inicio,
        horario_inicio,
        horario_fin,
        horario_fin,
        horario_inicio,
        horario_fin,
      ]
    );

    if (existingClass.length > 0) {
      return res.status(400).json({
        message: `Ya existe una clase "${existingClass[0].nombre}" programada que se superpone con ese horario (${existingClass[0].horario_inicio} - ${existingClass[0].horario_fin})`,
      });
    }

    const [result] = await pool.query(
      `
      UPDATE Clase 
      SET nombre = ?, descripcion = ?, fecha = ?, horario_inicio = ?, horario_fin = ?, cant_personas = ?, id_entrenador = ?
      WHERE id = ?
    `,
      [
        nombre,
        descripcion || "",
        fecha,
        horario_inicio,
        horario_fin,
        cupo_maximo,
        id_entrenador || req.user.id,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Clase no encontrada" });
    }

    res.json({ message: "Clase actualizada exitosamente" });
  } catch (error) {
    console.error("Error al actualizar clase:", error);
    res.status(500).json({ message: "Error al actualizar la clase" });
  }
};

// Eliminar clase (solo admin)
export const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    // Solo admin puede eliminar clases
    if (req.user.id_rol === 1) {
      return res
        .status(403)
        .json({ message: "Solo los administradores pueden eliminar clases" });
    }

    // Primero eliminar las reservas asociadas
    await pool.query("DELETE FROM Reserva WHERE id_clase = ?", [id]);

    // Luego eliminar la clase
    const [result] = await pool.query("DELETE FROM Clase WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Clase no encontrada" });
    }

    res.json({ message: "Clase eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar clase:", error);
    res.status(500).json({ message: "Error al eliminar la clase" });
  }
};

// Crear reserva (solo clientes)
export const createReservation = async (req, res) => {
  try {
    const { id_clase } = req.body;
    const userId = req.user.id;

    // Solo clientes pueden reservar
    if (req.user.id_rol === 2) {
      return res
        .status(403)
        .json({ message: "Solo los clientes pueden reservar clases" });
    }

    // Verificar que hay cupos disponibles
    const [classInfo] = await pool.query(
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

    if (!classInfo.length) {
      return res.status(404).json({ message: "Clase no encontrada" });
    }

    // Verificar que la clase no haya pasado
    if (new Date(classInfo[0].horario_completo) < new Date()) {
      return res
        .status(400)
        .json({ message: "No se puede reservar una clase que ya pasó" });
    }

    // Verificar cupos
    if (classInfo[0].reservas_actuales >= classInfo[0].cant_personas) {
      return res.status(400).json({ message: "No hay cupos disponibles" });
    }

    // Verificar que el usuario no tenga una reserva activa para esta clase
    const [existingReservation] = await pool.query(
      `
      SELECT id FROM Reserva 
      WHERE id_usuario = ? AND id_clase = ? AND estado = 'reservado'
    `,
      [userId, id_clase]
    );

    if (existingReservation.length > 0) {
      return res
        .status(409)
        .json({ message: "Ya tienes una reserva activa para esta clase" });
    }

    // Crear la reserva
    const [result] = await pool.query(
      `
      INSERT INTO Reserva (id_usuario, id_clase, estado, fecha_inicio, fecha_fin)
      VALUES (?, ?, 'reservado', NOW(), NOW())
    `,
      [userId, id_clase]
    );

    res.status(201).json({
      message: "Reserva creada exitosamente",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error al crear reserva:", error);
    res.status(500).json({ message: "Error al crear la reserva" });
  }
};

// Obtener reservas del usuario
export const getUserReservations = async (req, res) => {
  try {
    const userId = req.user.id;

    const [reservations] = await pool.query(
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
      [userId]
    );

    res.json(reservations);
  } catch (error) {
    console.error("Error al obtener reservas del usuario:", error);
    res.status(500).json({ message: "Error al obtener las reservas" });
  }
};

// Cancelar reserva (solo el dueño de la reserva)
export const cancelReservation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // id de la reserva

    // Verificar que la reserva exista y pertenezca al usuario
    const [rows] = await pool.query(
      `SELECT id FROM Reserva WHERE id = ? AND id_usuario = ? AND estado = 'reservado'`,
      [id, userId]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Reserva no encontrada o no autorizada" });
    }

    // Marcar como cancelado
    await pool.query(
      `UPDATE Reserva SET estado = 'cancelado', fecha_fin = NOW() WHERE id = ?`,
      [id]
    );

    return res.json({ success: true, message: "Reserva cancelada" });
  } catch (error) {
    console.error("Error al cancelar reserva:", error);
    res.status(500).json({ message: "Error al cancelar la reserva" });
  }
};
