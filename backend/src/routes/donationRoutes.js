import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { getAllDonations, createDonation, createPaggoDonation } from "../controllers/donationsController.js";

const router = express.Router();

// Obtener todas las donaciones (admins)
router.get("/", authenticateToken, getAllDonations);

// Registrar donación PayPal
router.post("/", authenticateToken, createDonation);

// Registrar donación Paggo
router.post("/paggo", authenticateToken, createPaggoDonation);

export default router;
