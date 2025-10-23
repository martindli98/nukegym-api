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


const app = express();
app.use(cors());

app.use(express.json()); // Middleware to parse JSON bodies

// const client = new MercadoPagoConfig({
//   accessToken: "APP_USR-8382445006725147-101100-441e410c25fc5f9044bca97ac5c27c57-2104582716",
// });

// app.post("/api/create_preference", async (req, res) => {
//   try {
//  console.log("📦 Datos recibidos del frontend:", req.body);

//     const body = {
//       items: [
//         {
//           title: req.body.title,
//           quantity: Number(req.body.quantity),
//           unit_price: Number(req.body.price),
//           currency_id: "ARS",
//         },
//       ],
//       back_urls: {
//         success: "http://localhost:3000/membership/success",
//         failure: "http://localhost:3000/membership/failure",
//         pending: "http://localhost:3000/membership/pending",
//       },
//       // auto_return: "approved",
//     }

// console.log("🧠 Body enviado a Mercado Pago:", body);

//     const preference = new Preference(client);
//     const result = await preference.create({ body });
// console.log("✅ Preferencia creada:", result);

//     res.json({
//       preferenceId: result.id
//     });
//   } catch (error) {
//     console.error("Error creating preference:", error);
//     res.status(500).json({ error: "Error al crear la preferencia" });
//   }
// });
app.use("/api/payments", paymentRoutes);

app.use("/api/users", userRoutes); // Use user routes for API calls
app.use("/api/auth", authRoutes); // Use user routes for API calls
app.use("/api/membership", membershipRoutes);
app.use("/api/feedback", feedbackRoutes);

app.use("/api/roles", roleRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api", classRoutes);
app.use("/api/routine",routineRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/exercises", exerciseRoutes);


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
