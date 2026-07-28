// ============================================================
// js/chat.js
// Chat en tiempo real entre usuarios de Daat Devotional
// Mensajes guardados en localStorage
// ============================================================

let usuariosChat = [];
let mensajesChat = [];
let contactoActual = null;
let usuarioActual = null;

const MENSAJES_KEY = "daat_mensajes_chat";

document.addEventListener("DOMContentLoaded", async function () {
    await iniciarPaginaInterna("../../json/");

    usuariosChat = DaatStorage.obtener("usuarios");
    usuarioActual = DaatStorage.usuarioActual();
    mensajesChat = obtenerMensajes();

    if (!usuarioActual && usuariosChat.length > 0) {
        usuarioActual = usuariosChat[0];
        DaatStorage.guardarUsuarioActual(usuarioActual);
    }

    if (usuarioActual) {
        const navUsuario = document.getElementById("navUsuario");
        if (navUsuario) {
            navUsuario.textContent = usuarioActual.nombre.toLowerCase() + usuarioActual.apellido.charAt(0).toLowerCase();
        }
    }

    renderizarContactos();
    configurarEventosChat();

    // Mostrar mensaje de bienvenida en el chat
    mostrarMensajeBienvenida();
});

function mostrarMensajeBienvenida() {
    const container = document.getElementById("mensajesContainer");
    container.innerHTML = `
        <div class="mensaje-sistema">
            <i class="fa-solid fa-comment-dots"></i>
            <strong>Selecciona un contacto</strong>
            <div class="subtitulo">Elige un usuario de la lista para comenzar a chatear</div>
        </div>
    `;
}

function obtenerMensajes() {
    return JSON.parse(localStorage.getItem(MENSAJES_KEY)) || [];
}

function guardarMensajes(mensajes) {
    localStorage.setItem(MENSAJES_KEY, JSON.stringify(mensajes));
}

function obtenerMensajesEntre(usuarioId1, usuarioId2) {
    return mensajesChat.filter(function (m) {
        return (m.remitenteId === usuarioId1 && m.destinatarioId === usuarioId2) ||
               (m.remitenteId === usuarioId2 && m.destinatarioId === usuarioId1);
    });
}

function enviarMensaje(remitenteId, destinatarioId, texto) {
    const nuevoMensaje = {
        id: mensajesChat.length > 0 ? Math.max.apply(null, mensajesChat.map(function (m) { return m.id; })) + 1 : 1,
        remitenteId: remitenteId,
        destinatarioId: destinatarioId,
        texto: texto,
        fecha: new Date().toISOString(),
        leido: false
    };

    mensajesChat.push(nuevoMensaje);
    guardarMensajes(mensajesChat);
    return nuevoMensaje;
}

function marcarMensajesComoLeidos(usuarioId, contactoId) {
    let actualizados = false;
    mensajesChat = mensajesChat.map(function (m) {
        if (m.remitenteId === contactoId && m.destinatarioId === usuarioId && !m.leido) {
            actualizados = true;
            m.leido = true;
        }
        return m;
    });
    if (actualizados) {
        guardarMensajes(mensajesChat);
    }
    return actualizados;
}

function contarMensajesNoLeidos(usuarioId, contactoId) {
    return mensajesChat.filter(function (m) {
        return m.remitenteId === contactoId && m.destinatarioId === usuarioId && !m.leido;
    }).length;
}

// ============================================================
// RENDERIZAR CONTACTOS
// ============================================================

