const DaatStorage = (function () {
  const CLAVES = {
    publicaciones: "daat_publicaciones",
    usuarios: "daat_usuarios",
    categorias: "daat_categorias"
  };

  async function cargarJSON(ruta) {
    const respuesta = await fetch(ruta);
    if (!respuesta.ok) throw new Error("No se pudo cargar el archivo: " + ruta);
    return await respuesta.json();
  }

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
      console.error("Error al inicializar los datos:", error);
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

  function nuevoId(arreglo) {
    if (arreglo.length === 0) return 1;
    return Math.max.apply(null, arreglo.map(function (item) { return item.id; })) + 1;
  }

  return { CLAVES, init, obtener, guardar, usuarioActual, guardarUsuarioActual, cerrarSesion, nuevoId };
})();