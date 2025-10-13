// authMiddleware.js
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticateToken = (req, res, next) => {
  
   if (req.originalUrl && req.originalUrl.includes("/api/payments/webhook")) {
    return next();
  }
  
  
  
  const header = req.headers["authorization"];
  const token = header && header.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token requerido" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token inválido" });
    req.user = decoded;
    next();
  });
};

export const onlyAdmin = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT id_rol FROM usuario WHERE id = ?", [
      req.user.id,
    ]);
    if (rows.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });

    const user = rows[0];
    if (user.id_rol !== 1) {
      return res.status(403).json({ message: "Acceso solo para administradores" });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al verificar rol" });
  }
};