function renderizarContactos() {
    const contenedor = document.getElementById("listaContactos");
    const busqueda = document.getElementById("buscarContacto").value.trim().toLowerCase();

    let contactos = usuariosChat.filter(function (u) {
        return u.id !== usuarioActual.id;
    });

    if (busqueda !== "") {
        contactos = contactos.filter(function (u) {
            const nombreCompleto = (u.nombre + " " + u.apellido).toLowerCase();
            return nombreCompleto.includes(busqueda) || u.email.toLowerCase().includes(busqueda);
        });
    }

    contenedor.innerHTML = "";

    if (contactos.length === 0) {
        contenedor.innerHTML = `
            <div class="sin-contactos">
                <i class="fa-solid fa-user-slash"></i>
                ${busqueda !== "" ? 'No se encontraron contactos con esa búsqueda.' : 'No hay otros usuarios para chatear.'}
            </div>
        `;
        return;
    }

    contactos.sort(function (a, b) {
        const noLeidosA = contarMensajesNoLeidos(usuarioActual.id, a.id);
        const noLeidosB = contarMensajesNoLeidos(usuarioActual.id, b.id);
        if (noLeidosA > 0 && noLeidosB === 0) return -1;
        if (noLeidosB > 0 && noLeidosA === 0) return 1;
        return 0;
    });

    contactos.forEach(function (contacto) {
        const esActivo = contactoActual && contactoActual.id === contacto.id;
        const ultimoMensaje = obtenerUltimoMensaje(usuarioActual.id, contacto.id);
        const noLeidos = contarMensajesNoLeidos(usuarioActual.id, contacto.id);

        const div = document.createElement("div");
        div.className = "contacto" + (esActivo ? " contacto-activo" : "");
        div.dataset.id = contacto.id;

        const nombreCompleto = contacto.nombre + " " + contacto.apellido;
        const avatar = contacto.avatar || "../../imagenes/Perfil.png";
        const preview = ultimoMensaje ? ultimoMensaje.texto.substring(0, 30) + (ultimoMensaje.texto.length > 30 ? "..." : "") : "Sin mensajes";
        const estado = ultimoMensaje ? obtenerTiempoRelativoMensaje(ultimoMensaje.fecha) : 'Sin actividad';

        div.innerHTML = `
            <img src="${avatar}" alt="${nombreCompleto}">
            <div class="contacto-info">
                <h3>${nombreCompleto}</h3>
                <p>${preview}</p>
                <div class="estado ${ultimoMensaje ? 'online' : ''}">${estado}</div>
            </div>
            ${noLeidos > 0 ? `<span class="badge-mensajes">${noLeidos}</span>` : ''}
        `;

        div.addEventListener("click", function () {
            seleccionarContacto(contacto.id);
        });

        contenedor.appendChild(div);
    });
}

function obtenerUltimoMensaje(usuarioId, contactoId) {
    const conversacion = obtenerMensajesEntre(usuarioId, contactoId);
    if (conversacion.length === 0) return null;
    return conversacion[conversacion.length - 1];
}

// ============================================================
// SELECCIONAR CONTACTO Y CARGAR CONVERSACIÓN
// ============================================================

function seleccionarContacto(contactoId) {
    const contacto = usuariosChat.find(function (u) { return u.id === contactoId; });
    if (!contacto) return;

    contactoActual = contacto;

    marcarMensajesComoLeidos(usuarioActual.id, contacto.id);

    const avatar = contacto.avatar || "../../imagenes/Perfil.png";
    const avatarImg = document.getElementById("chatAvatar");
    avatarImg.src = avatar;
    avatarImg.alt = contacto.nombre + " " + contacto.apellido;
    avatarImg.style.display = "block";
    
    document.getElementById("chatNombre").textContent = contacto.nombre + " " + contacto.apellido;
    document.getElementById("chatEstado").textContent = "En línea";

    const input = document.getElementById("campoMensajeChat");
    const btnEnviar = document.getElementById("btnEnviarMensaje");
    input.disabled = false;
    btnEnviar.disabled = false;
    input.focus();

    cargarMensajes(contacto.id);
    renderizarContactos();
}

