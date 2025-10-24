import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Obtener todos los usuarios con conteo de roles
export const getUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    });

    // Conteo de roles
    const totalUsers = usuarios.length;
    const admins = usuarios.filter(u => u.role === "admin").length;
    const normales = usuarios.filter(u => u.role === "user").length;

    res.json({ usuarios, totalUsers, admins, normales });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener los usuarios" });
  }
};

// Obtener un usuario específico
export const getUsuarioById = async (req, res) => {
  const { id } = req.params;
  try {
    const usuario = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(usuario);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener el usuario" });
  }
};

// Eliminar usuario
export const deleteUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id: Number(id) } });
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al eliminar el usuario" });
  }
};
