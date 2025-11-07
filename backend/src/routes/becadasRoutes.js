import express from "express";
import { createBecada, getAllBecadas, getBecadaById, deleteBecada, updateBecada } from "../controllers/becasController.js";

const router = express.Router();

// Rutas de becadas
router.get("/", getAllBecadas);       // Listado completo
router.get("/:id", getBecadaById);    // Obtener una por id
router.post("/", createBecada);       // Crear nueva becada
router.delete("/:id", deleteBecada);  // Eliminar becada
router.put("/:id", updateBecada);     // Actualizar becada

export default router;
