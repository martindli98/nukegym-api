// routes/userRoutes.js
import express from "express";
import {
  getAllUsers,
  createUser,
  getUserProfile,
  updateUserProfile,
} from "../controllers/userController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/get-user", getAllUsers);
router.post("/create-user", createUser);
router.get("/profile", authenticateToken, getUserProfile); // Ruta para obtener perfil
router.put("/profile", authenticateToken, updateUserProfile); // Ruta para actualizar perfil

export default router;
