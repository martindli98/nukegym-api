import express from "express";
import { getRoutineByUser } from "../controllers/routineController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Ruta protegida para obtener la rutina del usuario
router.get("/user", authenticateToken, getRoutineByUser);

export default router;
