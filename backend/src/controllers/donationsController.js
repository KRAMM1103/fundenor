import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch"; // npm i node-fetch@2
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

// --- Obtener todas las donaciones (solo admins) ---
export const getAllDonations = async (req, res) => {
  console.log("➡️ getAllDonations llamado");
  try {
    const donations = await prisma.donation.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    console.log("✅ Donaciones obtenidas:", donations.length);
    res.json(donations);
  } catch (err) {
    console.error("❌ Error al obtener donaciones:", err);
    res.status(500).json({ message: "Error al obtener donaciones" });
  }
};

// --- Crear donación PayPal ---
export const createDonation = async (req, res) => {
  console.log("➡️ createDonation PayPal llamado", req.body);
  const { orderId, amount, donorEmail } = req.body;
  try {
    const donation = await prisma.donation.create({
      data: {
        orderId,
        amount: parseFloat(amount),
        donorEmail,
        userId: req.user?.userId || null,
        paymentMethod: "paypal",
      },
    });
    console.log("✅ Donación PayPal registrada:", donation);
    res.json(donation);
  } catch (err) {
    console.error("❌ Error al registrar la donación PayPal:", err);
    res.status(500).json({ message: "Error al registrar la donación" });
  }
};

// --- Crear donación Paggo ---
export const createPaggoDonation = async (req, res) => {
  console.log("➡️ createPaggoDonation llamado", req.body);

  try {
    const { amount, donorEmail, concept } = req.body;
    console.log("💡 Datos recibidos:", { amount, donorEmail, concept });

    if (!amount || !donorEmail || !concept) {
      console.warn("⚠️ Faltan datos requeridos");
      return res.status(400).json({ message: "Faltan datos requeridos" });
    }

    if (!process.env.PAGGO_API_KEY) {
      console.error("❌ PAGGO_API_KEY no está definida");
      return res.status(500).json({ message: "API Key de Paggo no configurada" });
    }

    const response = await fetch(
      "https://api.paggoapp.com/api/center/transactions/create-link",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": process.env.PAGGO_API_KEY
        },
        body: JSON.stringify({ amount, email: donorEmail, concept })
      }
    );

    console.log("💡 Fetch enviado a Paggo, esperando respuesta...");

    const data = await response.json();
    console.log("✅ Respuesta Paggo ORIGINAL:", data);

    if (!data.result?.link) {
      console.error("❌ Error Paggo, link no encontrado:", data);
      return res.status(500).json({
        message: "No se pudo generar el link de Paggo",
        data
      });
    }

    // Guardar donación pendiente
    const donation = await prisma.donation.create({
      data: {
        orderId: String(data.transactionId || data.result?.id || "pending"),
        amount: parseFloat(amount),
        donorEmail,
        paymentMethod: "paggo",
        user: req.user?.userId
          ? { connect: { id: req.user.userId } }
          : undefined,
      },
    });
    console.log("✅ Donación Paggo registrada:", donation);

    // Devolver link al frontend
    console.log("➡️ Enviando link al frontend:", data.result.link);
    return res.json({
      success: true,
      result: { link: data.result.link }
    });

  } catch (err) {
    console.error("❌ Error al crear donación Paggo:", err);
    return res.status(500).json({
      message: "Error al crear donación Paggo",
      error: err.message
    });
  }
};
