// ============================================================
// js/inicio.js
// Feed principal de Daat Devotional
// COMMIT 2: carga dinámica desde JSON/localStorage
// COMMIT 3: búsqueda en tiempo real, filtro por categoría y orden
// COMMIT 4: CRUD (publicar, dar like, eliminar publicación propia)
// COMMIT 6: clima (Open-Meteo)
// COMMIT 7: gráfico de publicaciones por categoría (Chart.js)
// ============================================================

let publicacionesFeed = [];
let categoriasFeed = [];
let usuariosFeed = [];
let graficoCategorias = null;
let ciudadActual = 'santo-domingo';
let modalPublicacion = null;

const CIUDADES_CLIMA = {
    "santo-domingo": { nombre: "Santo Domingo", lat: -0.25, lon: -79.15 },
    "quito": { nombre: "Quito", lat: -0.18, lon: -78.47 },
    "guayaquil": { nombre: "Guayaquil", lat: -2.17, lon: -79.90 },
    "quevedo": { nombre: "Quevedo", lat: -1.03, lon: -79.46 }
};

document.addEventListener("DOMContentLoaded", async function () {
    await iniciarPaginaInterna("../../json/");

    cargarDatosFeed();
    generarFiltrosCategoria();
    renderizarPublicaciones();
    configurarEventosFeed();
    cargarClima(ciudadActual);
    inicializarModal();
});

function cargarDatosFeed() {
    publicacionesFeed = DaatStorage.obtener("publicaciones");
    categoriasFeed = DaatStorage.obtener("categorias");
    usuariosFeed = DaatStorage.obtener("usuarios");
}

function configurarEventosFeed() {
    // Buscador
    document.getElementById("buscarPublicacion").addEventListener("input", renderizarPublicaciones);
    
    // Filtro categoría
    document.getElementById("filtroCategoriaSelect").addEventListener("change", renderizarPublicaciones);
    
    // Ordenamiento
    document.getElementById("ordenarPublicaciones").addEventListener("change", renderizarPublicaciones);

    // Botones de clima
    document.querySelectorAll(".btn-clima").forEach(function(btn) {
        btn.addEventListener("click", function() {
            document.querySelectorAll(".btn-clima").forEach(function(b) {
                b.classList.remove("activo");
            });
            btn.classList.add("activo");
            ciudadActual = btn.dataset.ciudad;
            cargarClima(ciudadActual);
        });
    });

    // Toggle clima
    document.getElementById("btnToggleClima").addEventListener("click", function() {
        const panel = document.getElementById("panelClima");
        const botones = document.getElementById("climaBotones");
        panel.classList.toggle("oculto");
        botones.classList.toggle("oculto");
        this.classList.toggle("activo");
    });

    // Toggle gráfico
    document.getElementById("btnToggleGrafico").addEventListener("click", function() {
        const container = document.getElementById("graficoContainer");
        container.classList.toggle("visible");
        this.classList.toggle("activo");
        if (container.classList.contains("visible") && graficoCategorias) {
            setTimeout(function() { graficoCategorias.resize(); }, 300);
        }
    });

    // Abrir modal de publicación
    document.getElementById("btnAbrirPublicacion").addEventListener("click", function() {
        if (modalPublicacion) modalPublicacion.show();
    });

    // Botón publicar en modal
    document.getElementById("btnPublicarModal").addEventListener("click", publicarDesdeModal);

    // Vista previa de imagen en modal
    document.getElementById("modalImagen").addEventListener("change", function(e) {
        const preview = document.getElementById("modalPreviewImagen");
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                preview.src = event.target.result;
                preview.classList.add("visible");
            };
            reader.readAsDataURL(file);
        } else {
            preview.classList.remove("visible");
        }
    });

    // Restablecer datos
    document.getElementById("btnRestablecer").addEventListener("click", function() {
        restablecerDatosFeed();
    });

    // Delegación de eventos para publicaciones (like y eliminar)
    document.getElementById("listaPublicaciones").addEventListener("click", function(evento) {
        const botonLike = evento.target.closest(".btn-like");
        const botonEliminar = evento.target.closest(".btn-eliminar-post");

        if (botonLike) alternarLike(Number(botonLike.dataset.id));
        if (botonEliminar) confirmarEliminarPublicacion(Number(botonEliminar.dataset.id));
    });
}

