import express from "express";
import {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario
} from "../controllers/usuariosController.js";
import { authenticateToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Todas estas rutas requieren autenticación
router.use(authenticateToken);

// Solo los ADMIN pueden gestionar usuarios (crear, editar, eliminar, listar)
router.get("/", requireRole("admin"), getUsuarios);
router.get("/:id", requireRole("admin"), getUsuarioById);
router.post("/", requireRole("admin"), createUsuario);
router.put("/:id", requireRole("admin"), updateUsuario);
router.delete("/:id", requireRole("admin"), deleteUsuario);

export default router;
