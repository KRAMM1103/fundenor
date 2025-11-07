document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const sidebar = document.querySelector(".sidebar");

  if (!token || !sidebar) return;

  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user.role) {
    console.warn("No se encontró información de usuario o rol.");
    return;
  }

  const role = user.role;

  // Limpiar sidebar anterior
  sidebar.innerHTML = "";

  // === Marca / Encabezado ===
  const brandDiv = document.createElement("div");
  brandDiv.classList.add("brand");
  brandDiv.innerHTML = `
    <img src="../img/logo.png" alt="Fundenor" class="brand__logo">
    <span class="brand__name">Fundenor</span>
  `;
  sidebar.appendChild(brandDiv);

  // === Contenedor de menú ===
  const menuDiv = document.createElement("div");
  menuDiv.classList.add("menu");

  // Definir enlaces según rol
  let links = [];
  if (role === "admin") {
    links = [
      { text: "Donaciones", href: "../admin.html", icon: "💰" },
      { text: "Becas", href: "../becas.html", icon: "🎓" },
      { text: "Seguimiento", href: "../seguimiento.html", icon: "📋" },
      { text: "Usuarios", href: "../usuarios.html", icon: "👥" },
    ];
  } else if (role === "becasManager") {
    links = [
      { text: "Becas", href: "../becas.html", icon: "🎓" },
      { text: "Seguimiento", href: "../seguimiento.html", icon: "📋" },
    ];
  } else {
    // Usuarios normales no tienen sidebar
    return;
  }

  // Renderizar enlaces
  links.forEach(link => {
    const a = document.createElement("a");
    a.href = link.href;
    a.classList.add("menu__item");
    a.innerHTML = `<span class="ico">${link.icon}</span><span>${link.text}</span>`;

    // Marcar como activo si coincide la página actual
    if (window.location.pathname.includes(link.href.split("/").pop())) {
      a.classList.add("active");
    }

    menuDiv.appendChild(a);
  });

  sidebar.appendChild(menuDiv);

  // === Sección inferior (logout) ===
  const bottomDiv = document.createElement("div");
  bottomDiv.classList.add("sidebar__bottom");

  const logoutBtn = document.createElement("button");
  logoutBtn.textContent = "Cerrar sesión";
  logoutBtn.classList.add("logout-btn");
  logoutBtn.style.padding = "10px 14px";
  logoutBtn.style.background = "#004aad";
  logoutBtn.style.color = "#fff";
  logoutBtn.style.border = "none";
  logoutBtn.style.borderRadius = "6px";
  logoutBtn.style.cursor = "pointer";

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "../login/login.html";
  });

  bottomDiv.appendChild(logoutBtn);
  sidebar.appendChild(bottomDiv);
});
