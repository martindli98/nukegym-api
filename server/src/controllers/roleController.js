import { pool } from "../config/db.js";

export const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT u.id, u.nombre, u.email, u.id_rol, m.tipo AS membresia_tipo, m.estado AS membresia_estado FROM usuario u LEFT JOIN membresia m ON m.id_usuario = u.id AND m.id = (SELECT id FROM membresia WHERE id_usuario = u.id ORDER BY id DESC LIMIT 1)"
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener usuarios" });
  }
};

export const updateRoles = async (req, res) => {
  const { id } = req.params;
  const { id_rol } = req.body;

  if (![1, 2, 3].includes(id_rol)) {
    return res.status(400).json({ mensaje: "ID de rol inválido" });
  }

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    await connection.query("UPDATE usuario SET id_rol = ? WHERE id = ?", [
      id_rol,
      id,
    ]);
    if (id_rol === 3) {
      const [exists] = await connection.query(
        "SELECT id FROM Entrenador WHERE id_usuario = ?",
        [id]
      );

      if (exists.length === 0) {
        await connection.query(
          "INSERT INTO Entrenador (id_usuario, especialidad, turno, cupos) VALUES (?, ?, ?, ?)",
          [id, "Musculacion", "Tarde", 50]
        );
      }
    } else {
      await connection.query("DELETE FROM Entrenador WHERE id_usuario = ?", [
        id,
      ]);
    }

    await connection.commit();

    res.json({ mensaje: "Rol actualizado correctamente" });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ mensaje: "Error al actualizar rol" });
  } finally {
    connection.release();
  }
};
