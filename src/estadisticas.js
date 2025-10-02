let productos = {};
let historial = [];
let finanzas = [];
let chartVentas, chartCategorias, chartRotacion, chartStock;

const selectPeriodo = document.getElementById("select-periodo");

async function cargarDatos() {
  try {
    const res = await fetch("/api/data");
    const data = await res.json();
    productos = data.productos || {};
    historial = data.historial || [];
    finanzas = data.finanzas || [];
    
    calcularEstadisticas();
  } catch (error) {
    console.error("Error cargando datos:", error);
  }
}

function getFechaLimite() {
  const dias = parseInt(selectPeriodo.value);
  if (dias === 'all' || isNaN(dias)) return null;
  
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  return fecha;
}

function filtrarPorPeriodo(datos) {
  const fechaLimite = getFechaLimite();
  if (!fechaLimite) return datos;
  
  return datos.filter(d => new Date(d.fecha) >= fechaLimite);
}

function calcularEstadisticas() {
  const finanzasFiltradas = filtrarPorPeriodo(finanzas);
  const historialFiltrado = filtrarPorPeriodo(historial);
  
  calcularKPIs(finanzasFiltradas, historialFiltrado);
  renderChartVentas(finanzasFiltradas);
  renderChartCategorias(finanzasFiltradas);
  renderChartRotacion();
  renderChartStock();
  renderTopProductos(historialFiltrado);
  renderStockBajo();
}

function calcularKPIs(finanzasFiltradas, historialFiltrado) {
  const ingresos = finanzasFiltradas
    .filter(f => f.tipo === "ingreso")
    .reduce((sum, f) => sum + f.monto, 0);
  
  const gastos = finanzasFiltradas
    .filter(f => f.tipo === "gasto")
    .reduce((sum, f) => sum + f.monto, 0);
  
  const beneficio = ingresos - gastos;
  const margen = ingresos > 0 ? ((beneficio / ingresos) * 100) : 0;
  
  const ventasRealizadas = historialFiltrado
    .filter(h => h.accion === "Vendido").length;
  
  const ticketMedio = ventasRealizadas > 0 ? (ingresos / ventasRealizadas) : 0;
  
  document.getElementById("kpi-ingresos").textContent = 
    `€${ingresos.toFixed(2)}`;
  document.getElementById("kpi-gastos").textContent = 
    `€${gastos.toFixed(2)}`;
  document.getElementById("kpi-beneficio").textContent = 
    `€${beneficio.toFixed(2)}`;
  document.getElementById("kpi-margen").textContent = 
    `${margen.toFixed(1)}%`;
  document.getElementById("kpi-ventas").textContent = 
    ventasRealizadas;
  document.getElementById("kpi-ticket").textContent = 
    `€${ticketMedio.toFixed(2)}`;
  
  calcularTendencias();
}

function calcularTendencias() {
  const diasActual = parseInt(selectPeriodo.value);
  if (diasActual === 'all' || isNaN(diasActual)) {
    document.querySelectorAll('.kpi-trend').forEach(el => el.textContent = '');
    return;
  }
  
  const ahora = new Date();
  const inicioActual = new Date(ahora);
  inicioActual.setDate(ahora.getDate() - diasActual);
  
  const inicioAnterior = new Date(inicioActual);
  inicioAnterior.setDate(inicioActual.getDate() - diasActual);
  
  const finanzasActual = finanzas.filter(f => {
    const fecha = new Date(f.fecha);
    return fecha >= inicioActual && fecha <= ahora;
  });
  
  const finanzasAnterior = finanzas.filter(f => {
    const fecha = new Date(f.fecha);
    return fecha >= inicioAnterior && fecha < inicioActual;
  });
  
  const ingresosActual = finanzasActual
    .filter(f => f.tipo === "ingreso")
    .reduce((sum, f) => sum + f.monto, 0);
  
  const ingresosAnterior = finanzasAnterior
    .filter(f => f.tipo === "ingreso")
    .reduce((sum, f) => sum + f.monto, 0);
  
  const cambioIngresos = ingresosAnterior > 0 
    ? ((ingresosActual - ingresosAnterior) / ingresosAnterior) * 100 
    : 0;
  
  actualizarTendencia('trend-ingresos', cambioIngresos);
}

