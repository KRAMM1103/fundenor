document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('modalDonacion');
  const usuarioActivo = localStorage.getItem('usuarioActivo');
  const botones = document.querySelectorAll('.btn-donar');
  const navSesion = document.getElementById('navSesion'); // Contenedor para botón y nombre

  // ===== Mostrar nombre y botón de cerrar sesión si hay usuario =====
  if (usuarioActivo && navSesion) {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuario = usuarios.find(u => u.email === usuarioActivo);

    // Mostrar nombre
    navSesion.textContent = `Bienvenido, ${usuario.nombre} `;

    // Crear botón cerrar sesión
    const botonCerrar = document.createElement('button');
    botonCerrar.textContent = 'Cerrar Sesión';
    botonCerrar.className = 'btn-donar';
    botonCerrar.onclick = cerrarSesion;

    navSesion.appendChild(botonCerrar);
  }

  // ===== Configurar botones de donación =====
  if (botones.length > 0) {
    if (usuarioActivo) {
      // Usuario logueado → abrir modal
      botones.forEach(btn => {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          modal.style.display = "block";
        });
      });
    } else {
      // Usuario no logueado → alert y redirigir
      botones.forEach(btn => {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          alert('Por favor inicia sesión para poder donar.');
          window.location.href = '../login/login.html';
        });
      });
    }
  }

  // ===== Cerrar modal =====
  const span = document.querySelector('.close');
  if(span) {
    span.onclick = function() {
      modal.style.display = "none";
    }
  }

  window.onclick = function(event) {
    if(event.target == modal) {
      modal.style.display = "none";
    }
  }

  // ===== Formulario de donación simulado =====
  const formPago = document.getElementById('formPago');
  if (formPago) {
    formPago.addEventListener('submit', function(e){
      e.preventDefault();
      alert('Pago simulado: datos enviados correctamente!');
      modal.style.display = "none";
    });
  }
});
