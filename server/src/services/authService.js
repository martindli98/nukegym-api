// services/userService.js
import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

// Register User
export const registerUser = async (user) => {
  try {
    // 1) Chequear usuario existente
    const [existingUser] = await pool.query(
      "SELECT id FROM Usuario WHERE email = ? OR nro_documento = ?",
      [user.email, user.nro_documento]
    );
    if (existingUser.length > 0) {
      return { success: false, message: "El usuario ya existe." };
    }

    // 2) Buscar entrenadores disponibles en ese turno (con cupos > 0)
    const [trainers] = await pool.query(
      `SELECT id, cupos, id_usuario, turno
       FROM Entrenador
       WHERE turno = ? AND cupos > 0`,
      [user.turno]
    );

    let assignedTrainer = null;
    if (trainers.length > 0) {
      // Elegir el entrenador con mayor cupos
      trainers.sort((a, b) => b.cupos - a.cupos);
      assignedTrainer = trainers[0].id;
    }

    // 3) Hash de la contraseña
    const hashedPassword = await bcrypt.hash(user.password, 10);

    // 4) Insertar usuario (rol cliente = 2)
    const [result] = await pool.query(
      `INSERT INTO Usuario 
       (email, nro_documento, password, turno, id_trainer, id_rol)
       VALUES (?, ?, ?, ?, ?, 2)`,
      [user.email, user.nro_documento, hashedPassword, user.turno, assignedTrainer]
    );

    // 5) Si se asignó entrenador, decrementar cupos
    if (assignedTrainer) {
      await pool.query(
        "UPDATE Entrenador SET cupos = cupos - 1 WHERE id = ?",
        [assignedTrainer]
      );
    }

    return { success: true, message: "Usuario registrado correctamente" };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: "Falló el registro. Por favor, inténtelo nuevamente." };
  }
};


// Login User with JWT token
export const loginUser = async (email, password) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Usuario WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      return { success: false, message: "Usuario no encontrado." };
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return { success: false, message: "Incorrect password" };
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, id_rol: user.id_rol },
      JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    console.log("Generated token:", token); // For debugging

    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        id_rol: user.id_rol,
        rol:
          user.id_rol === 1
            ? "admin"
            : user.id_rol === 2
            ? "cliente"
            : "entrenador",
        id_trainer: user.id_trainer,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message:
        "Falló el inicio de sesión. Por favor, inténtelo de nuevo más tarde.",
    };
  }
};

// Get User Details from Token
export const getUserFromToken = async (token) => {
  try {
    const trimmedToken = token.trim();
    console.log("Received token:", trimmedToken);

    // Verify token (no `await` needed here)
    const decoded = jwt.verify(trimmedToken, JWT_SECRET);
    console.log("Decoded token:", decoded);

    // Retrieve user details from the database
    const [rows] = await pool.query(
      "SELECT id, email, nro_documento FROM Usuario WHERE id = ?",
      [decoded.id]
    );

    if (rows.length === 0) {
      return { success: false, message: "Usuario no encontrado." };
    }

    const user = rows[0];
    return { success: true, user };
  } catch (error) {
    console.error("Token verification error:", error);
    return { success: false, message: "Invalid or expired token" };
  }
};
