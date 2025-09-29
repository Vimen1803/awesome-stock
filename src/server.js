const express = require("express");
const fs = require("fs");
const path = require("path");
const PDFDocument = require('pdfkit');
const winston = require('winston');
const { createCanvas } = require('canvas');
const ExcelJS = require('exceljs');

const app = express();

// Crear carpetas necesarias si no existen
const dataDir = path.join(__dirname, '../data');
const logsDir = path.join(__dirname, '../data', 'logs');
const ticketsDir = path.join(__dirname, '../data', 'tickets');
const compraDir = path.join(ticketsDir, 'compra');
const ventaDir = path.join(ticketsDir, 'venta');
const barcodeDir = path.join(__dirname, '../docs', 'bar_code');

// Verificar y crear las carpetas
const createDirectoryIfNotExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Carpeta creada: ${dir}`);
  }
};

createDirectoryIfNotExists(dataDir);
createDirectoryIfNotExists(logsDir);
createDirectoryIfNotExists(ticketsDir);
createDirectoryIfNotExists(compraDir);
createDirectoryIfNotExists(ventaDir);
createDirectoryIfNotExists(barcodeDir);

// Configurar logger con winston
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
    new winston.transports.File({ filename: path.join(logsDir, 'app.log') })
  ]
});

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(express.static(__dirname));

// Servir archivos de códigos de barras
app.use('/bar_code', express.static(barcodeDir));

const DATA_FILE = path.join(__dirname, "../data/data.json");

// Inicializar data.json si no existe
function inicializarDataJSON() {
  if (!fs.existsSync(DATA_FILE)) {
    const dataInicial = {
      categorias: [
        "Alimentación",
        "Bebidas",
        "Limpieza",
        "Tecnología",
        "Hogar",
        "Juguetes",
        "Cosmética",
        "Ropa",
        "Deportes",
        "Otro"
      ],
      productos: {},
      historial: [],
      finanzas: [],
      ultimaIDUsada: 0
    };

    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(dataInicial, null, 2), 'utf-8');
      logger.info('Archivo data.json creado con éxito');
      console.log('✅ Archivo data.json creado con categorías predefinidas');
    } catch (error) {
      logger.error(`Error creando data.json: ${error}`);
      console.error('❌ Error al crear data.json:', error);
    }
  } else {
    logger.info('Archivo data.json ya existe');
    console.log('✅ Archivo data.json encontrado');
  }
}

// Llamar a la inicialización antes de iniciar el servidor
inicializarDataJSON();

// ==================== GENERACIÓN DE CÓDIGO DE BARRAS ====================
function generateBarcode128(text) {
  const patterns = {
    '0': '11011001100',
    '1': '11001101100',
    '2': '11001100110',
    '3': '10010011000',
    '4': '10010001100',
    '5': '10001001100',
    '6': '10011001000',
    '7': '10011000100',
    '8': '10001100100',
    '9': '11001001000'
  };
  
  let barcode = '11010010000'; // Start pattern
  
  for (let char of text) {
    if (patterns[char]) {
      barcode += patterns[char];
    }
  }
  
  barcode += '1100011101011'; // Stop pattern
  
  return barcode;
}

app.post("/api/generar-codigo-barras", (req, res) => {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: "ID de producto requerido" });
    }

    const canvas = createCanvas(200, 80);
    const ctx = canvas.getContext('2d');
    
    // Fondo blanco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Convertir ID a código de barras
    const code = id.replace('P', '');
    const barcodeData = generateBarcode128(code);
    
    // Dibujar barras
    ctx.fillStyle = '#000000';
    let x = 10;
    const barHeight = 50;
    const barWidth = 2;
    
    for (let i = 0; i < barcodeData.length; i++) {
      if (barcodeData[i] === '1') {
        ctx.fillRect(x, 10, barWidth, barHeight);
      }
      x += barWidth;
    }
    
    // Añadir texto del ID debajo
    ctx.fillStyle = '#000000';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(id, canvas.width / 2, canvas.height - 10);
    
    // Guardar imagen en disco
    const fileName = `${id}.png`;
    const filePath = path.join(barcodeDir, fileName);
    
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filePath, buffer);
    
    // Convertir a base64 para enviar al cliente
    const base64Image = canvas.toDataURL('image/png');
    
    logger.info(`Código de barras generado: ${fileName}`);
    
    res.json({
      success: true,
      id: id,
      fileName: fileName,
      filePath: path.relative(__dirname, filePath),
      imageData: base64Image
    });
    
  } catch (error) {
    logger.error(`Error generando código de barras: ${error}`);
    res.status(500).json({ error: 'Error generando código de barras' });
  }
});

// ==================== EXPORTAR A EXCEL ====================
app.get("/api/exportar-excel", async (req, res) => {
  try {
    // Leer datos
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    
    // Crear workbook
    const workbook = new ExcelJS.Workbook();
    
    // === HOJA 1: PRODUCTOS ===
    const wsProductos = workbook.addWorksheet('Productos');
    
    // Definir columnas
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
    
    // Estilo de encabezados
    wsProductos.getRow(1).font = { bold: true };
    wsProductos.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    wsProductos.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    
    // Agregar datos
    Object.entries(data.productos || {}).forEach(([id, prod]) => {
      wsProductos.addRow({
        id: id,
        nombre: prod.nombre,
        categoria: prod.categoria || 'Otro',
        proveedor: prod.proveedor,
        precioCompra: prod.precioCompra,
        precioVenta: prod.precioVenta,
        stock: prod.stock,
        ventasTotales: prod.ventasTotales,
        balance: prod.balance || 0,
        fechaAñadido: prod.fechaAñadido ? new Date(prod.fechaAñadido).toLocaleString('es-ES') : ''
      });
    });
    
    // Formato de números con decimales
    wsProductos.getColumn('precioCompra').numFmt = '0.00';
    wsProductos.getColumn('precioVenta').numFmt = '0.00';
    wsProductos.getColumn('balance').numFmt = '0.00';
    
    // === HOJA 2: HISTORIAL ===
    const wsHistorial = workbook.addWorksheet('Historial');
    
    wsHistorial.columns = [
      { header: 'Fecha', key: 'fecha', width: 20 },
      { header: 'Acción', key: 'accion', width: 15 },
      { header: 'Producto ID', key: 'productoID', width: 12 },
      { header: 'Producto Nombre', key: 'productoNombre', width: 25 },
      { header: 'Categoría', key: 'categoria', width: 15 },
      { header: 'Cantidad', key: 'cantidad', width: 10 },
      { header: 'Precio Total (€)', key: 'precioTotal', width: 15 },
      { header: 'Ticket ID', key: 'ticketID', width: 30 }
    ];
    
    wsHistorial.getRow(1).font = { bold: true };
    wsHistorial.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' }
    };
    wsHistorial.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    
    // Agregar historial
    (data.historial || []).forEach(h => {
      if (h.productos && Array.isArray(h.productos)) {
        // Historial con múltiples productos
        h.productos.forEach(prod => {
          wsHistorial.addRow({
            fecha: new Date(h.fecha).toLocaleString('es-ES'),
            accion: h.accion,
            productoID: prod.productoID,
            productoNombre: prod.productoNombre,
            categoria: prod.categoria,
            cantidad: prod.cantidad,
            precioTotal: prod.precioTotal || 0,
            ticketID: h.ticketID || ''
          });
        });
      } else {
        // Historial antiguo
        wsHistorial.addRow({
          fecha: new Date(h.fecha).toLocaleString('es-ES'),
          accion: h.accion,
          productoID: h.productoID,
          productoNombre: h.productoNombre,
          categoria: h.categoria,
          cantidad: h.cantidad || 0,
          precioTotal: 0,
          ticketID: ''
        });
      }
    });
    
    wsHistorial.getColumn('precioTotal').numFmt = '0.00';
    
    // === HOJA 3: FINANZAS ===
    const wsFinanzas = workbook.addWorksheet('Finanzas');
    
    wsFinanzas.columns = [
      { header: 'Fecha', key: 'fecha', width: 20 },
      { header: 'Tipo', key: 'tipo', width: 12 },
      { header: 'Monto (€)', key: 'monto', width: 15 },
      { header: 'Categoría', key: 'categoria', width: 15 },
      { header: 'Producto ID', key: 'productoID', width: 12 }
    ];
    
    wsFinanzas.getRow(1).font = { bold: true };
    wsFinanzas.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFC000' }
    };
    wsFinanzas.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    
    (data.finanzas || []).forEach(f => {
      wsFinanzas.addRow({
        fecha: new Date(f.fecha).toLocaleString('es-ES'),
        tipo: f.tipo,
        monto: f.monto,
        categoria: f.categoria,
        productoID: f.productoID
      });
    });
    
    wsFinanzas.getColumn('monto').numFmt = '0.00';
    
    // === HOJA 4: RESUMEN ===
    const wsResumen = workbook.addWorksheet('Resumen');
    
    wsResumen.columns = [
      { header: 'Métrica', key: 'metrica', width: 30 },
      { header: 'Valor', key: 'valor', width: 20 }
    ];
    
    wsResumen.getRow(1).font = { bold: true };
    wsResumen.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF5B9BD5' }
    };
    wsResumen.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    
    const totalProductos = Object.keys(data.productos || {}).length;
    const totalStock = Object.values(data.productos || {}).reduce((sum, p) => sum + p.stock, 0);
    const totalVentas = Object.values(data.productos || {}).reduce((sum, p) => sum + p.ventasTotales, 0);
    const balanceTotal = Object.values(data.productos || {}).reduce((sum, p) => sum + (p.balance || 0), 0);
    
    wsResumen.addRow({ metrica: 'Total de Productos', valor: totalProductos });
    wsResumen.addRow({ metrica: 'Total Stock', valor: totalStock });
    wsResumen.addRow({ metrica: 'Total Ventas Realizadas', valor: totalVentas });
    wsResumen.addRow({ metrica: 'Balance Total (€)', valor: balanceTotal.toFixed(2) });
    wsResumen.addRow({ metrica: 'Fecha de Exportación', valor: new Date().toLocaleString('es-ES') });
    
    // Guardar archivo
    const excelPath = path.join(dataDir, 'data.xlsx');
    await workbook.xlsx.writeFile(excelPath);
    
    logger.info(`Excel exportado: ${excelPath}`);
    
    res.json({
      success: true,
      message: 'Excel generado correctamente',
      filePath: path.relative(__dirname, excelPath),
      fileName: 'data.xlsx'
    });
    
  } catch (error) {
    logger.error(`Error exportando a Excel: ${error}`);
    res.status(500).json({ error: 'Error exportando a Excel' });
  }
});

// ==================== ALERTAS DE STOCK BAJO ====================
app.post("/api/registrar-alerta-stock", (req, res) => {
  try {
    const { productos } = req.body;
    
    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: "No hay productos para registrar" });
    }

    const stockAlertsFile = path.join(logsDir, 'stock_alerts.txt');
    const ahora = new Date();
    
    // Formatear fecha: DD/MM/YYYY HH:MM:SS
    const dia = String(ahora.getDate()).padStart(2, '0');
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const anio = ahora.getFullYear();
    const hora = String(ahora.getHours()).padStart(2, '0');
    const min = String(ahora.getMinutes()).padStart(2, '0');
    const seg = String(ahora.getSeconds()).padStart(2, '0');
    const fechaFormateada = `${dia}/${mes}/${anio} ${hora}:${min}:${seg}`;
    
    // Crear las líneas de alerta
    const lineas = productos.map(p => 
      `${p.id} - ${p.nombre} - Stock Disponible: ${p.stock} - ${fechaFormateada}`
    );
    
    // Agregar las líneas al archivo (append)
    const contenido = lineas.join('\n') + '\n';
    
    fs.appendFileSync(stockAlertsFile, contenido, 'utf-8');
    
    logger.info(`Alertas de stock bajo registradas: ${productos.length} productos`);
    
    res.json({
      success: true,
      alertasRegistradas: productos.length,
      productos: productos.map(p => p.id)
    });
    
  } catch (error) {
    logger.error(`Error registrando alertas de stock: ${error}`);
    res.status(500).json({ error: 'Error registrando alertas de stock' });
  }
});

// Generar ID único para operaciones
function generarIDOperacion(tipo) {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${tipo.toUpperCase()}-${timestamp}-${random}`;
}

