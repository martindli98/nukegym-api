import express from "express";
import {
  markAttendance,
  getMyAttendance,
  getAllAttendance,
} from "../controllers/attendanceController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/attendance/mark - Registrar asistencia por QR (requiere autenticación)
router.post("/mark", authenticateToken, markAttendance);

// GET /api/attendance/my - Obtener mis asistencias (requiere autenticación)
router.get("/my", authenticateToken, getMyAttendance);

// GET /api/attendance/all - Obtener todas las asistencias (solo admin)
router.get("/all", authenticateToken, getAllAttendance);

export default router;
