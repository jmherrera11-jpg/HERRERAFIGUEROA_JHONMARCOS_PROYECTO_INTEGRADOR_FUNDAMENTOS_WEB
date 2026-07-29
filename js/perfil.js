// ============================================================
// js/perfil.js
// ============================================================

let publicacionesPerfil = [];
let categoriasPerfil = [];
let usuariosPerfil = [];
let graficoPerfil = null;
let listaPaises = [];

document.addEventListener("DOMContentLoaded", async function () {
    console.log("🔵 Perfil: DOM cargado");

    await iniciarPaginaInterna("../../json/");
    console.log("🔵 Perfil: iniciarPaginaInterna completado");

    publicacionesPerfil = DaatStorage.obtener("publicaciones");
    categoriasPerfil = DaatStorage.obtener("categorias");
    usuariosPerfil = DaatStorage.obtener("usuarios");

    console.log("🔵 Perfil: publicaciones cargadas:", publicacionesPerfil.length);
    console.log("🔵 Perfil: usuarios cargados:", usuariosPerfil.length);

    await cargarPaises();

    const usuario = DaatStorage.usuarioActual();
    console.log("🔵 Perfil: usuario actual desde storage:", usuario);

    if (!usuario) {
        console.log("🔴 Perfil: No hay usuario, redirigiendo a login");
        window.location.href = "../formularios/login.html";
        return;
    }

    console.log("🔵 Perfil: Usuario encontrado -", usuario.nombre, usuario.apellido);

    pintarInfoUsuario();
    renderizarMisPublicaciones();
    crearGraficoPerfil();

    document.getElementById("listaMisPublicaciones").addEventListener("click", function (evento) {
        const botonEliminar = evento.target.closest(".btn-eliminar-post");
        const botonEditar = evento.target.closest(".btn-editar-post");

        if (botonEliminar) confirmarEliminarPost(Number(botonEliminar.dataset.id));
        if (botonEditar) editarPost(Number(botonEditar.dataset.id));
    });

    document.getElementById("btnEditarPerfil").addEventListener("click", editarPerfil);
});

async function cargarPaises() {
    try {
        const respuesta = await fetch("https://countries.dev/countries");
        if (!respuesta.ok) throw new Error("Error al cargar países");
        const datos = await respuesta.json();
        listaPaises = Array.isArray(datos) ? datos : (datos.data || []);
        console.log("🔵 Perfil: Países cargados:", listaPaises.length);
    } catch (error) {
        console.error("Error al cargar países:", error);
        listaPaises = [];
    }
}

// ============================================================
// FUNCIÓN CORREGIDA - MANEJO SEGURO DE PAÍSES
// ============================================================
function obtenerBanderaPais(nombrePais) {
    if (!listaPaises || listaPaises.length === 0) return null;
    if (!nombrePais || nombrePais === "En todo el mundo") return null;
    
    try {
        // Buscar el país por nombre común (ignorando mayúsculas/minúsculas)
        const pais = listaPaises.find(function(p) {
            if (!p || !p.name) return false;
            // Algunos países tienen name como string, otros como objeto
            const nombre = typeof p.name === 'string' ? p.name : (p.name.common || '');
            return nombre.toLowerCase() === nombrePais.toLowerCase();
        });
        
        // Si no se encontró, intentar búsqueda parcial
        if (!pais) {
            const paisParcial = listaPaises.find(function(p) {
                if (!p || !p.name) return false;
                const nombre = typeof p.name === 'string' ? p.name : (p.name.common || '');
                return nombre.toLowerCase().includes(nombrePais.toLowerCase()) || 
                       nombrePais.toLowerCase().includes(nombre.toLowerCase());
            });
            return paisParcial || null;
        }
        
        return pais;
    } catch (error) {
        console.error("Error al buscar país:", error);
        return null;
    }
}

