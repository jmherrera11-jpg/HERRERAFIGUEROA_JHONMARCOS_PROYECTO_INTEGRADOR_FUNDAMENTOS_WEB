// ============================================================
// js/registro.js
// COMMIT 5: registro de usuarios + integración de la API de países
// ============================================================

let listaPaises = [];

document.addEventListener("DOMContentLoaded", async function () {
  await DaatStorage.init("../../json/");
  await cargarPaises();
  configurarSelectorPaises();
  configurarValidacionRegistro();
});

// Consulta la API de países. Si la API no responde (caída, sin
// conexión, CORS, etc.) se usa una lista de respaldo para que el
// formulario nunca quede bloqueado.
async function cargarPaises() {
  try {
    const respuesta = await fetch("https://countries.dev/countries");

    if (!respuesta.ok) {
      throw new Error("Respuesta no válida de la API de países");
    }

    const datos = await respuesta.json();
    listaPaises = Array.isArray(datos) ? datos : (datos.data || []);

    if (listaPaises.length === 0) {
      throw new Error("La API devolvió una lista vacía");
    }
  } catch (error) {
    console.error("No se pudo cargar la lista de países desde la API:", error);
    listaPaises = paisesRespaldo();
    notificar("No se pudo conectar con la API de países, se usó una lista local.", "info");
  }
}

function paisesRespaldo() {
  return [
    { name: { common: "Ecuador" }, flag: "🇪🇨" },
    { name: { common: "Colombia" }, flag: "🇨🇴" },
    { name: { common: "Perú" }, flag: "🇵🇪" },
    { name: { common: "México" }, flag: "🇲🇽" },
    { name: { common: "España" }, flag: "🇪🇸" },
    { name: { common: "Estados Unidos" }, flag: "🇺🇸" },
    { name: { common: "Argentina" }, flag: "🇦🇷" },
    { name: { common: "Chile" }, flag: "🇨🇱" },
    { name: { common: "Venezuela" }, flag: "🇻🇪" },
    { name: { common: "Bolivia" }, flag: "🇧🇴" }
  ];
}

// Selector personalizado de país: campo de búsqueda + lista desplegable.
function configurarSelectorPaises() {
  const inputBuscar = document.getElementById("buscarPais");
  const listaContenedor = document.getElementById("listaPaises");
  const inputOculto = document.getElementById("nacionalidad");
  const selector = document.getElementById("selectorPaises");

  listaContenedor.style.display = "none";
  listaContenedor.style.position = "relative";
  listaContenedor.style.zIndex = "10";

  function pintarOpciones(filtro) {
    const texto = filtro.trim().toLowerCase();

    const coincidencias = listaPaises.filter(function (pais) {
      return pais.name.common.toLowerCase().includes(texto);
    }).slice(0, 15);

    listaContenedor.innerHTML = "";

    coincidencias.forEach(function (pais) {
      const opcion = document.createElement("div");
      opcion.className = "opcion-pais";
      opcion.style.cursor = "pointer";
      opcion.style.padding = "6px 10px";
      opcion.textContent = (pais.flag ? pais.flag + " " : "") + pais.name.common;

      opcion.addEventListener("click", function () {
        inputBuscar.value = pais.name.common;
        inputOculto.value = pais.name.common;
        listaContenedor.style.display = "none";
      });

      listaContenedor.appendChild(opcion);
    });

    listaContenedor.style.display = coincidencias.length > 0 ? "block" : "none";
  }

  inputBuscar.addEventListener("input", function () {
    inputOculto.value = "";
    pintarOpciones(inputBuscar.value);
  });

  inputBuscar.addEventListener("focus", function () {
    pintarOpciones(inputBuscar.value);
  });

  document.addEventListener("click", function (evento) {
    if (!selector.contains(evento.target)) {
      listaContenedor.style.display = "none";
    }
  });
}

function configurarValidacionRegistro() {
  const formulario = document.getElementById("formRegistro");

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmar = document.getElementById("confirmPassword").value;
    const fechaNacimiento = document.getElementById("fechaNacimiento").value;
    const nacionalidad = document.getElementById("nacionalidad").value;
    const terminos = document.getElementById("terminos").checked;

    if (nacionalidad === "") {
      Swal.fire("Falta información", "Selecciona tu nacionalidad de la lista desplegable.", "warning");
      return;
    }

    if (password !== confirmar) {
      Swal.fire("Las contraseñas no coinciden", "Verifica que ambas contraseñas sean iguales.", "warning");
      return;
    }

    if (!terminos) {
      Swal.fire("Términos y condiciones", "Debes aceptar los términos para continuar.", "warning");
      return;
    }

    const usuarios = DaatStorage.obtener("usuarios");

    const existe = usuarios.some(function (usuario) {
      return usuario.email.toLowerCase() === email.toLowerCase();
    });

    if (existe) {
      Swal.fire("Correo ya registrado", "Ya existe una cuenta con este correo electrónico.", "error");
      return;
    }

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
    }).then(function () {
      window.location.href = "login.html";
    });
  });
}
