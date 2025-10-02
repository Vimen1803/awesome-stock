const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');
const JsBarcode = require('jsbarcode');

// Directorios
const barcodeDir = path.join(__dirname, '../data', 'bar_code');
const DATA_FILE = path.join(__dirname, '../data/data.json');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

// Asegurar que el directorio existe
if (!fs.existsSync(barcodeDir)) {
  fs.mkdirSync(barcodeDir, { recursive: true });
}

/**
 * Convierte un ID (formato P0000 o numérico) a formato EAN-13
 * EAN-13 requiere exactamente 13 dígitos
 */
function convertirAEAN13(id) {
  let numeroID = id;
  
  // Si el ID empieza con 'P' (formato P0000), extraer solo la parte numérica
  if (typeof id === 'string' && id.toUpperCase().startsWith('P')) {
    numeroID = id.substring(1);
  }
  
  // Convertir a string y asegurar que sea numérico
  numeroID = numeroID.toString().replace(/\D/g, '');
  
  // Rellenar con ceros a la izquierda (12 dígitos)
  let codigo = numeroID.padStart(12, '0');
  
  // Si el ID es mayor de 12 dígitos, tomar solo los últimos 12
  if (codigo.length > 12) {
    codigo = codigo.slice(-12);
  }
  
  // Calcular dígito de control EAN-13
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(codigo[i]);
    sum += (i % 2 === 0) ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  
  return codigo + checkDigit;
}

/**
 * Genera un código de barras EAN-13 para un producto
 */
function generarCodigoBarras(productoID, silencioso = false) {
  try {
    // Verificar que el archivo existe
    if (!fs.existsSync(DATA_FILE)) {
      const mensaje = `Error: Archivo de datos no encontrado\n   Ruta esperada: ${DATA_FILE}`;
      if (!silencioso) {
        console.error(`${colors.red}✗ ${mensaje}${colors.reset}`);
      }
      throw new Error(mensaje);
    }

    // Leer y validar el archivo JSON
    let fileContent;
    try {
      fileContent = fs.readFileSync(DATA_FILE, 'utf8');
    } catch (readError) {
      const mensaje = `Error leyendo archivo: ${readError.message}`;
      if (!silencioso) {
        console.error(`${colors.red}✗ ${mensaje}${colors.reset}`);
      }
      throw new Error(mensaje);
    }

    // Eliminar BOM si existe (problema común en Windows)
    if (fileContent.charCodeAt(0) === 0xFEFF) {
      fileContent = fileContent.slice(1);
    }
    
    fileContent = fileContent.trim();
    
    if (!fileContent) {
      const mensaje = `Error: El archivo data.json está vacío\n   Inicia el servidor primero para inicializar los datos`;
      if (!silencioso) {
        console.error(`${colors.red}✗ ${mensaje}${colors.reset}`);
      }
      throw new Error(mensaje);
    }

    let data;
    try {
      data = JSON.parse(fileContent);
    } catch (parseError) {
      const mensaje = `Error: El archivo data.json está corrupto\n   ${parseError.message}\n   Posición del error: ${parseError.message.match(/position (\d+)/)?.[1] || 'desconocida'}`;
      if (!silencioso) {
        console.error(`${colors.red}✗ ${mensaje}${colors.reset}`);
      }
      throw new Error(mensaje);
    }

    // Verificar estructura de datos
    if (!data.productos) {
      const mensaje = `Error: Estructura de datos inválida (falta 'productos')`;
      if (!silencioso) {
        console.error(`${colors.red}✗ ${mensaje}${colors.reset}`);
      }
      throw new Error(mensaje);
    }

    const producto = data.productos[productoID];

    if (!producto) {
      const mensaje = `Error: Producto con ID ${productoID} no encontrado\n   IDs disponibles: ${Object.keys(data.productos).join(', ') || 'ninguno'}`;
      if (!silencioso) {
        console.error(`${colors.red}✗ ${mensaje}${colors.reset}`);
      }
      throw new Error(mensaje);
    }

    // Convertir ID a EAN-13
    const codigoEAN13 = convertirAEAN13(productoID);

    // Crear canvas con dimensiones óptimas para EAN-13
    // Tamaño recomendado: ancho mínimo 37.29mm (140px a 96dpi, 300px a 300dpi)
    const canvas = createCanvas(400, 200);
    
    // Generar código de barras usando JsBarcode
    JsBarcode(canvas, codigoEAN13, {
      format: 'EAN13',
      width: 3,              // Ancho de cada barra (mayor = mejor calidad)
      height: 120,           // Altura de las barras
      displayValue: true,    // Mostrar el número debajo
      fontSize: 20,          // Tamaño de la fuente
      margin: 15,            // Margen alrededor del código
      background: '#ffffff', // Fondo blanco
      lineColor: '#000000'   // Barras negras
    });

    // Guardar como PNG de alta calidad
    const fileName = `${productoID}.png`;
    const filePath = path.join(barcodeDir, fileName);
    const buffer = canvas.toBuffer('image/png', { compressionLevel: 3, filters: canvas.PNG_FILTER_NONE });
    fs.writeFileSync(filePath, buffer);

    if (!silencioso) {
      console.log(`${colors.green}✓ Código de barras generado exitosamente${colors.reset}`);
      console.log(`${colors.cyan}  Producto:${colors.reset} ${producto.nombre}`);
      console.log(`${colors.cyan}  ID:${colors.reset} ${productoID}`);
      console.log(`${colors.cyan}  Código EAN-13:${colors.reset} ${codigoEAN13}`);
      console.log(`${colors.cyan}  Archivo:${colors.reset} ${fileName}`);
      console.log(`${colors.cyan}  Ruta:${colors.reset} ${filePath}`);
      console.log(`${colors.gray}  Formato: EAN-13 | Resolución: 400x200px | Calidad: Alta${colors.reset}\n`);
    }

    return { success: true, fileName, filePath, ean13: codigoEAN13, producto };

  } catch (error) {
    if (!silencioso) {
      console.error(`${colors.red}✗ Error generando código de barras: ${error.message}${colors.reset}`);
    }
    throw error;
  }
}

