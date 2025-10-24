import express from "express";
import { authenticateToken, requireRole } from "../middleware/authMiddleware.js";
import { getAllDonations } from "../controllers/donationsController.js";
import { getAllBecadas, createBecada } from "../controllers/becasController.js";


const router = express.Router();

// Verificación de admin
router.get("/verify", authenticateToken, requireRole("admin"), (req, res) => {
  res.json({ message: "Admin verificado ✅", user: req.user });
});

// Obtener todas las donaciones (solo admin)
router.get("/donations", authenticateToken, requireRole("admin"), getAllDonations);

// Obtener todas las becadas
router.get("/becadas", authenticateToken, requireRole("admin"), getAllBecadas);

// Registrar una nueva becada
router.post("/becadas", authenticateToken, requireRole("admin"), createBecada);

export default router;
