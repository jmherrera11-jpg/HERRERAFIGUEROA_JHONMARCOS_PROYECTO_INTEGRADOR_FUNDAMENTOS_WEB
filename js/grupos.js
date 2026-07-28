// ============================================================
// js/grupos.js
// COMMIT 2: carga dinámica de grupos (se reutiliza categorias.json)
// COMMIT 3: búsqueda en tiempo real y filtro por categoría
// COMMIT 4: unirse / abandonar / crear grupo (CRUD + localStorage)
// ============================================================

let categoriasGrupos = [];
let miembrosBase = {};
let filtroGrupoActual = "Todos";

// Colores para los banners de los grupos (más variados y atractivos)
const COLORES_BANNER = [
    "#2E86AB", "#A23B72", "#F18F01", "#4C9F70", "#D64933",
    "#7B2CBF", "#FF6B35", "#F7C59F", "#EF476F", "#118AB2",
    "#06D6A0", "#9C89B8", "#F4A261", "#E63946", "#457B9D",
    "#2A9D8F", "#E76F51", "#264653", "#8D99AE", "#EF233C"
];

document.addEventListener("DOMContentLoaded", async function () {
    await iniciarPaginaInterna("../../json/");

    categoriasGrupos = DaatStorage.obtener("categorias").slice(0, 12);
    generarMiembrosBase();
    renderizarGrupos();

    document.getElementById("buscarGrupo").addEventListener("input", renderizarGrupos);
    document.getElementById("btnCrearGrupo").addEventListener("click", crearGrupoPersonalizado);

    document.querySelectorAll("#filtrosGrupos button").forEach(function (boton) {
        boton.addEventListener("click", function () {
            filtroGrupoActual = boton.textContent.trim();
            document.querySelectorAll("#filtrosGrupos button").forEach(function (b) {
                b.classList.remove("btn-secondary");
                b.classList.add("btn-primary");
            });
            boton.classList.remove("btn-primary");
            boton.classList.add("btn-secondary");
            renderizarGrupos();
        });
    });

    document.getElementById("listaGrupos").addEventListener("click", function (evento) {
        const boton = evento.target.closest(".btn-abandonar, .btn-unirse");
        if (!boton) return;
        alternarMembresia(Number(boton.dataset.id), boton.classList.contains("btn-unirse"));
    });
});

function generarMiembrosBase() {
    categoriasGrupos.forEach(function (categoria) {
        miembrosBase[categoria.id] = 50 + (categoria.id * 17) % 300;
    });
}

function obtenerGruposUnidos() {
    return JSON.parse(localStorage.getItem("daat_gruposUnidos")) || [];
}

function renderizarGrupos() {
    const contenedor = document.getElementById("listaGrupos");
    const texto = document.getElementById("buscarGrupo").value.trim().toLowerCase();
    const gruposUnidos = obtenerGruposUnidos();

    let resultado = categoriasGrupos.slice();

    if (filtroGrupoActual !== "Todos") {
        resultado = resultado.filter(function (c) { return c.nombre === filtroGrupoActual; });
    }

    if (texto !== "") {
        resultado = resultado.filter(function (c) {
            return c.nombre.toLowerCase().includes(texto) || c.descripcion.toLowerCase().includes(texto);
        });
    }

    contenedor.innerHTML = "";

    if (resultado.length === 0) {
        contenedor.innerHTML = "<p class='sin-resultados'>No se encontraron grupos.</p>";
        return;
    }

    resultado.forEach(function (categoria, index) {
        const unido = gruposUnidos.includes(categoria.id);
        const colorBanner = COLORES_BANNER[index % COLORES_BANNER.length];

        const articulo = document.createElement("article");
        articulo.className = "card-grupo";

        articulo.innerHTML = `
            <div class="card-banner" style="background: ${colorBanner};">
                <div class="banner-icono">
                    <i class="fa-solid ${categoria.icono || 'fa-users'}"></i>
                </div>
            </div>
            <div class="card-contenido">
                <h2>${categoria.nombre}</h2>
                <p>${categoria.descripcion}</p>
                <div class="card-miembros">
                    <i class="fa-solid fa-user-group"></i> ${miembrosBase[categoria.id] + (unido ? 1 : 0)} miembros
                </div>
                <button class="btn-etiqueta">
                    <i class="fa-solid ${categoria.icono || 'fa-tag'}"></i> ${categoria.nombre}
                </button>
                ${unido
                    ? `<button class="btn-abandonar" data-id="${categoria.id}">Abandonar grupo</button>`
                    : `<button class="btn-unirse" data-id="${categoria.id}">Solicitar unirse</button>`
                }
            </div>
        `;

        contenedor.appendChild(articulo);
    });
}

function alternarMembresia(id, unirse) {
    let gruposUnidos = obtenerGruposUnidos();

    if (unirse) {
        gruposUnidos.push(id);
        localStorage.setItem("daat_gruposUnidos", JSON.stringify(gruposUnidos));
        renderizarGrupos();
        notificar("Te has unido al grupo.", "exito");
        return;
    }

    Swal.fire({
        title: "¿Abandonar grupo?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, abandonar",
        cancelButtonText: "Cancelar"
    }).then(function (resultado) {
        if (resultado.isConfirmed) {
            gruposUnidos = gruposUnidos.filter(function (g) { return g !== id; });
            localStorage.setItem("daat_gruposUnidos", JSON.stringify(gruposUnidos));
            renderizarGrupos();
            notificar("Has abandonado el grupo.", "exito");
        }
    });
}

function crearGrupoPersonalizado() {
    Swal.fire({
        title: "Crear nuevo grupo",
        html:
            '<input id="swalNombreGrupo" class="swal2-input" placeholder="Nombre del grupo">' +
            '<textarea id="swalDescGrupo" class="swal2-textarea" placeholder="Descripción del grupo"></textarea>',
        confirmButtonText: "Crear",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        preConfirm: function () {
            const nombre = document.getElementById("swalNombreGrupo").value.trim();
            const descripcion = document.getElementById("swalDescGrupo").value.trim();
            if (nombre === "") {
                Swal.showValidationMessage("El grupo necesita un nombre.");
                return false;
            }
            return { nombre: nombre, descripcion: descripcion };
        }
    }).then(function (resultado) {
        if (resultado.isConfirmed) {
            const idNuevo = DaatStorage.nuevoId(categoriasGrupos);
            const nuevaCategoria = {
                id: idNuevo,
                nombre: resultado.value.nombre,
                descripcion: resultado.value.descripcion || "Grupo creado por un miembro de la comunidad.",
                icono: "fa-users",
                color: COLORES_BANNER[idNuevo % COLORES_BANNER.length]
            };

            categoriasGrupos.push(nuevaCategoria);
            miembrosBase[idNuevo] = 1;
            renderizarGrupos();
            notificar("Grupo creado correctamente.", "exito");
        }
    });
}