/**
 * Lista todos los códigos de barras generados
 */
function listarCodigosBarras() {
  try {
    const archivos = fs.readdirSync(barcodeDir).filter(f => f.endsWith('.png'));

    if (archivos.length === 0) {
      console.log(`${colors.yellow}⚠ No hay códigos de barras generados${colors.reset}\n`);
      return;
    }

    console.log(`${colors.cyan}${colors.bright}\n╔═══════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.cyan}${colors.bright}║         📊 CÓDIGOS DE BARRAS GENERADOS                    ║${colors.reset}`);
    console.log(`${colors.cyan}${colors.bright}╚═══════════════════════════════════════════════════════════╝${colors.reset}\n`);

    console.log(`${colors.bright}Total: ${archivos.length} archivo(s)${colors.reset}\n`);

    // Intentar cargar datos del producto si existe
    let data = null;
    if (fs.existsSync(DATA_FILE)) {
      try {
        let fileContent = fs.readFileSync(DATA_FILE, 'utf8');
        // Eliminar BOM si existe
        if (fileContent.charCodeAt(0) === 0xFEFF) {
          fileContent = fileContent.slice(1);
        }
        fileContent = fileContent.trim();
        if (fileContent) {
          data = JSON.parse(fileContent);
        }
      } catch (e) {
        // Si hay error leyendo, continuar sin datos de productos
      }
    }

    archivos.forEach((archivo, index) => {
      const productoID = path.basename(archivo, '.png');
      const filePath = path.join(barcodeDir, archivo);
      const stats = fs.statSync(filePath);
      const fechaCreacion = stats.mtime.toLocaleString('es-ES');
      const tamano = (stats.size / 1024).toFixed(2);
      const producto = data && data.productos ? data.productos[productoID] : null;
      const codigoEAN13 = convertirAEAN13(productoID);

      console.log(`${colors.cyan}${index + 1}.${colors.reset} ${colors.bright}${archivo}${colors.reset}`);
      console.log(`   ${colors.gray}├─${colors.reset} ID Producto: ${productoID}`);
      console.log(`   ${colors.gray}├─${colors.reset} Nombre: ${producto ? producto.nombre : 'N/A'}`);
      console.log(`   ${colors.gray}├─${colors.reset} EAN-13: ${codigoEAN13}`);
      console.log(`   ${colors.gray}├─${colors.reset} Tamaño: ${tamano} KB`);
      console.log(`   ${colors.gray}└─${colors.reset} Creado: ${fechaCreacion}\n`);
    });

  } catch (error) {
    console.error(`${colors.red}✗ Error listando códigos de barras: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

/**
 * Elimina uno o todos los códigos de barras
 */
function eliminarCodigosBarras(identificador) {
  try {
    if (identificador === 'all') {
      const archivos = fs.readdirSync(barcodeDir).filter(f => f.endsWith('.png'));
      
      if (archivos.length === 0) {
        console.log(`${colors.yellow}⚠ No hay códigos de barras para eliminar${colors.reset}\n`);
        return;
      }

      archivos.forEach(archivo => {
        fs.unlinkSync(path.join(barcodeDir, archivo));
      });

      console.log(`${colors.green}✓ ${archivos.length} código(s) de barras eliminado(s)${colors.reset}\n`);

    } else {
      const fileName = `${identificador}.png`;
      const filePath = path.join(barcodeDir, fileName);

      if (!fs.existsSync(filePath)) {
        console.error(`${colors.red}✗ Error: Código de barras no encontrado para ID ${identificador}${colors.reset}\n`);
        process.exit(1);
      }

      fs.unlinkSync(filePath);
      console.log(`${colors.green}✓ Código de barras eliminado: ${fileName}${colors.reset}\n`);
    }

  } catch (error) {
    console.error(`${colors.red}✗ Error eliminando código(s) de barras: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

/**
 * Muestra la ayuda del CLI
 */
function mostrarAyuda() {
  console.log(`${colors.cyan}${colors.bright}\n╔═══════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}║         ▌│█║▌│║▌│█ CÓDIGOS DE BARRAS EAN-13              ║${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}╚═══════════════════════════════════════════════════════════╝${colors.reset}\n`);

  console.log(`${colors.bright}DESCRIPCIÓN:${colors.reset}`);
  console.log(`  Herramienta CLI para generar, listar y eliminar códigos de barras EAN-13.\n`);

  console.log(`${colors.bright}USO:${colors.reset}`);
  console.log(`  ${colors.green}npm run barcode:generate <ID>${colors.reset}     Generar código de barras para un producto`);
  console.log(`  ${colors.green}npm run barcode:list${colors.reset}              Listar todos los códigos generados`);
  console.log(`  ${colors.green}npm run barcode:delete <ID|all>${colors.reset}   Eliminar código(s) de barras`);
  console.log(`  ${colors.green}npm run barcode:help${colors.reset}              Mostrar esta ayuda\n`);

  console.log(`${colors.bright}EJEMPLOS:${colors.reset}`);
  console.log(`  ${colors.gray}# Generar código para producto ID 42${colors.reset}`);
  console.log(`  ${colors.cyan}$ npm run barcode:generate 42${colors.reset}\n`);

  console.log(`  ${colors.gray}# Listar todos los códigos generados${colors.reset}`);
  console.log(`  ${colors.cyan}$ npm run barcode:list${colors.reset}\n`);

  console.log(`  ${colors.gray}# Eliminar código del producto ID 42${colors.reset}`);
  console.log(`  ${colors.cyan}$ npm run barcode:delete 42${colors.reset}\n`);

  console.log(`  ${colors.gray}# Eliminar todos los códigos${colors.reset}`);
  console.log(`  ${colors.cyan}$ npm run barcode:delete all${colors.reset}\n`);

  console.log(`${colors.bright}FORMATO EAN-13:${colors.reset}`);
  console.log(`  ${colors.gray}• Estándar internacional de código de barras${colors.reset}`);
  console.log(`  ${colors.gray}• 13 dígitos (12 + 1 dígito de control)${colors.reset}`);
  console.log(`  ${colors.gray}• Alta calidad de impresión (400x200px)${colors.reset}`);
  console.log(`  ${colors.gray}• Compatible con lectores estándar${colors.reset}\n`);

  console.log(`${colors.bright}UBICACIÓN:${colors.reset}`);
  console.log(`  ${colors.gray}Archivos guardados en:${colors.reset} ${barcodeDir}\n`);
}

// ==================== MAIN ====================
// Exportar funciones para uso como módulo
module.exports = {
  generarCodigoBarras,
  convertirAEAN13,
  listarCodigosBarras,
  eliminarCodigosBarras,
  colors
};

// Solo ejecutar CLI si se llama directamente (no como require)
if (require.main === module) {
  const args = process.argv.slice(2);
  const comando = args[0];
  const parametro = args[1];

  switch (comando) {
    case 'generate':
      if (!parametro) {
        console.error(`${colors.red}✗ Error: Debe especificar un ID de producto${colors.reset}`);
        console.log(`${colors.yellow}Uso: npm run barcode:generate <ID>${colors.reset}\n`);
        process.exit(1);
      }
      try {
        generarCodigoBarras(parametro, false);
      } catch (error) {
        process.exit(1);
      }
      break;

    case 'list':
      listarCodigosBarras();
      break;

    case 'delete':
      if (!parametro) {
        console.error(`${colors.red}✗ Error: Debe especificar un ID o 'all'${colors.reset}`);
        console.log(`${colors.yellow}Uso: npm run barcode:delete <ID|all>${colors.reset}\n`);
        process.exit(1);
      }
      eliminarCodigosBarras(parametro);
      break;

    case 'help':
    default:
      mostrarAyuda();
      break;
  }
}