function pintarInfoUsuario() {
    const usuario = DaatStorage.usuarioActual();
    console.log("🔵 pintarInfoUsuario: usuario =", usuario);

    if (!usuario) {
        console.log("🔴 pintarInfoUsuario: No hay usuario");
        window.location.href = "../formularios/login.html";
        return;
    }

    console.log("🔵 pintarInfoUsuario: Mostrando info de", usuario.nombre);

    // Actualizar nav
    const navUsuario = document.getElementById("navUsuario");
    if (navUsuario) {
        navUsuario.textContent = usuario.nombre.toLowerCase() + usuario.apellido.charAt(0).toLowerCase();
    }

    // Información básica
    const nombreEl = document.getElementById("nombrePerfil");
    const usuarioEl = document.getElementById("usuarioPerfil");
    const bioEl = document.getElementById("bioPerfil");

    if (nombreEl) nombreEl.textContent = usuario.nombre + " " + usuario.apellido;
    if (usuarioEl) usuarioEl.textContent = "@" + usuario.email.split("@")[0];
    if (bioEl) bioEl.textContent = usuario.biografia || "Miembro de la comunidad Daat Devotional.";

    // Avatar
    const avatar = document.querySelector(".perfil-info > img");
    if (avatar && usuario.avatar) {
        avatar.src = usuario.avatar;
    }

    // Fecha de registro
    if (usuario.fechaRegistro) {
        const fecha = new Date(usuario.fechaRegistro + "T00:00:00");
        const fechaStr = fecha.toLocaleDateString('es-ES', {
            month: 'long',
            year: 'numeric'
        });
        const fechaEl = document.getElementById("fechaRegistro");
        if (fechaEl) fechaEl.textContent = fechaStr.charAt(0).toUpperCase() + fechaStr.slice(1);
    }

    // ============================================================
    // NACIONALIDAD CON BANDERA (MANEJO SEGURO)
    // ============================================================
    const paisNombre = usuario.nacionalidad || "En todo el mundo";
    const nacionalidadDiv = document.getElementById("nacionalidadPerfil");
    
    if (nacionalidadDiv) {
        const paisInfo = obtenerBanderaPais(paisNombre);
        
        if (paisInfo && paisInfo.flags && paisInfo.flags.png) {
            // Mostrar bandera desde la API
            nacionalidadDiv.innerHTML = `
                <img src="${paisInfo.flags.png}" alt="Bandera de ${paisInfo.name.common}" style="width:24px;height:16px;border-radius:3px;object-fit:cover;border:1px solid #e0e0e0;">
                <span>${paisInfo.name.common}</span>
            `;
        } else if (paisInfo && paisInfo.flag) {
            // Si solo tiene el emoji de bandera
            nacionalidadDiv.innerHTML = `<span>${paisInfo.flag} ${paisNombre}</span>`;
        } else {
            // Fallback: solo texto
            nacionalidadDiv.innerHTML = `<i class="fa-solid fa-globe"></i> <span>${paisNombre}</span>`;
        }
    }

    // ============================================================
    // ESTADÍSTICAS
    // ============================================================
    const misPosts = publicacionesPerfil.filter(function (p) { 
        return p.usuarioId === usuario.id && (p.estado === "publicado" || !p.estado); 
    });
    console.log("🔵 Publicaciones de", usuario.nombre, ":", misPosts.length);

    const statPub = document.getElementById("statPublicaciones");
    if (statPub) statPub.textContent = misPosts.length;
    
    const statSeg = document.getElementById("statSeguidores");
    if (statSeg) statSeg.textContent = Math.floor(Math.random() * 100) + 20;
    
    const statSig = document.getElementById("statSiguiendo");
    if (statSig) statSig.textContent = Math.floor(Math.random() * 80) + 10;
}

// ============================================================
// RENDERIZAR PUBLICACIONES
// ============================================================
function renderizarMisPublicaciones() {
    const usuario = DaatStorage.usuarioActual();
    const contenedor = document.getElementById("listaMisPublicaciones");
    contenedor.innerHTML = "";

    console.log("🔵 renderizarMisPublicaciones: usuario =", usuario);

    if (!usuario) {
        console.log("🔴 renderizarMisPublicaciones: No hay usuario");
        return;
    }

    const misPosts = publicacionesPerfil.filter(function (p) { 
        return p.usuarioId === usuario.id && (p.estado === "publicado" || !p.estado); 
    });

    console.log("🔵 renderizarMisPublicaciones: posts encontrados =", misPosts.length);

    misPosts.sort(function(a, b) {
        return new Date(b.fecha) - new Date(a.fecha);
    });

    if (misPosts.length === 0) {
        contenedor.innerHTML = `
            <div class="sin-publicaciones">
                <i class="fa-solid fa-pen"></i>
                <h3>Aún no has publicado ninguna reflexión</h3>
                <p>Comparte tu primera reflexión bíblica con la comunidad</p>
                <a href="../feed/inicio.html" class="btn-publicar">
                    <i class="fa-solid fa-plus"></i> Ir a publicar
                </a>
            </div>
        `;
        return;
    }

    misPosts.forEach(function (post) {
        contenedor.appendChild(crearTarjetaPublicacion(post));
    });
}

