import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ================== CREAR ==================
export const createBecada = async (req, res) => {
  try {
    const {
      nombre,
      fechaNacimiento,
      grado,
      tipoBeca,
      departamento,
      municipio,
      comunidad,
      tallaPlayera,
      tallaZapatos,
      necesidades
    } = req.body;

    // Validación simple
    if (!nombre || !fechaNacimiento || !grado || !tipoBeca || !departamento || !municipio || !comunidad || !tallaPlayera)
      return res.status(400).json({ message: "Faltan campos obligatorios" });

    const becada = await prisma.becadas.create({
      data: {
        nombre,
        fecha_nacimiento: new Date(fechaNacimiento),
        grado,
        tipo_beca: tipoBeca,
        departamento,
        municipio,
        comunidad,
        talla_playera: tallaPlayera,
        talla_zapatos: tallaZapatos,
        necesidades
      }
    });

    res.status(201).json(becada);
  } catch (err) {
    console.error("Error en createBecada:", err);
    res.status(500).json({ message: "Error al crear becada" });
  }
};

// ================== OBTENER TODAS ==================
export const getAllBecadas = async (req, res) => {
  try {
    const becadas = await prisma.becadas.findMany({
      orderBy: { fecha_registro: "desc" }
    });
    res.json(becadas);
  } catch (err) {
    console.error("Error en getAllBecadas:", err);
    res.status(500).json({ message: "Error al obtener becadas" });
  }
};

// ================== OBTENER UNA ==================
export const getBecadaById = async (req, res) => {
  try {
    const { id } = req.params;
    const becada = await prisma.becadas.findUnique({
      where: { id: parseInt(id) }
    });
    if (!becada) return res.status(404).json({ message: "Becada no encontrada" });
    res.json(becada);
  } catch (err) {
    console.error("Error en getBecadaById:", err);
    res.status(500).json({ message: "Error al obtener becada" });
  }
};

// ================== ELIMINAR ==================
export const deleteBecada = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.becadas.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: "Becada eliminada correctamente" });
  } catch (err) {
    console.error("Error en deleteBecada:", err);
    res.status(500).json({ message: "Error al eliminar becada" });
  }
};