app.get("/api/data", (req, res) => {
  fs.readFile(DATA_FILE, "utf-8", (err, data) => {
    if (err) {
      logger.error('Error al leer datos: ' + err);
      return res.status(500).send("Error al leer datos");
    }
    res.send(data);
  });
});

app.post("/api/data", (req, res) => {
  fs.writeFile(DATA_FILE, JSON.stringify(req.body, null, 2), "utf-8", err => {
    if (err) {
      logger.error('Error al guardar datos: ' + err);
      return res.status(500).send("Error al guardar datos");
    }
    res.send({ status: "ok" });
  });
});

// Nueva ruta para generar tickets PDF
app.post("/api/generar-ticket", (req, res) => {
  try {
    const { tipo, operaciones, total, fecha } = req.body;
    
    if (!operaciones || operaciones.length === 0) {
      return res.status(400).json({ error: "No hay operaciones para procesar" });
    }

    const operacionID = generarIDOperacion(tipo);
    const fileName = `ticket_${tipo}_${operacionID}.pdf`;
    const dirPath = tipo === 'compra' ? compraDir : ventaDir;
    const filePath = path.join(dirPath, fileName);

    // Crear documento PDF con configuración estática
    const doc = new PDFDocument({ 
      margin: 40,
      size: 'A4',
      bufferPages: true
    });
    
    // Stream del PDF al archivo
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Posiciones fijas para mantener alineación
    const pageWidth = 595; // A4 width
    const margins = {
      left: 40,
      right: 40,
      top: 40,
      bottom: 40
    };
    const contentWidth = pageWidth - margins.left - margins.right;

    // Posiciones de columnas fijas
    const columns = {
      codigo: { x: margins.left, width: 80 },
      producto: { x: margins.left + 85, width: 180 },
      cantidad: { x: margins.left + 270, width: 60 },
      precioUnit: { x: margins.left + 335, width: 70 },
      total: { x: margins.left + 410, width: 80 }
    };

    let currentY = margins.top;

    // === ENCABEZADO ===
    doc.font('Helvetica-Bold')
       .fontSize(20)
       .text('VimenStock', margins.left, currentY, { 
         width: contentWidth, 
         align: 'center' 
       });
    
    currentY += 30;
    
    doc.fontSize(12)
       .text('Sistema de Gestión de Inventario', margins.left, currentY, { 
         width: contentWidth, 
         align: 'center' 
       });
    
    currentY += 40;

    // === INFORMACIÓN DE LA OPERACIÓN ===
    const fechaFormateada = new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    doc.font('Helvetica')
       .fontSize(11);

    // Información en dos columnas
    doc.text(`Fecha: ${fechaFormateada}`, margins.left, currentY);
    doc.text(`Tipo: ${tipo.toUpperCase()}`, margins.left + 250, currentY);
    
    currentY += 20;
    
    doc.text(`ID Operación: ${operacionID}`, margins.left, currentY, {
      width: contentWidth
    });

    currentY += 30;

    // === LÍNEA SEPARADORA ===
    doc.moveTo(margins.left, currentY)
       .lineTo(pageWidth - margins.right, currentY)
       .stroke();
    
    currentY += 15;

    // === CABECERA DE LA TABLA ===
    doc.font('Helvetica-Bold')
       .fontSize(10);

    // Fondo gris para cabecera
    doc.rect(margins.left, currentY - 5, contentWidth, 20)
       .fill('#f0f0f0');

    // Texto de cabecera con posiciones absolutas
    doc.fillColor('black')
       .text('CÓDIGO', columns.codigo.x, currentY, { width: columns.codigo.width, align: 'center' })
       .text('PRODUCTO', columns.producto.x, currentY, { width: columns.producto.width, align: 'left' })
       .text('CANT.', columns.cantidad.x, currentY, { width: columns.cantidad.width, align: 'center' })
       .text('PRECIO/U', columns.precioUnit.x, currentY, { width: columns.precioUnit.width, align: 'right' })
       .text('TOTAL', columns.total.x, currentY, { width: columns.total.width, align: 'right' });

    currentY += 20;

    // === LÍNEA BAJO CABECERA ===
    doc.moveTo(margins.left, currentY)
       .lineTo(pageWidth - margins.right, currentY)
       .stroke();
    
    currentY += 10;

    // === DETALLES DE OPERACIONES ===
    doc.font('Helvetica')
       .fontSize(9);
    
    let totalGeneral = 0;
    let itemCount = 0;

    operaciones.forEach(op => {
      // Verificar si necesitamos nueva página
      if (currentY > 700) {
        doc.addPage();
        currentY = margins.top;
      }

      const totalLinea = op.precioUnitario * op.cantidad;
      totalGeneral += totalLinea;
      itemCount++;

      // Alternar color de fondo para filas
      if (itemCount % 2 === 0) {
        doc.rect(margins.left, currentY - 2, contentWidth, 16)
           .fill('#f9f9f9');
      }

      // Truncar nombre del producto si es muy largo
      const nombreCorto = op.nombre.length > 28 ? 
        op.nombre.substring(0, 25) + '...' : 
        op.nombre;

      // Texto con posiciones absolutas y alineación fija
      doc.fillColor('black')
         .text(op.codigo, columns.codigo.x, currentY, { 
           width: columns.codigo.width, 
           align: 'center' 
         })
         .text(nombreCorto, columns.producto.x, currentY, { 
           width: columns.producto.width, 
           align: 'left' 
         })
         .text(op.cantidad.toString(), columns.cantidad.x, currentY, { 
           width: columns.cantidad.width, 
           align: 'center' 
         })
         .text(`€${op.precioUnitario.toFixed(2)}`, columns.precioUnit.x, currentY, { 
           width: columns.precioUnit.width, 
           align: 'right' 
         })
         .text(`€${totalLinea.toFixed(2)}`, columns.total.x, currentY, { 
           width: columns.total.width, 
           align: 'right' 
         });

      currentY += 16;
    });

    currentY += 10;

    // === LÍNEA ANTES DEL TOTAL ===
    doc.moveTo(margins.left, currentY)
       .lineTo(pageWidth - margins.right, currentY)
       .stroke();
    
    currentY += 15;

    // === TOTAL FINAL ===
    doc.font('Helvetica-Bold')
       .fontSize(14);

    // Fondo para total
    doc.rect(margins.left + 250, currentY - 5, contentWidth - 250, 25)
       .fill('#e8f4f8');

    doc.fillColor('black')
       .text(`TOTAL ${tipo.toUpperCase()}:`, margins.left + 260, currentY)
       .text(`€${totalGeneral.toFixed(2)}`, columns.total.x - 20, currentY, { 
         width: columns.total.width + 20, 
         align: 'right' 
       });

    currentY += 40;

    // === PIE DEL TICKET ===
    doc.font('Helvetica')
       .fontSize(8)
       .fillColor('gray');

    currentY = 750; // Posición fija en la parte inferior

    doc.text('Generado automáticamente por VimenStock', margins.left, currentY, {
      width: contentWidth,
      align: 'center'
    });

    doc.text(`Archivo: ${fileName}`, margins.left, currentY + 12, {
      width: contentWidth,
      align: 'center'
    });

    // Finalizar el PDF
    doc.end();

    // Esperar a que el archivo se escriba completamente
    stream.on('finish', () => {
      logger.info(`Ticket generado: ${fileName}`);
      res.json({ 
        success: true, 
        operacionID,
        fileName,
        filePath: path.relative(__dirname, filePath)
      });
    });

    stream.on('error', (err) => {
      logger.error(`Error escribiendo PDF: ${err}`);
      res.status(500).json({ error: 'Error generando ticket PDF' });
    });

  } catch (error) {
    logger.error(`Error en generar-ticket: ${error}`);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para descargar tickets
app.get("/api/descargar-ticket/:tipo/:fileName", (req, res) => {
  try {
    const { tipo, fileName } = req.params;
    const dirPath = tipo === 'compra' ? compraDir : ventaDir;
    const filePath = path.join(dirPath, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    res.download(filePath, fileName, (err) => {
      if (err) {
        logger.error(`Error descargando archivo: ${err}`);
        res.status(500).json({ error: 'Error descargando ticket' });
      }
    });
  } catch (error) {
    logger.error(`Error en descargar-ticket: ${error}`);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  logger.info(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`\n🚀 Servidor VimenStock iniciado en http://localhost:${PORT}`);
  console.log(`📁 Directorio de datos: ${dataDir}`);
  console.log(`📄 Archivo de datos: ${DATA_FILE}`);
  console.log(`\n✨ Sistema listo para usar\n`);
});