function actualizarTendencia(id, cambio) {
  const el = document.getElementById(id);
  if (cambio > 0) {
    el.textContent = `↑ ${cambio.toFixed(1)}% vs período anterior`;
    el.className = 'kpi-trend';
  } else if (cambio < 0) {
    el.textContent = `↓ ${Math.abs(cambio).toFixed(1)}% vs período anterior`;
    el.className = 'kpi-trend negative';
  } else {
    el.textContent = 'Sin cambios';
    el.className = 'kpi-trend';
  }
}

function renderChartVentas(finanzasFiltradas) {
  const ventas = finanzasFiltradas.filter(f => f.tipo === "ingreso");
  
  const ventasPorFecha = {};
  ventas.forEach(v => {
    const fecha = new Date(v.fecha).toLocaleDateString('es-ES');
    ventasPorFecha[fecha] = (ventasPorFecha[fecha] || 0) + v.monto;
  });
  
  const labels = Object.keys(ventasPorFecha).sort();
  const data = labels.map(l => ventasPorFecha[l]);
  
  const ctx = document.getElementById('chart-ventas').getContext('2d');
  
  if (chartVentas) chartVentas.destroy();
  
  chartVentas = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Ventas (€)',
        data: data,
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => `€${value.toFixed(0)}`
          }
        }
      }
    }
  });
}

function renderChartCategorias(finanzasFiltradas) {
  const ingresosPorCategoria = {};
  
  finanzasFiltradas
    .filter(f => f.tipo === "ingreso")
    .forEach(f => {
      const cat = f.categoria || "Otro";
      ingresosPorCategoria[cat] = (ingresosPorCategoria[cat] || 0) + f.monto;
    });
  
  const categorias = Object.keys(ingresosPorCategoria);
  const valores = Object.values(ingresosPorCategoria);
  
  const ctx = document.getElementById('chart-categorias').getContext('2d');
  
  if (chartCategorias) chartCategorias.destroy();
  
  chartCategorias = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: categorias,
      datasets: [{
        label: 'Ingresos (€)',
        data: valores,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
          '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
          '#4BC0C0', '#FF6384'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => `€${value.toFixed(0)}`
          }
        }
      }
    }
  });
}

function renderChartRotacion() {
  const rotacion = {};
  
  Object.entries(productos).forEach(([id, prod]) => {
    if (prod.stock > 0) {
      const ratio = prod.ventasTotales / prod.stock;
      rotacion[id] = {
        nombre: prod.nombre,
        ratio: ratio
      };
    }
  });
  
  const sorted = Object.entries(rotacion)
    .sort((a, b) => b[1].ratio - a[1].ratio)
    .slice(0, 10);
  
  const labels = sorted.map(s => s[1].nombre);
  const data = sorted.map(s => s[1].ratio.toFixed(2));
  
  const ctx = document.getElementById('chart-rotacion').getContext('2d');
  
  if (chartRotacion) chartRotacion.destroy();
  
  chartRotacion = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Ratio Ventas/Stock',
        data: data,
        backgroundColor: '#36A2EB'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          beginAtZero: true
        }
      }
    }
  });
}

function renderChartStock() {
  const categorias = {};
  
  Object.values(productos).forEach(prod => {
    const cat = prod.categoria || "Otro";
    categorias[cat] = (categorias[cat] || 0) + prod.stock;
  });
  
  const labels = Object.keys(categorias);
  const data = Object.values(categorias);
  
  const ctx = document.getElementById('chart-stock').getContext('2d');
  
  if (chartStock) chartStock.destroy();
  
  chartStock = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
          '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
          '#4BC0C0', '#FF6384'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right'
        }
      }
    }
  });
}

