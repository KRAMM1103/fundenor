document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://localhost:4000/api";

  // ================== SELECT BECADA ==================
  const selectBecada = document.getElementById("selectBecada");
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
          opt.textContent = `${b.nombres} ${b.apellidos || ""}`;
          selectBecada.appendChild(opt);
        });
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error al cargar becadas");
    }
  }

  // ================== VARIABLES ==================
  // Modal mensual
  const modalMensual = document.getElementById("modalMensual");
  const btnNewMensual = document.getElementById("btnNewSeguimiento");
  const closeModalMensual = document.getElementById("closeModalMensual");
  const formMensual = document.getElementById("formMensual");
  const tableMensual = document.querySelector("#tableMensual tbody");
  let editIdMensual = null;

  // Modal finales
  const modalFinales = document.getElementById("modalFinales");
  const btnNewDatosFinales = document.getElementById("btnNewDatosFinales");
  const closeModalFinales = document.getElementById("closeModalFinales");
  const formFinales = document.getElementById("formFinales");
  const tableFinales = document.querySelector("#tableFinales tbody");
  let editIdFinales = null;

  // Insumos dinámicos
  const addInsumoBtn = document.getElementById("addInsumoBtn");
  const insumoInput = document.getElementById("insumoInput");
  const insumosList = document.getElementById("insumosList");
  let insumosArray = [];

  // ================== MODALES ==================
  btnNewMensual.addEventListener("click", () => {
    if (!selectBecada.value) return alert("Selecciona primero una becada");
    formMensual.reset();
    editIdMensual = null;
    modalMensual.classList.add("open");
  });
  closeModalMensual.addEventListener("click", () => {
    formMensual.reset();
    modalMensual.classList.remove("open");
  });

  btnNewDatosFinales.addEventListener("click", () => {
    if (!selectBecada.value) return alert("Selecciona primero una becada");
    formFinales.reset();
    insumosList.innerHTML = "";
    insumosArray = [];
    editIdFinales = null;
    modalFinales.classList.add("open");
  });
  closeModalFinales.addEventListener("click", () => {
    formFinales.reset();
    insumosList.innerHTML = "";
    insumosArray = [];
    const papeleriaCheckboxes = document.querySelectorAll("#papeleriaChecklist input[type=checkbox]");
    papeleriaCheckboxes.forEach(cb => cb.checked = false);
    modalFinales.classList.remove("open");
  });

  // ================== INSUMOS DINÁMICOS ==================
  addInsumoBtn.addEventListener("click", () => {
    const valor = insumoInput.value.trim();
    if (!valor) return;
    if (insumosArray.includes(valor)) return alert("Este insumo ya fue agregado");

    insumosArray.push(valor);
    const item = document.createElement("span");
    item.classList.add("insumo-item");
    item.textContent = valor;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "x";
    removeBtn.addEventListener("click", () => {
      insumosArray = insumosArray.filter(i => i !== valor);
      item.remove();
    });

    item.appendChild(removeBtn);
    insumosList.appendChild(item);
    insumoInput.value = "";
  });

  // ================== CARGAR TABLAS ==================
  async function loadSeguimiento() {
    const becadaId = selectBecada.value;
    if (!becadaId) return;

    const token = localStorage.getItem("token");

    // --- Seguimiento mensual ---
    try {
      const resMensual = await fetch(`${API_URL}/admin/seguimiento/mensual/${becadaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const mensual = await resMensual.json();
      tableMensual.innerHTML = "";
      mensual.forEach(m => {
        const tr = document.createElement("tr");
        let sesionesResumen = "";
        for (let i = 1; i <= 7; i++) {
          const tema = m[`sesion${i}_tema`] || "-";
          const asistencia = m[`sesion${i}_asistencia`] ? "SI" : "NO";
          sesionesResumen += `S${i}: ${tema} (${asistencia})<br>`;
        }
        sesionesResumen += `Encuentro Anual: ${m.asistenciaEncuentroAnual ? "SI" : "NO"}`;
        tr.innerHTML = `
          <td>${m.mes}</td>
          <td>${sesionesResumen}</td>
          <td>
            <button class="btnEditMensual" data-id="${m.id}">✏️</button>
            <button class="btnDeleteMensual" data-id="${m.id}">🗑️</button>
          </td>
        `;
        tableMensual.appendChild(tr);
      });

      // Editar mensual
      document.querySelectorAll(".btnEditMensual").forEach(btn => {
        btn.addEventListener("click", async () => {
          const id = btn.dataset.id;
          editIdMensual = id;
          try {
            const res = await fetch(`${API_URL}/admin/seguimiento/mensual/registro/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            formMensual.reset();
            document.getElementById("mes").value = data.mes;
            for (let i = 1; i <= 7; i++) {
              document.getElementById(`sesion${i}`).value = data[`sesion${i}_tema`] || "";
              document.getElementById(`asistencia${i}`).value = data[`sesion${i}_asistencia`] ? "true" : "false";
            }
            document.getElementById("asistenciaEncuentro").value = data.asistenciaEncuentroAnual ? "true" : "false";
            modalMensual.classList.add("open");
          } catch (err) {
            console.error(err);
            alert("❌ No se pudo cargar el registro para editar");
          }
        });
      });

      // Eliminar mensual
      document.querySelectorAll(".btnDeleteMensual").forEach(btn => {
        btn.addEventListener("click", async () => {
          const id = btn.dataset.id;
          if (!confirm("¿Seguro que deseas eliminar este registro mensual?")) return;
          try {
            await fetch(`${API_URL}/admin/seguimiento/mensual/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            loadSeguimiento();
          } catch (err) {
            console.error(err);
            alert("❌ Error al eliminar el registro mensual");
          }
        });
      });
    } catch (err) { console.error(err); }

    // --- Datos finales ---
    try {
      const resFinales = await fetch(`${API_URL}/admin/seguimiento/finales/${becadaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const finales = await resFinales.json();
      tableFinales.innerHTML = "";
      finales.forEach(f => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${f.anio}</td>
          <td>${f.insumosRecibidos || ""}</td>
          <td>${f.estadoCiclo}</td>
          <td>${f.papeleriaCompleta ? "Sí" : "No"}</td>
          <td>${f.solicitudContinuidad ? "Sí" : "No"}</td>
          <td>
            <button class="btnEditFinales" data-id="${f.id}">✏️</button>
            <button class="btnDeleteFinales" data-id="${f.id}">🗑️</button>
          </td>
        `;
        tableFinales.appendChild(tr);
      });

      // Editar finales
      document.querySelectorAll(".btnEditFinales").forEach(btn => {
        btn.addEventListener("click", async () => {
          const id = btn.dataset.id;
          editIdFinales = id;
          try {
            const res = await fetch(`${API_URL}/admin/seguimiento/finales/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const f = await res.json();
            formFinales.reset();
            insumosArray = f.insumosRecibidos ? f.insumosRecibidos.split(", ") : [];
            insumosList.innerHTML = "";
            insumosArray.forEach(val => {
              const item = document.createElement("span");
              item.classList.add("insumo-item");
              item.textContent = val;
              const removeBtn = document.createElement("button");
              removeBtn.type = "button";
              removeBtn.textContent = "x";
              removeBtn.addEventListener("click", () => {
                insumosArray = insumosArray.filter(i => i !== val);
                item.remove();
              });
              item.appendChild(removeBtn);
              insumosList.appendChild(item);
            });
            document.getElementById("anio").value = f.anio;
            document.getElementById("estadoCiclo").value = f.estadoCiclo;
            const papeleriaCheckboxes = document.querySelectorAll("#papeleriaChecklist input[type=checkbox]");
            papeleriaCheckboxes.forEach(cb => cb.checked = f.papeleriaCompleta);
            document.getElementById("solicitudContinuidad").value = f.solicitudContinuidad ? "true" : "false";
            modalFinales.classList.add("open");
          } catch (err) {
            console.error(err);
            alert("❌ No se pudo cargar el registro final para editar");
          }
        });
      });

      // Eliminar finales
      document.querySelectorAll(".btnDeleteFinales").forEach(btn => {
        btn.addEventListener("click", async () => {
          const id = btn.dataset.id;
          if (!confirm("¿Seguro que deseas eliminar este registro final?")) return;
          try {
            await fetch(`${API_URL}/admin/seguimiento/finales/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            loadSeguimiento();
          } catch (err) {
            console.error(err);
            alert("❌ Error al eliminar el registro final");
          }
        });
      });
    } catch (err) { console.error(err); }
  }

  selectBecada.addEventListener("change", loadSeguimiento);

  // ================== GUARDAR ==================
  formMensual.addEventListener("submit", async e => {
    e.preventDefault();
    if (!selectBecada.value) return alert("Selecciona una becada antes de guardar el seguimiento");

    const sesiones = [];
    for (let i = 1; i <= 7; i++) {
      const tema = document.getElementById(`sesion${i}`).value;
      const asistencia = document.getElementById(`asistencia${i}`).value === "true";
      sesiones.push({ tema, asistencia });
    }

    const data = {
      becadaId: selectBecada.value,
      mes: document.getElementById("mes").value,
      sesiones,
      asistenciaEncuentro: document.getElementById("asistenciaEncuentro").value === "true",
    };

    try {
      const token = localStorage.getItem("token");
      const url = editIdMensual ? `${API_URL}/admin/seguimiento/mensual/${editIdMensual}` : `${API_URL}/admin/seguimiento/mensual`;
      const method = editIdMensual ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error al guardar el seguimiento mensual");

      alert(editIdMensual ? "✏️ Seguimiento mensual editado" : "✅ Seguimiento mensual registrado");
      formMensual.reset();
      editIdMensual = null;
      modalMensual.classList.remove("open");
      loadSeguimiento();
    } catch (err) {
      console.error(err);
      alert("❌ Error al guardar el seguimiento mensual");
    }
  });

  formFinales.addEventListener("submit", async e => {
    e.preventDefault();
    if (!selectBecada.value) return alert("Selecciona una becada antes de guardar los datos finales");

    const papeleriaCheckboxes = document.querySelectorAll("#papeleriaChecklist input[type=checkbox]");
    const papeleriaCompletada = Array.from(papeleriaCheckboxes).every(cb => cb.checked);

    const data = {
      becadaId: selectBecada.value,
      anio: parseInt(document.getElementById("anio").value),
      insumosRecibidos: insumosArray.join(", "),
      estadoCiclo: document.getElementById("estadoCiclo").value,
      papeleriaCompleta: papeleriaCompletada,
      solicitudContinuidad: document.getElementById("solicitudContinuidad").value === "true",
    };

    try {
      const token = localStorage.getItem("token");
      const url = editIdFinales ? `${API_URL}/admin/seguimiento/finales/${editIdFinales}` : `${API_URL}/admin/seguimiento/finales`;
      const method = editIdFinales ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error al guardar los datos finales");

      alert(editIdFinales ? "✏️ Datos finales editados" : "✅ Datos finales registrados");
      formFinales.reset();
      insumosList.innerHTML = "";
      insumosArray = [];
      papeleriaCheckboxes.forEach(cb => cb.checked = false);
      editIdFinales = null;
      modalFinales.classList.remove("open");
      loadSeguimiento();
    } catch (err) {
      console.error(err);
      alert("❌ Error al guardar los datos finales");
    }
  });

  // ================== INICIAL ==================
  loadBecadas();
});
