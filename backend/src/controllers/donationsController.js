import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch"; // npm i node-fetch@2 si no lo tienes
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

// --- Obtener todas las donaciones (solo admins) ---
export const getAllDonations = async (req, res) => {
  try {
    const donations = await prisma.donation.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(donations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener donaciones" });
  }
};

// --- Crear donación PayPal ---
export const createDonation = async (req, res) => {
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
    res.json(donation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al registrar la donación" });
  }
};

// --- Crear donación Paggo ---
export const createPaggoDonation = async (req, res) => {
  try {
    const { amount, donorEmail, concept } = req.body;

    if (!amount || !donorEmail || !concept) {
      return res.status(400).json({ message: "Faltan datos requeridos" });
    }

    const response = await fetch(
      "https://api.paggoapp.com/api/center/transactions/create-link",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": process.env.PAGGO_API_KEY
        },
        body: JSON.stringify({
          amount,
          email: donorEmail,
          concept
        })
      }
    );

    const data = await response.json();

    console.log("Respuesta Paggo ORIGINAL:", data);

    // ✅ Validar la estructura real de Paggo
    if (!data.result?.link) {
      console.error("Error Paggo:", data);
      return res.status(500).json({
        message: "No se pudo generar el link de Paggo",
        data
      });
    }

    // ✅ Guardar donación pendiente
    await prisma.donation.create({
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

    // ✅ Devolver exactamente lo que espera el frontend
    return res.json({
      success: true,
      result: {
        link: data.result.link
      }
    });

  } catch (err) {
    console.error("Error Paggo:", err);
    return res.status(500).json({
      message: "Error al crear donación Paggo"
    });
  }
};
