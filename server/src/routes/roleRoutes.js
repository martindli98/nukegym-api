import express from "express";
import { getUsers, updateRoles } from "../controllers/roleController.js";
import { authenticateToken, onlyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, onlyAdmin, getUsers);
router.put("/:id", authenticateToken, onlyAdmin, updateRoles);

export default router;
