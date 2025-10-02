const express = require("express");
const fs = require("fs");
const path = require("path");
const PDFDocument = require('pdfkit');
const winston = require('winston');
const { createCanvas } = require('canvas');
const ExcelJS = require('exceljs');
const { execSync } = require('child_process');
const { getSystemErrorMessage } = require("util");

const app = express();
const PORT = 3000;
const BACKUP_TIME = 12;
const categorias = ["Alimentación", "Bebidas", "Limpieza", "Tecnología", "Hogar", "Juguetes", "Cosmética", "Ropa", "Deportes", "Otro"];

const dataDir = path.join(__dirname, '../data');
const logsDir = path.join(__dirname, '../data', 'logs');
const ticketsDir = path.join(__dirname, '../data', 'tickets');
const compraDir = path.join(ticketsDir, 'compra');
const ventaDir = path.join(ticketsDir, 'venta');
const barcodeDir = path.join(__dirname, '../data', 'bar_code');
const backupDir = path.join(__dirname, '../', 'backups');
const informesDir = path.join(__dirname, '../data', 'informes');
const informesGeneralDir = path.join(informesDir, 'general');
const informesProductosDir = path.join(informesDir, 'productos');
const informesCategoriasDir = path.join(informesDir, 'categorias');

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
createDirectoryIfNotExists(backupDir);
createDirectoryIfNotExists(informesDir);
createDirectoryIfNotExists(informesGeneralDir);
createDirectoryIfNotExists(informesProductosDir);
createDirectoryIfNotExists(informesCategoriasDir);

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
app.use('/bar_code', express.static(barcodeDir));

const DATA_FILE = path.join(__dirname, "../data/data.json");

// ==================== BACKUP AUTOMÁTICO usando CLI ====================
function realizarBackup() {
  try {
    const backupScript = path.join(__dirname, 'backup-cli.js');
    execSync(`node "${backupScript}"`, { stdio: 'inherit' });
    logger.info(`Backup creado en ${backupDir}.`);
  } catch (error) {
    logger.error(`Error ejecutando backup automático: ${error.message}`);
  }
}

setInterval(() => {
  realizarBackup();
}, BACKUP_TIME * 60 * 60 * 1000);

app.post("/api/crear-backup", (req, res) => {
  try {
    const backupScript = path.join(__dirname, 'backup-cli.js');
    execSync(`node "${backupScript}"`, { stdio: 'inherit' });
    res.json({ success: true, message: 'Backup creado correctamente' });
    logger.info(`Backup creado en ${backupDir}.`);
  } catch (error) {
    logger.error(`Error creando backup manual: ${error.message}`);
    res.status(500).json({ error: 'Error creando backup' });
  }
});

// ==================== AÑADIR CATEGORÍA ====================
app.post("/api/agregar-categoria", (req, res) => {
  try {
    const { nombreCategoria } = req.body;

    if (!nombreCategoria || nombreCategoria.trim() === '') {
      return res.status(400).json({ error: 'Nombre de categoría inválido' });
    }

    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    
    if (!data.categorias) {
      data.categorias = [];
    }

    const categoriaLimpia = nombreCategoria.trim();

    if (data.categorias.includes(categoriaLimpia)) {
      return res.status(400).json({ error: 'La categoría ya existe' });
    }

    data.categorias.push(categoriaLimpia);
    
    data.categorias.sort((a, b) => {
      if (a === "Otro") return 1;
      if (b === "Otro") return -1;
      return a.localeCompare(b);
    });

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    logger.info(`Nueva categoría agregada: ${categoriaLimpia}`);

    res.json({ success: true, categoria: categoriaLimpia, categorias: data.categorias });

  } catch (error) {
    logger.error(`Error agregando categoría: ${error}`);
    res.status(500).json({ error: 'Error agregando categoría' });
  }
});

