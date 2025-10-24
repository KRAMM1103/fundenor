const modal = document.getElementById("modalBeca");
const btn = document.getElementById("btnAddBeca");
const span = document.querySelector(".modal .close");

btn.onclick = () => { modal.style.display = "block"; }
span.onclick = () => { modal.style.display = "none"; }

window.onclick = (event) => {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

// Aquí más adelante puedes agregar submit del formBeca para guardar en backend
