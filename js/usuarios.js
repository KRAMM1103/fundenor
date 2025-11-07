document.addEventListener("DOMContentLoaded", () => {
  const btnNewUser = document.getElementById("btnNewUser");
  const modal = document.getElementById("modalUser");
  const closeModal = document.getElementById("closeModalUser");
  const form = document.getElementById("formUser");
  const tableBody = document.querySelector("#tableUsuarios tbody");

  const totalUsuariosEl = document.getElementById("totalUsuarios");
  const totalAdminsEl = document.getElementById("totalAdmins");
  const totalNormalesEl = document.getElementById("totalNormales");
  const totalBecasEl = document.getElementById("totalBecas"); // ⚙️ NUEVO (si lo agregaste en el HTML)

  let editId = null;

  // ================== MODAL ==================
  btnNewUser.addEventListener("click", () => {
    editId = null;
    form.reset();
    modal.classList.add("open");
  });

  closeModal.addEventListener("click", () => modal.classList.remove("open"));

  // ================== CARGAR USUARIOS ==================
  async function loadUsers() {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No hay token, inicia sesión");

      const res = await fetch("http://localhost:4000/api/admin/usuarios", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Error al obtener los usuarios");

      const data = await res.json();
      const users = data.usuarios || [];
      const totalUsers = data.totalUsers || users.length;
      const admins = data.admins || users.filter(u => u.role === "admin").length;
      const normales = data.normales || users.filter(u => u.role === "user").length;
      const becasManagers = data.becasManagers || users.filter(u => u.role === "becasManager").length;

      // Limpiar tabla
      tableBody.innerHTML = "";

      users.forEach(u => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>${u.role}</td>
          <td>${new Date(u.createdAt).toLocaleDateString()}</td>
          <td>
            <button class="btnEdit" data-id="${u.id}">✏️</button>
            <button class="btnDelete" data-id="${u.id}">🗑️</button>
          </td>
        `;
        tableBody.appendChild(tr);
      });

      // Actualizar totales
      totalUsuariosEl.textContent = totalUsers;
      totalAdminsEl.textContent = admins;
      totalNormalesEl.textContent = normales;
      if (totalBecasEl) totalBecasEl.textContent = becasManagers;

      attachTableEvents();
    } catch (err) {
      console.error(err);
      alert("❌ Error al cargar los usuarios");
    }
  }

  // ================== FORMULARIO ==================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value,
      role: document.getElementById("role").value
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("No hay token, inicia sesión");

      let url = "http://localhost:4000/api/admin/usuarios";
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
        alert(editId ? "✏️ Usuario actualizado" : "✅ Usuario registrado");
        form.reset();
        modal.classList.remove("open");
        editId = null;
        loadUsers();
      } else {
        alert("❌ Error: " + (result.message || "No se pudo procesar el usuario"));
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
          const res = await fetch(`http://localhost:4000/api/admin/usuarios/${id}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (!res.ok) throw new Error("No se pudo obtener el usuario");

          const u = await res.json();
          document.getElementById("name").value = u.name;
          document.getElementById("email").value = u.email;
          document.getElementById("password").value = "";
          document.getElementById("role").value = u.role;

          modal.classList.add("open");
        } catch (err) {
          console.error(err);
          alert("❌ Error al cargar el usuario para editar");
        }
      });
    });

    document.querySelectorAll(".btnDelete").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;

        try {
          const token = localStorage.getItem("token");
          const res = await fetch(`http://localhost:4000/api/admin/usuarios/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (!res.ok) throw new Error("No se pudo eliminar el usuario");

          alert("🗑️ Usuario eliminado");
          loadUsers();
        } catch (err) {
          console.error(err);
          alert("❌ Error al eliminar el usuario");
        }
      });
    });
  }

  // ================== CARGAR INICIAL ==================
  loadUsers();
});