function inicializarModal() {
    modalPublicacion = new bootstrap.Modal(document.getElementById('modalPublicacion'));
    
    // Llenar categorías en el modal
    const select = document.getElementById("modalCategoria");
    select.innerHTML = '';
    categoriasFeed.forEach(function(cat) {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.nombre;
        select.appendChild(option);
    });
}

// ---------- Filtros por categoría ----------

function generarFiltrosCategoria() {
    const select = document.getElementById("filtroCategoriaSelect");
    select.innerHTML = '<option value="">Todas las categorías</option>';
    
    categoriasFeed.forEach(function(categoria) {
        const option = document.createElement("option");
        option.value = categoria.id;
        option.textContent = categoria.nombre;
        select.appendChild(option);
    });
}

// ---------- Render principal (búsqueda + filtro + orden) ----------

function renderizarPublicaciones() {
    const contenedor = document.getElementById("listaPublicaciones");
    const texto = document.getElementById("buscarPublicacion").value.trim().toLowerCase();
    const categoriaId = parseInt(document.getElementById("filtroCategoriaSelect").value) || 0;
    const orden = document.getElementById("ordenarPublicaciones").value;

    // Solo publicaciones con estado "publicado" o sin estado
    let resultado = publicacionesFeed.filter(function(p) { 
        return p.estado === "publicado" || !p.estado; 
    });

    // Filtro por categoría
    if (categoriaId > 0) {
        resultado = resultado.filter(function(p) { return p.categoriaId === categoriaId; });
    }

    // Búsqueda por texto
    if (texto !== "") {
        resultado = resultado.filter(function(p) {
            const autor = buscarPorId(usuariosFeed, p.usuarioId);
            const nombreAutor = autor ? (autor.nombre + " " + autor.apellido).toLowerCase() : "";
            return p.titulo.toLowerCase().includes(texto) ||
                p.contenido.toLowerCase().includes(texto) ||
                nombreAutor.includes(texto) ||
                (p.referencia && p.referencia.toLowerCase().includes(texto));
        });
    }

    // Ordenamiento
    if (orden === "recientes") {
        resultado = resultado.slice().sort(function(a, b) { return new Date(b.fecha) - new Date(a.fecha); });
    } else if (orden === "antiguas") {
        resultado = resultado.slice().sort(function(a, b) { return new Date(a.fecha) - new Date(b.fecha); });
    } else if (orden === "populares") {
        resultado = resultado.slice().sort(function(a, b) { return b.likes - a.likes; });
    }

    contenedor.innerHTML = "";

    if (resultado.length === 0) {
        contenedor.innerHTML = `
            <div class="sin-resultados">
                <i class="fa-solid fa-search"></i>
                No se encontraron publicaciones con esos criterios.
            </div>
        `;
        return;
    }

    resultado.forEach(function(publicacion) {
        contenedor.appendChild(crearTarjetaPublicacion(publicacion));
    });
}

function crearTarjetaPublicacion(publicacion) {
    const autor = buscarPorId(usuariosFeed, publicacion.usuarioId);
    const categoria = buscarPorId(categoriasFeed, publicacion.categoriaId);
    const usuarioActual = DaatStorage.usuarioActual();
    const esPropia = usuarioActual && usuarioActual.id === publicacion.usuarioId;
    
    // Verificar si el usuario ya dio like
    const likesDados = JSON.parse(localStorage.getItem("daat_likesDados")) || [];
    const yaLiked = likesDados.includes(publicacion.id);

    const articulo = document.createElement("article");
    articulo.className = "publicacion";

    // Mostrar imagen si existe (ruta válida)
    let imagenHTML = '';
    if (publicacion.imagen && publicacion.imagen.trim() !== '' && publicacion.imagen !== 'null' && publicacion.imagen !== 'undefined') {
        imagenHTML = `<img src="${publicacion.imagen}" alt="${publicacion.titulo}" class="publicacion-imagen" onerror="this.style.display='none'">`;
    }

    articulo.innerHTML =
        '<div class="publicacion-header">' +
        '<img src="' + (autor ? autor.avatar : "../../imagenes/Perfil.png") + '" alt="Perfil">' +
        '<div class="publicacion-autor">' +
        "<strong>" + (autor ? autor.nombre + " " + autor.apellido : "Usuario") + "</strong>" +
        '<div class="publicacion-fecha">' + (categoria ? categoria.nombre : "") + " · " + formatearFecha(publicacion.fecha) + "</div>" +
        "</div></div>" +
        "<h3 class='titulo-publicacion'>" + publicacion.titulo + "</h3>" +
        "<p>" + publicacion.contenido + "</p>" +
        (publicacion.versiculo ?
            '<div class="versiculo"><i>"' + publicacion.versiculo + '"</i>' +
            '<div class="referencia"><b>' + publicacion.referencia + "</b></div></div>" : "") +
        imagenHTML +
        '<div class="acciones">' +
        '<div class="btn-like' + (yaLiked ? ' liked' : '') + '" data-id="' + publicacion.id + '">' +
            '<i class="fa-solid fa-heart"></i> ' + publicacion.likes +
        '</div>' +
        '<div><i class="fa-regular fa-comment-dots"></i> ' + publicacion.comentarios + "</div>" +
        '<div><i class="fa-solid fa-location-arrow"></i> Compartir</div>' +
        (esPropia ? 
            '<div class="btn-eliminar-post" data-id="' + publicacion.id + '">' +
                '<i class="fa-solid fa-trash"></i> Eliminar' +
            '</div>' : 
            '') +
        "</div>";

    return articulo;
}

