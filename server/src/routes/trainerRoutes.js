import express from "express";
import {
  getAllTrainers,
  assignTrainer,
  getStudentsByTrainer,
  getTrainersByTurn,
  updateTrainerTurn,
  updateTrainerAdmin,
} from "../controllers/trainerController.js";
import { authenticateToken, onlyAdmin } from "../middleware/authMiddleware.js"

const router = express.Router();

router.get("/", getAllTrainers);
router.get("/trainers", getTrainersByTurn)
router.get("/:id/alumnos", getStudentsByTrainer);
router.put("/:id/asignar", assignTrainer);
router.put("/updateTurn", updateTrainerTurn);
router.put("/:id/update", authenticateToken, onlyAdmin, updateTrainerAdmin);


export default router;
