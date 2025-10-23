import express from "express";
import { createRutine, deleteRutine, getRoutineByUser, getRoutineDetails } from "../controllers/routineController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Ruta protegida para obtener la rutina del usuario
router.post("/", createRutine)
router.get("/user", authenticateToken, getRoutineByUser);
router.get("/:id", getRoutineDetails)
router.delete("/:id", authenticateToken, deleteRutine);

export default router;