// ---------- Publicar desde Modal ----------

function publicarDesdeModal() {
    const titulo = document.getElementById("modalTitulo").value.trim();
    const contenido = document.getElementById("modalContenido").value.trim();
    const versiculo = document.getElementById("modalVersiculo").value.trim();
    const referencia = document.getElementById("modalReferencia").value.trim();
    const categoriaId = parseInt(document.getElementById("modalCategoria").value) || 1;
    const imagenFile = document.getElementById("modalImagen").files[0];

    if (titulo === "" || contenido === "") {
        Swal.fire({
            icon: "warning",
            title: "Campos incompletos",
            text: "Debes completar el título y el contenido de la reflexión."
        });
        return;
    }

    const usuarioActual = DaatStorage.usuarioActual();

    // Procesar imagen si se seleccionó
    if (imagenFile) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const imagenData = event.target.result;
            guardarPublicacion(titulo, contenido, versiculo, referencia, categoriaId, imagenData, usuarioActual);
        };
        reader.readAsDataURL(imagenFile);
    } else {
        guardarPublicacion(titulo, contenido, versiculo, referencia, categoriaId, "", usuarioActual);
    }
}

function guardarPublicacion(titulo, contenido, versiculo, referencia, categoriaId, imagen, usuarioActual) {
    const nuevaPublicacion = {
        id: DaatStorage.nuevoId(publicacionesFeed),
        usuarioId: usuarioActual ? usuarioActual.id : 1,
        categoriaId: categoriaId,
        titulo: titulo,
        contenido: contenido,
        versiculo: versiculo,
        referencia: referencia,
        imagen: imagen || "",
        fecha: new Date().toISOString().substring(0, 10),
        likes: 0,
        comentarios: 0,
        estado: "publicado"
    };

    publicacionesFeed.unshift(nuevaPublicacion);
    DaatStorage.guardar("publicaciones", publicacionesFeed);

    // Limpiar modal
    document.getElementById("modalTitulo").value = "";
    document.getElementById("modalContenido").value = "";
    document.getElementById("modalVersiculo").value = "";
    document.getElementById("modalReferencia").value = "";
    document.getElementById("modalImagen").value = "";
    document.getElementById("modalPreviewImagen").classList.remove("visible");
    document.getElementById("modalPreviewImagen").src = "";

    modalPublicacion.hide();
    renderizarPublicaciones();
    actualizarGraficoCategorias();
    notificar("Tu reflexión ha sido publicada.", "exito");
}

// ---------- Likes ----------

function alternarLike(id) {
    const publicacion = buscarPorId(publicacionesFeed, id);
    if (!publicacion) return;

    const likesDados = JSON.parse(localStorage.getItem("daat_likesDados")) || [];
    const indice = likesDados.indexOf(id);

    if (indice === -1) {
        publicacion.likes += 1;
        likesDados.push(id);
    } else {
        publicacion.likes -= 1;
        likesDados.splice(indice, 1);
    }

    localStorage.setItem("daat_likesDados", JSON.stringify(likesDados));
    DaatStorage.guardar("publicaciones", publicacionesFeed);
    renderizarPublicaciones();
}

