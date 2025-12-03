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
  getStudentsClass
} from "../controllers/classController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { allowClasses, requireActiveMembership } from "../middleware/membershipMiddleware.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas para clases
router.get("/classes", getAllClasses); // Todas las clases (admin/entrenador)
router.get("/classes/available",authenticateToken, requireActiveMembership, allowClasses, getAvailableClasses); // Clases disponibles (todos)
router.post("/classes", createClass); // Crear clase (admin/entrenador)
router.get("/classes/studentsClass/:id", getStudentsClass);
router.put("/classes/:id", updateClass); // Actualizar clase (admin/entrenador)
router.delete("/classes/:id", deleteClass); // Eliminar clase (admin)

// Rutas para reservas
router.post("/reservations", requireActiveMembership, allowClasses, createReservation); // Crear reserva (cliente)
router.get("/reservations", requireActiveMembership, allowClasses, getUserReservations); // Reservas del usuario
router.delete("/reservations/:id", requireActiveMembership, allowClasses, cancelReservation); // Cancelar reserva (cliente)

export default router;
