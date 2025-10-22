import express from "express";
import {
  createNotification,
  getNotifications,
  updateNotification,
  deleteNotification,
} from "../controllers/notificationController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateToken, createNotification);
router.get("/", authenticateToken, getNotifications);
router.put("/:id", authenticateToken, updateNotification);
router.delete("/:id", authenticateToken, deleteNotification);

export default router;
