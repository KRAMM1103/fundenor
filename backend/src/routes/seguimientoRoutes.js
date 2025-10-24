import express from "express";
import { authenticateToken, requireRole } from "../middleware/authMiddleware.js";
import {
  addSeguimiento,
  getSeguimientos,
  addDatosFinales,
  getDatosFinales
} from "../controllers/seguimientoController.js";

const router = express.Router();

// Todas estas rutas requieren ser admin
router.use(authenticateToken, requireRole("admin"));

// Seguimiento mensual
router.post("/mensual", addSeguimiento);
router.get("/mensual/:becadaId", getSeguimientos);

// Datos finales
router.post("/finales", addDatosFinales);
router.get("/finales/:becadaId", getDatosFinales);

export default router;