function cargarMensajes(contactoId) {
    const container = document.getElementById("mensajesContainer");
    const mensajes = obtenerMensajesEntre(usuarioActual.id, contactoId);

    if (mensajes.length === 0) {
        container.innerHTML = `
            <div class="mensaje-sistema">
                <i class="fa-solid fa-comment-dots"></i>
                <strong>No hay mensajes aún</strong>
                <div class="subtitulo">¡Envía el primer mensaje!</div>
            </div>
        `;
        return;
    }

    container.innerHTML = "";
    let fechaActual = "";

    mensajes.forEach(function (m) {
        const fecha = new Date(m.fecha);
        const fechaStr = fecha.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        if (fechaStr !== fechaActual) {
            fechaActual = fechaStr;
            const divider = document.createElement("div");
            divider.className = "mensaje-fecha-divisor";
            divider.textContent = fechaStr;
            container.appendChild(divider);
        }

        const esPropio = m.remitenteId === usuarioActual.id;
        const remitente = usuariosChat.find(function (u) { return u.id === m.remitenteId; });
        const nombreRemitente = remitente ? remitente.nombre + " " + remitente.apellido : "Usuario";
        const hora = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        const div = document.createElement("div");
        div.className = esPropio ? "mensaje-enviado" : "mensaje-recibido";

        if (!esPropio) {
            div.innerHTML = `
                <div class="nombre-remitente">${nombreRemitente}</div>
                ${m.texto}
                <div class="hora">${hora}</div>
            `;
        } else {
            div.innerHTML = `
                ${m.texto}
                <div class="hora">${hora} ${m.leido ? '✓✓' : '✓'}</div>
            `;
        }

        container.appendChild(div);
    });

    container.scrollTop = container.scrollHeight;
}

// ============================================================
// ENVIAR MENSAJE
// ============================================================

function configurarEventosChat() {
    const input = document.getElementById("campoMensajeChat");
    const btnEnviar = document.getElementById("btnEnviarMensaje");
    const buscar = document.getElementById("buscarContacto");

    btnEnviar.addEventListener("click", function () {
        enviarMensajeChat();
    });

    input.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            enviarMensajeChat();
        }
    });

    buscar.addEventListener("input", function () {
        renderizarContactos();
    });

    setInterval(function () {
        if (contactoActual) {
            const noLeidos = contarMensajesNoLeidos(usuarioActual.id, contactoActual.id);
            if (noLeidos > 0) {
                marcarMensajesComoLeidos(usuarioActual.id, contactoActual.id);
                cargarMensajes(contactoActual.id);
                renderizarContactos();
            }
        }
        renderizarContactos();
    }, 5000);

    document.querySelectorAll(".nav-salir").forEach(function (enlace) {
        enlace.addEventListener("click", function (e) {
            e.preventDefault();
            cerrarSesionChat();
        });
    });
}

function enviarMensajeChat() {
    if (!contactoActual) {
        notificar("Selecciona un contacto primero.", "error");
        return;
    }

    const input = document.getElementById("campoMensajeChat");
    const texto = input.value.trim();

    if (texto === "") {
        notificar("Escribe un mensaje antes de enviar.", "error");
        return;
    }

    enviarMensaje(usuarioActual.id, contactoActual.id, texto);
    input.value = "";
    input.focus();

    cargarMensajes(contactoActual.id);
    renderizarContactos();
}

// ============================================================
// FUNCIONES DE UTILIDAD
// ============================================================

function obtenerTiempoRelativoMensaje(fechaISO) {
    const fecha = new Date(fechaISO);
    const ahora = new Date();
    const diffMs = ahora - fecha;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Ahora';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    if (diffHoras < 24) return `Hace ${diffHoras} h`;
    if (diffDias === 1) return 'Ayer';
    if (diffDias < 7) return `Hace ${diffDias} días`;
    return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function cerrarSesionChat() {
    Swal.fire({
        title: "¿Cerrar sesión?",
        text: "¿Estás seguro de que quieres salir?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#324d82",
        cancelButtonColor: "#dc3545",
        confirmButtonText: "Sí, salir",
        cancelButtonText: "Cancelar"
    }).then(function (result) {
        if (result.isConfirmed) {
            eliminarDeStorage("daat_usuarioActual");
            window.location.href = "../../index.html";
        }
    });
}

function notificar(mensaje, tipo) {
    const colores = {
        exito: "#198754",
        error: "#dc3545",
        info: "#0d6efd"
    };

    if (typeof Toastify !== 'undefined') {
        Toastify({
            text: mensaje,
            duration: 2800,
            gravity: "top",
            position: "right",
            style: { background: colores[tipo] || colores.info }
        }).showToast();
    } else {
        console.log(mensaje);
    }
}

function eliminarDeStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (e) {
        console.error(e);
    }
}