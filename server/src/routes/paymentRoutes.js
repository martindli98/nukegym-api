import express from "express";
import { createPreference, paymentWebhook } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create_preference", createPreference);
router.post("/webhook", paymentWebhook);

export default router;
