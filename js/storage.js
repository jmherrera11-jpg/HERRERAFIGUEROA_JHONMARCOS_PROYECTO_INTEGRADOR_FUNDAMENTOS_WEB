// ============================================================
// js/storage.js
// Módulo central de datos de Daat Devotional.
//
// Responsabilidad de este archivo:
//  - Cargar publicaciones, usuarios y categorías desde /json/*.json
//    únicamente la primera vez que se visita el sitio.
//  - Guardar esa información en localStorage para que las
//    siguientes visitas ya no dependan del fetch (persistencia).
//  - Exponer funciones simples para leer/guardar/actualizar
//    cada colección desde el resto de los scripts.
// ============================================================

const DaatStorage = (function () {

  const CLAVES = {
    publicaciones: "daat_publicaciones",
    usuarios: "daat_usuarios",
    categorias: "daat_categorias"
  };

  // Descarga un archivo JSON y maneja el caso de que no exista o falle.
  async function cargarJSON(ruta) {
    const respuesta = await fetch(ruta);

    if (!respuesta.ok) {
      throw new Error("No se pudo cargar el archivo: " + ruta);
    }

    return await respuesta.json();
  }

  // Se ejecuta al iniciar cada página. Si ya existen datos en
  // localStorage, no se vuelve a hacer fetch (persistencia real).
  // basePath = ruta relativa a la carpeta /json/ desde la página actual.
  async function init(basePath) {
    basePath = basePath || "./json/";

    try {
      if (!localStorage.getItem(CLAVES.usuarios)) {
        const usuarios = await cargarJSON(basePath + "usuarios.json");
        localStorage.setItem(CLAVES.usuarios, JSON.stringify(usuarios));
      }

      if (!localStorage.getItem(CLAVES.categorias)) {
        const categorias = await cargarJSON(basePath + "categorias.json");
        localStorage.setItem(CLAVES.categorias, JSON.stringify(categorias));
      }

      if (!localStorage.getItem(CLAVES.publicaciones)) {
        const publicaciones = await cargarJSON(basePath + "publicaciones.json");
        localStorage.setItem(CLAVES.publicaciones, JSON.stringify(publicaciones));
      }

      return true;
    } catch (error) {
      console.error("Error al inicializar los datos de Daat Devotional:", error);
      return false;
    }
  }

    function obtener(clave) {
      const datos = localStorage.getItem(CLAVES[clave]);
      return datos ? JSON.parse(datos) : [];
    }

  function guardar(clave, arreglo) {
    localStorage.setItem(CLAVES[clave], JSON.stringify(arreglo));
  }

  // COMMIT 3 (restablecimiento): vuelve a traer los JSON originales
  // y reemplaza lo que el usuario haya modificado en localStorage.
  async function restablecer(basePath) {
    localStorage.removeItem(CLAVES.publicaciones);
    localStorage.removeItem(CLAVES.usuarios);
    localStorage.removeItem(CLAVES.categorias);
    await init(basePath);
  }

  function usuarioActual() {
    const datos = sessionStorage.getItem("daat_usuarioActual");
    return datos ? JSON.parse(datos) : null;
  }

  function guardarUsuarioActual(usuario) {
    sessionStorage.setItem("daat_usuarioActual", JSON.stringify(usuario));
  }

  function cerrarSesion() {
    sessionStorage.removeItem("daat_usuarioActual");
  }

  // Genera un id nuevo y único para cualquier arreglo con objetos {id: n}
  function nuevoId(arreglo) {
    if (arreglo.length === 0) return 1;
    return Math.max.apply(null, arreglo.map(function (item) { return item.id; })) + 1;
  }

  return {
    CLAVES: CLAVES,
    init: init,
    obtener: obtener,
    guardar: guardar,
    restablecer: restablecer,
    usuarioActual: usuarioActual,
    guardarUsuarioActual: guardarUsuarioActual,
    cerrarSesion: cerrarSesion,
    nuevoId: nuevoId
  };

})();