function renderTopProductos(historialFiltrado) {
  const ventasPorProducto = {};
  
  historialFiltrado
    .filter(h => h.accion === "Vendido")
    .forEach(h => {
      if (h.productos && Array.isArray(h.productos)) {
        h.productos.forEach(p => {
          if (!ventasPorProducto[p.productoID]) {
            ventasPorProducto[p.productoID] = {
              nombre: p.productoNombre,
              categoria: p.categoria,
              unidades: 0,
              ingresos: 0
            };
          }
          ventasPorProducto[p.productoID].unidades += p.cantidad;
          ventasPorProducto[p.productoID].ingresos += p.precioTotal;
        });
      } else if (h.productoID) {
        if (!ventasPorProducto[h.productoID]) {
          ventasPorProducto[h.productoID] = {
            nombre: h.productoNombre,
            categoria: h.categoria,
            unidades: 0,
            ingresos: 0
          };
        }
        ventasPorProducto[h.productoID].unidades += h.cantidad || 0;
      }
    });
  
  const sorted = Object.entries(ventasPorProducto)
    .sort((a, b) => b[1].unidades - a[1].unidades)
    .slice(0, 10);
  
  const tbody = document.getElementById('top-productos');
  tbody.innerHTML = '';
  
  sorted.forEach(([id, data], index) => {
    const prod = productos[id];
    const stockStatus = prod && prod.stock < 25 
      ? '<span class="badge badge-danger">Stock Bajo</span>'
      : '<span class="badge badge-success">OK</span>';
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${id}</td>
      <td>${data.nombre}</td>
      <td>${data.categoria}</td>
      <td>${data.unidades}</td>
      <td>€${data.ingresos.toFixed(2)}</td>
      <td>${stockStatus}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderStockBajo() {
  const STOCK_MINIMO = 25;
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() - 30);
  
  const productosStockBajo = Object.entries(productos)
    .filter(([id, prod]) => prod.stock < STOCK_MINIMO)
    .map(([id, prod]) => {
      const ventas30d = historial
        .filter(h => {
          if (h.accion !== "Vendido") return false;
          const fecha = new Date(h.fecha);
          if (fecha < fechaLimite) return false;
          
          if (h.productos && Array.isArray(h.productos)) {
            return h.productos.some(p => p.productoID === id);
          }
          return h.productoID === id;
        })
        .reduce((sum, h) => {
          if (h.productos && Array.isArray(h.productos)) {
            const producto = h.productos.find(p => p.productoID === id);
            return sum + (producto ? producto.cantidad : 0);
          }
          return sum + (h.cantidad || 0);
        }, 0);
      
      return { id, ...prod, ventas30d };
    })
    .sort((a, b) => a.stock - b.stock);
  
  const tbody = document.getElementById('stock-bajo');
  tbody.innerHTML = '';
  
  if (productosStockBajo.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay productos con stock bajo</td></tr>';
    return;
  }
  
  productosStockBajo.forEach(prod => {
    let estadoBadge;
    if (prod.stock === 0) {
      estadoBadge = '<span class="badge badge-danger">Agotado</span>';
    } else if (prod.stock < 10) {
      estadoBadge = '<span class="badge badge-danger">Crítico</span>';
    } else {
      estadoBadge = '<span class="badge badge-warning">Bajo</span>';
    }
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${prod.id}</td>
      <td>${prod.nombre}</td>
      <td>${prod.categoria || 'Otro'}</td>
      <td>${prod.stock}</td>
      <td>${prod.ventas30d}</td>
      <td>${estadoBadge}</td>
    `;
    tbody.appendChild(tr);
  });
}

selectPeriodo.addEventListener('change', calcularEstadisticas);

cargarDatos();
