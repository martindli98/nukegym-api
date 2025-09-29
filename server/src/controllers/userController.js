// controllers/userController.js
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
  try {
    const userId = req.user.id; // Del token JWT decodificado
    const {
      nombre,
      apellido,
      email,
      nro_documento,
      num_personal,
      num_emergencia,
      fechaNac,
      patologias,
    } = req.body;

    // Validaciones básicas
    if (!nombre || !apellido || !email || !nro_documento) {
      return res.status(400).json({
        success: false,
        message: "Los campos nombre, apellido, email y DNI son obligatorios",
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Formato de email inválido",
      });
    }

    // Validar DNI (8 dígitos)
    const dniRegex = /^\d{8}$/;
    if (!dniRegex.test(nro_documento)) {
      return res.status(400).json({
        success: false,
        message: "El DNI debe tener exactamente 8 dígitos",
      });
    }

    // Validar que el email no esté en uso por otro usuario
    const [existingUser] = await pool.query(
      "SELECT id FROM Usuario WHERE email = ? AND id != ? AND baja_usuario = FALSE",
      [email, userId]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: "El email ya está en uso por otro usuario",
      });
    }

    // Validar que el DNI no esté en uso por otro usuario
    const [existingDni] = await pool.query(
      "SELECT id FROM Usuario WHERE nro_documento = ? AND id != ? AND baja_usuario = FALSE",
      [nro_documento, userId]
    );

    if (existingDni.length > 0) {
      return res.status(400).json({
        success: false,
        message: "El DNI ya está en uso por otro usuario",
      });
    }

    // Formatear fecha de nacimiento si se proporciona
    let formattedFechaNac = null;
    if (fechaNac) {
      formattedFechaNac = new Date(fechaNac).toISOString().split("T")[0];
    }

    // Actualizar usuario en la base de datos
    const [result] = await pool.query(
      `
      UPDATE Usuario 
      SET 
        nombre = ?,
        apellido = ?,
        email = ?,
        nro_documento = ?,
        num_personal = ?,
        num_emergencia = ?,
        fechaNac = ?,
        patologias = ?
      WHERE id = ? AND baja_usuario = FALSE
      `,
      [
        nombre,
        apellido,
        email,
        nro_documento,
        num_personal || null,
        num_emergencia || null,
        formattedFechaNac,
        patologias || null,
        userId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Obtener los datos actualizados
    const [updatedUser] = await pool.query(
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
        r.tipo as tipo_rol
      FROM Usuario u
      LEFT JOIN Rol r ON u.id_rol = r.id
      WHERE u.id = ? AND u.baja_usuario = FALSE
      `,
      [userId]
    );

    res.json({
      success: true,
      message: "Perfil actualizado correctamente",
      user: updatedUser[0],
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor al actualizar el perfil",
    });
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
