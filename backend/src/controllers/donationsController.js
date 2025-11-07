import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

// --- Obtener todas las donaciones ---
export const getAllDonations = async (req, res) => {
  try {
    const donations = await prisma.donation.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(donations);
  } catch (err) {
    console.error("❌ Error al obtener donaciones:", err);
    res.status(500).json({ message: "Error al obtener donaciones" });
  }
};

// --- Crear orden PayPal ---
export const createPayPalOrder = async (req, res) => {
  try {
    const { amount: amountUSD, originalAmountQ, donorEmail } = req.body;

    console.log("💡 createPayPalOrder recibido:", { amountUSD, originalAmountQ, donorEmail });

    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString("base64");

    console.log("💡 Autenticando con PayPal Sandbox...");

    const orderRes = await fetch(`${process.env.PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{ amount: { currency_code: "USD", value: amountUSD } }]
      }),
    });

    const orderData = await orderRes.json();
    console.log("✅ PayPal create order response:", orderData);

    if (!orderData.id) {
      return res.status(500).json({ message: "No se pudo crear la orden PayPal", orderData });
    }

    // Guardamos DONDE ORIGINAL EN Q
    const donation = await prisma.donation.create({
      data: {
        orderId: orderData.id,
        amount: originalAmountQ,          // monto en quetzales
        amountUSD: parseFloat(amountUSD), // monto en USD
        userId: req.user?.userId || null,
        donorEmail: donorEmail || null,
        paymentMethod: "paypal",
        status: "pending",
      },
    });

    console.log("✅ Donación PayPal registrada en DB:", donation);

    res.json({ id: orderData.id, amount: donation.amount });
  } catch (err) {
    console.error("❌ Error en createPayPalOrder:", err);
    res.status(500).json({ message: "Error al crear orden PayPal", error: err.message });
  }
};

// --- Capturar orden PayPal ---
export const capturePayPalOrder = async (req, res) => {
  try {
    const { orderID } = req.params;

    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString("base64");

    const captureRes = await fetch(`${process.env.PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    });

    const captureData = await captureRes.json();
    console.log("✅ PayPal capture response:", captureData);

    const donation = await prisma.donation.update({
      where: { orderId: orderID },
      data: { status: "completed" },
    });

    res.json({
      message: "Donación completada",
      payerName: captureData.payer?.name?.given_name || "Donante",
      amount: donation.amount, // monto ORIGINAL en quetzales
    });
  } catch (err) {
    console.error("❌ Error al capturar orden PayPal:", err);
    res.status(500).json({ message: "Error al capturar orden PayPal", error: err.message });
  }
};

// --- Donación Paggo ---
export const createPaggoDonation = async (req, res) => {
  const { amount, donorEmail, concept } = req.body;

  if (!amount || !donorEmail || !concept) return res.status(400).json({ message: "Faltan datos" });
  if (!process.env.PAGGO_API_KEY) return res.status(500).json({ message: "API Key Paggo no configurada" });

  try {
    const response = await fetch("https://api.paggoapp.com/api/center/transactions/create-link", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-KEY": process.env.PAGGO_API_KEY },
      body: JSON.stringify({ amount, email: donorEmail, concept })
    });

    const data = await response.json();
    if (!data.result?.link) return res.status(500).json({ message: "No se pudo generar el link Paggo", data });

    const donation = await prisma.donation.create({
      data: {
        orderId: String(data.transactionId || data.result?.id || "pending"),
        amount: parseFloat(amount),
        donorEmail,
        paymentMethod: "paggo",
        user: req.user?.userId ? { connect: { id: req.user.userId } } : undefined,
      },
    });

    res.json({ success: true, result: { link: data.result.link } });
  } catch (err) {
    console.error("❌ Error Paggo:", err);
    res.status(500).json({ message: "Error al procesar Paggo", error: err.message });
  }
};