// ==================== INFORMES PERSONALIZADOS (usando CLI) ====================
app.post("/api/generar-informe", async (req, res) => {
  try {
    const { tipo, formato, filtros } = req.body;

    if (formato === 'excel' && tipo !== 'balance') {
      return res.status(400).json({ 
        error: 'El formato Excel solo está disponible para informes de Balance General' 
      });
    }

    const informeScript = path.join(__dirname, 'informes-cli.js');
    let comando = '';
    
    if (tipo === 'balance') {
      comando = `node "${informeScript}" balance ${formato || 'pdf'}`;
    } else if (tipo === 'producto') {
      comando = `node "${informeScript}" producto ${filtros.productoID}`;
    } else if (tipo === 'categoria') {
      comando = `node "${informeScript}" categoria "${filtros.categoria}"`;
    } else {
      logger.info(`Tipo de informe no valido.`);
      return res.status(400).json({ error: 'Tipo de informe no válido' });
    }

    execSync(comando, { stdio: 'inherit' });

    // Obtener el último archivo generado
    let subdirInformes;
    if (tipo === 'balance') {
      subdirInformes = informesGeneralDir;
    } else if (tipo === 'producto') {
      subdirInformes = informesProductosDir;
    } else if (tipo === 'categoria') {
      subdirInformes = informesCategoriasDir;
    }

    const archivos = fs.readdirSync(subdirInformes)
      .filter(f => f.endsWith(formato === 'excel' ? '.xlsx' : '.pdf'))
      .map(f => ({ name: f, time: fs.statSync(path.join(subdirInformes, f)).mtime.getTime() }))
      .sort((a, b) => b.time - a.time);

    if (archivos.length === 0) {
      return res.status(500).json({ error: 'Error generando informe' });
    }

    const fileName = archivos[0].name;
    const filePath = path.join(subdirInformes, fileName);

    logger.info(`Informe generado en ${filePath}`);
    res.json({ success: true, message:"Prueba", fileName, filePath, tipo });

  } catch (error) {
    logger.error(`Error generando el informe. Error: ${getSystemErrorMessage}`);
    res.status(500).json({ error: 'Error generando informe' });
  }
});

// ==================== CÓDIGO DE BARRAS (usando CLI) ====================
app.post("/api/generar-codigo-barras", (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "ID requerido" });
    }

    // Llamar al CLI para que genere el archivo de imagen
    const barcodeCliScript = path.join(__dirname, 'barcode-cli.js');
    const command = `node "${barcodeCliScript}" generate ${id}`;
    
    // Usar stdio: 'inherit' para ver la salida con colores en consola
    execSync(command, { stdio: 'inherit' });

    const filePath = path.join(barcodeDir, `${id}.png`);

    // Comprobar si el archivo fue creado y leerlo
    if (fs.existsSync(filePath)) {
      const imageBuffer = fs.readFileSync(filePath);
      // Convertir la imagen a Data URL para enviarla al cliente
      const imageDataUrl = `data:image/png;base64,${imageBuffer.toString('base64')}`;
      
      res.json({ success: true, id, fileName: `${id}.png`, imageData: imageDataUrl });
    } else {
      throw new Error('El archivo del código de barras no fue creado por el script CLI.');
    }
  } catch (error) {
    logger.error(`Error generando código de barras via CLI: ${error.message}`);
    const errorMessage = error.stderr ? error.stderr.toString() : 'Error generando código de barras';
    res.status(500).json({ error: errorMessage });
  }
});