function crearTarjetaPublicacion(publicacion) {
    const autor = buscarPorId(usuariosPerfil, publicacion.usuarioId);
    const categoria = buscarPorId(categoriasPerfil, publicacion.categoriaId);
    const usuarioActual = DaatStorage.usuarioActual();
    const esPropia = usuarioActual && usuarioActual.id === publicacion.usuarioId;

    const likesDados = JSON.parse(localStorage.getItem("daat_likesDados")) || [];
    const yaLiked = likesDados.includes(publicacion.id);

    const articulo = document.createElement("article");
    articulo.className = "publicacion";

    let imagenHTML = '';
    if (publicacion.imagen && publicacion.imagen.trim() !== '' && 
        publicacion.imagen !== 'null' && publicacion.imagen !== 'undefined') {
        imagenHTML = `<img src="${publicacion.imagen}" alt="${publicacion.titulo}" class="publicacion-imagen" onerror="this.style.display='none'">`;
    }

    const fechaTexto = obtenerTiempoRelativo(publicacion.fecha);
    const nombreAutor = autor ? autor.nombre + " " + autor.apellido : "Usuario";
    const usuarioTag = autor ? "@" + autor.email.split("@")[0] : "@usuario";
    const avatar = autor ? autor.avatar : "../../imagenes/Perfil.png";

    articulo.innerHTML = `
        <div class="publicacion-header">
            <img src="${avatar}" alt="Perfil">
            <div class="publicacion-autor">
                <strong>${nombreAutor}</strong>
                <div class="publicacion-fecha">${usuarioTag} · ${fechaTexto}</div>
            </div>
        </div>
        <p>${publicacion.contenido}</p>
        ${publicacion.versiculo ? `
            <div class="versiculo">
                <i>"${publicacion.versiculo}"</i>
                <div class="referencia"><b>${publicacion.referencia}</b></div>
            </div>
        ` : ''}
        ${imagenHTML}
        <div class="acciones">
            <div class="btn-like${yaLiked ? ' liked' : ''}" data-id="${publicacion.id}">
                <i class="fa-solid fa-heart"></i> ${publicacion.likes}
            </div>
            <div><i class="fa-regular fa-comment-dots"></i> ${publicacion.comentarios}</div>
            <div><i class="fa-solid fa-location-arrow"></i> Compartir</div>
            ${esPropia ? 
                `<div class="btn-eliminar-post" data-id="${publicacion.id}">
                    <i class="fa-solid fa-trash"></i> Eliminar
                </div>` : 
                ''
            }
        </div>
    `;

    return articulo;
}

// ============================================================
// CRUD - ELIMINAR, EDITAR
// ============================================================
function confirmarEliminarPost(id) {
    Swal.fire({
        title: "¿Eliminar esta publicación?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#dc3545"
    }).then(function (resultado) {
        if (resultado.isConfirmed) {
            publicacionesPerfil = publicacionesPerfil.filter(function (p) { return p.id !== id; });
            DaatStorage.guardar("publicaciones", publicacionesPerfil);
            pintarInfoUsuario();
            renderizarMisPublicaciones();
            actualizarGraficoPerfil();
            notificar("Publicación eliminada.", "exito");
        }
    });
}

function editarPost(id) {
    const post = buscarPorId(publicacionesPerfil, id);
    if (!post) return;

    Swal.fire({
        title: "Editar publicación",
        html: `
            <textarea id="swalEditContenido" class="swal2-textarea" style="min-height:120px;">${post.contenido}</textarea>
            <input id="swalEditVersiculo" class="swal2-input" placeholder="Versículo (opcional)" value="${post.versiculo || ''}">
            <input id="swalEditReferencia" class="swal2-input" placeholder="Referencia (opcional)" value="${post.referencia || ''}">
        `,
        confirmButtonText: "Guardar cambios",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        preConfirm: function () {
            const nuevoContenido = document.getElementById("swalEditContenido").value.trim();
            if (nuevoContenido === "") {
                Swal.showValidationMessage("El contenido no puede quedar vacío.");
                return false;
            }
            return {
                contenido: nuevoContenido,
                versiculo: document.getElementById("swalEditVersiculo").value.trim(),
                referencia: document.getElementById("swalEditReferencia").value.trim()
            };
        }
    }).then(function (resultado) {
        if (resultado.isConfirmed) {
            post.contenido = resultado.value.contenido;
            post.versiculo = resultado.value.versiculo || "";
            post.referencia = resultado.value.referencia || "";
            DaatStorage.guardar("publicaciones", publicacionesPerfil);
            renderizarMisPublicaciones();
            notificar("Publicación actualizada.", "exito");
        }
    });
}

