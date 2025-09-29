import express from "express";
import { feedback , getUserId } from "../controllers/feedbackController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/status", authenticateToken, getUserId) 
router.post("/postFeedback", authenticateToken, feedback) ;

export default router;
