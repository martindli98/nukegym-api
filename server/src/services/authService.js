// services/userService.js
import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

// Register User
export const registerUser = async (user) => {
  try {
    const [existingUser] = await pool.query(
      "SELECT * FROM Usuario WHERE email = ? OR nro_documento = ?",
      [user.email, user.nro_documento /* , user.nombre */]
    );
    if (existingUser.length > 0) {
      return { success: false, message: "El usuario ya existe." };
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);
    const query = `INSERT INTO Usuario ( email, nro_documento, password, id_rol) VALUES (?, ?, ?, 2)`;
    const values = [
      /* user.nombre, */ user.email,
      user.nro_documento,
      hashedPassword,
      user.id_rol,
    ];
    await pool.query(query, values);
    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: "Falló el registro. Por favor, inténtelo de nuevo más tarde.",
    };
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
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

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
