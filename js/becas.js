document.addEventListener("DOMContentLoaded", () => {
  const btnNew = document.getElementById("btnNewBecada");
  const modal = document.getElementById("modalBecada");
  const closeModal = document.getElementById("closeModal");
  const form = document.getElementById("formBecada");

  let editId = null;

  // ======== Abrir modal para nueva becada ========
  btnNew.addEventListener("click", () => {
    editId = null;
    form.reset();
    modal.classList.add("open");
  });

  closeModal.addEventListener("click", () => modal.classList.remove("open"));

  // ======== Select municipios ========
  const departamentoSelect = document.getElementById("departamento");
  const municipioSelect = document.getElementById("municipio");

  const municipios = {
    "Alta Verapaz": ["Cobán","Santa Cruz Verapaz","San Cristóbal Verapaz","Tactic","Tamahú","San Miguel Tucurú","Panzós","Senahú","San Pedro Carchá","San Juan Chamelco","San Agustín Lanquín","Santa María Cahabón","Chisec","Chahal","Fray Bartolomé de las Casas","Santa Catalina La Tinta","Raxruhá"],
    "Baja Verapaz": ["Salamá","San Miguel Chicaj","Rabinal","Cubulco","Granados","Santa Cruz el Chol","San Jerónimo","Purulhá"]
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
    applyFilters();
  });

  // ======== Cargar becadas ========
  const tableBody = document.querySelector("#tableBecadas tbody");
  const totalBecadasEl = document.getElementById("totalBecadas");
  const becadasComunitariaEl = document.getElementById("becadasComunitaria");
  const becadasResidenciaEl = document.getElementById("becadasResidencia");

  async function loadBecadas(filters = {}) {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No hay token, inicia sesión");

      const res = await fetch("http://localhost:4000/api/admin/becadas", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Error al obtener las becadas");

      let becadas = await res.json();

      // Aplicar filtros si existen
      if (filters.tipoBeca) becadas = becadas.filter(b => b.tipo_beca === filters.tipoBeca);
      if (filters.grado) becadas = becadas.filter(b => b.grado === filters.grado);
      if (filters.departamento) becadas = becadas.filter(b => b.departamento === filters.departamento);
      if (filters.municipio) becadas = becadas.filter(b => b.municipio === filters.municipio);

      tableBody.innerHTML = "";

      let total = becadas.length;
      let comunitaria = 0;
      let residencia = 0;

      becadas.forEach(b => {
        if (b.tipo_beca === "Comunitaria") comunitaria++;
        if (b.tipo_beca === "Residencia") residencia++;

        let fechaFormateada = "";
        let edad = "";
        if (b.fecha_nacimiento) {
          const [year, month, day] = b.fecha_nacimiento.split('T')[0].split('-');
          fechaFormateada = `${day}/${month}/${year}`;
          const nacimiento = new Date(year, month - 1, day);
          edad = Math.floor((Date.now() - nacimiento.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
        }

        const necesidadesTexto = b.necesidades ? (() => {
          try { return JSON.parse(b.necesidades).join(", "); } catch { return ""; }
        })() : "";

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${b.nombres || ""}</td>
          <td>${b.apellidos || ""}</td>
          <td>${fechaFormateada}</td>
          <td>${edad}</td>
          <td>${b.grado || ""}</td>
          <td>${b.tipo_beca || ""}</td>
          <td>${b.departamento || ""}</td>
          <td>${b.municipio || ""}</td>
          <td>${b.comunidad || ""}</td>
          <td>${b.talla_playera || ""}</td>
          <td>${b.talla_zapatos || ""}</td>
          <td>${necesidadesTexto}</td>
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

      attachTableEvents();
    } catch (err) {
      console.error(err);
    }
  }

  // ======== Editar / Eliminar eventos ========
  function attachTableEvents() {
    // ----- Editar -----
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

          // ====== Cargar datos en el formulario ======
          document.getElementById("nombres").value = b.nombres;
          document.getElementById("apellidos").value = b.apellidos;
          document.getElementById("fechaNacimiento").value = b.fecha_nacimiento ? b.fecha_nacimiento.split('T')[0] : "";
          document.getElementById("grado").value = b.grado;
          document.getElementById("tipoBeca").value = b.tipo_beca;
          departamentoSelect.value = b.departamento;

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
          document.getElementById("tallaPlayera").value = b.talla_playera || "";
          document.getElementById("tallaZapatos").value = b.talla_zapatos || "";

          // ====== Cargar necesidades existentes -----
          lista.length = 0;
          ulLista.innerHTML = "";
          if (b.necesidades) {
            try {
              const arr = JSON.parse(b.necesidades);
              if (Array.isArray(arr)) {
                arr.forEach(n => {
                  lista.push(n);
                  const li = document.createElement("li");
                  li.textContent = n;

                  const btnEliminar = document.createElement("button");
                  btnEliminar.textContent = "❌";
                  btnEliminar.style.marginLeft = "8px";
                  btnEliminar.type = "button";
                  btnEliminar.addEventListener("click", () => {
                    ulLista.removeChild(li);
                    const index = lista.indexOf(n);
                    if (index > -1) lista.splice(index, 1);
                    inputHidden.value = JSON.stringify(lista);
                  });

                  li.appendChild(btnEliminar);
                  ulLista.appendChild(li);
                });
              }
            } catch {}
          }
          inputHidden.value = JSON.stringify(lista);

          modal.classList.add("open");
        } catch (err) {
          console.error(err);
          alert("❌ Error al cargar la becada para editar");
        }
      });
    });

    // ----- Eliminar -----
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

  // ======== Necesidades educativas ========
  const lista = [];
  const btnAgregar = document.getElementById("btnAgregarNecesidad");
  const inputNueva = document.getElementById("nuevaNecesidad");
  const ulLista = document.getElementById("listaNecesidades");
  const inputHidden = document.getElementById("necesidades");

  btnAgregar.addEventListener("click", () => {
    const val = inputNueva.value.trim();
    if (!val) return;
    lista.push(val);

    const li = document.createElement("li");
    li.textContent = val;

    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "❌";
    btnEliminar.style.marginLeft = "8px";
    btnEliminar.type = "button";
    btnEliminar.addEventListener("click", () => {
      ulLista.removeChild(li);
      const index = lista.indexOf(val);
      if (index > -1) lista.splice(index, 1);
      inputHidden.value = JSON.stringify(lista);
    });

    li.appendChild(btnEliminar);
    ulLista.appendChild(li);

    inputNueva.value = "";
    inputHidden.value = JSON.stringify(lista);
  });

  form.addEventListener("reset", () => {
    lista.length = 0;
    ulLista.innerHTML = "";
    inputHidden.value = "";
  });

  // ======== Guardar nueva / editar becada ========
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) return alert("No hay token, inicia sesión");

    const data = {
      nombres: document.getElementById("nombres").value,
      apellidos: document.getElementById("apellidos").value,
      fechaNacimiento: document.getElementById("fechaNacimiento").value || null,
      grado: document.getElementById("grado").value,
      tipoBeca: document.getElementById("tipoBeca").value,
      departamento: document.getElementById("departamento").value,
      municipio: document.getElementById("municipio").value,
      comunidad: document.getElementById("comunidad").value,
      tallaPlayera: document.getElementById("tallaPlayera").value || null,
      tallaZapatos: document.getElementById("tallaZapatos").value || null,
      necesidades: inputHidden.value
    };

    try {
      let res;
      if (editId) {
        res = await fetch(`http://localhost:4000/api/admin/becadas/${editId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(data)
        });
      } else {
        res = await fetch("http://localhost:4000/api/admin/becadas", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(data)
        });
      }

      if (!res.ok) throw new Error("Error al guardar la becada");

      alert(editId ? "✏️ Becada editada correctamente" : "✅ Becada creada correctamente");
      modal.classList.remove("open");
      form.reset();
      editId = null;
      loadBecadas();
    } catch (err) {
      console.error(err);
      alert("❌ Error al guardar la becada");
    }
  });

  // ======== FILTROS DE TABLA ========
  const filterTipoBeca = document.getElementById("filterTipoBeca");
  const filterGrado = document.getElementById("filterGrado");
  const filterDepartamento = document.getElementById("filterDepartamento");
  const filterMunicipio = document.getElementById("filterMunicipio");

  function applyFilters() {
    const tipo = filterTipoBeca.value;
    const grado = filterGrado.value;
    const depto = filterDepartamento.value;
    const muni = filterMunicipio.value;

    Array.from(tableBody.rows).forEach(row => {
      const cells = row.cells;
      const tipoMatch = !tipo || cells[5].textContent === tipo;
      const gradoMatch = !grado || cells[4].textContent === grado;
      const deptoMatch = !depto || cells[6].textContent.includes(depto);
      const muniMatch = !muni || cells[7].textContent.includes(muni);

      row.style.display = tipoMatch && gradoMatch && deptoMatch && muniMatch ? "" : "none";
    });
  }

  [filterTipoBeca, filterGrado, filterDepartamento, filterMunicipio].forEach(f => {
    f.addEventListener("change", applyFilters);
  });

  // ======== Cargar inicialmente ========
  loadBecadas();
});
