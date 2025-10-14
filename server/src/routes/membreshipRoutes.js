import express from "express";
import { getMembership } from "../controllers/membershipController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/status", authenticateToken, getMembership);
router.get("/membership", authenticateToken, getMembership);
export default router;