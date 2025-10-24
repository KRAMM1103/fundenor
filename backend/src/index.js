import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";
import becadasRoutes from "./routes/becadasRoutes.js";
import usuariosRoutes from "./routes/usuariosRoutes.js";
import seguimientoRoutes from "./routes/seguimientoRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas principales
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/admin/becadas", becadasRoutes);
app.use("/api/admin/usuarios", usuariosRoutes);
app.use("/api/admin/seguimiento", seguimientoRoutes);

app.get("/", (req, res) => {
  res.send("Servidor FUNDENOR funcionando 🚀");
});

// --- Rutas de retorno de pagos PayPal ---
app.get("/donations/success", (req, res) => {
  res.send("✅ Pago realizado con éxito. Gracias por tu donación!");
});

app.get("/donations/cancel", (req, res) => {
  res.send("❌ Pago cancelado.");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Servidor ejecutándose en http://localhost:${PORT}`);
});
