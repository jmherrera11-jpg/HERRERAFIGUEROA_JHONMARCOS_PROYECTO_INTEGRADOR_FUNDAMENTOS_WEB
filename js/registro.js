// ============================================================
// js/registro.js
// Registro de usuarios + integración de la API de países
// ============================================================

let listaPaises = [];
let temporizadores = {};

// ============================================================
// 1. SELECCIONAR ELEMENTOS DEL DOM
// ============================================================
const formRegistro = document.getElementById("formRegistro");
const inputNombre = document.getElementById("nombre");
const inputApellido = document.getElementById("apellido");
const inputEmail = document.getElementById("email");
const inputPassword = document.getElementById("password");
const inputConfirm = document.getElementById("confirmPassword");
const selectNacionalidad = document.getElementById("nacionalidad");
const inputFecha = document.getElementById("fechaNacimiento");
const checkboxTerminos = document.getElementById("terminos");

const estadoNombre = document.getElementById("estadoNombre");
const estadoApellido = document.getElementById("estadoApellido");
const estadoEmail = document.getElementById("estadoEmail");
const estadoPassword = document.getElementById("estadoPassword");
const estadoConfirm = document.getElementById("estadoConfirm");

// ============================================================
// 2. INICIALIZAR
// ============================================================
document.addEventListener("DOMContentLoaded", async function () {
    await iniciarPaginaInterna("../../json/");
    await cargarPaises();
    configurarEventos();
});

// ============================================================
// 3. CARGAR PAÍSES CON ASYNC/AWAIT
// ============================================================
async function cargarPaises() {
    try {
        selectNacionalidad.innerHTML = '<option value="">Cargando países...</option>';

        const respuesta = await fetch("https://countries.dev/countries");

        if (!respuesta.ok) {
            throw new Error("No se pudo obtener el listado de países.");
        }

        const datos = await respuesta.json();
        listaPaises = Array.isArray(datos) ? datos : (datos.data || []);

        if (listaPaises.length === 0) {
            throw new Error("La lista de países está vacía.");
        }

        selectNacionalidad.innerHTML = '<option value="">Seleccione su país...</option>';

        listaPaises.sort(function(a, b) {
            const nombreA = a.name.common || "";
            const nombreB = b.name.common || "";
            return nombreA.localeCompare(nombreB);
        });

        for (const pais of listaPaises) {
            const opcion = document.createElement("option");
            opcion.value = pais.name.common;
            opcion.textContent = (pais.flag || "🏳️") + " " + pais.name.common;
            selectNacionalidad.appendChild(opcion);
        }

        console.log(" Países cargados:", listaPaises.length);

    } catch (error) {
        console.error("Error al cargar países:", error);
        selectNacionalidad.innerHTML = `
            <option value="">Error al cargar países</option>
            <option value="Ecuador">🇪🇨 Ecuador</option>
            <option value="Colombia">🇨🇴 Colombia</option>
            <option value="Perú">🇵🇪 Perú</option>
            <option value="México">🇲🇽 México</option>
            <option value="España">🇪🇸 España</option>
            <option value="Argentina">🇦🇷 Argentina</option>
            <option value="Chile">🇨🇱 Chile</option>
            <option value="Venezuela">🇻🇪 Venezuela</option>
            <option value="Bolivia">🇧🇴 Bolivia</option>
            <option value="Uruguay">🇺🇾 Uruguay</option>
        `;
        notificar("No se pudo conectar con la API de países, se usó una lista local.", "info");
    }
}

// ============================================================
// 4. CONFIGURAR EVENTOS
// ============================================================
function configurarEventos() {
    // Evento input para "Escribiendo..." con íconos
    inputNombre.addEventListener("input", function() {
        mostrarEscribiendo("estadoNombre", 'Escribiendo nombre...');
    });

    inputApellido.addEventListener("input", function() {
        mostrarEscribiendo("estadoApellido", 'Escribiendo apellido...');
    });

    inputEmail.addEventListener("input", function() {
        mostrarEscribiendo("estadoEmail", 'Escribiendo correo...');
    });

    inputPassword.addEventListener("input", function() {
        mostrarEscribiendo("estadoPassword", 'Escribiendo contraseña...');
        validarContraseña();
    });

    inputConfirm.addEventListener("input", function() {
        mostrarEscribiendo("estadoConfirm", 'Confirmando contraseña...');
        validarConfirmacion();
    });

    formRegistro.addEventListener("submit", function(evento) {
        evento.preventDefault();
        procesarRegistro();
    });
}

