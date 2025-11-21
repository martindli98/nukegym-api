import { pool } from "../config/db.js";

// Chequea si la membresía está activa
export const requireActiveMembership = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Obtener rol del usuario
    const [roleRows] = await pool.query(
      "SELECT id_rol FROM Usuario WHERE id = ?",
      [userId]
    );

    if (roleRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    const role = roleRows[0].id_rol;
    req.user.id_rol = role;

    // Admin (1) y Entrenador (3) NO necesitan membresía
    if (role === 1 || role === 3) {
      req.membership = { tipo: "libre" }; // acceso total
      return next();
    }

    // Cliente (2) → requiere membresía
    const [rows] = await pool.query(
      `SELECT tipo
       FROM Membresia
       WHERE id_usuario = ?
       AND estado = 'activo'
       ORDER BY id DESC
       LIMIT 1`,
      [userId]
    );

    // ❌ Sin membresía activa
    if (rows.length === 0) {
      return res.status(403).json({
        success: false,
        membershipActive: false,
        message: "No tenés una membresía activa",
      });
    }

    // Mapear tipo
    const mapTipo = { 1: "basica", 2: "medio", 3: "libre" };
    const membership = {
      tipo: mapTipo[rows[0].tipo],
    };

    req.membership = membership;
    next();

  } catch (err) {
    console.error("Membership error:", err);
    res.status(500).json({
      success: false,
      message: "Error validando membresía",
    });
  }
};

// Rutinas: basica, medio y libre pueden ver
export const allowRoutine = (req, res, next) => {
  if (req.user.id_rol === 1 || req.user.id_rol === 3) return next();

  const type = req.membership?.tipo;
  if (["basica", "medio", "libre"].includes(type)) return next();

  return res.status(403).json({
    success: false,
    message: "No tenés acceso a rutinas",
  });
};

// Clases: SOLO medio y libre
export const allowClasses = (req, res, next) => {
  if (req.user.id_rol === 1 || req.user.id_rol === 3) return next();

  const type = req.membership?.tipo;
  if (["medio", "libre"].includes(type)) return next();

  return res.status(403).json({
    success: false,
    message: "Tu membresía no permite ver clases",
  });
};
