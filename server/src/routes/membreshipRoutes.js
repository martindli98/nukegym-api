import express from "express";
import {
  getMembership,
  getMembershipList,
  getPlans,
  updatePlan,
} from "../controllers/membershipController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/status", authenticateToken, getMembership);
router.get("/membership", authenticateToken, getMembership);
router.get("/list", authenticateToken, getMembershipList);

router.get("/plans", getPlans);
router.put("/plans/:id", authenticateToken, updatePlan);

export default router;
