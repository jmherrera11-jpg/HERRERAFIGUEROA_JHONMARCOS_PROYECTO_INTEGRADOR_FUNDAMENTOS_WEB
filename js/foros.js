// ============================================================
// js/foros.js
// ============================================================

let temasForo = [];
let categoriasForo = [];
let usuariosForo = [];
let filtroForoActual = "Todos";
let modalTema = null;
let temaActualId = null;

const COMENTARIOS_KEY = "daat_comentarios_foro";

document.addEventListener("DOMContentLoaded", async function () {
    await iniciarPaginaInterna("../../json/");

    temasForo = DaatStorage.obtener("publicaciones");
    categoriasForo = DaatStorage.obtener("categorias");
    usuariosForo = DaatStorage.obtener("usuarios");

    modalTema = new bootstrap.Modal(document.getElementById("modalTema"));

    renderizarTemas();

    document.getElementById("buscarTema").addEventListener("input", renderizarTemas);
    document.getElementById("btnNuevoTema").addEventListener("click", crearNuevoTema);

    document.querySelectorAll("#filtrosForo button").forEach(function (boton) {
        boton.addEventListener("click", function () {
            filtroForoActual = boton.dataset.filtro;
            document.querySelectorAll("#filtrosForo button").forEach(function (b) {
                b.className = "btn-inactivo";
            });
            boton.className = "btn-activo";
            renderizarTemas();
        });
    });

    // Delegación de eventos para las tarjetas
    document.getElementById("listaTemas").addEventListener("click", function (evento) {
        const tarjeta = evento.target.closest(".card-tema");
        if (tarjeta && !evento.target.closest(".accion")) {
            const id = Number(tarjeta.dataset.id);
            abrirTema(id);
        }

        const btnLike = evento.target.closest(".accion-like");
        if (btnLike) {
            evento.stopPropagation();
            const id = Number(btnLike.dataset.id);
            darLikeTema(id);
        }

        const btnEliminar = evento.target.closest(".accion-eliminar");
        if (btnEliminar) {
            evento.stopPropagation();
            const id = Number(btnEliminar.dataset.id);
            eliminarTema(id);
        }

        const btnCompartir = evento.target.closest(".accion-compartir");
        if (btnCompartir) {
            evento.stopPropagation();
            const id = Number(btnCompartir.dataset.id);
            compartirTema(id);
        }

        const btnComentar = evento.target.closest(".accion-comentar");
        if (btnComentar) {
            evento.stopPropagation();
            const id = Number(btnComentar.dataset.id);
            abrirTema(id);
        }
    });

    document.getElementById("btnEnviarComentario").addEventListener("click", function () {
        enviarComentario();
    });

    document.getElementById("inputComentario").addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            enviarComentario();
        }
    });

    document.getElementById("modalTemaBody").addEventListener("click", function (evento) {
        const btnEliminar = evento.target.closest(".btn-eliminar-comentario");
        if (btnEliminar) {
            const comentarioId = Number(btnEliminar.dataset.id);
            eliminarComentario(comentarioId);
        }
    });
});



