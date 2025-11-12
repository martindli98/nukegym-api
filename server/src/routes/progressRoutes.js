import express from "express";
import { getRoutineUser, insertProgress, getProgressId} from "../controllers/progressController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";


const router = express.Router();

router.get("/routine", authenticateToken, getRoutineUser);
router.post("/add", authenticateToken, insertProgress)

// Obtener progreso de una rutina
router.get("/routine/:id_rutina", authenticateToken, getProgressId);


export default router;
