import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// =================== Seguimiento Mensual ===================
export const addSeguimiento = async (req, res) => {
  try {
    const { becadaId, mes, principalNecesidad, sesiones } = req.body;

    const seguimiento = await prisma.seguimientoMensual.create({
      data: {
        becadaId: parseInt(becadaId), // ✅ <--- Conversión aquí
        mes,
        principalNecesidad,
        sesion1_tema: sesiones?.[0],
        sesion2_tema: sesiones?.[1],
        sesion3_tema: sesiones?.[2],
        sesion4_tema: sesiones?.[3],
        sesion5_tema: sesiones?.[4],
        sesion6_tema: sesiones?.[5],
        sesion7_tema: sesiones?.[6],
      },
    });

    res.json(seguimiento);
  } catch (err) {
    console.error("Error al registrar seguimiento mensual:", err);
    res.status(500).json({ message: "Error al registrar seguimiento mensual" });
  }
};

export const getSeguimientos = async (req, res) => {
  try {
    const { becadaId } = req.params;

    const seguimientos = await prisma.seguimientoMensual.findMany({
      where: { becadaId: Number(becadaId) },
      orderBy: { mes: "asc" },
    });

    res.json(seguimientos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener seguimientos" });
  }
};

// =================== Datos Finales ===================
export const addDatosFinales = async (req, res) => {
  try {
    const { becadaId, anio, insumosRecibidos, estadoCiclo, papeleriaCompleta, solicitudContinuidad } = req.body;

    const datos = await prisma.datosFinales.create({
      data: {
        becadaId,
        anio,
        insumosRecibidos,
        estadoCiclo,
        papeleriaCompleta,
        solicitudContinuidad,
      },
    });

    res.json(datos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al registrar datos finales" });
  }
};

export const getDatosFinales = async (req, res) => {
  try {
    const { becadaId } = req.params;

    const datos = await prisma.datosFinales.findMany({
      where: { becadaId: Number(becadaId) },
      orderBy: { anio: "asc" },
    });

    res.json(datos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener datos finales" });
  }
};
