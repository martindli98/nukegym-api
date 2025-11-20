import express from "express";
import { createRutine, deleteRutine, getRoutineByUser, getRoutineDetails } from "../controllers/routineController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { allowRoutine, requireActiveMembership } from "../middleware/membershipMiddleware.js";

const router = express.Router();

// Ruta protegida para obtener la rutina del usuario
router.post("/", authenticateToken, requireActiveMembership, allowRoutine, createRutine)
router.get("/user", authenticateToken, requireActiveMembership, allowRoutine, getRoutineByUser);
router.get("/:id", requireActiveMembership, allowRoutine, getRoutineDetails)
router.delete("/:id", authenticateToken, requireActiveMembership, allowRoutine, deleteRutine);

export default router;
