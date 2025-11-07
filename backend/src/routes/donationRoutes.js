import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  getAllDonations,
  createPaggoDonation,
  createPayPalOrder,
  capturePayPalOrder
} from "../controllers/donationsController.js";

const router = express.Router();

router.get("/", authenticateToken, getAllDonations);
router.post("/paggo", authenticateToken, createPaggoDonation);

// Endpoints PayPal
router.post("/create-order", authenticateToken, createPayPalOrder);
router.post("/capture-order/:orderID", authenticateToken, capturePayPalOrder);

export default router;
