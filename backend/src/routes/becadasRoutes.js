import express from "express";
import { createBecada, getAllBecadas, getBecadaById, deleteBecada } from "../controllers/becasController.js";

const router = express.Router();

// Middleware de autenticación opcional
// router.use(authMiddleware);

router.get("/", getAllBecadas);       // Listado completo
router.get("/:id", getBecadaById);    // Obtener una por id
router.post("/", createBecada);       // Crear nueva becada
router.delete("/:id", deleteBecada);  // Eliminar becada

export default router;