function renderizarTemas() {
    const contenedor = document.getElementById("listaTemas");
    const texto = document.getElementById("buscarTema").value.trim().toLowerCase();

    // Obtener la lista actualizada de temas
    temasForo = DaatStorage.obtener("publicaciones");

    let resultado = temasForo.filter(function(t) {
        return t.estado === "publicado" || !t.estado;
    });

    // Aplicar filtro de categoría
    if (filtroForoActual !== "Todos") {
        const categoria = categoriasForo.find(function (c) { 
            return c.nombre === filtroForoActual; 
        });
        if (categoria) {
            resultado = resultado.filter(function (t) { 
                return t.categoriaId === categoria.id; 
            });
        }
    }

    // Aplicar búsqueda
    if (texto !== "") {
        resultado = resultado.filter(function (t) {
            return (t.titulo && t.titulo.toLowerCase().includes(texto)) || 
                   (t.contenido && t.contenido.toLowerCase().includes(texto));
        });
    }

    contenedor.innerHTML = "";

    if (resultado.length === 0) {
        contenedor.innerHTML = `
            <div class="sin-resultados">
                <i class="fa-solid fa-search"></i> 
                No hay temas que coincidan con tu búsqueda.
                <br><br>
                <button class="btn-nuevo" style="display:inline-block;width:auto;padding:8px 20px;" onclick="document.getElementById('btnNuevoTema').click()">
                    <i class="fa-solid fa-plus"></i> Crear nuevo tema
                </button>
            </div>
        `;
        return;
    }

    // Ordenar por fecha (más reciente primero)
    resultado.sort(function (a, b) { 
        return new Date(b.fecha) - new Date(a.fecha); 
    });

    resultado.forEach(function (tema) {
        contenedor.appendChild(crearTarjetaTema(tema));
    });
}

function crearTarjetaTema(tema) {
    const autor = buscarPorId(usuariosForo, tema.usuarioId);
    const categoria = buscarPorId(categoriasForo, tema.categoriaId);
    const usuarioActual = DaatStorage.usuarioActual();
    const esPropio = usuarioActual && usuarioActual.id === tema.usuarioId;

    const likesDados = JSON.parse(localStorage.getItem("daat_likesForo")) || [];
    const yaLiked = likesDados.includes(tema.id);

    const comentarios = obtenerComentarios(tema.id);
    const totalComentarios = comentarios.length;

    const articulo = document.createElement("article");
    articulo.className = "card-tema";
    articulo.dataset.id = tema.id;

    const fechaTexto = obtenerTiempoRelativo(tema.fecha);
    const nombreAutor = autor ? autor.nombre + " " + autor.apellido : "Usuario";
    const avatar = autor ? autor.avatar : "../../imagenes/Perfil.png";
    const nombreCategoria = categoria ? categoria.nombre : "General";

    // Limitar el contenido mostrado
    const contenidoCorto = tema.contenido.length > 120 ? tema.contenido.substring(0, 120) + "..." : tema.contenido;

    articulo.innerHTML = `
        <div class="tema-header">
            <img src="${avatar}" alt="${nombreAutor}">
            <div class="tema-autor">
                <strong>${nombreAutor}</strong>
                <div class="tema-fecha">${fechaTexto}</div>
            </div>
        </div>
        <div class="tema-etiquetas">
            ${tema.likes > 15 ? `<span class="etiqueta destacado">🔥 Destacado</span>` : ''}
            <span class="etiqueta">${nombreCategoria}</span>
        </div>
        <h2>${tema.titulo || "Tema sin título"}</h2>
        <p class="tema-resumen">${contenidoCorto}</p>
        <div class="tema-acciones">
            <div class="accion accion-like ${yaLiked ? 'liked' : ''}" data-id="${tema.id}">
                <i class="fa-solid fa-heart"></i>
                <span class="contador">${tema.likes || 0}</span>
            </div>
            <div class="accion accion-comentar" data-id="${tema.id}">
                <i class="fa-regular fa-comment"></i>
                <span class="contador">${totalComentarios}</span>
            </div>
            <div class="accion accion-compartir" data-id="${tema.id}">
                <i class="fa-solid fa-share-alt"></i>
                <span>Compartir</span>
            </div>
            ${esPropio ? `
                <div class="accion eliminar accion-eliminar" data-id="${tema.id}">
                    <i class="fa-solid fa-trash"></i>
                    <span>Eliminar</span>
                </div>
            ` : ''}
        </div>
        <div class="tema-info">
            <span><i class="fa-regular fa-eye"></i> ${tema.likes || 0} vistas</span>
            <span><i class="fa-regular fa-comment"></i> ${totalComentarios} respuestas</span>
            <span><i class="fa-regular fa-calendar"></i> ${fechaTexto}</span>
        </div>
    `;

    return articulo;
}

