const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

const dataDir = path.join(__dirname, '../data');
const informesDir = path.join(__dirname, '../data', 'informes');
const informesGeneralDir = path.join(informesDir, 'general');
const informesProductosDir = path.join(informesDir, 'productos');
const informesCategoriasDir = path.join(informesDir, 'categorias');
const DATA_FILE = path.join(__dirname, "../data/data.json");

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function mostrarAyuda() {
  log('\n📊 SISTEMA DE INFORMES - VIMENSTOCK\n', 'blue');
  
  log('DESCRIPCIÓN', 'blue');
  log('Sistema de generación de informes personalizados en PDF y Excel.', 'gray');
  log(`Los informes se almacenan en: ${informesDir}`, 'gray');
  log('Estructura: general/, productos/, categorias/\n', 'gray');
  
  log('COMANDOS DISPONIBLES', 'blue');
  
  log('\n📈 GENERAR INFORME DE BALANCE', 'green');
  log('  npm run informe:balance [pdf|excel]', 'gray');
  log('  - Genera un informe completo del negocio', 'gray');
  log('  - Incluye: KPIs, top productos, stock bajo, análisis por categoría', 'gray');
  log('  - Formato por defecto: PDF', 'gray');
  log('  Ejemplos:', 'gray');
  log('    npm run informe:balance', 'gray');
  log('    npm run informe:balance excel', 'gray');
  
  log('\n📦 GENERAR INFORME DE PRODUCTO', 'green');
  log('  npm run informe:producto <ID> [pdf]', 'gray');
  log('  - Genera informe detallado de un producto específico', 'gray');
  log('  - Incluye: información completa y historial de movimientos', 'gray');
  log('  - Solo disponible en formato PDF', 'gray');
  log('  Ejemplo: npm run informe:producto P001', 'gray');
  
  log('\n📂 GENERAR INFORME DE CATEGORÍA', 'green');
  log('  npm run informe:categoria <nombre> [pdf]', 'gray');
  log('  - Genera informe de todos los productos de una categoría', 'gray');
  log('  - Incluye: lista de productos y historial de movimientos', 'gray');
  log('  - Solo disponible en formato PDF', 'gray');
  log('  Ejemplo: npm run informe:categoria Alimentación', 'gray');
  
  log('\n📋 LISTAR INFORMES', 'green');
  log('  npm run informe:list [tipo]', 'gray');
  log('  - Muestra todos los informes generados', 'gray');
  log('  - Tipos: general, productos, categorias, all (por defecto)', 'gray');
  log('  Ejemplos:', 'gray');
  log('    npm run informe:list', 'gray');
  log('    npm run informe:list general', 'gray');
  
  log('\n❓ AYUDA', 'green');
  log('  npm run informe:help', 'gray');
  log('  - Muestra esta ayuda completa', 'gray');
  
  log('\nNOTAS IMPORTANTES', 'blue');
  log('• Los informes se organizan automáticamente por tipo', 'gray');
  log('• El formato Excel solo está disponible para Balance General', 'gray');
  log('• Los índices [0] siempre representan el informe más reciente', 'gray');
  log('• Los informes incluyen marca de tiempo en el nombre', 'gray');
  log('• Se recomienda limpiar informes antiguos periódicamente\n', 'gray');
}

