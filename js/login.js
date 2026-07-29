// ============================================================
// js/login.js
// COMMIT 2: autenticación contra los usuarios cargados desde JSON
// ============================================================

let temporizadores = {};

document.addEventListener("DOMContentLoaded", async function () {
    await DaatStorage.init("../../json/");

    configurarEventosLogin();
});

// ============================================================
// 1. SELECCIONAR ELEMENTOS DEL DOM
// ============================================================
function configurarEventosLogin() {
    const formLogin = document.getElementById("formLogin");
    const inputEmail = document.getElementById("email");
    const inputPassword = document.getElementById("password");
    const estadoEmail = document.getElementById("estadoEmail");
    const estadoPassword = document.getElementById("estadoPassword");

    // ============================================================
    // EVENTO INPUT - EMAIL
    // ============================================================
    inputEmail.addEventListener("input", function() {
        mostrarEscribiendo("estadoEmail", 'Escribiendo correo...');
    });

    // ============================================================
    // EVENTO INPUT - CONTRASEÑA
    // ============================================================
    inputPassword.addEventListener("input", function() {
        mostrarEscribiendo("estadoPassword", 'Escribiendo contraseña...');
    });

    // ============================================================
    // EVENTO SUBMIT - LOGIN
    // ============================================================
    formLogin.addEventListener("submit", function(evento) {
        evento.preventDefault();

        const email = inputEmail.value.trim();
        const password = inputPassword.value.trim();

        // Validar campos vacíos
        if (email === "" || password === "") {
            Swal.fire({
                icon: "warning",
                title: "Campos incompletos",
                text: "Completa tu correo y contraseña."
            });
            return;
        }

        // Validar formato de email
        if (!validarEmail(email)) {
            mostrarMensaje("estadoEmail", "Formato de correo inválido.", "error");
            return;
        }

        // Buscar usuario en localStorage
        const usuarios = DaatStorage.obtener("usuarios");
        const usuarioEncontrado = usuarios.find(function(usuario) {
            return usuario.email.toLowerCase() === email.toLowerCase() && usuario.password === password;
        });

        if (!usuarioEncontrado) {
            Swal.fire({
                icon: "error",
                title: "Datos incorrectos",
                text: "El correo o la contraseña no coinciden con ningún usuario registrado."
            });
            return;
        }

        // ============================================================
        // LOGIN EXITOSO
        // ============================================================
        DaatStorage.guardarUsuarioActual(usuarioEncontrado);

        // Guardar último usuario en localStorage
        localStorage.setItem("ultimoUsuario", usuarioEncontrado.email);

        Toastify({
            text: "Bienvenido/a, " + usuarioEncontrado.nombre + ".",
            duration: 2000,
            gravity: "top",
            position: "right",
            style: {
                background: "#198754",
                borderRadius: "8px",
                padding: "12px 20px"
            }
        }).showToast();

        setTimeout(function() {
            window.location.href = "../feed/inicio.html";
        }, 1200);
    });
}

// ============================================================
// 2. FUNCIÓN "ESCRIBIENDO..." CON ÍCONOS
// ============================================================
function mostrarEscribiendo(elementoId, mensaje) {
    const elemento = document.getElementById(elementoId);
    if (!elemento) return;

    elemento.innerHTML = mensaje;
    elemento.style.color = "#0d6efd";
    elemento.style.fontSize = "13px";
    elemento.style.fontWeight = "500";

    if (temporizadores[elementoId]) {
        clearTimeout(temporizadores[elementoId]);
    }

    temporizadores[elementoId] = setTimeout(function() {
        elemento.innerHTML = "";
    }, 1500);
}

// ============================================================
// 3. FUNCIÓN PARA MOSTRAR MENSAJES CON ÍCONOS
// ============================================================
function mostrarMensaje(elementoId, mensaje, tipo) {
    const elemento = document.getElementById(elementoId);
    if (!elemento) return;

    const iconos = {
        exito: '<i class="fa-solid fa-circle-check" style="color:#198754;"></i>',
        error: '<i class="fa-solid fa-circle-exclamation" style="color:#dc3545;"></i>',
        advertencia: '<i class="fa-solid fa-triangle-exclamation" style="color:#ffc107;"></i>',
        info: '<i class="fa-solid fa-circle-info" style="color:#0d6efd;"></i>'
    };

    const colores = {
        exito: "#198754",
        error: "#dc3545",
        advertencia: "#ffc107",
        info: "#0d6efd"
    };

    elemento.innerHTML = iconos[tipo] + ' ' + mensaje;
    elemento.style.color = colores[tipo];
    elemento.style.fontSize = "13px";
    elemento.style.fontWeight = "500";
}

function limpiarMensaje(elementoId) {
    const elemento = document.getElementById(elementoId);
    if (elemento) {
        elemento.innerHTML = "";
    }
}

// ============================================================
// 4. VALIDAR EMAIL
// ============================================================
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}