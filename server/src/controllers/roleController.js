import { pool } from "../config/db.js";

// Obtener todos los usuarios
export const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nombre, email, id_rol FROM usuario"
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener usuarios" });
  }
};

// Actualizar rol del usuario
export const updateRoles = async (req, res) => {
  const { id } = req.params;
  const { id_rol } = req.body;

  if (![1, 2, 3].includes(id_rol)) {
    return res.status(400).json({ mensaje: "ID de rol inválido" });
  }

  try {
    await pool.query("UPDATE usuario SET id_rol = ? WHERE id = ?", [id_rol, id]);
    res.json({ mensaje: "Rol actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al actualizar rol" });
  }
};
