import express from "express";
import { getUsuarios, getUsuarioById, deleteUsuario } from "../controllers/usuariosController.js";
import { authenticateToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Todas estas rutas requieren que el usuario esté autenticado y sea admin
router.use(authenticateToken, requireRole("admin"));

router.get("/", getUsuarios);          // Listar todos los usuarios
router.get("/:id", getUsuarioById);    // Obtener usuario por ID
router.delete("/:id", deleteUsuario);  // Eliminar usuario

export default router;
