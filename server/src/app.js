// app.js
import express from "express";
import userRoutes from "./routes/userRoutes.js";
import { checkConnection } from "./config/db.js";
import createAllTable from "./utils/dbUtils.js";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import membershipRoutes from "./routes/membreshipRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import trainerRoutes from "./routes/trainerRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import routineRoutes from "./routes/routineRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
// import { MercadoPagoConfig, Preference } from "mercadopago";
import notificationRoutes from "./routes/notificationRoutes.js";
import exerciseRoutes from "./routes/exerciseRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";

const app = express();
app.use(cors());

app.use(express.json()); // Middleware to parse JSON bodies

app.use("/api/payments", paymentRoutes);

app.use("/api/users", userRoutes); // Use user routes for API calls
app.use("/api/auth", authRoutes); // Use user routes for API calls
app.use("/api/membership", membershipRoutes);
app.use("/api/feedback", feedbackRoutes);

app.use("/api/roles", roleRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api", classRoutes);
app.use("/api/routine", routineRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/attendance", attendanceRoutes);

app.use(express.urlencoded({ extended: true }));

app.listen(process.env.PORT || 3000, async () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
  try {
    await checkConnection();
    await createAllTable();
  } catch (error) {
    console.log("Failed to initialize the database", error);
  }
});
