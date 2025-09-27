// Seleccionar elementos
const modal = document.getElementById('modalDonacion');
const btns = document.querySelectorAll('.btn-donar');
const span = document.querySelector('.close');

// Abrir modal al pulsar cualquier botón de donar
btns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    modal.style.display = "block";
  });
});

// Cerrar modal al pulsar la X
span.onclick = function() {
  modal.style.display = "none";
}

// Cerrar modal al hacer click fuera del contenido
window.onclick = function(event) {
  if(event.target == modal) {
    modal.style.display = "none";
  }
}

// Opcional: prevenir envío real por ahora
document.getElementById('formPago').addEventListener('submit', function(e){
  e.preventDefault();
  alert('Pago simulado: datos enviados correctamente!');
  modal.style.display = "none";
});