// ============================================================
// 5. FUNCIÓN "ESCRIBIENDO..." CON ÍCONOS
// ============================================================
function mostrarEscribiendo(elementoId, mensaje) {
    const elemento = document.getElementById(elementoId);
    if (!elemento) return;

    elemento.innerHTML = mensaje;
    elemento.style.color = "#0d6efd";
    elemento.style.fontSize = "13px";

    if (temporizadores[elementoId]) {
        clearTimeout(temporizadores[elementoId]);
    }

    temporizadores[elementoId] = setTimeout(function() {
        elemento.innerHTML = "";
    }, 1500);
}

// ============================================================
// 6. MOSTRAR MENSAJES CON ÍCONOS (validación)
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
// 7. VALIDACIONES EN TIEMPO REAL CON ÍCONOS
// ============================================================
function validarContraseña() {
    const password = inputPassword.value;

    if (password.length === 0) {
        limpiarMensaje("estadoPassword");
        return;
    }

    if (password.length < 8) {
        mostrarMensaje(
            "estadoPassword",
            "La contraseña debe tener al menos 8 caracteres.",
            "error"
        );
    } else {
        mostrarMensaje(
            "estadoPassword",
            "Contraseña válida.",
            "exito"
        );
    }
}

function validarConfirmacion() {
    const password = inputPassword.value;
    const confirm = inputConfirm.value;

    if (confirm.length === 0) {
        limpiarMensaje("estadoConfirm");
        return;
    }

    if (password === confirm) {
        mostrarMensaje(
            "estadoConfirm",
            "Las contraseñas coinciden.",
            "exito"
        );
    } else {
        mostrarMensaje(
            "estadoConfirm",
            "Las contraseñas no coinciden.",
            "error"
        );
    }
}

// ============================================================
// 8. PROCESAR REGISTRO
// ============================================================
function procesarRegistro() {
    const nombre = inputNombre.value.trim();
    const apellido = inputApellido.value.trim();
    const email = inputEmail.value.trim();
    const password = inputPassword.value;
    const confirm = inputConfirm.value;
    const fechaNacimiento = inputFecha.value;
    const nacionalidad = selectNacionalidad.value;
    const terminos = checkboxTerminos.checked;

    // VALIDACIONES
    if (nombre === "" || apellido === "" || email === "" || password === "" || confirm === "") {
        Swal.fire({
            icon: "warning",
            title: "Campos incompletos",
            text: "Todos los campos son obligatorios."
        });
        return;
    }

    if (nacionalidad === "" || nacionalidad === "Cargando países..." || nacionalidad === "Error al cargar países") {
        Swal.fire({
            icon: "warning",
            title: "Nacionalidad requerida",
            text: "Selecciona tu país de origen de la lista."
        });
        return;
    }

    if (password !== confirm) {
        Swal.fire({
            icon: "warning",
            title: "Contraseñas no coinciden",
            text: "Verifica que ambas contraseñas sean iguales."
        });
        return;
    }

    if (password.length < 8) {
        Swal.fire({
            icon: "warning",
            title: "Contraseña muy corta",
            text: "La contraseña debe tener al menos 8 caracteres."
        });
        return;
    }

    if (!terminos) {
        Swal.fire({
            icon: "warning",
            title: "Acepta los términos",
            text: "Debes aceptar los términos y condiciones para continuar."
        });
        return;
    }

    if (!fechaNacimiento) {
        Swal.fire({
            icon: "warning",
            title: "Fecha de nacimiento requerida",
            text: "Ingresa tu fecha de nacimiento."
        });
        return;
    }

    const usuarios = DaatStorage.obtener("usuarios");
    const existe = usuarios.some(function(usuario) {
        return usuario.email.toLowerCase() === email.toLowerCase();
    });

    if (existe) {
        Swal.fire({
            icon: "error",
            title: "Correo ya registrado",
            text: "Ya existe una cuenta con este correo electrónico."
        });
        return;
    }

    // CREAR NUEVO USUARIO
    const nuevoUsuario = {
        id: DaatStorage.nuevoId(usuarios),
        nombre: nombre,
        apellido: apellido,
        email: email,
        password: password,
        fechaNacimiento: fechaNacimiento,
        nacionalidad: nacionalidad,
        biografia: "Nuevo miembro de la comunidad Daat Devotional.",
        avatar: "../../imagenes/Perfil.png",
        fechaRegistro: new Date().toISOString().substring(0, 10),
        estado: "activo"
    };

    usuarios.push(nuevoUsuario);
    DaatStorage.guardar("usuarios", usuarios);

    Swal.fire({
        title: "¡Registro exitoso!",
        text: "Bienvenido/a a Daat Devotional, " + nombre + ".",
        icon: "success",
        confirmButtonText: "Iniciar sesión"
    }).then(function() {
        window.location.href = "login.html";
    });
}

// ============================================================
// 9. UTILIDADES
// ============================================================
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