import express from "express";
import {
  getAllTrainers,
  assignTrainer,
  getStudentsByTrainer,
} from "../controllers/trainerController.js";

const router = express.Router();

router.get("/", getAllTrainers);
router.get("/:id/alumnos", getStudentsByTrainer);
router.put("/:id/asignar", assignTrainer);

export default router;