// ==================== ALERTAS STOCK ====================
app.post("/api/registrar-alerta-stock", (req, res) => {
  try {
    const { productos } = req.body;
    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: "No hay productos para registrar" });
    }

    const stockAlertsFile = path.join(logsDir, 'stock_alerts.txt');
    const ahora = new Date();
    const dia = String(ahora.getDate()).padStart(2, '0');
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const anio = ahora.getFullYear();
    const hora = String(ahora.getHours()).padStart(2, '0');
    const min = String(ahora.getMinutes()).padStart(2, '0');
    const seg = String(ahora.getSeconds()).padStart(2, '0');
    const fechaFormateada = `${dia}/${mes}/${anio} ${hora}:${min}:${seg}`;
    
    const lineas = productos.map(p => `${p.id} - ${p.nombre} - Stock Disponible: ${p.stock} - ${fechaFormateada}`);
    const contenido = lineas.join('\n') + '\n';
    fs.appendFileSync(stockAlertsFile, contenido, 'utf-8');
    
    logger.info(`Alertas de stock bajo registradas: ${productos.length} productos`);
    res.json({ success: true, alertasRegistradas: productos.length, productos: productos.map(p => p.id) });
    
  } catch (error) {
    logger.error(`Error registrando alertas de stock: ${error}`);
    res.status(500).json({ error: 'Error registrando alertas de stock' });
  }
});

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

    const doc = new PDFDocument({ margin: 40, size: 'A4', bufferPages: true });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 40;
    const contentWidth = pageWidth - 2 * margin;

    const columns = {
      codigo: { x: margin, width: 80 },
      producto: { x: margin + 85, width: 180 },
      cantidad: { x: margin + 270, width: 60 },
      precioUnit: { x: margin + 335, width: 70 },
      total: { x: margin + 410, width: 80 }
    };

    let currentY = margin;

    doc.font('Helvetica-Bold').fontSize(20).text('VimenStock', margin, currentY, { width: contentWidth, align: 'center' });
    currentY += 30;
    doc.fontSize(12).text('Sistema de Gestión de Inventario', margin, currentY, { width: contentWidth, align: 'center' });
    currentY += 40;

    const fechaFormateada = new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    doc.font('Helvetica').fontSize(11);
    doc.text(`Fecha: ${fechaFormateada}`, margin, currentY);
    doc.text(`Tipo: ${tipo.toUpperCase()}`, margin + 250, currentY);
    currentY += 20;
    doc.text(`ID Operación: ${operacionID}`, margin, currentY, { width: contentWidth });
    currentY += 30;

    doc.moveTo(margin, currentY).lineTo(pageWidth - margin, currentY).stroke();
    currentY += 15;

    doc.font('Helvetica-Bold').fontSize(10);
    doc.rect(margin, currentY - 5, contentWidth, 20).fill('#f0f0f0');
    doc.fillColor('black')
       .text('CÓDIGO', columns.codigo.x, currentY, { width: columns.codigo.width, align: 'center' })
       .text('PRODUCTO', columns.producto.x, currentY, { width: columns.producto.width, align: 'left' })
       .text('CANT.', columns.cantidad.x, currentY, { width: columns.cantidad.width, align: 'center' })
       .text('PRECIO/U', columns.precioUnit.x, currentY, { width: columns.precioUnit.width, align: 'right' })
       .text('TOTAL', columns.total.x, currentY, { width: columns.total.width, align: 'right' });

    currentY += 20;
    doc.moveTo(margin, currentY).lineTo(pageWidth - margin, currentY).stroke();
    currentY += 10;

    doc.font('Helvetica').fontSize(9);
    
    let totalGeneral = 0;

    operaciones.forEach((op, index) => {
      if (currentY > 700) { doc.addPage(); currentY = margin; }
      const totalLinea = op.precioUnitario * op.cantidad;
      totalGeneral += totalLinea;
      if (index % 2 === 0) { doc.rect(margin, currentY - 2, contentWidth, 16).fill('#f9f9f9'); }
      const nombreCorto = op.nombre.length > 28 ? op.nombre.substring(0, 25) + '...' : op.nombre;
      doc.fillColor('black')
         .text(op.codigo, columns.codigo.x, currentY, { width: columns.codigo.width, align: 'center' })
         .text(nombreCorto, columns.producto.x, currentY, { width: columns.producto.width, align: 'left' })
         .text(op.cantidad.toString(), columns.cantidad.x, currentY, { width: columns.cantidad.width, align: 'center' })
         .text(`€${op.precioUnitario.toFixed(2)}`, columns.precioUnit.x, currentY, { width: columns.precioUnit.width, align: 'right' })
         .text(`€${totalLinea.toFixed(2)}`, columns.total.x, currentY, { width: columns.total.width, align: 'right' });
      currentY += 16;
    });

    currentY += 10;
    doc.moveTo(margin, currentY).lineTo(pageWidth - margin, currentY).stroke();
    currentY += 15;

    doc.font('Helvetica-Bold').fontSize(14);
    doc.rect(margin + 250, currentY - 5, contentWidth - 250, 25).fill('#e8f4f8');
    doc.fillColor('black')
       .text(`TOTAL ${tipo.toUpperCase()}:`, margin + 260, currentY)
       .text(`€${totalGeneral.toFixed(2)}`, columns.total.x - 20, currentY, { width: columns.total.width + 20, align: 'right' });

    doc.end();

    stream.on('finish', () => {
      logger.info(`Ticket generado: ${fileName}`);
      res.json({ success: true, operacionID, fileName, filePath: path.relative(__dirname, filePath) });
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

function inicializarDataJSON() {
  if (!fs.existsSync(DATA_FILE)) {
    
    categorias.sort((a, b) => {
      if (a === "Otro") return 1;
      if (b === "Otro") return -1;
      return a.localeCompare(b);
    });
    
    const dataInicial = {
      categorias: categorias,
      productos: {}, 
      historial: [], 
      finanzas: [], 
      ultimaIDUsada: 0
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataInicial, null, 2), 'utf-8');
    logger.info('Archivo data.json creado');
  }
}

inicializarDataJSON();

app.listen(PORT, () => {
  logger.info(`Servidor corriendo en http://localhost:${PORT}`);
  
  const c = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    gray: '\x1b[90m'
  };

  console.log(`\n${c.cyan}${c.bright}╔═══════════════════════════════════════════════════════════════════════╗${c.reset}`);
  console.log(`${c.cyan}${c.bright}║                    🚀 VIMENSTOCK SERVER INICIADO                      ║${c.reset}`);
  console.log(`${c.cyan}${c.bright}╚═══════════════════════════════════════════════════════════════════════╝${c.reset}\n`);

  console.log(`${c.green}${c.bright}🌐 SERVIDOR${c.reset}`);
  console.log(`${c.gray}   └─${c.reset} ${c.cyan}http://localhost:${PORT}${c.reset}\n`);

  console.log(`${c.green}${c.bright}📁 DIRECTORIOS${c.reset}`);
  console.log(`${c.gray}   ├─${c.reset} Datos:          ${c.yellow}${dataDir}${c.reset}`);
  console.log(`${c.gray}   ├─${c.reset} Logs:           ${c.yellow}${logsDir}${c.reset}`);
  console.log(`${c.gray}   ├─${c.reset} Tickets:        ${c.yellow}${ticketsDir}${c.reset}`);
  console.log(`${c.gray}   ├─${c.reset} Informes:       ${c.yellow}${informesDir}${c.reset}`);
  console.log(`${c.gray}   └─${c.reset} Códigos Barras: ${c.yellow}${barcodeDir}${c.reset}\n`);

  console.log(`${c.green}${c.bright}⚙️  CONFIGURACIÓN${c.reset}`);
  console.log(`${c.gray}   ├─${c.reset} Archivo datos:  ${c.magenta}${DATA_FILE}${c.reset}`);
  console.log(`${c.gray}   ├─${c.reset} Backups auto:   ${c.blue}cada ${BACKUP_TIME} horas${c.reset}`);
  console.log(`${c.gray}   └─${c.reset} Informes CLI:   ${c.blue}disponibles${c.reset}\n`);

  console.log(`${c.green}${c.bright}✨ Sistema listo para usar${c.reset}`);
  console.log(`${c.gray}   Ejecuta ${c.cyan}npm run help${c.reset}${c.gray} para ver todos los comandos disponibles${c.reset}\n`);
  
  realizarBackup();
});