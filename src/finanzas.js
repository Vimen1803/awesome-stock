const selectPeriodo = document.getElementById("select-periodo");
const selectCategoria = document.getElementById("select-categoria");
const inputProductoID = document.getElementById("input-producto-id");
const graficoCanvas = document.getElementById("grafico").getContext("2d");
const divBeneficio = document.getElementById("beneficio-total");
let finanzasGlobal = [];
let categoriasGlobales = [];
let chartInstance;

const calendarBody = document.querySelector("#calendar tbody");
const monthYear = document.getElementById("month-year");
const prevBtn = document.getElementById("prev-month");
const nextBtn = document.getElementById("next-month");

let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let selectedDate = new Date(today);

const btnHoy = document.createElement("button");
btnHoy.textContent = "Hoy";
btnHoy.style.position = "absolute";
btnHoy.style.bottom = "20px";
btnHoy.style.right = "20px";
btnHoy.style.padding = "6px 12px";
btnHoy.style.borderRadius = "6px";
btnHoy.style.border = "none";
btnHoy.style.backgroundColor = "#0078d7";
btnHoy.style.color = "white";
btnHoy.style.cursor = "pointer";
btnHoy.addEventListener("click", () => {
  selectedDate = new Date(today);
  currentMonth = today.getMonth();
  currentYear = today.getFullYear();

  if (selectPeriodo.value !== "diaria") {
    selectPeriodo.value = "diaria";
  }

  renderCalendar(currentMonth, currentYear);
  renderGrafico();
});

document.querySelector(".calendar-container").style.position = "relative";
document.querySelector(".calendar-container").appendChild(btnHoy);

// ---------------- Cargar finanzas ----------------
async function cargarFinanzas() {
  try {
    const res = await fetch("/api/data");
    const data = await res.json();
    finanzasGlobal = data.finanzas || [];
    categoriasGlobales = data.categorias || [];
    
    poblarSelectCategorias();
    
    renderCalendar(currentMonth, currentYear);
    renderGrafico();
  } catch (error) {
    console.error("Error cargando datos:", error);
    finanzasGlobal = [];
    categoriasGlobales = [];
  }
}

// ---------------- select de categorías ----------------
function poblarSelectCategorias() {
  selectCategoria.innerHTML = '<option value="todos">Todos</option>';
  
  categoriasGlobales.forEach(categoria => {
    const option = document.createElement("option");
    option.value = categoria;
    option.textContent = categoria;
    selectCategoria.appendChild(option);
  });
}

// ---------------- Render gráfico ----------------
function renderGrafico() {
  const periodo = selectPeriodo.value;
  const categoriaSeleccionada = selectCategoria.value;
  const productoIDSeleccionado = inputProductoID.value.trim().toUpperCase();
  let filtrado = [];

  if (periodo === "diaria") {
    filtrado = finanzasGlobal.filter(f => new Date(f.fecha).toDateString() === selectedDate.toDateString());
  } else if (periodo === "semanal") {
    const semana = getWeekNumber(selectedDate);
    filtrado = finanzasGlobal.filter(f => {
      const d = new Date(f.fecha);
      return getWeekNumber(d) === semana && d.getFullYear() === selectedDate.getFullYear();
    });
  } else if (periodo === "mensual") {
    filtrado = finanzasGlobal.filter(f => {
      const d = new Date(f.fecha);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  } else if (periodo === "anual") {
    filtrado = finanzasGlobal.filter(f => new Date(f.fecha).getFullYear() === currentYear);
  } else if (periodo === "siempre") {
    filtrado = finanzasGlobal;
  }

  if (categoriaSeleccionada !== "todos") {
    filtrado = filtrado.filter(f => f.categoria === categoriaSeleccionada);
  }

  if (productoIDSeleccionado !== "") {
    filtrado = filtrado.filter(f => f.productoID && f.productoID === productoIDSeleccionado);
  }

  const ingresos = filtrado.filter(f => f.tipo === "ingreso").reduce((a, b) => a + b.monto, 0);
  const gastos = filtrado.filter(f => f.tipo === "gasto").reduce((a, b) => a + b.monto, 0);

  divBeneficio.textContent = `Beneficio Total: ${(ingresos - gastos).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

  graficoCanvas.canvas.width = 1200;
  graficoCanvas.canvas.height = 800;

  if (chartInstance) chartInstance.destroy();

  let chartData, chartLabels;
  
  if (ingresos > 0 || gastos > 0) {
    chartData = [ingresos, gastos];
    chartLabels = ["Ingresos", "Gastos"];
  } else {
    chartData = [1];
    chartLabels = ["Sin datos para el período/categoría/producto seleccionado"];
  }

  chartInstance = new Chart(graficoCanvas, {
    type: "pie",
    data: {
      labels: chartLabels,
      datasets: [{ 
        data: chartData, 
        backgroundColor: ingresos > 0 || gastos > 0 ? ["#4caf50", "#f44336"] : ["#cccccc"]
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
        tooltip: {
          callbacks: {
            label: ctx => {
              if (ingresos === 0 && gastos === 0) {
                return "No hay datos disponibles";
              }
              return `${ctx.label}: ${ctx.raw.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
            }
          }
        }
      }
    }
  });
}


// ---------------- Render calendario ----------------
function renderCalendar(month, year) {
  calendarBody.innerHTML = "";
  const firstDay = (new Date(year, month, 1).getDay() || 7);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthStr = String(month + 1).padStart(2, '0');
  monthYear.textContent = `${year}-${monthStr}`;

  let tr = document.createElement("tr");

  for (let i = 1; i < firstDay; i++) tr.appendChild(document.createElement("td"));

  for (let d = 1; d <= daysInMonth; d++) {
    const td = document.createElement("td");
    const cellDate = new Date(year, month, d);
    td.classList.remove("selected", "today-selected");

    const span = document.createElement("span");
    span.textContent = d;

    if (cellDate.toDateString() === selectedDate.toDateString()) {
      if (cellDate.toDateString() === today.toDateString()) td.classList.add("today-selected");
      else td.classList.add("selected");
    }

    td.appendChild(span);

    td.addEventListener("click", () => {
      selectedDate = cellDate;
      renderCalendar(currentMonth, currentYear);
      renderGrafico();
    });

    tr.appendChild(td);

    if (tr.children.length === 7) {
      calendarBody.appendChild(tr);
      tr = document.createElement("tr");
    }
  }

  if (tr.children.length > 0) calendarBody.appendChild(tr);
}

// ---------------- Navegación mes/año ----------------
prevBtn.addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar(currentMonth, currentYear);

  if (selectPeriodo.value === "mensual" || selectPeriodo.value === "anual") renderGrafico();
});

nextBtn.addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar(currentMonth, currentYear);

  if (selectPeriodo.value === "mensual" || selectPeriodo.value === "anual") renderGrafico();
});

// ---------------- Obtener número de semana ----------------
function getWeekNumber(d) {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayNum = date.getDay() || 7;
  date.setDate(date.getDate() + 4 - dayNum);
  const yearStart = new Date(date.getFullYear(), 0, 1);
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}

// ---------------- Eventos cambio filtros ----------------
selectPeriodo.onchange = renderGrafico;
selectCategoria.onchange = renderGrafico;
inputProductoID.oninput = renderGrafico;

// ---------------- Inicial ----------------

cargarFinanzas();
