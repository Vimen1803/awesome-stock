const tablaHistorial = document.querySelector("#tabla-historial tbody");
const filtroTipo = document.getElementById("filtro-tipo");
const filtroCategoria = document.getElementById("filtro-categoria");
const filtroID = document.getElementById("filtro-id");
const btnReset = document.getElementById("reset-filtros");
const btnToggleFiltros = document.getElementById("btn-toggle-filtros");
const bloqueFiltros = document.getElementById("bloque-filtros");

// Inicializar Flatpickr
const fechaPicker = flatpickr("#filtro-fecha", { dateFormat: "d/m/Y", allowInput: true });
const desdePicker = flatpickr("#filtro-fecha-desde", { dateFormat: "d/m/Y", allowInput: true });
const hastaPicker = flatpickr("#filtro-fecha-hasta", { dateFormat: "d/m/Y", allowInput: true });

let historialGlobal = [];
let categoriasGlobales = [];

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

// Poblar select de categorías dinámicamente
function poblarSelectCategoria() {
  filtroCategoria.innerHTML = '<option value="todos">Todos</option>';
  categoriasGlobales.forEach(categoria => {
    const option = document.createElement("option");
    option.value = categoria;
    option.textContent = categoria;
    filtroCategoria.appendChild(option);
  });
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, exito = true) {
  const notif = document.createElement("div");
  notif.className = "notificacion";
  notif.style.position = "fixed";
  notif.style.top = "50%";
  notif.style.left = "50%";
  notif.style.transform = "translate(-50%, -50%)";
  notif.style.padding = "15px 25px";
  notif.style.borderRadius = "8px";
  notif.style.backgroundColor = exito ? "#28a745" : "#dc3545";
  notif.style.color = "white";
  notif.style.fontWeight = "bold";
  notif.style.fontSize = "1.1rem";
  notif.style.opacity = "0";
  notif.style.transition = "opacity 0.5s ease";
  notif.style.zIndex = "10000";

  notif.innerText = mensaje;
  document.body.appendChild(notif);

  // Fade in
  requestAnimationFrame(() => { notif.style.opacity = "1"; });

  // Fade out y remover
  setTimeout(() => { 
    notif.style.opacity = "0";
    setTimeout(() => notif.remove(), 500);
  }, 2000);
}

// Función para descargar tickets
async function descargarTicket(tipo, fileName) {
  try {
    const response = await fetch(`/api/descargar-ticket/${tipo}/${fileName}`);
    
    if (!response.ok) {
      mostrarNotificacion("Ticket no encontrado o error en la descarga", false);
      return;
    }

    // Crear un blob con el contenido del PDF
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    // Crear un enlace temporal para descargar
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    // Limpiar
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    mostrarNotificacion("Ticket descargado correctamente");
    
  } catch (error) {
    console.error('Error descargando ticket:', error);
    mostrarNotificacion("Error al descargar el ticket", false);
  }
}

// Cargar historial desde data.json
async function cargarHistorial() {
  try {
    const res = await fetch("/api/data");
    if (!res.ok) throw new Error("Error al leer historial");
    const data = await res.json();

    historialGlobal = (data.historial || []).map(h => ({
      ...h,
      fechaObj: parseFechaISO(h.fecha),
      categoria: h.categoria || "Otro" // Migrar registros antiguos sin categoría
    })).sort((a, b) => b.fechaObj - a.fechaObj);

    categoriasGlobales = data.categorias || [];
    poblarSelectCategoria();
    renderHistorial();
  } catch (err) {
    console.error("Error cargando historial:", err);
    historialGlobal = [];
    categoriasGlobales = [];
    renderHistorial();
  }
}