// ---------- Eliminar ----------

function confirmarEliminarPublicacion(id) {
    Swal.fire({
        title: "¿Eliminar publicación?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#dc3545"
    }).then(function (resultado) {
        if (resultado.isConfirmed) {
            publicacionesFeed = publicacionesFeed.filter(function (p) { return p.id !== id; });
            DaatStorage.guardar("publicaciones", publicacionesFeed);
            renderizarPublicaciones();
            actualizarGraficoCategorias();
            notificar("Publicación eliminada.", "exito");
        }
    });
}

// ---------- Restablecer ----------

function restablecerDatosFeed() {
    Swal.fire({
        title: "¿Restablecer datos?",
        text: "Esto eliminará todas las publicaciones creadas y volverá a los datos originales.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, restablecer",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#dc3545"
    }).then(async function(resultado) {
        if (resultado.isConfirmed) {
            await DaatStorage.restablecer("../../json/");
            cargarDatosFeed();
            renderizarPublicaciones();
            actualizarGraficoCategorias();
            notificar("Datos restablecidos correctamente.", "exito");
        }
    });
}

// ---------- Gráfico ----------

function calcularConteoPorCategoria() {
    const labels = [];
    const valores = [];
    const colores = [];

    categoriasFeed.forEach(function (categoria) {
        const cantidad = publicacionesFeed.filter(function (p) { 
            return p.categoriaId === categoria.id && (p.estado === "publicado" || !p.estado); 
        }).length;
        if (cantidad > 0) {
            labels.push(categoria.nombre);
            valores.push(cantidad);
            colores.push(categoria.color);
        }
    });

    return { labels: labels, valores: valores, colores: colores };
}

function crearGraficoCategorias() {
    const ctx = document.getElementById("graficoCategorias");
    if (!ctx) return;

    const datos = calcularConteoPorCategoria();

    if (datos.labels.length === 0) {
        document.getElementById("graficoContainer").querySelector("h4").textContent = 
            "📊 Publicaciones por categoría (sin datos)";
        return;
    }

    graficoCategorias = new Chart(ctx, {
        type: "bar",
        data: {
            labels: datos.labels,
            datasets: [{
                label: "Publicaciones por categoría",
                data: datos.valores,
                backgroundColor: datos.colores
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
            plugins: { legend: { display: false } }
        }
    });
}

function actualizarGraficoCategorias() {
    if (!graficoCategorias) {
        crearGraficoCategorias();
        return;
    }
    const datos = calcularConteoPorCategoria();
    graficoCategorias.data.labels = datos.labels;
    graficoCategorias.data.datasets[0].data = datos.valores;
    graficoCategorias.data.datasets[0].backgroundColor = datos.colores;
    graficoCategorias.update();
}

// ---------- Clima ----------

async function cargarClima(claveCiudad) {
    const panel = document.getElementById("panelClima");
    const ciudad = CIUDADES_CLIMA[claveCiudad];

    panel.innerHTML = "<p style='color: rgba(255,255,255,0.7) !important;'>Consultando clima...</p>";

    try {
        const url = "https://api.open-meteo.com/v1/forecast?latitude=" + ciudad.lat +
            "&longitude=" + ciudad.lon +
            "&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto";

        const respuesta = await fetch(url);
        if (!respuesta.ok) throw new Error("Respuesta no válida del servicio de clima");

        const datos = await respuesta.json();
        const actual = datos.current;

        panel.innerHTML =
            "<h3>" + ciudad.nombre + "</h3>" +
            "<p>🌡️ " + actual.temperature_2m + " °C</p>" +
            "<p>💧 Humedad: " + actual.relative_humidity_2m + "%</p>" +
            "<p>💨 Viento: " + actual.wind_speed_10m + " km/h</p>" +
            '<p class="clima-versiculo">"Los cielos cuentan la gloria de Dios" — Salmos 19:1</p>';
    } catch (error) {
        panel.innerHTML = "<p style='color: rgba(255,200,200,0.9) !important;'>No se pudo obtener el clima en este momento.</p>";
        console.error(error);
    }
}

// ---------- Inicializar gráfico al cargar ----------
// Se llama desde DOMContentLoaded
setTimeout(function() {
    crearGraficoCategorias();
}, 500);