// ============================================================
// FUNCIONES DE COMENTARIOS
// ============================================================

function obtenerComentarios(temaId) {
    const allComments = JSON.parse(localStorage.getItem(COMENTARIOS_KEY)) || [];
    return allComments.filter(function (c) { return c.temaId === temaId; });
}

function obtenerTodosComentarios() {
    return JSON.parse(localStorage.getItem(COMENTARIOS_KEY)) || [];
}

function guardarComentarios(comentarios) {
    localStorage.setItem(COMENTARIOS_KEY, JSON.stringify(comentarios));
}

function abrirTema(id) {
    const tema = buscarPorId(temasForo, id);
    if (!tema) {
        notificar("El tema no existe.", "error");
        return;
    }

    temaActualId = id;
    const autor = buscarPorId(usuariosForo, tema.usuarioId);
    const categoria = buscarPorId(categoriasForo, tema.categoriaId);
    const comentarios = obtenerComentarios(id);
    const usuarioActual = DaatStorage.usuarioActual();

    const nombreAutor = autor ? autor.nombre + " " + autor.apellido : "Usuario";
    const avatar = autor ? autor.avatar : "../../imagenes/Perfil.png";
    const fechaTexto = formatearFecha(tema.fecha);

    let versiculoHTML = '';
    if (tema.versiculo && tema.versiculo.trim() !== '') {
        versiculoHTML = `
            <div class="tema-versiculo">
                "${tema.versiculo}"
                <div class="referencia">${tema.referencia || ''}</div>
            </div>
        `;
    }

    let imagenHTML = '';
    if (tema.imagen && tema.imagen.trim() !== '' && tema.imagen !== 'null' && tema.imagen !== 'undefined') {
        imagenHTML = `<img src="${tema.imagen}" alt="${tema.titulo}" class="tema-imagen">`;
    }

    let comentariosHTML = '';
    if (comentarios.length === 0) {
        comentariosHTML = '<p class="text-muted" style="font-size:14px;">No hay comentarios aún. ¡Sé el primero en comentar!</p>';
    } else {
        comentariosHTML = comentarios.map(function (c) {
            const usuarioComentario = buscarPorId(usuariosForo, c.usuarioId);
            const nombre = usuarioComentario ? usuarioComentario.nombre + " " + usuarioComentario.apellido : "Usuario";
            const esComentarioPropio = usuarioActual && usuarioActual.id === c.usuarioId;
            const fechaComentario = new Date(c.fecha).toLocaleString('es-ES', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });

            return `
                <div class="comentario" data-id="${c.id}">
                    <div class="comentario-header">
                        <strong>${nombre}</strong>
                        <div style="display:flex;align-items:center;gap:8px;">
                            <span class="comentario-fecha">${fechaComentario}</span>
                            ${esComentarioPropio ? `
                                <button class="btn-eliminar-comentario" data-id="${c.id}">
                                    <i class="fa-solid fa-times"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    <p class="comentario-texto">${c.texto}</p>
                </div>
            `;
        }).join('');
    }

    const body = document.getElementById("modalTemaBody");
    body.innerHTML = `
        <div class="tema-detalle">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
                <img src="${avatar}" alt="${nombreAutor}" style="width:40px;height:40px;border-radius:50%;">
                <div>
                    <strong>${nombreAutor}</strong>
                    <div style="font-size:12px;color:#5a78a5;">${categoria ? categoria.nombre : 'General'} · ${fechaTexto}</div>
                </div>
            </div>
            <h3>${tema.titulo}</h3>
            <div class="tema-contenido">${tema.contenido}</div>
            ${versiculoHTML}
            ${imagenHTML}
            <div style="margin-top:12px;display:flex;gap:16px;font-size:13px;color:#5b7db6;">
                <span><i class="fa-regular fa-heart"></i> ${tema.likes || 0} likes</span>
                <span><i class="fa-regular fa-comment"></i> ${comentarios.length} comentarios</span>
            </div>
        </div>
        <div class="tema-comentarios">
            <h6><i class="fa-regular fa-comment"></i> Comentarios (${comentarios.length})</h6>
            <div id="listaComentarios">
                ${comentariosHTML}
            </div>
            <div class="form-comentario">
                <input type="text" id="inputComentario" placeholder="Escribe un comentario..." maxlength="500">
                <button type="button" id="btnEnviarComentario" class="btn btn-primary">
                    <i class="fa-solid fa-paper-plane"></i> Enviar
                </button>
            </div>
        </div>
    `;

    modalTema.show();
}

function enviarComentario() {
    const input = document.getElementById("inputComentario");
    const texto = input.value.trim();

    if (texto === "") {
        notificar("Escribe un comentario antes de enviar.", "error");
        return;
    }

    const usuarioActual = DaatStorage.usuarioActual();
    if (!usuarioActual) {
        Swal.fire({
            title: "Inicia sesión",
            text: "Necesitas iniciar sesión para comentar.",
            icon: "warning",
            confirmButtonText: "Ir a login"
        }).then(function() {
            window.location.href = "../formularios/login.html";
        });
        return;
    }

    const comentarios = obtenerTodosComentarios();
    const nuevoId = comentarios.length > 0 ? Math.max.apply(null, comentarios.map(function (c) { return c.id; })) + 1 : 1;

    const nuevoComentario = {
        id: nuevoId,
        temaId: temaActualId,
        usuarioId: usuarioActual.id,
        texto: texto,
        fecha: new Date().toISOString()
    };

    comentarios.push(nuevoComentario);
    guardarComentarios(comentarios);

    // Actualizar contador de comentarios en el tema
    const tema = buscarPorId(temasForo, temaActualId);
    if (tema) {
        tema.comentarios = (tema.comentarios || 0) + 1;
        DaatStorage.guardar("publicaciones", temasForo);
    }

    input.value = "";
    abrirTema(temaActualId);
    renderizarTemas();
    notificar("Comentario agregado.", "exito");
}

function eliminarComentario(comentarioId) {
    Swal.fire({
        title: "¿Eliminar comentario?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#dc3545"
    }).then(function (resultado) {
        if (resultado.isConfirmed) {
            let comentarios = obtenerTodosComentarios();
            comentarios = comentarios.filter(function (c) { return c.id !== comentarioId; });
            guardarComentarios(comentarios);

            const tema = buscarPorId(temasForo, temaActualId);
            if (tema && tema.comentarios > 0) {
                tema.comentarios = (tema.comentarios || 0) - 1;
                DaatStorage.guardar("publicaciones", temasForo);
            }

            abrirTema(temaActualId);
            renderizarTemas();
            notificar("Comentario eliminado.", "exito");
        }
    });
}

// ============================================================
// FUNCIONES DE LIKES, ELIMINAR Y COMPARTIR
// ============================================================

function darLikeTema(id) {
    const tema = buscarPorId(temasForo, id);
    if (!tema) return;

    const likesDados = JSON.parse(localStorage.getItem("daat_likesForo")) || [];
    const indice = likesDados.indexOf(id);

    if (indice === -1) {
        tema.likes = (tema.likes || 0) + 1;
        likesDados.push(id);
    } else {
        tema.likes = (tema.likes || 0) - 1;
        likesDados.splice(indice, 1);
    }

    localStorage.setItem("daat_likesForo", JSON.stringify(likesDados));
    DaatStorage.guardar("publicaciones", temasForo);
    renderizarTemas();
}

function eliminarTema(id) {
    const tema = buscarPorId(temasForo, id);
    if (!tema) return;

    Swal.fire({
        title: "¿Eliminar tema?",
        text: "Esta acción eliminará el tema y todos sus comentarios.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#dc3545"
    }).then(function (resultado) {
        if (resultado.isConfirmed) {
            temasForo = temasForo.filter(function (t) { return t.id !== id; });
            DaatStorage.guardar("publicaciones", temasForo);

            let comentarios = obtenerTodosComentarios();
            comentarios = comentarios.filter(function (c) { return c.temaId !== id; });
            guardarComentarios(comentarios);

            renderizarTemas();
            notificar("Tema eliminado correctamente.", "exito");
        }
    });
}

function compartirTema(id) {
    const tema = buscarPorId(temasForo, id);
    if (!tema) return;

    const url = window.location.href.split('?')[0] + '?tema=' + id;

    if (navigator.share) {
        navigator.share({
            title: tema.titulo,
            text: tema.contenido.substring(0, 100) + '...',
            url: url
        }).catch(function() {});
    } else {
        navigator.clipboard.writeText(url).then(function() {
            notificar("Enlace copiado al portapapeles.", "exito");
        }).catch(function() {
            Swal.fire({
                title: "Compartir tema",
                text: "Copia este enlace: " + url,
                icon: "info"
            });
        });
    }
}

// ============================================================
// CREAR NUEVO TEMA
// ============================================================

function crearNuevoTema() {
    const usuarioActual = DaatStorage.usuarioActual();
    if (!usuarioActual) {
        Swal.fire({
            title: "Inicia sesión",
            text: "Necesitas iniciar sesión para crear un nuevo tema.",
            icon: "warning",
            confirmButtonText: "Ir a login"
        }).then(function() {
            window.location.href = "../formularios/login.html";
        });
        return;
    }

    // Crear select de categorías
    let categoriasOptions = '';
    categoriasForo.forEach(function(cat) {
        categoriasOptions += `<option value="${cat.id}">${cat.nombre}</option>`;
    });

    Swal.fire({
        title: "Nuevo tema de discusión",
        html: `
            <input id="swalTitulo" class="swal2-input" placeholder="Título del tema">
            <textarea id="swalContenido" class="swal2-textarea" placeholder="Describe el tema..."></textarea>
            <input id="swalVersiculo" class="swal2-input" placeholder="Versículo (opcional)">
            <input id="swalReferencia" class="swal2-input" placeholder="Referencia (opcional, ej: Juan 3:16)">
            <select id="swalCategoria" class="swal2-input" style="height:40px;">
                ${categoriasOptions}
            </select>
        `,
        confirmButtonText: "Publicar tema",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        width: 600,
        preConfirm: function () {
            const titulo = document.getElementById("swalTitulo").value.trim();
            const contenido = document.getElementById("swalContenido").value.trim();
            if (titulo === "" || contenido === "") {
                Swal.showValidationMessage("Debes completar el título y la descripción.");
                return false;
            }
            return {
                titulo: titulo,
                contenido: contenido,
                versiculo: document.getElementById("swalVersiculo").value.trim(),
                referencia: document.getElementById("swalReferencia").value.trim(),
                categoriaId: parseInt(document.getElementById("swalCategoria").value) || 1
            };
        }
    }).then(function (resultado) {
        if (resultado.isConfirmed) {
            // Obtener la lista actualizada
            temasForo = DaatStorage.obtener("publicaciones");
            
            const nuevoTema = {
                id: DaatStorage.nuevoId(temasForo),
                usuarioId: usuarioActual.id,
                categoriaId: resultado.value.categoriaId,
                titulo: resultado.value.titulo,
                contenido: resultado.value.contenido,
                versiculo: resultado.value.versiculo || "",
                referencia: resultado.value.referencia || "",
                imagen: "",
                fecha: new Date().toISOString().substring(0, 10),
                likes: 0,
                comentarios: 0,
                estado: "publicado"
            };

            temasForo.unshift(nuevoTema);
            DaatStorage.guardar("publicaciones", temasForo);
            renderizarTemas();
            notificar("Tema publicado correctamente.", "exito");
        }
    });
}

// ============================================================
// FUNCIONES DE UTILIDAD
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

function formatearFecha(fecha) {
    if (!fecha) return 'Fecha desconocida';
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
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