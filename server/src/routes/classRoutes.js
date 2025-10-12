import express from "express";
import {
  getAllClasses,
  getAvailableClasses,
  createClass,
  updateClass,
  deleteClass,
  createReservation,
  getUserReservations,
  cancelReservation,
} from "../controllers/classController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas para clases
router.get("/classes", getAllClasses); // Todas las clases (admin/entrenador)
router.get("/classes/available", getAvailableClasses); // Clases disponibles (todos)
router.post("/classes", createClass); // Crear clase (admin/entrenador)
router.put("/classes/:id", updateClass); // Actualizar clase (admin/entrenador)
router.delete("/classes/:id", deleteClass); // Eliminar clase (admin)

// Rutas para reservas
router.post("/reservations", createReservation); // Crear reserva (cliente)
router.get("/reservations", getUserReservations); // Reservas del usuario
router.delete("/reservations/:id", cancelReservation); // Cancelar reserva (cliente)

export default router;
