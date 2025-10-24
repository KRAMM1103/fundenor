// --- donaciones.js ---
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  function isLoggedIn() {
    return !!token;
  }

  // --- Obtener correo desde token JWT ---
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
    const fixedAmount = container.dataset.amount ? parseFloat(container.dataset.amount) : null;

    if (!isLoggedIn()) {
      container.innerHTML = `<p style="text-align:center">Inicia sesión para donar.</p>`;
      container.style.color = "#444";
      container.style.fontSize = "14px";
      container.style.padding = "10px";
      container.style.border = "1px dashed #ccc";
      container.addEventListener("click", () => {
        window.location.href = "../login/login.html";
      });
      return;
    }

    paypal.Buttons({
  onClick: (data, actions) => {
    if (fixedAmount) return actions.resolve();
    const v = input ? parseFloat(input.value) : 0;
    if (!v || v <= 0) {
      alert("Ingrese un monto válido para PayPal.");
      return actions.reject();
    }
    return actions.resolve();
  },
  createOrder: (data, actions) => {
    let amount = fixedAmount;
    if (input && input.value) amount = parseFloat(input.value);

    // --- Conversión de Q a USD ---
    const conversionRate = 8.2; // 1 USD = Q8.2 (puedes actualizar según la tasa real)
    const usdAmount = (amount / conversionRate).toFixed(2);

    return actions.order.create({
      purchase_units: [{
        amount: {
          value: usdAmount,
          currency_code: "USD" // PayPal necesita USD
        }
      }]
    });
  },
  onApprove: (data, actions) => {
    return actions.order.capture().then(details => {
      const paidAmountUSD = details.purchase_units[0].amount.value;
      
      // Convertir de vuelta a quetzales para la visualización
      const conversionRate = 8.2;
      const paidAmountGTQ = (paidAmountUSD * conversionRate).toFixed(2);

      alert(`Gracias por tu donación de Q.${paidAmountGTQ}, ${details.payer.name.given_name}!`);

      fetch("http://localhost:4000/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
          orderId: details.id,
          amount: paidAmountGTQ,
          donorEmail: details.payer.email_address
        })
      })
      .then(res => res.json())
      .then(d => console.log("Donación registrada:", d))
      .catch(err => console.error("Error al registrar donación:", err));
    });
  },
  onError: (err) => {
    console.error("Error con PayPal:", err);
    alert("Hubo un problema al procesar tu donación con PayPal.");
  }
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
        alert("No se pudo obtener tu correo. Inicia sesión de nuevo.");
        return;
      }

      try {
        const res = await fetch("http://localhost:4000/api/donations/paggo", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          },
          body: JSON.stringify({ amount, donorEmail, concept })
        });

        const data = await res.json();
        console.log("Respuesta Paggo:", data); // depuración

        if (data.result && data.result.link) {
          window.location.href = data.result.link; // ✅ redirige correctamente
        } else {
          console.error("Error Paggo:", data);
          alert("No se pudo generar el link de Paggo. Revisa la consola.");
        }
      } catch (err) {
        console.error("Error al llamar a Paggo:", err);
        alert("Ocurrió un error al procesar tu donación con Paggo.");
      }
    });
  });
});
