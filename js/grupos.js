let categoriasGrupos = [];

document.addEventListener("DOMContentLoaded", async function () {
  await iniciarPaginaInterna("../../json/");
  categoriasGrupos = DaatStorage.obtener("categorias").slice(0, 12);
  renderizarGrupos();
});

function renderizarGrupos() {
  const contenedor = document.getElementById("listaGrupos");
  contenedor.innerHTML = "";

  categoriasGrupos.forEach(function (categoria) {
    const articulo = document.createElement("article");
    articulo.className = "card-grupo";
    articulo.innerHTML =
      '<div class="col">' +
      '<div class="card-banner" style="background:' + categoria.color + '"></div>' +
      "<h2>" + categoria.nombre + "</h2>" +
      "<p>" + categoria.descripcion + "</p>" +
      '<div class="card-miembros">' + (50 + (categoria.id * 17) % 300) + " miembros</div>" +
      "<button class='btn-etiqueta'><i class='fa-solid " + categoria.icono + "'></i> " + categoria.nombre + "</button>" +
      "</div>";
    contenedor.appendChild(articulo);
  });
}