function editarPerfil() {
    const usuario = DaatStorage.usuarioActual();
    if (!usuario) return;

    Swal.fire({
        title: "Editar perfil",
        html: `
            <input id="swalBio" class="swal2-input" placeholder="Biografía" value="${usuario.biografia || ''}">
            <input id="swalNacionalidad" class="swal2-input" placeholder="Nacionalidad" value="${usuario.nacionalidad || ''}">
        `,
        confirmButtonText: "Guardar cambios",
        showCancelButton: true,
        cancelButtonText: "Cancelar"
    }).then(function (resultado) {
        if (resultado.isConfirmed) {
            const bio = document.getElementById("swalBio").value.trim();
            const nacionalidad = document.getElementById("swalNacionalidad").value.trim();

            const usuarios = DaatStorage.obtener("usuarios");
            const index = usuarios.findIndex(function(u) { return u.id === usuario.id; });
            if (index !== -1) {
                usuarios[index].biografia = bio || "Miembro de la comunidad Daat Devotional.";
                usuarios[index].nacionalidad = nacionalidad || "En todo el mundo";
                DaatStorage.guardar("usuarios", usuarios);
                DaatStorage.guardarUsuarioActual(usuarios[index]);
                pintarInfoUsuario();
                notificar("Perfil actualizado.", "exito");
            }
        }
    });
}

// ============================================================
// GRÁFICO
// ============================================================
function calcularConteoPerfil() {
    const usuario = DaatStorage.usuarioActual();
    const labels = [];
    const valores = [];
    const colores = [];

    if (!usuario) return { labels: ["Sin datos"], valores: [1], colores: ["#d5ddeb"] };

    const misPosts = publicacionesPerfil.filter(function (p) { 
        return p.usuarioId === usuario.id && (p.estado === "publicado" || !p.estado); 
    });

    if (misPosts.length === 0) {
        return { labels: ["Sin publicaciones"], valores: [1], colores: ["#d5ddeb"] };
    }

    categoriasPerfil.forEach(function (categoria) {
        const cantidad = misPosts.filter(function (p) { return p.categoriaId === categoria.id; }).length;
        if (cantidad > 0) {
            labels.push(categoria.nombre);
            valores.push(cantidad);
            colores.push(categoria.color || "#5b7db6");
        }
    });

    if (labels.length === 0) {
        return { labels: ["Sin datos"], valores: [1], colores: ["#d5ddeb"] };
    }

    return { labels: labels, valores: valores, colores: colores };
}

function crearGraficoPerfil() {
    const ctx = document.getElementById("graficoPerfil");
    if (!ctx) return;

    const datos = calcularConteoPerfil();

    graficoPerfil = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: datos.labels,
            datasets: [{
                data: datos.valores,
                backgroundColor: datos.colores,
                borderWidth: 2,
                borderColor: "#ffffff"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 11 },
                        padding: 10,
                        boxWidth: 12
                    }
                }
            },
            cutout: '60%'
        }
    });
}

function actualizarGraficoPerfil() {
    if (!graficoPerfil) {
        crearGraficoPerfil();
        return;
    }
    const datos = calcularConteoPerfil();
    graficoPerfil.data.labels = datos.labels;
    graficoPerfil.data.datasets[0].data = datos.valores;
    graficoPerfil.data.datasets[0].backgroundColor = datos.colores;
    graficoPerfil.update();
}

// ============================================================
// UTILIDADES
// ============================================================
function obtenerTiempoRelativo(fecha) {
    if (!fecha) return 'Fecha desconocida';
    
    const ahora = new Date();
    const fechaPublicacion = new Date(fecha + 'T00:00:00');
    const diffMs = ahora - fechaPublicacion;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Hace un momento';
    if (diffMin < 60) return `Hace ${diffMin} minutos`;
    if (diffHoras < 24) return `Hace ${diffHoras} horas`;
    if (diffDias === 1) return 'Ayer';
    if (diffDias < 7) return `Hace ${diffDias} días`;
    if (diffDias < 30) return `Hace ${Math.floor(diffDias / 7)} semanas`;
    if (diffDias < 365) return `Hace ${Math.floor(diffDias / 30)} meses`;
    return `Hace ${Math.floor(diffDias / 365)} años`;
}

function buscarPorId(arreglo, id) {
    return arreglo.find(function (item) { return item.id === id; });
}

function notificar(mensaje, tipo) {
    const colores = {
        exito: "#198754",
        error: "#dc3545",
        info: "#0d6efd"
    };

    Toastify({
        text: mensaje,
        duration: 2800,
        gravity: "top",
        position: "right",
        style: { background: colores[tipo] || colores.info }
    }).showToast();
}