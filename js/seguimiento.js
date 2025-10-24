// seguimiento.js
document.addEventListener("DOMContentLoaded", () => {
  const selectBecada = document.getElementById("selectBecada");
  const tableMensual = document.querySelector("#tableMensual tbody");
  const tableFinales = document.querySelector("#tableFinales tbody");

  const btnNewMensual = document.getElementById("btnNewSeguimiento");
  const modalMensual = document.getElementById("modalMensual");
  const closeModalMensual = document.getElementById("closeModalMensual");
  const formMensual = document.getElementById("formMensual");

  const modalFinales = document.getElementById("modalFinales");
  const closeModalFinales = document.getElementById("closeModalFinales");
  const formFinales = document.getElementById("formFinales");

  const API_URL = "http://localhost:4000/api"; // Cambiar si el backend está en otro puerto

  // ================== MODALES ==================
  btnNewMensual.addEventListener("click", () => {
    if (!selectBecada.value) {
      alert("Selecciona primero una becada");
      return;
    }
    formMensual.reset();
    modalMensual.classList.add("open");
  });

  closeModalMensual.addEventListener("click", () =>
    modalMensual.classList.remove("open")
  );
  closeModalFinales.addEventListener("click", () =>
    modalFinales.classList.remove("open")
  );

  // ================== CARGAR BECADAS EN SELECT ==================
  async function loadBecadas() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/becadas`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      selectBecada.innerHTML = `<option value="">-- Selecciona una becada --</option>`;
      const becadas = Array.isArray(data) ? data : data.becadas;
      if (becadas && becadas.length > 0) {
  becadas.forEach((b) => {
      const opt = document.createElement("option");
      opt.value = b.id;
      opt.textContent = b.nombre;
      selectBecada.appendChild(opt);
    });
  } else {
    alert("No hay becadas registradas.");
  }
    } catch (err) {
      console.error(err);
      alert("❌ Error al cargar becadas");
    }
  }

  // ================== CARGAR TABLAS ==================
  async function loadSeguimiento() {
    const becadaId = selectBecada.value;
    if (!becadaId) return;

    try {
      const token = localStorage.getItem("token");

      // Seguimiento mensual
      const resMensual = await fetch(
        `${API_URL}/admin/seguimiento/mensual/${becadaId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const mensual = await resMensual.json();

      tableMensual.innerHTML = "";
      mensual.forEach((m) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${m.mes}</td>
          <td>${m.principalNecesidad}</td>
          <td>${m.sesion1_tema || ""}</td>
          <td>${m.sesion2_tema || ""}</td>
          <td>${m.sesion3_tema || ""}</td>
          <td>${m.sesion4_tema || ""}</td>
          <td>${m.sesion5_tema || ""}</td>
          <td>${m.sesion6_tema || ""}</td>
          <td>${m.sesion7_tema || ""}</td>
        `;
        tableMensual.appendChild(tr);
      });

      // Datos finales
      const resFinales = await fetch(
        `${API_URL}/admin/seguimiento/finales/${becadaId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const finales = await resFinales.json();

      tableFinales.innerHTML = "";
      finales.forEach((f) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${f.anio}</td>
          <td>${f.insumosRecibidos || ""}</td>
          <td>${f.estadoCiclo}</td>
          <td>${f.papeleriaCompleta ? "Sí" : "No"}</td>
          <td>${f.solicitudContinuidad ? "Sí" : "No"}</td>
        `;
        tableFinales.appendChild(tr);
      });
    } catch (err) {
      console.error(err);
      alert("❌ Error al cargar el seguimiento");
    }
  }

  // ================== SELECCIÓN DE BECADA ==================
  selectBecada.addEventListener("change", loadSeguimiento);

  // ================== GUARDAR SEGUIMIENTO MENSUAL ==================
  formMensual.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!selectBecada.value) {
      alert("Selecciona una becada antes de guardar el seguimiento");
      return;
    }

    const data = {
      becadaId: selectBecada.value,
      mes: document.getElementById("mes").value,
      principalNecesidad: document.getElementById("principalNecesidad").value,
      sesiones: [
        document.getElementById("sesion1").value,
        document.getElementById("sesion2").value,
        document.getElementById("sesion3").value,
        document.getElementById("sesion4").value,
        document.getElementById("sesion5").value,
        document.getElementById("sesion6").value,
        document.getElementById("sesion7").value,
      ],
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/seguimiento/mensual`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        alert("✅ Seguimiento mensual registrado correctamente");
        formMensual.reset();
        modalMensual.classList.remove("open");
        loadSeguimiento();
      } else {
        alert("❌ " + (result.message || "No se pudo registrar"));
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error de conexión con el servidor");
    }
  });

  // ================== GUARDAR DATOS FINALES ==================
  formFinales.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!selectBecada.value) {
      alert("Selecciona una becada antes de guardar los datos finales");
      return;
    }

    const data = {
      becadaId: selectBecada.value,
      anio: parseInt(document.getElementById("anio").value),
      insumosRecibidos: document.getElementById("insumosRecibidos").value,
      estadoCiclo: document.getElementById("estadoCiclo").value,
      papeleriaCompleta:
        document.getElementById("papeleriaCompleta").value === "true",
      solicitudContinuidad:
        document.getElementById("solicitudContinuidad").value === "true",
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/seguimiento/finales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        alert("✅ Datos finales registrados correctamente");
        formFinales.reset();
        modalFinales.classList.remove("open");
        loadSeguimiento();
      } else {
        alert("❌ " + (result.message || "No se pudo registrar"));
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error de conexión con el servidor");
    }
  });

  // ================== INICIAL ==================
  loadBecadas();
});
