// --- CONFIGURACIÓN BASE ---
const API_BASE = "http://localhost:4000/api/auth";

// --- UTILIDADES DE SESIÓN ---
function saveSession(user, token) {
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", token);
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
  window.location.href = "../login/login.html";
}

// --- ACTUALIZAR NAVBAR ---
function updateNavbar() {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;

  const existingSession = isLoggedIn();
  const user = getUser();

  // Limpia contenido previo
  const sessionArea = document.getElementById("sessionArea");
  if (sessionArea) sessionArea.remove();

  // Crear nuevo contenedor
  const div = document.createElement("div");
  div.id = "sessionArea";

  if (existingSession && user) {
    div.innerHTML = `
      <span style="margin-right: 10px; font-weight: 600; color: var(--primary);">
        👋 Hola, ${user.name}
      </span>
      <button id="logoutBtn" style="background: var(--primary); color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer;">
        Cerrar sesión
      </button>
    `;
  } else {
    div.innerHTML = `
      <a href="../login/login.html" style="text-decoration:none; color: var(--primary); font-weight:600;">Iniciar sesión</a>
      <span> / </span>
      <a href="../login/registro.html" style="text-decoration:none; color: var(--primary); font-weight:600;">Registrarse</a>
    `;
  }

  navbar.appendChild(div);

  // Evento para cerrar sesión
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
}

// --- AUTOEJECUCIÓN EN TODAS LAS PÁGINAS ---
document.addEventListener("DOMContentLoaded", updateNavbar);

// --- MANEJO DE FORMULARIOS ---
// Registro
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombreInput = document.getElementById("nombre");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");

    if (passwordInput.value !== confirmPasswordInput.value) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nombreInput.value,
          email: emailInput.value,
          password: passwordInput.value,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      alert("Registro exitoso. Ahora puedes iniciar sesión.");
      window.location.href = "login.html";
    } catch (err) {
      alert("Error: " + err.message);
    }
  });
}

// Login
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
      window.location.href = "../index.html";
    } catch (err) {
      alert("Error: " + err.message);
    }
  });
}
