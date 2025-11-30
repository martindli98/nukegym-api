import express from "express";
import {
  createRutine,
  deleteRutine,
  getRoutineByUser,
  getRoutineByUserId,
  getRoutineDetails,
  updateRoutineName,
  updateExercise,
  deleteExercise,
  addExercises,
} from "../controllers/routineController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  allowRoutine,
  requireActiveMembership,
} from "../middleware/membershipMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  requireActiveMembership,
  allowRoutine,
  createRutine
);
router.get(
  "/user",
  authenticateToken,
  requireActiveMembership,
  allowRoutine,
  getRoutineByUser
);
router.get(
  "/user/:userId",
  authenticateToken,
  requireActiveMembership,
  allowRoutine,
  getRoutineByUserId
);
router.put(
  "/:id/name",
  authenticateToken,
  requireActiveMembership,
  allowRoutine,
  updateRoutineName
);
router.post(
  "/:id/exercises",
  authenticateToken,
  requireActiveMembership,
  allowRoutine,
  addExercises
);
router.put(
  "/:id_rutina/exercise/:id_ejercicio",
  authenticateToken,
  requireActiveMembership,
  allowRoutine,
  updateExercise
);
router.delete(
  "/:id_rutina/exercise/:id_ejercicio",
  authenticateToken,
  requireActiveMembership,
  allowRoutine,
  deleteExercise
);
router.get("/:id", requireActiveMembership, allowRoutine, getRoutineDetails);
router.delete(
  "/:id",
  authenticateToken,
  requireActiveMembership,
  allowRoutine,
  deleteRutine
);

export default router;
