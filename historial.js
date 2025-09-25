const tablaHistorial = document.querySelector("#tabla-historial tbody");
const filtroTipo = document.getElementById("filtro-tipo");
const filtroID = document.getElementById("filtro-id");
const btnReset = document.getElementById("reset-filtros");
const btnToggleFiltros = document.getElementById("btn-toggle-filtros");
const bloqueFiltros = document.getElementById("collapsible-form");

// Inicializar Flatpickr
const fechaPicker = flatpickr("#filtro-fecha", { dateFormat: "d/m/Y", allowInput: true });
const desdePicker = flatpickr("#filtro-fecha-desde", { dateFormat: "d/m/Y", allowInput: true });
const hastaPicker = flatpickr("#filtro-fecha-hasta", { dateFormat: "d/m/Y", allowInput: true });

let historialGlobal = [];

// Convertir fecha ISO → objeto Date completo (con horas)
function parseFechaISO(str) {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d) ? null : d;
}

// Comparar solo día/mes/año
function sameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

// Cargar historial desde data.json
async function cargarHistorial() {
  try {
    const res = await fetch("/api/data");
    if (!res.ok) throw new Error("Error al leer historial");
    const data = await res.json();

    historialGlobal = data.historial.map(h => ({
      ...h,
      fechaObj: parseFechaISO(h.fecha)
    })).sort((a, b) => b.fechaObj - a.fechaObj);

    renderHistorial();
  } catch (err) {
    console.error("Error cargando historial:", err);
    historialGlobal = [];
    renderHistorial();
  }
}

function renderHistorial() {
  const tipo = filtroTipo.value;
  const fechaExacta = fechaPicker.selectedDates[0] || null;
  const desde = desdePicker.selectedDates[0] || null;
  const hasta = hastaPicker.selectedDates[0] || null;
  const idBuscado = filtroID.value ? filtroID.value.toLowerCase() : null;

  tablaHistorial.innerHTML = "";

  // Filtrar primero
  let filtrado = historialGlobal.filter(h => {
    if (!h.fechaObj) return false;
    const filaFecha = h.fechaObj;
    const productoIDText = h.productoID.toString().toLowerCase();
    const fechaValida = (!fechaExacta || sameDay(filaFecha, fechaExacta)) &&
                        (!desde || filaFecha >= desde) &&
                        (!hasta || filaFecha <= hasta);
    return (tipo === "todos" || h.accion === tipo) &&
           fechaValida &&
           (!idBuscado || productoIDText.includes(idBuscado));
  });

  // Limitar a los últimos 1000 registros
  filtrado = filtrado.slice(0, 10000);

  // Renderizar
  filtrado.forEach(h => {
    const filaFecha = h.fechaObj;
    const tr = document.createElement("tr");
    tr.className = h.accion;
    const dia = String(filaFecha.getDate()).padStart(2, '0');
    const mes = String(filaFecha.getMonth() + 1).padStart(2, '0');
    const anio = filaFecha.getFullYear();
    const hora = String(filaFecha.getHours()).padStart(2,'0');
    const minuto = String(filaFecha.getMinutes()).padStart(2,'0');

    tr.innerHTML = `
      <td>${dia}/${mes}/${anio} ${hora}:${minuto}</td>
      <td>${h.productoID}<br><small>${h.productoNombre}</small></td>
      <td>${h.accion}</td>
      <td>${h.cantidad}</td>
    `;
    tablaHistorial.appendChild(tr);
  });
}

// Reiniciar filtros
btnReset.onclick = () => {
  filtroTipo.value = "todos";
  filtroID.value = "";
  fechaPicker.clear();
  desdePicker.clear();
  hastaPicker.clear();
  renderHistorial();
};

// Toggle bloque de filtros
btnToggleFiltros.addEventListener("click", () => {
  bloqueFiltros.classList.toggle("show");
});

// Eventos filtros
[filtroTipo, filtroID].forEach(el => el.addEventListener("input", renderHistorial));
[fechaPicker, desdePicker, hastaPicker].forEach(picker => picker.config.onChange.push(renderHistorial));

// Inicial
cargarHistorial();
