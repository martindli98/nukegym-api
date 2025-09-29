import { pool } from "../config/db.js";

export const getUserId = async (req, res) => {
  try {
    const userId = req.user.id; 
    const [rows] = await pool.query(
      `SELECT id, nombre, apellido, email , id_rol
       FROM usuario
       WHERE id = ?
       LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    return res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Error en el servidor" });
  }
};


export const feedback = async (req, res) => {
  try {
    const { comentario } = req.body;
    const id_cliente = req.user.id; 

    if (!comentario) {
      return res.status(400).json({
        success: false,
        message: "El comentario no puede estar vacío",
      });
    }

    const query = `
      INSERT INTO encuesta (id_cliente, comentario, fecha) 
      VALUES (?, ?, NOW())
    `;

    await pool.query(query, [id_cliente, comentario]);

    res.json({
      success: true,
      message: "Feedback guardado correctamente",
    });
  } catch (error) {
    console.error("Error al guardar feedback:", error);
    res.status(500).json({
      success: false,
      message: "Error al guardar el feedback",
    });
  }
};

export const getComments = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, id_cliente, comentario, fecha
       FROM Encuesta
       ORDER BY fecha DESC` // opcional: ordenar por fecha
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "No hay comentarios." });
    }

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Error en el servidor" });
  }
};
