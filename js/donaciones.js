document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const QtoUSD = 0.1275; // 1 Q ≈ 0.1275 USD (ajusta según tipo de cambio actual)

  function isLoggedIn() {
    return !!token;
  }

  function getUserEmail() {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.email || null;
    } catch {
      return null;
    }
  }

  // --- PAYPAL ---
  const paypalContainers = document.querySelectorAll(".paypal-container");

  paypalContainers.forEach((container) => {
    const parent = container.closest(".donacion-card, .causa-card");
    const input = parent.querySelector(".donation-amount");
    const fixedAmountQ = container.dataset.amount ? parseFloat(container.dataset.amount) : null;

    if (!isLoggedIn()) {
      container.innerHTML = `<p style="text-align:center">Inicia sesión para donar.</p>`;
      container.style.color = "#444";
      container.style.fontSize = "14px";
      container.style.padding = "10px";
      container.style.border = "1px dashed #ccc";
      container.addEventListener("click", () => { window.location.href = "../login/login.html"; });
      return;
    }

    paypal.Buttons({
      style: { layout: 'vertical', color: 'blue', shape: 'rect', label: 'paypal' },

      onClick: (data, actions) => {
        const vQ = input ? parseFloat(input.value) : fixedAmountQ;
        if (!vQ || vQ <= 0) {
          alert("Ingrese un monto válido para PayPal.");
          return actions.reject();
        }
        return actions.resolve();
      },

      createOrder: async (data, actions) => {
        const amountQ = input ? parseFloat(input.value) : fixedAmountQ;
        const amountUSD = (amountQ * QtoUSD).toFixed(2);

        const res = await fetch("http://localhost:4000/api/donations/create-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
          },
          body: JSON.stringify({ 
            amount: amountUSD,
            originalAmountQ: amountQ,
            donorEmail: getUserEmail()
          })
        });

        const order = await res.json();
        return order.id;
      },

      onApprove: async (data, actions) => {
        const res = await fetch(`http://localhost:4000/api/donations/capture-order/${data.orderID}`, {
          method: "POST",
          headers: { Authorization: "Bearer " + token }
        });

        const capture = await res.json();
        alert(`Gracias por tu donación de Q.${capture.amount}, ${capture.payerName}!`);
      },

      onError: (err) => {
        console.error("Error con PayPal:", err);
        alert("Hubo un problema al procesar tu donación con PayPal.");
      },

    }).render(container);
  });

  // --- PAGGO ---
  const paggoButtons = document.querySelectorAll(".paggo-btn");
  paggoButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!isLoggedIn()) {
        alert("Inicia sesión para donar con Paggo.");
        window.location.href = "../login/login.html";
        return;
      }

      const parent = btn.closest(".donacion-card, .causa-card");
      const input = parent.querySelector(".donation-amount");
      const amount = input ? parseFloat(input.value) : parseFloat(btn.dataset.amount);
      const concept = parent.querySelector("h3, h4")?.innerText || "Donación";

      if (!amount || amount <= 0) {
        alert("Ingrese un monto válido para Paggo.");
        return;
      }

      const donorEmail = getUserEmail();
      if (!donorEmail) {
        alert("No se pudo obtener tu correo. Inicia sesión nuevamente.");
        return;
      }

      try {
        const res = await fetch("http://localhost:4000/api/donations/paggo", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
          },
          body: JSON.stringify({ amount, donorEmail, concept })
        });

        const data = await res.json();
        if (data.success && data.result?.link) {
          window.open(data.result.link, "_blank");
        } else {
          console.error(data);
          alert("No se pudo generar el link de Paggo.");
        }
      } catch (err) {
        console.error("Error Paggo:", err);
        alert("Error al procesar Paggo.");
      }
    });
  });
});
