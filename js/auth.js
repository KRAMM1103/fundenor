// ================= REGISTRO =================
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

    if (usuarios.some(u => u.email === email)) {
      alert('El correo ya está registrado.');
      return;
    }

    usuarios.push({ nombre, email, password });
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    localStorage.setItem('usuarioActivo', email);

    alert('Registro exitoso. Bienvenido, ' + nombre + '!');
    window.location.href = '../donaciones/donaciones.html';
  });
}

// ================= LOGIN =================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

    const usuario = usuarios.find(u => u.email === email && u.password === password);

    if (usuario) {
      localStorage.setItem('usuarioActivo', email);
      alert('¡Bienvenido de nuevo, ' + usuario.nombre + '!');
      window.location.href = '../donaciones/donaciones.html';
    } else {
      alert('Correo o contraseña incorrectos.');
    }
  });
}

// ================= CERRAR SESIÓN =================
function cerrarSesion() {
  localStorage.removeItem('usuarioActivo');
  alert('Has cerrado sesión.');
  window.location.reload();
}