function renderHistorial() {
  const tipo = filtroTipo.value;
  const categoria = filtroCategoria.value;
  const fechaExacta = fechaPicker.selectedDates[0] || null;
  const desde = desdePicker.selectedDates[0] || null;
  const hasta = hastaPicker.selectedDates[0] || null;
  const idBuscado = filtroID.value ? filtroID.value.toLowerCase() : null;

  tablaHistorial.innerHTML = "";

  // Filtrar primero
  let filtrado = historialGlobal.filter(h => {
    if (!h.fechaObj) return false;
    const filaFecha = h.fechaObj;

    // Para filtrar por ID, buscamos en productoID o ticketID o en productos[].productoID si es operación múltiple
    let idMatch = false;
    if (!idBuscado) {
      idMatch = true;
    } else {
      if (h.productoID && h.productoID.toString().toLowerCase().includes(idBuscado)) {
        idMatch = true;
      } else if (h.ticketID && h.ticketID.toString().toLowerCase().includes(idBuscado)) {
        idMatch = true;
      } else if (h.productos && Array.isArray(h.productos)) {
        idMatch = h.productos.some(p => p.productoID.toString().toLowerCase().includes(idBuscado));
      }
    }

    // Para filtrar por categoría, si es operación múltiple, verificar si alguna coincide
    let categoriaValida = false;
    if (categoria === "todos") {
      categoriaValida = true;
    } else if (h.categoria) {
      categoriaValida = h.categoria === categoria;
    } else if (h.productos && Array.isArray(h.productos)) {
      categoriaValida = h.productos.some(p => p.categoria === categoria);
    }

    const fechaValida = (!fechaExacta || sameDay(filaFecha, fechaExacta)) &&
                        (!desde || filaFecha >= desde) &&
                        (!hasta || filaFecha <= hasta);

    return (tipo === "todos" || h.accion === tipo) &&
           categoriaValida &&
           fechaValida &&
           idMatch;
  });

  // Limitar a los últimos 1000 registros
  filtrado = filtrado.slice(0, 1000);

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

    // Construir texto de acción
    let accionText = h.accion;

    // Mostrar precio unitario si es compra/venta y hay productos
    if ((h.accion === "Comprado" || h.accion === "Vendido")) {
      if (h.productos && Array.isArray(h.productos)) {
        accionText += `<br><small style="opacity:0.7">Productos: ${h.productos.length}</small>`;
      } else if (h.precioUnitario) {
        accionText += `<br><small style="opacity:0.7">€${h.precioUnitario.toFixed(2)}/unidad</small>`;
      }
    }

    // Enlace para descargar ticket si existe
    if (h.ticketID && h.ticketFile && (h.accion === "Comprado" || h.accion === "Vendido")) {
      const tipoTicket = h.accion === "Comprado" ? "compra" : "venta";
      accionText += `<br><small><span style="cursor:pointer; text-decoration:underline; color:#0078d7;" 
                     onclick="descargarTicket('${tipoTicket}', '${h.ticketFile}')"
                     title="Hacer clic para descargar ticket">Ticket: ${h.ticketID}</span></small>`;
    }

    // Construir texto de cantidad/cambios
    let cantidadText = "";

    if (h.accion === "Editado" && h.cambios && h.cambios.length > 0) {
      cantidadText = h.cambios.join('<br>');
    } else if (h.productos && Array.isArray(h.productos)) {
      cantidadText = h.productos.map(p => 
        `${p.productoID} - ${p.cantidad} unidades<br><small>€${p.precioUnitario.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/unidad</small>`
      ).join('<br><hr style="margin:4px 0;">');
      if (h.precioTotalOperacion) {
        cantidadText += `<br><strong>Total operación: €${h.precioTotalOperacion.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>`;
      }
    } else if (h.cantidad && h.cantidad > 0) {
      cantidadText = `${h.cantidad} unidades`;
      if (h.precioTotal) {
        cantidadText += `<br><strong>Total: €${h.precioTotal.toFixed(2)}</strong>`;
      }
    } else {
      cantidadText = "-";
    }

    // Producto o productos para mostrar en columna producto
    let productoCol = "";
    if (h.productos && Array.isArray(h.productos)) {
      productoCol = h.productos.map(p => `${p.productoID}<br><small>${p.productoNombre}</small>`).join('<hr style="margin:4px 0;">');
    } else {
      productoCol = `${h.productoID}<br><small>${h.productoNombre || ""}</small>`;
    }

    tr.innerHTML = `
      <td>${dia}/${mes}/${anio} ${hora}:${minuto}</td>
      <td>${productoCol}</td>
      <td>${accionText}</td>
      <td style="font-size:0.9rem">${cantidadText}</td>
    `;
    tablaHistorial.appendChild(tr);
  });
}

// Reiniciar filtros
btnReset.onclick = () => {
  filtroTipo.value = "todos";
  filtroCategoria.value = "todos";
  filtroID.value = "";
  fechaPicker.clear();
  desdePicker.clear();
  hastaPicker.clear();
  renderHistorial();
};

// Toggle bloque de filtros
btnToggleFiltros.addEventListener("click", () => {
  bloqueFiltros.classList.toggle("show");
  if (bloqueFiltros.classList.contains("show")) {
    btnToggleFiltros.textContent = "▲ FILTROS ▲";
  } else {
    btnToggleFiltros.textContent = "▼ FILTROS ▼";
  }
});

// Eventos filtros
[filtroTipo, filtroCategoria, filtroID].forEach(el => el.addEventListener("input", renderHistorial));
[fechaPicker, desdePicker, hastaPicker].forEach(picker => picker.config.onChange.push(renderHistorial));

// Hacer la función disponible globalmente
window.descargarTicket = descargarTicket;

// Inicial
cargarHistorial();
