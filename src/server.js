const express = require("express");
const fs = require("fs");
const path = require("path");
const PDFDocument = require('pdfkit');
const winston = require('winston');

const app = express();

const dataDir = path.join(__dirname, '../data');
const logsDir = path.join(__dirname, '../data', 'logs');
const ticketsDir = path.join(__dirname, '../data', 'tickets');
const compraDir = path.join(ticketsDir, 'compra');
const ventaDir = path.join(ticketsDir, 'venta');

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

const DATA_FILE = path.join(__dirname, "../data/data.json");

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

inicializarDataJSON();

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

    const doc = new PDFDocument({ 
      margin: 40,
      size: 'A4',
      bufferPages: true
    });
    
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const pageWidth = 595;
    const margins = {
      left: 40,
      right: 40,
      top: 40,
      bottom: 40
    };
    const contentWidth = pageWidth - margins.left - margins.right;

    const columns = {
      codigo: { x: margins.left, width: 80 },
      producto: { x: margins.left + 85, width: 180 },
      cantidad: { x: margins.left + 270, width: 60 },
      precioUnit: { x: margins.left + 335, width: 70 },
      total: { x: margins.left + 410, width: 80 }
    };

    let currentY = margins.top;

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

    const fechaFormateada = new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    doc.font('Helvetica')
       .fontSize(11);

    doc.text(`Fecha: ${fechaFormateada}`, margins.left, currentY);
    doc.text(`Tipo: ${tipo.toUpperCase()}`, margins.left + 250, currentY);
    
    currentY += 20;
    
    doc.text(`ID Operación: ${operacionID}`, margins.left, currentY, {
      width: contentWidth
    });

    currentY += 30;

    doc.moveTo(margins.left, currentY)
       .lineTo(pageWidth - margins.right, currentY)
       .stroke();
    
    currentY += 15;

    doc.font('Helvetica-Bold')
       .fontSize(10);

    doc.rect(margins.left, currentY - 5, contentWidth, 20)
       .fill('#f0f0f0');

    doc.fillColor('black')
       .text('CÓDIGO', columns.codigo.x, currentY, { width: columns.codigo.width, align: 'center' })
       .text('PRODUCTO', columns.producto.x, currentY, { width: columns.producto.width, align: 'left' })
       .text('CANT.', columns.cantidad.x, currentY, { width: columns.cantidad.width, align: 'center' })
       .text('PRECIO/U', columns.precioUnit.x, currentY, { width: columns.precioUnit.width, align: 'right' })
       .text('TOTAL', columns.total.x, currentY, { width: columns.total.width, align: 'right' });

    currentY += 20;

    doc.moveTo(margins.left, currentY)
       .lineTo(pageWidth - margins.right, currentY)
       .stroke();
    
    currentY += 10;

    doc.font('Helvetica')
       .fontSize(9);
    
    let totalGeneral = 0;
    let itemCount = 0;

    operaciones.forEach(op => {
      if (currentY > 700) {
        doc.addPage();
        currentY = margins.top;
      }

      const totalLinea = op.precioUnitario * op.cantidad;
      totalGeneral += totalLinea;
      itemCount++;

      if (itemCount % 2 === 0) {
        doc.rect(margins.left, currentY - 2, contentWidth, 16)
           .fill('#f9f9f9');
      }

      const nombreCorto = op.nombre.length > 28 ? 
        op.nombre.substring(0, 25) + '...' : 
        op.nombre;

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

    doc.moveTo(margins.left, currentY)
       .lineTo(pageWidth - margins.right, currentY)
       .stroke();
    
    currentY += 15;

    doc.font('Helvetica-Bold')
       .fontSize(14);

    doc.rect(margins.left + 250, currentY - 5, contentWidth - 250, 25)
       .fill('#e8f4f8');

    doc.fillColor('black')
       .text(`TOTAL ${tipo.toUpperCase()}:`, margins.left + 260, currentY)
       .text(`€${totalGeneral.toFixed(2)}`, columns.total.x - 20, currentY, { 
         width: columns.total.width + 20, 
         align: 'right' 
       });

    currentY += 40;

    doc.font('Helvetica')
       .fontSize(8)
       .fillColor('gray');

    currentY = 750;

    doc.text('Generado automáticamente por VimenStock', margins.left, currentY, {
      width: contentWidth,
      align: 'center'
    });

    doc.text(`Archivo: ${fileName}`, margins.left, currentY + 12, {
      width: contentWidth,
      align: 'center'
    });

    doc.end();

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
