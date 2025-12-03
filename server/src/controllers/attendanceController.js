import { pool } from "../config/db.js";

// Registrar asistencia mediante QR
export const markAttendance = async (req, res) => {
  try {
    const { qr_code } = req.body;
    const id_usuario = req.user.id;

    // Validar QR del gimnasio
    const VALID_QR = process.env.GYM_QR_CODE || "NUKEGYM_EMR_2025";

    if (!qr_code) {
      return res.status(400).json({
        success: false,
        message: "Código QR requerido",
      });
    }

    if (qr_code !== VALID_QR) {
      return res.status(400).json({
        success: false,
        message: "Código QR inválido",
      });
    }

    // Verificar membresía activa
    const [membership] = await pool.query(
      `SELECT m.estado, m.fechaFin 
       FROM Membresia m 
       WHERE m.id_usuario = ? 
       ORDER BY m.fechaFin DESC 
       LIMIT 1`,
      [id_usuario]
    );

    if (!membership.length) {
      return res.status(200).json({
        success: false,
        message: "No tienes una membresía registrada",
      });
    }

    if (membership[0].estado !== "activo") {
      return res.status(403).json({
        success: false,
        message: "Tu membresía no está activa",
      });
    }

    if (new Date(membership[0].fechaFin) < new Date()) {
      return res.status(403).json({
        success: false,
        message: "Tu membresía ha expirado",
      });
    }

    // Verificar si ya registró asistencia hoy
    const today = new Date().toISOString().split("T")[0];
    const [existing] = await pool.query(
      `SELECT id FROM Asistencia 
       WHERE id_usuario = ? 
       AND fecha = ?`,
      [id_usuario, today]
    );

    if (existing.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Ya registraste tu asistencia hoy",
        already_registered: true,
        attendance_date: today,
      });
    }

    // Registrar asistencia
    await pool.query(
      `INSERT INTO Asistencia (id_usuario, fecha, estado) 
       VALUES (?, ?, 'presente')`,
      [id_usuario, today]
    );

    // Obtener datos del usuario para respuesta personalizada
    const [user] = await pool.query(
      `SELECT nombre, apellido FROM Usuario WHERE id = ?`,
      [id_usuario]
    );

    res.json({
      success: true,
      message: `¡Bienvenido/a ${user[0].nombre} ${user[0].apellido}!`,
      attendance_date: today,
    });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({
      success: false,
      message: "Error al registrar asistencia",
      error: error.message,
    });
  }
};

// Obtener historial de asistencias del usuario autenticado
export const getMyAttendance = async (req, res) => {
  try {
    const id_usuario = req.user.id;
    const { month, year, limit = 30 } = req.query;

    let query = `
      SELECT 
        a.id,
        a.fecha,
        a.estado
      FROM Asistencia a
      WHERE a.id_usuario = ?
    `;

    const params = [id_usuario];

    if (month && year) {
      query += ` AND MONTH(a.fecha) = ? AND YEAR(a.fecha) = ?`;
      params.push(parseInt(month), parseInt(year));
    }

    query += ` ORDER BY a.fecha DESC LIMIT ?`;
    params.push(parseInt(limit));

    const [attendances] = await pool.query(query, params);

    // Calcular estadísticas del mes actual
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const [stats] = await pool.query(
      `SELECT COUNT(*) as total_asistencias
       FROM Asistencia 
       WHERE id_usuario = ? 
       AND MONTH(fecha) = ? 
       AND YEAR(fecha) = ?
       AND estado = 'presente'`,
      [id_usuario, currentMonth, currentYear]
    );

    res.json({
      success: true,
      data: attendances,
      total: attendances.length,
      stats: {
        monthly_count: stats[0].total_asistencias,
        month: currentMonth,
        year: currentYear,
      },
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener asistencias",
    });
  }
};

// Obtener asistencias de todos los usuarios (solo admin)
export const getAllAttendance = async (req, res) => {
  try {
    // Verificar que sea admin
    if (req.user.id_rol !== 1) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para ver todas las asistencias",
      });
    }

    const { date, limit = 100 } = req.query;

    let query = `
      SELECT 
        a.id,
        a.fecha,
        a.estado,
        u.id as usuario_id,
        u.nombre,
        u.apellido,
        u.email
      FROM Asistencia a
      INNER JOIN Usuario u ON a.id_usuario = u.id
    `;

    const params = [];

    if (date) {
      query += ` WHERE a.fecha = ?`;
      params.push(date);
    }

    query += ` ORDER BY a.fecha DESC, a.id DESC LIMIT ?`;
    params.push(parseInt(limit));

    const [attendances] = await pool.query(query, params);

    res.json({
      success: true,
      data: attendances,
      total: attendances.length,
    });
  } catch (error) {
    console.error("Error fetching all attendance:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener asistencias",
    });
  }
};
