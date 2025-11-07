import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// ==============================
// 📄 Obtener todos los usuarios
// ==============================
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
    const becasManagers = usuarios.filter(u => u.role === "becasManager").length;

    res.json({ usuarios, totalUsers, admins, normales, becasManagers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener los usuarios" });
  }
};

// ==============================
// 👤 Obtener un usuario por ID
// ==============================
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

// ==============================
// ➕ Crear nuevo usuario
// ==============================
export const createUsuario = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validación básica
    if (!name || !email || !password || !role)
      return res.status(400).json({ message: "Todos los campos son obligatorios" });

    // Validar rol permitido
    const rolesPermitidos = ["admin", "user", "becasManager"];
    if (!rolesPermitidos.includes(role))
      return res.status(400).json({ message: "Rol no permitido" });

    // Evitar duplicados
    const existe = await prisma.user.findUnique({ where: { email } });
    if (existe)
      return res.status(400).json({ message: "El correo ya está registrado" });

    // Encriptar contraseña
    const hashed = await bcrypt.hash(password, 10);

    const nuevoUsuario = await prisma.user.create({
      data: { name, email, password: hashed, role }
    });

    res.status(201).json(nuevoUsuario);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al crear el usuario" });
  }
};

// ==============================
// ✏️ Actualizar usuario
// ==============================
export const updateUsuario = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role } = req.body;

  try {
    // Verificar si el usuario existe
    const userExist = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!userExist) return res.status(404).json({ message: "Usuario no encontrado" });

    // Validar rol permitido
    const rolesPermitidos = ["admin", "user", "becasManager"];
    if (role && !rolesPermitidos.includes(role))
      return res.status(400).json({ message: "Rol no permitido" });

    // Preparar datos actualizados
    const updatedData = { name, email, role };
    if (password && password.trim() !== "") {
      updatedData.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: updatedData
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al actualizar el usuario" });
  }
};

// ==============================
// 🗑️ Eliminar usuario
// ==============================
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