function crearDirectorios() {
  [informesDir, informesGeneralDir, informesProductosDir, informesCategoriasDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

function generarInformeBalance(formato = 'pdf') {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      log('❌ Error: El archivo de datos no existe', 'red');
      process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    
    const totalIngresos = data.finanzas.filter(f => f.tipo === 'ingreso').reduce((sum, f) => sum + f.monto, 0);
    const totalGastos = data.finanzas.filter(f => f.tipo === 'gasto').reduce((sum, f) => sum + f.monto, 0);
    const beneficioNeto = totalIngresos - totalGastos;
    const margenBruto = totalIngresos > 0 ? (beneficioNeto / totalIngresos) * 100 : 0;
    const ventasRealizadas = data.historial.filter(h => h.accion === "Vendido").length;
    const ticketMedio = ventasRealizadas > 0 ? totalIngresos / ventasRealizadas : 0;

    const ventasPorProducto = {};
    data.historial.filter(h => h.accion === "Vendido").forEach(h => {
      if (h.productos && Array.isArray(h.productos)) {
        h.productos.forEach(p => {
          if (!ventasPorProducto[p.productoID]) {
            const productoOriginal = data.productos[p.productoID];
            ventasPorProducto[p.productoID] = {
              nombre: p.productoNombre,
              categoria: p.categoria,
              proveedor: productoOriginal ? productoOriginal.proveedor : 'N/A',
              unidades: 0,
              ingresos: 0
            };
          }
          ventasPorProducto[p.productoID].unidades += p.cantidad;
          ventasPorProducto[p.productoID].ingresos += p.precioTotal;
        });
      }
    });

    const topProductos = Object.entries(ventasPorProducto)
      .sort((a, b) => b[1].unidades - a[1].unidades)
      .slice(0, 10)
      .map(([id, data]) => ({ id, ...data }));

    const STOCK_MINIMO = 25;
    const productosStockBajo = Object.entries(data.productos)
      .filter(([id, prod]) => prod.stock < STOCK_MINIMO)
      .map(([id, prod]) => ({ id, ...prod }))
      .sort((a, b) => a.stock - b.stock);

    const ingresosPorCategoria = {};
    data.finanzas.filter(f => f.tipo === 'ingreso').forEach(f => {
      const cat = f.categoria || "Otro";
      ingresosPorCategoria[cat] = (ingresosPorCategoria[cat] || 0) + f.monto;
    });
    
    const stockPorCategoria = {};
    Object.values(data.productos).forEach(p => {
      const cat = p.categoria || "Otro";
      stockPorCategoria[cat] = (stockPorCategoria[cat] || 0) + p.stock;
    });

    const costosPorCategoria = {};
    data.historial.filter(h => h.accion === "Vendido").forEach(h => {
      if (h.productos && Array.isArray(h.productos)) {
        h.productos.forEach(p => {
          const productoOriginal = data.productos[p.productoID];
          if (productoOriginal) {
            const cat = productoOriginal.categoria || "Otro";
            const costoTotalProducto = (productoOriginal.precioCompra || 0) * p.cantidad;
            costosPorCategoria[cat] = (costosPorCategoria[cat] || 0) + costoTotalProducto;
          }
        });
      }
    });

    const beneficiosPorCategoria = {};
    const todasCategorias = new Set([...Object.keys(ingresosPorCategoria), ...Object.keys(costosPorCategoria)]);
    todasCategorias.forEach(cat => {
      const ingresos = ingresosPorCategoria[cat] || 0;
      const costos = costosPorCategoria[cat] || 0;
      beneficiosPorCategoria[cat] = { ingresos, costos, beneficio: ingresos - costos };
    });

    const datosFiltrados = {
      productos: data.productos, // Incluir todos los productos para la hoja adicional
      historial: data.historial,
      finanzas: data.finanzas,
      resumen: {
        totalIngresos, totalGastos, beneficioNeto, margenBruto,
        ventasRealizadas, ticketMedio,
        totalProductos: Object.keys(data.productos).length,
        totalStock: Object.values(data.productos).reduce((sum, p) => sum + p.stock, 0),
        topProductos, productosStockBajo,
        ingresosPorCategoria, stockPorCategoria, beneficiosPorCategoria
      }
    };

    log('\n⏳ Generando informe de balance...', 'yellow');
    
    if (formato === 'excel') {
      generarInformeExcel(datosFiltrados, 'balance', 'informe_balance_general', informesGeneralDir);
    } else {
      generarInformePDF(datosFiltrados, 'balance', 'informe_balance_general', informesGeneralDir);
    }

  } catch (error) {
    log(`❌ Error generando informe de balance: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

function generarInformeProducto(productoID) {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      log('❌ Error: El archivo de datos no existe', 'red');
      process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    
    if (!data.productos[productoID]) {
      log(`❌ Error: Producto ${productoID} no encontrado`, 'red');
      process.exit(1);
    }

    const datosFiltrados = {
      producto: { [productoID]: data.productos[productoID] },
      historial: data.historial.filter(h => {
        if (h.productos && Array.isArray(h.productos)) {
          return h.productos.some(p => p.productoID === productoID);
        }
        return h.productoID === productoID;
      }).sort((a, b) => new Date(b.fecha) - new Date(a.fecha)),
      finanzas: data.finanzas.filter(f => f.productoID === productoID)
    };

    log(`\n⏳ Generando informe del producto ${productoID}...`, 'yellow');
    generarInformePDF(datosFiltrados, 'producto', `informe_producto_${productoID}`, informesProductosDir);

  } catch (error) {
    log(`❌ Error generando informe de producto: ${error.message}`, 'red');
    process.exit(1);
  }
}

function generarInformeCategoria(categoria) {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      log('❌ Error: El archivo de datos no existe', 'red');
      process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    
    const datosFiltrados = {
      productos: Object.fromEntries(
        Object.entries(data.productos).filter(([id, p]) => p.categoria === categoria)
      )
    };

    if (Object.keys(datosFiltrados.productos).length === 0) {
      log(`❌ Error: No se encontraron productos en la categoría "${categoria}"`, 'red');
      process.exit(1);
    }

    const productosCategoriaIDs = Object.keys(datosFiltrados.productos);
    datosFiltrados.historial = data.historial.filter(h => {
      if (h.productos && Array.isArray(h.productos)) {
        return h.productos.some(p => productosCategoriaIDs.includes(p.productoID));
      }
      if (h.productoID) {
        return productosCategoriaIDs.includes(h.productoID);
      }
      return false;
    }).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    datosFiltrados.finanzas = data.finanzas.filter(f => f.categoria === categoria);

    log(`\n⏳ Generando informe de la categoría "${categoria}"...`, 'yellow');
    generarInformePDF(datosFiltrados, 'categoria', `informe_categoria_${categoria}`, informesCategoriasDir);

  } catch (error) {
    log(`❌ Error generando informe de categoría: ${error.message}`, 'red');
    process.exit(1);
  }
}

async function generarInformePDF(datos, tipo, nombreBase, subdirInformes) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `${nombreBase}_${timestamp}.pdf`;
  const filePath = path.join(subdirInformes, fileName);

  const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 50;
  const contentWidth = pageWidth - 2 * margin;

  doc.rect(0, 0, pageWidth, 80).fill('#0078d7');
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(28).text('VimenStock', margin, 20, { align: 'center' });
  doc.fontSize(14).text('Sistema de Gestión de Inventario', margin, 50, { align: 'center' });

  let yPos = 100;

  doc.fillColor('#333333').fontSize(10).font('Helvetica').text(`Fecha de generación: ${new Date().toLocaleString('es-ES')}`, margin, yPos);
  doc.text(`Tipo de informe: ${tipo.toUpperCase()}`, pageWidth - margin - 200, yPos, { width: 200, align: 'right' });
  
  yPos += 30;
  doc.moveTo(margin, yPos).lineTo(pageWidth - margin, yPos).strokeColor('#cccccc').stroke();
  yPos += 20;

  if (tipo === 'balance' && datos.resumen) {
    doc.fillColor('#0078d7').font('Helvetica-Bold').fontSize(16).text('Indicadores Clave de Rendimiento', margin, yPos);
    yPos += 25;

    const kpis = [
      { label: 'Ingresos Totales', value: `€${datos.resumen.totalIngresos.toFixed(2)}`, color: '#28a745' },
      { label: 'Gastos Totales', value: `€${datos.resumen.totalGastos.toFixed(2)}`, color: '#dc3545' },
      { label: 'Beneficio Neto', value: `€${datos.resumen.beneficioNeto.toFixed(2)}`, color: datos.resumen.beneficioNeto >= 0 ? '#28a745' : '#dc3545' },
      { label: 'Margen Bruto', value: `${datos.resumen.margenBruto.toFixed(1)}%`, color: '#0078d7' },
      { label: 'Ventas Realizadas', value: datos.resumen.ventasRealizadas.toString(), color: '#17a2b8' },
      { label: 'Ticket Medio', value: `€${datos.resumen.ticketMedio.toFixed(2)}`, color: '#ffc107' }
    ];

    const boxWidth = 160;
    const boxHeight = 60;
    const spacing = 20;
    let xOffset = margin;

    kpis.forEach((kpi, index) => {
      if (index % 3 === 0 && index !== 0) {
        yPos += boxHeight + spacing;
        xOffset = margin;
      }

      doc.rect(xOffset, yPos, boxWidth, boxHeight).fillAndStroke('#f8f9fa', '#dddddd');
      doc.fillColor('#666666').font('Helvetica').fontSize(10).text(kpi.label, xOffset + 10, yPos + 12, { width: boxWidth - 20, align: 'center' });
      doc.fillColor(kpi.color).font('Helvetica-Bold').fontSize(18).text(kpi.value, xOffset + 10, yPos + 30, { width: boxWidth - 20, align: 'center' });

      xOffset += boxWidth + spacing;
    });

    yPos += boxHeight + 40;

    if (datos.resumen.topProductos && datos.resumen.topProductos.length > 0) {
      if (yPos > 650) {
        doc.addPage();
        yPos = margin;
      }

      doc.fillColor('#0078d7').font('Helvetica-Bold').fontSize(16).text('Top 10 Productos Más Vendidos', margin, yPos);
      yPos += 20;

      const colWidths = [30, 60, 110, 90, 70, 70, 85];
      const colX = [margin, margin + 30, margin + 90, margin + 200, margin + 290, margin + 360, margin + 430];
      
      doc.rect(margin, yPos, pageWidth - 2 * margin, 25).fill('#0078d7');
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9);
      doc.text('#', colX[0] + 5, yPos + 8, { width: colWidths[0] });
      doc.text('ID', colX[1] + 5, yPos + 8, { width: colWidths[1] });
      doc.text('Producto', colX[2] + 5, yPos + 8, { width: colWidths[2] });
      doc.text('Proveedor', colX[3] - 20, yPos + 8, { width: colWidths[3] });
      doc.text('Categoría', colX[4] - 15, yPos + 8, { width: colWidths[4] });
      doc.text('Unidades', colX[5] - 25, yPos + 8, { width: colWidths[5], align: 'right' });
      doc.text('Ingresos', colX[6] - 35, yPos + 8, { width: colWidths[6], align: 'right' });
      
      yPos += 25;

      datos.resumen.topProductos.forEach((prod, index) => {
        if (yPos > 750) {
          doc.addPage();
          yPos = margin;
        }

        const bgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
        doc.rect(margin, yPos, pageWidth - 2 * margin, 20).fill(bgColor);

        doc.fillColor('#333333').font('Helvetica').fontSize(8);
        doc.text((index + 1).toString(), colX[0] + 5, yPos + 6, { width: colWidths[0] });
        doc.text(prod.id, colX[1] + 5, yPos + 6, { width: colWidths[1] });
        doc.text(prod.nombre.substring(0, 18), colX[2] + 5, yPos + 6, { width: colWidths[2] });
        doc.text((prod.proveedor || 'N/A').substring(0, 15), colX[3] - 20, yPos + 6, { width: colWidths[3] });
        doc.text(prod.categoria.substring(0, 12), colX[4] - 15, yPos + 6, { width: colWidths[4] });
        doc.text(prod.unidades.toString(), colX[5] - 25, yPos + 6, { width: colWidths[5], align: 'right' });
        doc.text(`€${prod.ingresos.toFixed(2)}`, colX[6] - 35, yPos + 6, { width: colWidths[6], align: 'right' });

        yPos += 20;
      });
    }
    
    doc.addPage();
    yPos = margin;

    if (datos.resumen.productosStockBajo && datos.resumen.productosStockBajo.length > 0) {
      doc.fillColor('#dc3545').font('Helvetica-Bold').fontSize(16).text('Productos con Stock Bajo', margin, yPos);
      yPos += 20;

      const colWidths = [60, 130, 100, 85, 60, 60];
      const colX = [margin, margin + 60, margin + 190, margin + 290, margin + 375, margin + 435];
      
      doc.rect(margin, yPos, pageWidth - 2 * margin, 25).fill('#dc3545');
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9);
      doc.text('ID', colX[0] + 5, yPos + 8);
      doc.text('Producto', colX[1] + 5, yPos + 8);
      doc.text('Proveedor', colX[2] - 25, yPos + 8);
      doc.text('Categoría', colX[3] - 25, yPos + 8);
      doc.text('Stock', colX[4] - 10, yPos + 8);
      doc.text('Estado', colX[5] - 35, yPos + 8, { align: 'center' });
      
      yPos += 25;

      datos.resumen.productosStockBajo.slice(0, 30).forEach((prod, index) => {
        if (yPos > 750) {
          doc.addPage();
          yPos = margin;
        }

        const bgColor = index % 2 === 0 ? '#fff3cd' : '#ffffff';
        doc.rect(margin, yPos, pageWidth - 2 * margin, 20).fill(bgColor);

        doc.fillColor('#333333').font('Helvetica').fontSize(8);
        doc.text(prod.id, colX[0] + 5, yPos + 6, { width: colWidths[0] });
        doc.text(prod.nombre.substring(0, 22), colX[1] + 5, yPos + 6);
        doc.text((prod.proveedor || 'N/A').substring(0, 16), colX[2] - 25, yPos + 6);
        doc.text(prod.categoria.substring(0, 14), colX[3] - 25, yPos + 6);
        doc.text(prod.stock.toString(), colX[4] - 5, yPos + 6);
        
        const estado = prod.stock === 0 ? 'Agotado' : prod.stock < 10 ? 'Crítico' : 'Bajo';
        doc.fillColor('#dc3545').font('Helvetica-Bold');
        doc.text(estado, colX[5] - 35, yPos + 6, { align: 'center' });

        yPos += 20;
      });
    }

    doc.addPage();
    yPos = margin;

    if (datos.resumen.stockPorCategoria) {
      doc.fillColor('#0078d7').font('Helvetica-Bold').fontSize(16).text('Distribución de Stock por Categoría', margin, yPos);
      yPos += 20;

      const stockColWidths = [150, 200, 125];
      const stockColX = [margin, margin + 150, margin + 350];
      
      doc.rect(margin, yPos, pageWidth - 2 * margin, 25).fill('#0078d7');
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9);
      doc.text('Categoría', stockColX[0] + 5, yPos + 8, { width: stockColWidths[0] });
      doc.text('Unidades en Stock', stockColX[1] + 5, yPos + 8, { width: stockColWidths[1], align: 'center' });
      doc.text('% del Total', stockColX[2] + 5, yPos + 8, { width: stockColWidths[2], align: 'center' });
      yPos += 25;

      const totalStockGlobal = Object.values(datos.resumen.stockPorCategoria).reduce((sum, val) => sum + val, 0);
      const stockOrdenado = Object.entries(datos.resumen.stockPorCategoria).sort((a, b) => b[1] - a[1]);
      stockOrdenado.forEach(([categoria, stock], index) => {
        const porcentaje = totalStockGlobal > 0 ? (stock / totalStockGlobal) * 100 : 0;
        const bgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
        doc.rect(margin, yPos, pageWidth - 2 * margin, 20).fill(bgColor);
        doc.fillColor('#333333').font('Helvetica').fontSize(8);
        doc.text(categoria, stockColX[0] + 5, yPos + 6, { width: stockColWidths[0] });
        doc.text(stock.toString(), stockColX[1] + 5, yPos + 6, { width: stockColWidths[1], align: 'center' });
        doc.text(`${porcentaje.toFixed(2)}%`, stockColX[2] + 5, yPos + 6, { width: stockColWidths[2], align: 'center' });
        yPos += 20;
      });
      yPos += 30;
    }

    if (datos.resumen.beneficiosPorCategoria) {
      if (yPos > 600) { doc.addPage(); yPos = margin; }
      
      doc.fillColor('#0078d7').font('Helvetica-Bold').fontSize(16).text('Análisis de Beneficios por Categoría', margin, yPos);
      yPos += 20;

      const benColWidths = [100, 125, 125, 125];
      const benColX = [margin, margin + 100, margin + 225, margin + 350];
      
      doc.rect(margin, yPos, pageWidth - 2 * margin, 25).fill('#0078d7');
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9);
      doc.text('Categoría', benColX[0] + 5, yPos + 8, { width: benColWidths[0] });
      doc.text('Ingresos Totales', benColX[1] + 5, yPos + 8, { width: benColWidths[1], align: 'right' });
      doc.text('Costos Totales', benColX[2] + 5, yPos + 8, { width: benColWidths[2], align: 'right' });
      doc.text('Beneficio Neto', benColX[3] + 5, yPos + 8, { width: benColWidths[3], align: 'right' });
      yPos += 25;

      const beneficiosOrdenados = Object.entries(datos.resumen.beneficiosPorCategoria).sort((a, b) => b[1].beneficio - a[1].beneficio);
      beneficiosOrdenados.forEach(([categoria, data], index) => {
        const bgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
        doc.rect(margin, yPos, pageWidth - 2 * margin, 20).fill(bgColor);
        doc.fillColor('#333333').font('Helvetica').fontSize(8);
        doc.text(categoria, benColX[0] + 5, yPos + 6, { width: benColWidths[0] });
        doc.text(`€${data.ingresos.toFixed(2)}`, benColX[1] + 5, yPos + 6, { width: benColWidths[1], align: 'right' });
        doc.text(`€${data.costos.toFixed(2)}`, benColX[2] + 5, yPos + 6, { width: benColWidths[2], align: 'right' });
        const beneficioColor = data.beneficio >= 0 ? '#28a745' : '#dc3545';
        doc.fillColor(beneficioColor).font('Helvetica-Bold');
        doc.text(`€${data.beneficio.toFixed(2)}`, benColX[3] + 5, yPos + 6, { width: benColWidths[3], align: 'right' });
        yPos += 20;
      });
    }

  } else if (datos.producto) {
    const [id, prod] = Object.entries(datos.producto)[0];
    
    doc.fillColor('#0078d7').font('Helvetica-Bold').fontSize(18).text(`Informe del Producto: ${prod.nombre}`, margin, yPos);
    yPos += 30;

    const rowData = [
        id,
        prod.categoria,
        prod.proveedor,
        `€${prod.precioCompra.toFixed(2)}`,
        `€${prod.precioVenta.toFixed(2)}`,
        prod.stock.toString(),
        prod.ventasTotales.toString(),
        `€${(prod.balance || 0).toFixed(2)}`
    ];

    const colWidths = [60, 80, 80, 80, 80, 80, 80, 50];
    const colX = [margin, margin + 70, margin + 140, margin + 190, margin + 240, margin + 320, margin + 370, margin + 430];
    
    doc.rect(margin, yPos, contentWidth, 25).fill('#f0f0f0');
    doc.fillColor('black').font('Helvetica-Bold').fontSize(9);
    doc.text('Producto', colX[0] + 5, yPos + 8);
    doc.text('Categoria', colX[1] + 5, yPos + 8);
    doc.text('Proveedor', colX[2] + 5, yPos + 8);
    doc.text('P. Compra', colX[3] + 5, yPos + 8, { align: 'right', width: colWidths[3] - 10 });
    doc.text('P. Venta', colX[4] + 5, yPos + 8, { align: 'right', width: colWidths[4] - 10 });
    doc.text('Stock', colX[5] + 5, yPos + 8, { align: 'center', width: colWidths[5] - 10 });
    doc.text('Ventas', colX[6] + 5, yPos + 8, { align: 'center', width: colWidths[6] - 10 });
    doc.text('Balance', colX[7] + 5, yPos + 8, { align: 'right', width: colWidths[7] - 10 });
    yPos += 25;

    doc.rect(margin, yPos, contentWidth, 20).fill('#f8f9fa');
    doc.fillColor('#333333').font('Helvetica').fontSize(9);
    
    rowData.forEach((data, i) => {
        if (i === 3 || i === 4 || i === 7) {
            doc.text(data, colX[i] + 5, yPos + 6, { align: 'right', width: colWidths[i] - 10 });
        } else if (i === 5 || i === 6) {
            doc.text(data, colX[i] + 5, yPos + 6, { align: 'center', width: colWidths[i] - 10 });
        } else {
            doc.text(data, colX[i] + 5, yPos + 6);
        }
    });

    yPos += 40;
    
    if (datos.historial && datos.historial.length > 0) {
      doc.fillColor('#0078d7').font('Helvetica-Bold').fontSize(14).text('Historial de Movimientos', margin, yPos);
      yPos += 20;

      const histColWidths = [100, 60, 50, 155, 130];
      const histColX = [margin, margin + 100, margin + 160, margin + 210, margin + 365];

      doc.rect(margin, yPos, contentWidth, 25).fill('#f0f0f0');
      doc.fillColor('black').font('Helvetica-Bold').fontSize(9);
      doc.text('Fecha', histColX[0] + 5, yPos + 8);
      doc.text('Acción', histColX[1] + 3, yPos + 8);
      doc.text('Cant.', histColX[2] + 5, yPos + 8);
      doc.text('Precio / Detalle', histColX[3] + 15, yPos + 8);
      doc.text('ID Ticket', histColX[4] - 15, yPos + 8);
      yPos += 25;

      datos.historial.slice(0, 20).forEach((h, index) => {
          if (yPos > 750) {
              doc.addPage();
              yPos = margin;
          }

          const productoEnHistorial = h.productos ? h.productos.find(p => p.productoID === id) : null;
          let cantidad = '-';
          let detalle = '-';
          let rowHeight = 20;

          if (['Vendido', 'Comprado'].includes(h.accion) && productoEnHistorial) {
              cantidad = productoEnHistorial.cantidad.toString();
              detalle = `€${productoEnHistorial.precioUnitario.toFixed(2)} / €${productoEnHistorial.precioTotal.toFixed(2)}`;
          } else if (h.accion === 'Editado') {
              detalle = (h.cambios || []).join('\n');
              const numLines = (h.cambios || []).length;
              rowHeight = numLines * 12 + 6;
          }

          const bgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
          doc.rect(margin, yPos, contentWidth, rowHeight).fill(bgColor);
          const fecha = new Date(h.fecha).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });

          doc.fillColor('#333333').font('Helvetica').fontSize(8);
          doc.text(fecha, histColX[0] + 5, yPos + 6);
          doc.text(h.accion, histColX[1] + 3, yPos + 6);
          doc.text(cantidad, histColX[2] + 5, yPos + 6, { width: histColX[2] - 175, align: "center" });
          doc.text(detalle, histColX[3] + 15, yPos + 6, { width: histColWidths[3] - 5, lineBreak: false });
          doc.text(h.ticketID || h.operacionID || 'N/A', histColX[4] - 15, yPos + 6);

          yPos += rowHeight;
      });
    }
  } else if (datos.productos && Object.keys(datos.productos).length > 0) {
    doc.fillColor('#0078d7').font('Helvetica-Bold').fontSize(18).text(`Productos de la Categoría: ${Object.values(datos.productos)[0].categoria}`, margin, yPos);
    yPos += 30;

    const totalProductos = Object.keys(datos.productos).length;
    const totalStock = Object.values(datos.productos).reduce((sum, p) => sum + p.stock, 0);
    doc.fillColor('#333333').font('Helvetica').fontSize(11);
    doc.text(`Total de productos: ${totalProductos} | Stock total: ${totalStock} unidades`, margin, yPos);
    yPos += 30;

    const colWidths = [60, 50, 50, 80, 80, 80, 80, 50];
    const colX = [margin, margin + 50, margin + 120, margin + 170, margin + 240, margin + 320, margin + 370, margin + 430];
    
    doc.rect(margin, yPos, contentWidth, 25).fill('#f0f0f0');
    doc.fillColor('black').font('Helvetica-Bold').fontSize(9);
    doc.text('ID', colX[0] + 5, yPos + 8);
    doc.text('Producto', colX[1] + 5, yPos + 8);
    doc.text('Proveedor', colX[2] + 5, yPos + 8);
    doc.text('P. Compra', colX[3] + 5, yPos + 8, { align: 'right', width: colWidths[3] - 10 });
    doc.text('P. Venta', colX[4] + 5, yPos + 8, { align: 'right', width: colWidths[4] - 10 });
    doc.text('Stock', colX[5] + 5, yPos + 8, { align: 'center', width: colWidths[5] - 10 });
    doc.text('Ventas', colX[6] + 5, yPos + 8, { align: 'center', width: colWidths[6] - 10 });
    doc.text('Balance', colX[7] + 5, yPos + 8, { align: 'right', width: colWidths[7] - 10 });
    yPos += 25;

    Object.entries(datos.productos).forEach(([id, prod], index) => {
      if (yPos > 750) {
        doc.addPage();
        yPos = margin;
      }

      const bgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
      doc.rect(margin, yPos, contentWidth, 20).fill(bgColor);
      doc.fillColor('#333333').font('Helvetica').fontSize(8);
      doc.text(id, colX[0] + 5, yPos + 6);
      doc.text(prod.nombre.substring(0, 18), colX[1] + 5, yPos + 6);
      doc.text(prod.proveedor.substring(0, 15), colX[2] + 5, yPos + 6);
      doc.text(`€${prod.precioCompra.toFixed(2)}`, colX[3] + 5, yPos + 6, { align: 'right', width: colWidths[3] - 10 });
      doc.text(`€${prod.precioVenta.toFixed(2)}`, colX[4] + 5, yPos + 6, { align: 'right', width: colWidths[4] - 10 });
      doc.text(prod.stock.toString(), colX[5] + 5, yPos + 6, { align: 'center', width: colWidths[5] - 10 });
      doc.text(prod.ventasTotales.toString(), colX[6] + 5, yPos + 6, { align: 'center', width: colWidths[6] - 10 });
      doc.text(`€${(prod.balance || 0).toFixed(2)}`, colX[7] + 5, yPos + 6, { align: 'right', width: colWidths[7] - 10 });
      yPos += 20;
    });
    
    if (datos.historial && datos.historial.length > 0) {
      doc.addPage();
      yPos = margin;

      doc.fillColor('#0078d7').font('Helvetica-Bold').fontSize(14).text('Historial de Movimientos de la Categoría', margin, yPos);
      yPos += 20;

      const histColWidths = [90, 110, 60, 40, 140, 90];
      const histColX = [margin, margin + 90, margin + 200, margin + 260, margin + 300, margin + 405];

      doc.rect(margin, yPos, contentWidth, 25).fill('#f0f0f0');
      doc.fillColor('black').font('Helvetica-Bold').fontSize(9);
      doc.text('Fecha', histColX[0] + 2, yPos + 8);
      doc.text('Producto', histColX[1] - 10, yPos + 8);
      doc.text('Acción', histColX[2] - 40, yPos + 8);
      doc.text('Cant', histColX[3] - 40, yPos + 8, { width: histColWidths[3] - 50, align: 'center' });
      doc.text('Precio/Detalle', histColX[4] - 30, yPos + 8);
      doc.text('ID Ticket', histColX[5] - 10, yPos + 8);
      yPos += 25;

      datos.historial.slice(0, 10).forEach((h, index) => {
          if (yPos > 750) {
              doc.addPage();
              yPos = margin;
          }

          const productoEnHistorial = h.productos ? h.productos[0] : null;
          let cantidad = '-';
          let detalle = '-';
          let nombreProd = h.productoNombre || (productoEnHistorial ? productoEnHistorial.productoNombre : 'N/A');
          let IDProd = h.productoID || (productoEnHistorial ? productoEnHistorial.productoID : 'N/A');
          let rowHeight = 20;

          if (['Vendido', 'Comprado'].includes(h.accion) && productoEnHistorial) {
              cantidad = productoEnHistorial.cantidad.toString();
              detalle = `€${productoEnHistorial.precioUnitario.toFixed(2)} / €${productoEnHistorial.precioTotal.toFixed(2)}`;
          } else if (h.accion === 'Editado') {
              detalle = (h.cambios || []).join('\n');
              const numLines = (h.cambios || []).length;
              rowHeight = numLines * 12 + 6;
          }

          const bgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
          doc.rect(margin, yPos, contentWidth, rowHeight).fill(bgColor);
          const fecha = new Date(h.fecha).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });

          doc.fillColor('#333333').font('Helvetica').fontSize(8);
          doc.text(fecha, histColX[0] + 2, yPos + 6);
          doc.text(IDProd, histColX[1] - 10, yPos + 6);
          doc.text(h.accion, histColX[2] - 40, yPos + 6);
          doc.text(cantidad, histColX[3] - 30, yPos + 6, { width: histColWidths[3] - 50, align: 'center' });
          doc.text(detalle, histColX[4] - 30, yPos + 6, { width: histColWidths[4] - 30 });
          doc.text(h.ticketID || h.operacionID || 'N/A', histColX[5] - 20, yPos + 6);

          yPos += rowHeight;
      });
    }
  }

  const totalPages = doc.bufferedPageRange().count;

  for (let i = 0; i < totalPages; i++) {
    doc.switchToPage(i);
    doc.fillColor('#999999').font('Helvetica').fontSize(8);
    doc.text(
      `Página ${i+1} de ${totalPages} | Generado por VimenStock | ${new Date().toLocaleDateString('es-ES')}`,
      margin,
      pageHeight - 60,
      { align: 'center', width: contentWidth }
    );
    doc.moveTo(margin, pageHeight - 40).lineTo(pageWidth - margin, pageHeight - 40).strokeColor('#cccccc').stroke();
  }

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => {
      log('✅ Informe PDF generado exitosamente', 'green');
      log(`📄 Nombre: ${fileName}`, 'blue');
      log(`📂 Ubicación: ${filePath}\n`, 'gray');
      resolve(filePath);
    });
    stream.on('error', reject);
  });
}

// Nueva función para añadir la hoja de productos al Excel
async function addProductosSheet(workbook, data) {
  const wsProductos = workbook.addWorksheet('Productos');
  wsProductos.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Nombre', key: 'nombre', width: 25 },
    { header: 'Categoría', key: 'categoria', width: 15 },
    { header: 'Proveedor', key: 'proveedor', width: 20 },
    { header: 'Precio Compra (€)', key: 'precioCompra', width: 15 },
    { header: 'Precio Venta (€)', key: 'precioVenta', width: 15 },
    { header: 'Stock', key: 'stock', width: 10 },
    { header: 'Ventas Totales', key: 'ventasTotales', width: 15 },
    { header: 'Balance (€)', key: 'balance', width: 15 },
    { header: 'Fecha Añadido', key: 'fechaAñadido', width: 20 }
  ];

  wsProductos.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  wsProductos.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
  wsProductos.getRow(1).height = 20;
  wsProductos.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };

  Object.entries(data.productos || {}).forEach(([id, prod]) => {
    wsProductos.addRow({
      id, nombre: prod.nombre, categoria: prod.categoria || 'Otro',
      proveedor: prod.proveedor, precioCompra: prod.precioCompra,
      precioVenta: prod.precioVenta, stock: prod.stock,
      ventasTotales: prod.ventasTotales, balance: prod.balance || 0,
      fechaAñadido: prod.fechaAñadido ? new Date(prod.fechaAñadido).toLocaleString('es-ES') : ''
    });
  });
}


async function generarInformeExcel(datosFiltrados, tipo, nombreBase, subdirInformes) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `${nombreBase}_${timestamp}.xlsx`;
  const filePath = path.join(subdirInformes, fileName);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'VimenStock';
  workbook.created = new Date();

  if (tipo === 'balance' && datosFiltrados.resumen) {
    const wsResumen = workbook.addWorksheet('Resumen Ejecutivo');
    
    wsResumen.getColumn(1).width = 40;
    wsResumen.getColumn(2).width = 30;
    
    wsResumen.mergeCells('A1:B1');
    const tituloCell = wsResumen.getCell('A1');
    tituloCell.value = 'VimenStock - Informe de Balance General';
    tituloCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    tituloCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0078D7' } };
    tituloCell.alignment = { horizontal: 'center', vertical: 'middle' };
    wsResumen.getRow(1).height = 30;

    wsResumen.mergeCells('A2:B2');
    const fechaCell = wsResumen.getCell('A2');
    fechaCell.value = `Fecha de generación: ${new Date().toLocaleString('es-ES')}`;
    fechaCell.font = { size: 10, italic: true };
    fechaCell.alignment = { horizontal: 'center' };
    
    wsResumen.addRow([]);

    wsResumen.addRow(['INDICADORES CLAVE', '']);
    wsResumen.getRow(4).font = { bold: true, size: 12 };
    wsResumen.getRow(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F4F8' } };
    
    const kpis = [
      ['Ingresos Totales', `€${datosFiltrados.resumen.totalIngresos.toFixed(2)}`],
      ['Gastos Totales', `€${datosFiltrados.resumen.totalGastos.toFixed(2)}`],
      ['Beneficio Neto', `€${datosFiltrados.resumen.beneficioNeto.toFixed(2)}`],
      ['Margen Bruto', `${datosFiltrados.resumen.margenBruto.toFixed(2)}%`],
      ['Ventas Realizadas', datosFiltrados.resumen.ventasRealizadas],
      ['Ticket Medio', `€${datosFiltrados.resumen.ticketMedio.toFixed(2)}`],
      ['Total Productos', datosFiltrados.resumen.totalProductos],
      ['Stock Total', datosFiltrados.resumen.totalStock]
    ];

    kpis.forEach(([label, value]) => {
      const row = wsResumen.addRow([label, value]);
      row.getCell(1).font = { bold: true };
      row.getCell(2).alignment = { horizontal: 'right' };
      
      if (label === 'Beneficio Neto') {
        const beneficio = datosFiltrados.resumen.beneficioNeto;
        row.getCell(2).font = { bold: true, color: { argb: beneficio >= 0 ? 'FF28A745' : 'FFDC3545' } };
      }
    });

    // Hoja: Top Productos
    if (datosFiltrados.resumen.topProductos && datosFiltrados.resumen.topProductos.length > 0) {
      const wsTop = workbook.addWorksheet('Top Productos');
      
      wsTop.columns = [
        { header: 'Posición', key: 'posicion', width: 12 },
        { header: 'ID', key: 'id', width: 12 },
        { header: 'Producto', key: 'nombre', width: 30 },
        { header: 'Proveedor', key: 'proveedor', width: 20 },
        { header: 'Categoría', key: 'categoria', width: 18 },
        { header: 'Us. Vendidas', key: 'unidades', width: 18 },
        { header: 'Ingresos (€)', key: 'ingresos', width: 15 }
      ];
      
      wsTop.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      wsTop.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0078D7' } };
      wsTop.getRow(1).height = 20;
      wsTop.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };
      
      datosFiltrados.resumen.topProductos.forEach((prod, index) => {
        const row = wsTop.addRow({
          posicion: index + 1,
          id: prod.id,
          nombre: prod.nombre,
          proveedor: prod.proveedor,
          categoria: prod.categoria,
          unidades: prod.unidades,
          ingresos: prod.ingresos
        });
        
        row.getCell('ingresos').numFmt = '€#,##0.00';
        
        if (index % 2 === 0) {
          row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } };
        }
        
        if (index < 3) {
          row.font = { bold: true };
        }
      });
      
      wsTop.getColumn('unidades').alignment = { horizontal: 'center' };
      wsTop.getColumn('ingresos').alignment = { horizontal: 'right' };
    }

    // Hoja: Stock Bajo
    if (datosFiltrados.resumen.productosStockBajo && datosFiltrados.resumen.productosStockBajo.length > 0) {
      const wsStock = workbook.addWorksheet('Stock Bajo');
      
      wsStock.columns = [
        { header: 'ID', key: 'id', width: 12 },
        { header: 'Producto', key: 'nombre', width: 30 },
        { header: 'Proveedor', key: 'proveedor', width: 20 },
        { header: 'Categoría', key: 'categoria', width: 18 },
        { header: 'Stock Actual', key: 'stock', width: 15 },
        { header: 'Estado', key: 'estado', width: 12 }
      ];
      
      wsStock.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      wsStock.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC3545' } };
      wsStock.getRow(1).height = 20;
      wsStock.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };
      
      datosFiltrados.resumen.productosStockBajo.forEach((prod, index) => {
        const estado = prod.stock === 0 ? 'Agotado' : prod.stock < 10 ? 'Crítico' : 'Bajo';
        
        const row = wsStock.addRow({
          id: prod.id,
          nombre: prod.nombre,
          proveedor: prod.proveedor,
          categoria: prod.categoria,
          stock: prod.stock,
          estado: estado
        });
        
        row.getCell('stock').alignment = { horizontal: 'center' };
        row.getCell('estado').alignment = { horizontal: 'center' };
        
        const estadoCell = row.getCell('estado');
        if (estado === 'Agotado') {
          estadoCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          estadoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC3545' } };
        } else if (estado === 'Crítico') {
          estadoCell.font = { bold: true, color: { argb: 'FF000000' } };
          estadoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC107' } };
        } else {
          estadoCell.font = { bold: true };
          estadoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };
        }
      });
    }

    // Hoja: Stock por Categoría
    if (datosFiltrados.resumen.stockPorCategoria) {
      const wsStockCat = workbook.addWorksheet('Stock por Categoría');
      
      wsStockCat.columns = [
        { header: 'Categoría', key: 'categoria', width: 25 },
        { header: 'Unidades en Stock', key: 'stock', width: 20 },
        { header: '% del Total', key: 'porcentaje', width: 15 }
      ];
      
      wsStockCat.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      wsStockCat.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0078D7' } };
      wsStockCat.getRow(1).height = 20;
      wsStockCat.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };

      const totalStockGlobal = Object.values(datosFiltrados.resumen.stockPorCategoria).reduce((sum, val) => sum + val, 0);
      const stockOrdenado = Object.entries(datosFiltrados.resumen.stockPorCategoria).sort((a, b) => b[1] - a[1]);

      stockOrdenado.forEach(([categoria, stock], index) => {
        const porcentaje = totalStockGlobal > 0 ? (stock / totalStockGlobal) * 100 : 0;
        const row = wsStockCat.addRow({ 
          categoria, 
          stock,
          porcentaje: `${porcentaje.toFixed(2)}%`
        });
        row.getCell('stock').alignment = { horizontal: 'center' };
        row.getCell('porcentaje').alignment = { horizontal: 'center' };
        if (index % 2 === 0) {
          row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } };
        }
      });
    }
    
    // Hoja: Beneficios por Categoría
    if (datosFiltrados.resumen.beneficiosPorCategoria) {
      const wsBeneficios = workbook.addWorksheet('Beneficios por Categoría');
      wsBeneficios.columns = [
        { header: 'Categoría', key: 'categoria', width: 25 },
        { header: 'Ingresos Totales (€)', key: 'ingresos', width: 20 },
        { header: 'Costos Totales (€)', key: 'costos', width: 20 },
        { header: 'Beneficio Neto (€)', key: 'beneficio', width: 20 }
      ];
      wsBeneficios.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      wsBeneficios.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0078D7' } };
      wsBeneficios.getRow(1).height = 20;
      wsBeneficios.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };
      
      const beneficiosOrdenados = Object.entries(datosFiltrados.resumen.beneficiosPorCategoria).sort((a, b) => b[1].beneficio - a[1].beneficio);
      beneficiosOrdenados.forEach(([categoria, data], index) => {
        const row = wsBeneficios.addRow({ 
          categoria, 
          ingresos: data.ingresos,
          costos: data.costos,
          beneficio: data.beneficio
        });
        row.getCell('ingresos').numFmt = '€#,##0.00';
        row.getCell('costos').numFmt = '€#,##0.00';
        row.getCell('beneficio').numFmt = '€#,##0.00';
        if (data.beneficio < 0) {
          row.getCell('beneficio').font = { bold: true, color: { argb: 'FFDC3545' } };
        }
        if (index % 2 === 0) {
          row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } };
        }
      });
    }

    // AÑADIR LA HOJA DE PRODUCTOS AQUÍ
    await addProductosSheet(workbook, datosFiltrados);
  }

  await workbook.xlsx.writeFile(filePath);
  
  log('✅ Informe Excel generado exitosamente', 'green');
  log(`📄 Nombre: ${fileName}`, 'blue');
  log(`📂 Ubicación: ${filePath}\n`, 'gray');
  
  return filePath;
}

function listarInformes(tipoFiltro = 'all') {
  try {
    crearDirectorios();

    const tipos = tipoFiltro === 'all' 
      ? [{ nombre: 'general', dir: informesGeneralDir }, { nombre: 'productos', dir: informesProductosDir }, { nombre: 'categorias', dir: informesCategoriasDir }]
      : [{ nombre: tipoFiltro, dir: tipoFiltro === 'general' ? informesGeneralDir : tipoFiltro === 'productos' ? informesProductosDir : informesCategoriasDir }];

    let hayInformes = false;

    tipos.forEach(({ nombre, dir }) => {
      if (!fs.existsSync(dir)) return;

      const informes = fs.readdirSync(dir)
        .filter(f => (f.endsWith('.pdf') || f.endsWith('.xlsx')) && fs.statSync(path.join(dir, f)).isFile())
        .sort()
        .reverse();

      if (informes.length > 0) {
        hayInformes = true;
        log(`\n📊 Informes de ${nombre.toUpperCase()}:\n`, 'blue');
        log('─'.repeat(80), 'gray');

        informes.forEach((informe, index) => {
          const informePath = path.join(dir, informe);
          const stats = fs.statSync(informePath);
          const fecha = stats.mtime.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          const tamano = (stats.size / 1024).toFixed(2);
          const extension = path.extname(informe).toUpperCase();

          log(`[${index}] - ${informe}`, 'green');
          log(`     Fecha: ${fecha} | Tamaño: ${tamano} KB | Formato: ${extension}`, 'gray');
          log('─'.repeat(80), 'gray');
        });

        log(`\n💾 Total: ${informes.length} informe(s)\n`, 'blue');
      }
    });

    if (!hayInformes) {
      log('\n⚠️  No hay informes disponibles\n', 'yellow');
    }

  } catch (error) {
    log(`❌ Error listando informes: ${error.message}`, 'red');
    process.exit(1);
  }
}
// Procesar argumentos
const args = process.argv.slice(2);

crearDirectorios();

if (args.length === 0 || args[0] === 'help' || args[0] === '--help' || args[0] === '-h') {
  mostrarAyuda();
} else if (args[0] === 'balance') {
  const formato = args[1] && args[1].toLowerCase() === 'excel' ? 'excel' : 'pdf';
  generarInformeBalance(formato);
} else if (args[0] === 'producto') {
  if (args.length < 2) {
    log('❌ Debes especificar el ID del producto', 'red');
    log('Ejemplo: npm run informe:producto P001', 'gray');
    log('Usa "npm run informe:help" para más información\n', 'gray');
    process.exit(1);
  }
  generarInformeProducto(args[1]);
} else if (args[0] === 'categoria') {
  if (args.length < 2) {
    log('❌ Debes especificar el nombre de la categoría', 'red');
    log('Ejemplo: npm run informe:categoria Alimentación', 'gray');
    log('Usa "npm run informe:help" para más información\n', 'gray');
    process.exit(1);
  }
  generarInformeCategoria(args.slice(1).join(' '));
} else if (args[0] === 'list') {
  const tipoFiltro = args[1] || 'all';
  if (!['all', 'general', 'productos', 'categorias'].includes(tipoFiltro)) {
    log('❌ Tipo inválido. Usa: all, general, productos o categorias', 'red');
    process.exit(1);
  }
  listarInformes(tipoFiltro);
} else {
  log('❌ Comando no reconocido', 'red');
  log('Usa "npm run informe:help" para ver todos los comandos disponibles\n', 'gray');
  process.exit(1);
}
