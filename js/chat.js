// ============================================================
// js/chat.js
// Manipulación del DOM y eventos sobre la vista de chat
// (no depende de un JSON propio; usa la sesión activa)
// ============================================================

document.addEventListener("DOMContentLoaded", async function () {
  await iniciarPaginaInterna("../../json/");

  const contactos = document.querySelectorAll(".contacto");

  contactos.forEach(function (contacto) {
    contacto.addEventListener("click", function () {
      contactos.forEach(function (c) { c.classList.remove("contacto-activo"); });
      contacto.classList.add("contacto-activo");

      const nombre = contacto.querySelector("h3").textContent;
      document.querySelector(".chat-titulo .nombre").textContent = nombre;
    });
  });

  const botonEnviar = document.getElementById("btnEnviarMensaje");
  const inputMensaje = document.getElementById("campoMensajeChat");
  const contenedorMensajes = document.querySelector(".mensajes");

  function enviarMensaje() {
    const texto = inputMensaje.value.trim();
    if (texto === "") return;

    const divMensaje = document.createElement("div");
    divMensaje.className = "mensaje-enviado";
    const hora = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    divMensaje.innerHTML = texto + '<div class="hora">' + hora + "</div>";

    contenedorMensajes.appendChild(divMensaje);
    contenedorMensajes.scrollTop = contenedorMensajes.scrollHeight;
    inputMensaje.value = "";
  }

  botonEnviar.addEventListener("click", enviarMensaje);
  inputMensaje.addEventListener("keydown", function (evento) {
    if (evento.key === "Enter") enviarMensaje();
  });
});
