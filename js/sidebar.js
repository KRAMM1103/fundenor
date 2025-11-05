// sidebar.js — inserta el sidebar solo para admins y ajusta el contenido

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = localStorage.getItem("role");

  // Si no hay sesión o el rol no es admin, salir
  if (!user || role !== "admin") return;

  // Evitar insertar en páginas de admin ya existentes
  const currentPage = window.location.pathname;
  if (
    currentPage.includes("admin.html") ||
    currentPage.includes("becas.html") ||
    currentPage.includes("seguimiento.html") ||
    currentPage.includes("usuarios.html")
  ) {
    return;
  }

  // Agregar clase al body para estilos especiales cuando hay sidebar
  document.body.classList.add("with-sidebar");

  // Crear el contenedor principal
  const appDiv = document.createElement("div");
  appDiv.classList.add("app");

  // Insertar el sidebar
  appDiv.innerHTML = `
    <aside class="sidebar" id="sidebar">
      <div class="brand">
        <img src="img/logo.png" class="brand__logo" alt="Logo">
      </div>
      <nav class="menu">
        <a href="admin.html" class="menu__item"><span class="ico">💰</span><span>Donaciones</span></a>
        <a href="becas.html" class="menu__item"><span class="ico">🎓</span><span>Becas</span></a>
        <a href="seguimiento.html" class="menu__item"><span class="ico">📊</span><span>Seguimiento</span></a>
        <a href="usuarios.html" class="menu__item"><span class="ico">👥</span><span>Usuarios</span></a>
      </nav>
    </aside>
  `;

  // Crear main y mover todo el contenido actual dentro de él
  const mainContent = document.createElement("main");
  mainContent.classList.add("main");

  while (document.body.firstChild) {
    mainContent.appendChild(document.body.firstChild);
  }

  appDiv.appendChild(mainContent);
  document.body.appendChild(appDiv);

  // Vincular evento de cerrar sesión
  const logoutBtn = document.getElementById("logoutSidebarBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "login/login.html";
    });
  }
});
