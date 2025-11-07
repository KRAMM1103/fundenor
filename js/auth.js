// --- CONFIGURACIÓN BASE ---
const API_BASE = "http://localhost:4000/api/auth";

// --- UTILIDADES DE SESIÓN ---
function saveSession(user, token) {
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", token);
  localStorage.setItem("role", user.role);
}

function getUser() {
  return JSON.parse(localStorage.getItem("user"));
}

function getToken() {
  return localStorage.getItem("token");
}

function isLoggedIn() {
  return !!localStorage.getItem("token");
}

function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "/login/login.html";
}

// --- FUNCIÓN EXTRA: Validar acceso admin ---
function checkAdminAccess() {
  const role = localStorage.getItem("role");
  if (role !== "admin") {
    alert("Acceso restringido. Debes iniciar sesión como administrador.");
    window.location.href = "/login/login.html";
  }
}

// --- NUEVO: Validar acceso de becasManager ---
function checkBecasManagerAccess() {
  const role = localStorage.getItem("role");
  if (role !== "becasManager" && role !== "admin") {
    alert("Acceso restringido. Solo personal autorizado.");
    window.location.href = "/login/login.html";
  }
}

// --- ACTUALIZAR NAVBAR / SESIÓN ---
function updateNavbar() {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;

  const existingSession = isLoggedIn();
  const user = getUser();
  const role = localStorage.getItem("role");

  const adminElements = document.querySelectorAll(".admin-only");
  adminElements.forEach(el => (el.style.display = role === "admin" ? "block" : "none"));

  const sessionArea = document.getElementById("sessionArea");
  if (sessionArea) sessionArea.remove();

  const div = document.createElement("div");
  div.id = "sessionArea";

  if (existingSession && user) {
    div.innerHTML = `
      <span style="margin-right: 10px; font-weight: 600; color: black;">
        👋 Hola, ${user.name} (${role})
      </span>
      <button id="logoutBtn" style="background: white; color: black; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer;">
        Cerrar sesión
      </button>
    `;
  } else {
    div.innerHTML = `
      <a href="/login/login.html" style="text-decoration:none; color: var(--primary); font-weight:600;">Iniciar sesión</a>
      <span> / </span>
      <a href="/login/registro.html" style="text-decoration:none; color: var(--primary); font-weight:600;">Registrarse</a>
    `;
  }

  navbar.appendChild(div);

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
}

document.addEventListener("DOMContentLoaded", updateNavbar);

// --- LOGIN ---
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailInput.value,
          password: passwordInput.value,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      saveSession(data.user, data.token);
      alert("Inicio de sesión exitoso");

      // ✅ Redirección según rol
      const role = data.user.role;
      if (role === "admin") {
        window.location.href = "/admin.html";
      } else if (role === "becasManager") {
        window.location.href = "/becas.html";
      } else {
        window.location.href = "/index.html";
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  });
}
