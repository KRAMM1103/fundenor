document.addEventListener("DOMContentLoaded", () => {
  // ================== MODAL ==================
  const btnNew = document.getElementById("btnNewBecada");
  const modal = document.getElementById("modalBecada");
  const closeModal = document.getElementById("closeModal");
  const form = document.getElementById("formBecada");

  let editId = null; // ID de la becada a editar

  btnNew.addEventListener("click", () => {
    editId = null;
    form.reset();
    modal.classList.add("open");
  });

  closeModal.addEventListener("click", () => modal.classList.remove("open"));

  // ================== SELECT MUNICIPIOS ==================
  const departamentoSelect = document.getElementById("departamento");
  const municipioSelect = document.getElementById("municipio");

  const municipios = {
    "Alta Verapaz": [
      "Cobán","Santa Cruz Verapaz","San Cristóbal Verapaz","Tactic",
      "Tamahú","San Miguel Tucurú","Panzóz","Senahú",
      "San Pedro Carchá","San Juan Chamelco","San Agustín Lanquín",
      "Santa María Cahabón","Chisec","Chahal","Fray Bartolomé de las Casas",
      "Santa Catalina La Tinta","Raxruhá"
    ],
    "Baja Verapaz": [
      "Salamá","San Miguel Chicaj","Rabinal","Cubulco",
      "Granados","Santa Cruz el Chol","San Jerónimo","Purulhá"
    ]
  };

  departamentoSelect.addEventListener("change", () => {
    const selected = departamentoSelect.value;
    municipioSelect.innerHTML = "<option value=''>Selecciona</option>";
    if (municipios[selected]) {
      municipios[selected].forEach(m => {
        const option = document.createElement("option");
        option.value = m;
        option.textContent = m;
        municipioSelect.appendChild(option);
      });
    }
  });

  // ================== CARDS Y TABLA ==================
  const tableBody = document.querySelector("#tableBecadas tbody");
  const totalBecadasEl = document.getElementById("totalBecadas");
  const becadasComunitariaEl = document.getElementById("becadasComunitaria");
  const becadasResidenciaEl = document.getElementById("becadasResidencia");

  async function loadBecadas() {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No hay token, inicia sesión");

      const res = await fetch("http://localhost:4000/api/admin/becadas", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Error al obtener las becadas");

      const becadas = await res.json();

      tableBody.innerHTML = "";
      let total = becadas.length;
      let comunitaria = 0;
      let residencia = 0;

      becadas.forEach(b => {
        if (b.tipo_beca === "Comunitaria") comunitaria++;
        if (b.tipo_beca === "Residencia") residencia++;

        let edad = "";
        if (b.fecha_nacimiento) {
          const nacimiento = new Date(b.fecha_nacimiento);
          const diff = Date.now() - nacimiento.getTime();
          edad = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
        }

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${b.nombre}</td>
          <td>${b.fecha_nacimiento ? new Date(b.fecha_nacimiento).toLocaleDateString() : ""}</td>
          <td>${edad}</td>
          <td>${b.grado}</td>
          <td>${b.tipo_beca}</td>
          <td>${b.comunidad}</td>
          <td>
            <button class="btnEdit" data-id="${b.id}">✏️</button>
            <button class="btnDelete" data-id="${b.id}">🗑️</button>
          </td>
        `;
        tableBody.appendChild(tr);
      });

      totalBecadasEl.textContent = total;
      becadasComunitariaEl.textContent = comunitaria;
      becadasResidenciaEl.textContent = residencia;

      attachTableEvents(); // Asignar eventos a los botones
    } catch (err) {
      console.error(err);
      alert("❌ Error al cargar las becadas");
    }
  }

  // ================== FORMULARIO SUBMIT ==================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      nombre: document.getElementById("nombre").value,
      fechaNacimiento: document.getElementById("fechaNacimiento").value,
      grado: document.getElementById("grado").value,
      tipoBeca: document.getElementById("tipoBeca").value,
      departamento: departamentoSelect.value,
      municipio: municipioSelect.value,
      comunidad: document.getElementById("comunidad").value,
      tallaPlayera: document.getElementById("tallaPlayera").value,
      tallaZapatos: document.getElementById("tallaZapatos").value,
      necesidades: document.getElementById("necesidades").value
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("No hay token, inicia sesión");

      let url = "http://localhost:4000/api/admin/becadas";
      let method = "POST";

      if (editId) {
        url += `/${editId}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (res.ok) {
        alert(editId ? "✏️ Becada actualizada correctamente" : "✅ Becada registrada correctamente");
        form.reset();
        municipioSelect.innerHTML = "<option value=''>Selecciona un departamento primero</option>";
        modal.classList.remove("open");
        editId = null;
        loadBecadas();
      } else {
        alert("❌ Error: " + (result.message || "No se pudo procesar la becada"));
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error de conexión con el servidor");
    }
  });

  // ================== BOTONES EDITAR / ELIMINAR ==================
  function attachTableEvents() {
    document.querySelectorAll(".btnEdit").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        editId = id;

        try {
          const token = localStorage.getItem("token");
          const res = await fetch(`http://localhost:4000/api/admin/becadas/${id}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });

          if (!res.ok) throw new Error("No se pudo obtener la becada");

          const b = await res.json();

          // Cargar datos en el modal
          document.getElementById("nombre").value = b.nombre;
          document.getElementById("fechaNacimiento").value = b.fecha_nacimiento ? b.fecha_nacimiento.split('T')[0] : "";
          document.getElementById("grado").value = b.grado;
          document.getElementById("tipoBeca").value = b.tipo_beca;
          departamentoSelect.value = b.departamento;

          // Llenar municipios y seleccionar
          municipioSelect.innerHTML = "<option value=''>Selecciona</option>";
          if (municipios[b.departamento]) {
            municipios[b.departamento].forEach(m => {
              const option = document.createElement("option");
              option.value = m;
              option.textContent = m;
              if (m === b.municipio) option.selected = true;
              municipioSelect.appendChild(option);
            });
          }

          document.getElementById("comunidad").value = b.comunidad;
          document.getElementById("tallaPlayera").value = b.talla_playera;
          document.getElementById("tallaZapatos").value = b.talla_zapatos;
          document.getElementById("necesidades").value = b.necesidades;

          modal.classList.add("open");
        } catch (err) {
          console.error(err);
          alert("❌ Error al cargar la becada para editar");
        }
      });
    });

    document.querySelectorAll(".btnDelete").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        if (!confirm("¿Seguro que deseas eliminar esta becada?")) return;

        try {
          const token = localStorage.getItem("token");
          const res = await fetch(`http://localhost:4000/api/admin/becadas/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
          });

          if (!res.ok) throw new Error("No se pudo eliminar la becada");

          alert("🗑️ Becada eliminada correctamente");
          loadBecadas();
        } catch (err) {
          console.error(err);
          alert("❌ Error al eliminar la becada");
        }
      });
    });
  }

  // ================== CARGAR BECADAS INICIAL ==================
  loadBecadas();
});
