import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// =================== Seguimiento Mensual ===================
export const addSeguimiento = async (req, res) => {
  try {
    const { becadaId, mes, sesiones, asistenciaEncuentro } = req.body;

    if (!becadaId || !mes || !sesiones || !Array.isArray(sesiones)) {
      return res.status(400).json({ message: "Datos incompletos para registrar seguimiento" });
    }

    const seguimiento = await prisma.seguimientoMensual.create({
      data: {
        becadaId: parseInt(becadaId),
        mes,
        sesion1_tema: sesiones[0]?.tema || null,
        sesion1_asistencia: sesiones[0]?.asistencia || false,
        sesion2_tema: sesiones[1]?.tema || null,
        sesion2_asistencia: sesiones[1]?.asistencia || false,
        sesion3_tema: sesiones[2]?.tema || null,
        sesion3_asistencia: sesiones[2]?.asistencia || false,
        sesion4_tema: sesiones[3]?.tema || null,
        sesion4_asistencia: sesiones[3]?.asistencia || false,
        sesion5_tema: sesiones[4]?.tema || null,
        sesion5_asistencia: sesiones[4]?.asistencia || false,
        sesion6_tema: sesiones[5]?.tema || null,
        sesion6_asistencia: sesiones[5]?.asistencia || false,
        sesion7_tema: sesiones[6]?.tema || null,
        sesion7_asistencia: sesiones[6]?.asistencia || false,
        asistenciaEncuentroAnual: asistenciaEncuentro || false,
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
    if (!becadaId) return res.status(400).json({ message: "Falta ID de becada" });

    const seguimientos = await prisma.seguimientoMensual.findMany({
      where: { becadaId: parseInt(becadaId) },
      orderBy: { mes: "asc" },
    });

    res.json(seguimientos);
  } catch (err) {
    console.error("Error al obtener seguimientos:", err);
    res.status(500).json({ message: "Error al obtener seguimientos" });
  }
};

// =================== Datos Finales ===================
export const addDatosFinales = async (req, res) => {
  try {
    const { becadaId, anio, insumosRecibidos, estadoCiclo, papeleriaCompleta, solicitudContinuidad } = req.body;

    if (!becadaId || !anio || !estadoCiclo || papeleriaCompleta === undefined || solicitudContinuidad === undefined) {
      return res.status(400).json({ message: "Datos incompletos para registrar datos finales" });
    }

    const datos = await prisma.datosFinales.create({
      data: {
        becadaId: parseInt(becadaId),
        anio: parseInt(anio),
        insumosRecibidos: insumosRecibidos || "",
        estadoCiclo,
        papeleriaCompleta,
        solicitudContinuidad,
      },
    });

    res.json(datos);
  } catch (err) {
    console.error("Error al registrar datos finales:", err);
    res.status(500).json({ message: "Error al registrar datos finales" });
  }
};

export const getDatosFinales = async (req, res) => {
  try {
    const { becadaId } = req.params;
    if (!becadaId) return res.status(400).json({ message: "Falta ID de becada" });

    const datos = await prisma.datosFinales.findMany({
      where: { becadaId: parseInt(becadaId) },
      orderBy: { anio: "asc" },
    });

    res.json(datos);
  } catch (err) {
    console.error("Error al obtener datos finales:", err);
    res.status(500).json({ message: "Error al obtener datos finales" });
  }
};
