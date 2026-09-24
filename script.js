// ============================================================
// VISTAZO — Renderizado dinámico de noticias desde JSON
// ============================================================

let noticias = [];       // se llena al cargar data/news.json
let filtroActivo = "todas";

const CAT_CLASS = {
  educacion: "cat-edu",
  tecnologia: "cat-tech",
  turismo: "cat-tur",
  comercio: "cat-com"
};

// ---------- Carga de datos ----------
async function cargarNoticias() {
  try {
    const res = await fetch("data/news.json");
    if (!res.ok) throw new Error("No se pudo cargar el JSON de noticias");
    noticias = await res.json();
  } catch (err) {
    console.error(err);
    noticias = [];
  }
  renderHome();
  renderListado();
}

function buscarNoticiaPorId(id) {
  return noticias.find(n => n.id === Number(id));
}

// ---------- HOME: destacadas dinámicas ----------
function renderHome() {
  const contenedor = document.getElementById("home-cards-grid");
  const destacadas = noticias.filter(n => n.destacadaHome);
  contenedor.innerHTML = destacadas.map(n => tarjetaHome(n)).join("");
}

function tarjetaHome(n) {
  const claseTamano = n.tamHome === "feature" ? "card-feature"
                     : n.tamHome === "normal-wide" ? "card-normal-wide"
                     : "";
  return `
    <div class="card ${claseTamano}">
      <div class="card-img" style="background-image:url('${n.imagen}')"><span class="cat-pill ${CAT_CLASS[n.categoria]}">${n.catLabel}</span></div>
      <div class="card-body">
        <h3>${n.titulo}</h3>
        <p>${n.resumen}</p>
        <div class="card-foot">
          <a class="link-more" data-detalle="${n.id}">Ver más →</a>
          <span class="fav-icon">♡</span>
        </div>
      </div>
    </div>`;
}

// ---------- LISTADO: cards dinámicas + filtro por categoría ----------
function renderListado() {
  const contenedor = document.getElementById("listado-grid");
  const contador = document.getElementById("listado-contador");

  const lista = filtroActivo === "todas"
    ? noticias
    : noticias.filter(n => n.categoria === filtroActivo);

  contador.textContent = `${lista.length} historia${lista.length === 1 ? "" : "s"} encontrada${lista.length === 1 ? "" : "s"}`;

  contenedor.innerHTML = lista.length
    ? lista.map(n => tarjetaListado(n)).join("")
    : `<p class="empty-state">No hay noticias en esta categoría por ahora.</p>`;
}

function tarjetaListado(n) {
  return `
    <div class="list-card">
      <div class="card-img" style="background-image:url('${n.imagen}')"><span class="cat-pill ${CAT_CLASS[n.categoria]}">${n.catLabel}</span></div>
      <div class="card-body">
        <h3>${n.titulo}</h3>
        <p>${n.resumen}</p>
        <div class="card-foot">
          <a class="link-more" data-detalle="${n.id}">Ver más →</a>
          <span class="fav-icon">♡</span>
        </div>
      </div>
    </div>`;
}

function inicializarFiltros() {
  document.querySelectorAll("#listado-filtros .filter-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      filtroActivo = chip.dataset.cat;
      document.querySelectorAll("#listado-filtros .filter-chip")
        .forEach(c => c.classList.toggle("active", c === chip));
      renderListado();
    });
  });
}

// ---------- DETALLE: contenido dinámico según la noticia elegida ----------
function renderDetalle(id) {
  const n = buscarNoticiaPorId(id);
  const contenedor = document.getElementById("detalle-contenido");
  if (!n) {
    contenedor.innerHTML = `<p class="empty-state">Noticia no encontrada.</p>`;
    return;
  }

  const relacionadas = (n.relacionadas || [])
    .map(rid => buscarNoticiaPorId(rid))
    .filter(Boolean);

  contenedor.innerHTML = `
    <div>
      <div class="breadcrumb"><a data-goto="listado">Explorar</a> / ${n.catLabel} / Detalle</div>
      <div class="detalle-img" style="background-image:url('${n.imagen}')"><span class="cat-pill ${CAT_CLASS[n.categoria]}">${n.catLabel}</span></div>
      <h1>${n.titulo}</h1>
      <div class="meta-row"><span>📍 ${n.ubicacion}</span><span>·</span><span>${n.fecha}</span></div>
      <div class="detalle-body">
        ${n.contenido.map(p => `<p>${p}</p>`).join("")}
      </div>
      <div class="detalle-actions">
        <span class="btn btn-primary">♡ Agregar a favoritos</span>
        <span class="btn btn-ghost" data-goto="contacto">Contactar organizadores</span>
      </div>
    </div>

    <div>
      <div class="side-box">
        <h4>Sobre esta experiencia</h4>
        <p>Categoría: ${n.catLabel}<br>Modalidad: ${n.modalidad}<br>Costo: ${n.costo}<br>Cupos: ${n.cupos}</p>
      </div>
      <div class="side-box">
        <h4>Relacionadas</h4>
        <p>${relacionadas.map(r => `<span class="related-item" data-detalle="${r.id}">${r.titulo}</span>`).join("<br><br>") || "No hay noticias relacionadas."}</p>
      </div>
    </div>`;
}

// ---------- Navegación entre pantallas ----------
function goTo(nombrePantalla) {
  document.querySelectorAll(".screen").forEach(s => s.classList.toggle("active", s.id === nombrePantalla));
  window.scrollTo({ top: 0, behavior: "instant" });
}

function goToDetalle(id) {
  renderDetalle(id);
  goTo("detalle");
}

// Delegación de eventos: clicks en data-goto y data-detalle en cualquier parte del documento,
// incluido el contenido que se genera dinámicamente.
document.addEventListener("click", (e) => {
  const irA = e.target.closest("[data-goto]");
  if (irA) {
    goTo(irA.dataset.goto);
    return;
  }
  const verDetalle = e.target.closest("[data-detalle]");
  if (verDetalle) {
    goToDetalle(verDetalle.dataset.detalle);
  }
});

// ---------- Inicio ----------
document.addEventListener("DOMContentLoaded", () => {
  inicializarFiltros();
  cargarNoticias();
});
