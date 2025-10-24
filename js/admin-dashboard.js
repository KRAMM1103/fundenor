document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  // --- Verificar si hay sesión ---
  if (!token) {
    alert("Debes iniciar sesión para acceder al panel de administración.");
    window.location.href = "../login/login.html";
    return;
  }

  try {
    // --- Verificar que el usuario sea admin ---
    const res = await fetch("http://localhost:4000/api/admin/verify", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 403) {
      alert("Acceso denegado. Solo los administradores pueden entrar.");
      window.location.href = "../index.html";
      return;
    }

    if (res.status === 401) {
      alert("Tu sesión ha expirado. Inicia sesión nuevamente.");
      localStorage.removeItem("token");
      window.location.href = "../login/login.html";
      return;
    }

    const data = await res.json();
    console.log("✅ Admin verificado:", data.user);

    // --- Mostrar iniciales del usuario en el avatar ---
    const avatar = document.querySelector(".avatar");
    if (avatar && data.user?.name) {
      avatar.textContent = data.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }

    // --- Cargar las donaciones ---
    await cargarDonaciones(token);
  } catch (error) {
    console.error("Error al verificar sesión:", error);
    alert("Error al verificar tu sesión. Inicia sesión nuevamente.");
    localStorage.removeItem("token");
    window.location.href = "../login/login.html";
  }
});

// --- Función para cargar donaciones ---
async function cargarDonaciones(token) {
  const tbody = document.querySelector(".table tbody");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="8">Cargando donaciones...</td></tr>`;

  try {
    const res = await fetch("http://localhost:4000/api/admin/donations", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Error al obtener donaciones: ${errorText}`);
    }

    const donations = await res.json();
    tbody.innerHTML = "";

    if (donations.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8">No hay donaciones registradas.</td></tr>`;
      return;
    }

    donations.forEach((d) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>#${d.id}</td>
        <td>${d.user?.name || "Desconocido"}</td>
        <td>Q ${(d.amount ?? 0).toFixed(2)}</td>
        <td>${d.program || "-"}</td>
        <td>${d.method || "-"}</td>
        <td>${new Date(d.createdAt ?? Date.now()).toLocaleDateString()}</td>
        <td>
          <span class="badge ${
            d.status === "Aprobado" ? "badge--success" : "badge--warning"
          }">
            ${d.status || "Pendiente"}
          </span>
        </td>
        <td><button class="btn-ghost btn-sm" data-open-detail="${
          d.user?.name
        }">Ver</button></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="8">Error al cargar donaciones.</td></tr>`;
  }
}
