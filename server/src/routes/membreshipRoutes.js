import express from "express";
import { getMembership } from "../controllers/membershipController.js";

const router = express.Router();

router.get("/status", getMembership);

export default router;
