import { pool } from "../config/db.js";

export const getMembership = async (req, res) => {
  try {
    
    /* const userId = 2; */
     const userId = req.user.id;

    // membresía más reciente del usuario
    const [rows] = await pool.query(
      `SELECT id, fechaInicio, fechaFin, tipo, estado
       FROM Membresia
       WHERE id_usuario = ?
       ORDER BY fechaFin DESC
       LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.json({
        success: true,
        membershipActive: false,
        message: "El usuario no tiene membresía registrada",
      });
    }

    const membership = rows[0];

    
    const normalizeDate = (d) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const today = normalizeDate(new Date());
    const inicio = normalizeDate(new Date(membership.fechaInicio));
    const fin = normalizeDate(new Date(membership.fechaFin));

    let isActive = false;

  
    if (membership.estado === "activo") {
      if (inicio <= today && fin >= today) {
        isActive = true; 
      } else {
        isActive = false; 
      }
    } 

    return res.json({
      success: true,
      membershipActive: isActive,
      data: {
        tipo: membership.tipo,
        fechaInicio: membership.fechaInicio,
        fechaFin: membership.fechaFin,
        estado: membership.estado,
      },
    });
  } catch (error) {
    console.error("❌ Error en getMembership:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener la membresía",
    });
  }
};
