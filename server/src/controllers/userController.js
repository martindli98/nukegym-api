import { pool } from "../config/db.js";

const users = []; // Array to store user data

// Function to get user profile by ID
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Del token JWT decodificado

    const [rows] = await pool.query(
      `
      SELECT 
        u.id,
        u.nombre,
        u.apellido,
        u.email,
        u.nro_documento,
        u.num_personal,
        u.num_emergencia,
        u.fechaNac,
        u.patologias,
        u.foto_avatar,
        u.turno,
        u.id_trainer,
        u.id_rol,
        r.tipo as tipo_rol
      FROM Usuario u
      LEFT JOIN Rol r ON u.id_rol = r.id
      WHERE u.id = ? AND u.baja_usuario = FALSE
    `,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    const user = rows[0];
    res.json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener el perfil del usuario",
    });
  }
};

// Function to update user profile
export const updateUserProfile = async (req, res) => {
  let connection;
  try {
    const userId = req.user.id;
    const {
      nombre,
      apellido,
      email,
      nro_documento,
      num_personal,
      num_emergencia,
      fechaNac,
      patologias,
      turno,
    } = req.body;

    // validaciones...
    if (!nombre || !apellido || !email || !nro_documento) {
      return res.status(400).json({
        success: false,
        message: "Los campos nombre, apellido, email y DNI son obligatorios",
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res
        .status(400)
        .json({ success: false, message: "Formato de email inválido" });
    const dniRegex = /^\d{8}$/;
    if (!dniRegex.test(nro_documento))
      return res.status(400).json({
        success: false,
        message: "El DNI debe tener exactamente 8 dígitos",
      });

    // chequear email/dni únicos
    const [existingUser] = await pool.query(
      "SELECT id FROM Usuario WHERE email = ? AND id != ? AND baja_usuario = FALSE",
      [email, userId]
    );
    if (existingUser.length > 0)
      return res.status(400).json({
        success: false,
        message: "El email ya está en uso por otro usuario",
      });

    const [existingDni] = await pool.query(
      "SELECT id FROM Usuario WHERE nro_documento = ? AND id != ? AND baja_usuario = FALSE",
      [nro_documento, userId]
    );
    if (existingDni.length > 0)
      return res.status(400).json({
        success: false,
        message: "El DNI ya está en uso por otro usuario",
      });

    // formateo fecha
    let formattedFechaNac = null;
    if (fechaNac)
      formattedFechaNac = new Date(fechaNac).toISOString().split("T")[0];

    // obtener turno e entrenador actuales
    const [prevRows] = await pool.query(
      "SELECT turno, id_trainer FROM Usuario WHERE id = ?",
      [userId]
    );
    if (prevRows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });

    const oldTurno = prevRows[0].turno;
    const oldTrainer = prevRows[0].id_trainer || null;

    // CONEXIÓN y TRANSACTION para atomicidad
    connection = await pool.getConnection();
    await connection.beginTransaction();

    let newTrainerAssigned = null;

    let newTrainer = null;
    if (
      req.body.id_trainer !== undefined &&
      req.body.id_trainer !== null &&
      req.body.id_trainer !== ""
    ) {
      newTrainer = Number(req.body.id_trainer);
    }

    const wantsTrainerChange = newTrainer !== Number(oldTrainer);

    if (wantsTrainerChange || turno !== oldTurno) {
      if (oldTrainer) {
        await connection.query(
          "UPDATE Entrenador SET cupos = cupos + 1 WHERE id = ?",
          [oldTrainer]
        );
      }

      // borrar relación temporalmente
      await connection.query(
        "UPDATE Usuario SET id_trainer = NULL WHERE id = ?",
        [userId]
      );

      // Si el usuario eligió un entrenador manualmente
      let chosenTrainer = null;

      if (
        req.body.id_trainer !== undefined &&
        req.body.id_trainer !== null &&
        req.body.id_trainer !== ""
      ) {
        chosenTrainer = Number(req.body.id_trainer);
      }

      if (chosenTrainer !== null) {
        // validar que ese entrenador existe y tiene cupo
        const [trainerRows] = await connection.query(
          "SELECT cupos FROM Entrenador WHERE id = ? AND turno = ?",
          [Number(chosenTrainer), turno]
        );

        if (trainerRows.length === 0)
          throw new Error(
            "El entrenador elegido no existe o no trabaja ese turno"
          );

        if (trainerRows[0].cupos <= 0)
          throw new Error("El entrenador elegido no tiene cupos disponibles");

        // restar cupo
        await connection.query(
          "UPDATE Entrenador SET cupos = cupos - 1 WHERE id = ?",
          [chosenTrainer]
        );

        // asignar entrenador elegido
        await connection.query(
          "UPDATE Usuario SET id_trainer = ? WHERE id = ?",
          [chosenTrainer, userId]
        );

        newTrainerAssigned = chosenTrainer;
      }

      // Si NO eligió entrenador → asignación automática
      else {
        const [trainerRows] = await connection.query(
          "SELECT id FROM Entrenador WHERE turno = ? AND cupos > 0 ORDER BY cupos DESC LIMIT 1",
          [turno]
        );

        if (trainerRows.length > 0) {
          newTrainerAssigned = trainerRows[0].id;

          await connection.query(
            "UPDATE Entrenador SET cupos = cupos - 1 WHERE id = ?",
            [newTrainerAssigned]
          );

          await connection.query(
            "UPDATE Usuario SET id_trainer = ? WHERE id = ?",
            [newTrainerAssigned, userId]
          );
        } else {
          newTrainerAssigned = null;
        }
      }
    }

    // Finalmente, actualizar el resto de los datos del usuario (sin tocar id_trainer aquí)
    const [result] = await connection.query(
      `UPDATE Usuario SET
         nombre = ?,
         apellido = ?,
         email = ?,
         nro_documento = ?,
         num_personal = ?,
         num_emergencia = ?,
         fechaNac = ?,
         patologias = ?,
         turno = ?
       WHERE id = ? AND baja_usuario = FALSE`,
      [
        nombre,
        apellido,
        email,
        nro_documento,
        num_personal || null,
        num_emergencia || null,
        formattedFechaNac,
        patologias || null,
        turno,
        userId,
      ]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    }

    await connection.commit();

    // recuperar usuario actualizado (ya con id_trainer actualizado por la transacción si hubo cambio)
    const [updatedUser] = await pool.query(
      `SELECT 
         u.id,u.nombre,u.apellido,u.email,u.nro_documento,u.num_personal,u.num_emergencia,u.fechaNac,u.patologias,u.foto_avatar,u.turno,u.id_trainer,
         r.tipo as tipo_rol
       FROM Usuario u
       LEFT JOIN Rol r ON u.id_rol = r.id
       WHERE u.id = ? AND u.baja_usuario = FALSE`,
      [userId]
    );

    return res.json({
      success: true,
      message: "Perfil actualizado correctamente",
      user: updatedUser[0],
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error updating user profile:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor al actualizar el perfil",
    });
  } finally {
    if (connection) connection?.release();
  }
};

// Function to get all users
export const getAllUsers = (req, res) => {
  res.json(users); // Send all users as JSON response
};

// Function to create a new user
export const createUser = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const newUser = { email, password }; // Create a new user object
  users.push(newUser); // Add the new user to the array

  res
    .status(201)
    .json({ message: "User registered successfully", user: newUser });
};
