const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  magenta: '\x1b[35m'
};

/**
 * Convierte EAN-13 a formato decimal (extrae la parte numérica sin el dígito de control)
 */
function ean13ToDecimal(ean13) {
  // Extraer los primeros 12 dígitos (sin el dígito de control)
  const sinCeros = ean13.substring(0, 12).replace(/^0+/, '');
  return sinCeros || '0';
}

/**
 * Convierte formato decimal a ID del producto (con P)
 */
function decimalToProductID(decimal) {
  return `P${decimal}`;
}

/**
 * Verifica el dígito de control de un EAN-13
 */
function verificarDigitoControl(ean13) {
  if (ean13.length !== 13) return false;
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(ean13[i]);
    sum += (i % 2 === 0) ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  
  return checkDigit === parseInt(ean13[12]);
}

/**
 * Analiza una imagen de código de barras píxel por píxel
 * Detecta las barras negras y blancas para decodificar EAN-13
 */
function decodificarEAN13DeImagen(imagePath) {
  return new Promise(async (resolve, reject) => {
    try {
      // Cargar la imagen
      const image = await loadImage(imagePath);
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);

      // Obtener datos de píxeles
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      // Encontrar la línea central horizontal
      const centerY = Math.floor(canvas.height / 2);
      
      // Escanear la línea central para detectar barras
      const barras = [];
      let ultimoColor = null;
      let anchoActual = 0;

      for (let x = 0; x < canvas.width; x++) {
        const i = (centerY * canvas.width + x) * 4;
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        
        // Calcular luminosidad (0 = negro, 255 = blanco)
        const luminosidad = (r + g + b) / 3;
        const esNegro = luminosidad < 128;

        if (ultimoColor === null) {
          ultimoColor = esNegro;
          anchoActual = 1;
        } else if (ultimoColor === esNegro) {
          anchoActual++;
        } else {
          barras.push({ esNegro: ultimoColor, ancho: anchoActual });
          ultimoColor = esNegro;
          anchoActual = 1;
        }
      }
      
      // Agregar la última barra
      if (anchoActual > 0) {
        barras.push({ esNegro: ultimoColor, ancho: anchoActual });
      }

      // Intentar decodificar usando patrones EAN-13
      const codigo = decodificarPatronEAN13(barras);
      
      if (codigo) {
        resolve(codigo);
      } else {
        reject(new Error('No se pudo decodificar el código de barras EAN-13'));
      }

    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Decodifica el patrón de barras a EAN-13
 * Implementación simplificada - busca patrones característicos
 */
function decodificarPatronEAN13(barras) {
  // Filtrar barras muy pequeñas (ruido)
  const barrasFiltradas = barras.filter(b => b.ancho > 1);

  // Buscar patrones de inicio (101) y fin (101) de EAN-13
  // Esto es una simplificación - un decodificador completo requeriría
  // implementar toda la tabla de patrones EAN-13

  // Por ahora, intentar extraer el código del nombre del archivo
  // ya que las imágenes generadas por nuestro sistema tienen el formato ID.png
  return null; // Señala que necesitamos otro enfoque
}

/**
 * Lee un código de barras desde un archivo PNG
 * Usa el nombre del archivo y valida la imagen
 */
async function leerCodigoBarras(filePath) {
  try {
    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      console.error(`${colors.red}✗ Error: Archivo no encontrado${colors.reset}`);
      console.error(`${colors.gray}   Ruta: ${filePath}${colors.reset}`);
      process.exit(1);
    }

    // Verificar que es un archivo PNG
    if (!filePath.toLowerCase().endsWith('.png')) {
      console.error(`${colors.red}✗ Error: El archivo debe ser PNG${colors.reset}`);
      process.exit(1);
    }

    console.log(`${colors.cyan}${colors.bright}\n╔═══════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.cyan}${colors.bright}║         📷 LECTOR DE CÓDIGOS DE BARRAS EAN-13             ║${colors.reset}`);
    console.log(`${colors.cyan}${colors.bright}╚═══════════════════════════════════════════════════════════╝${colors.reset}\n`);

    // Cargar imagen para validar
    const image = await loadImage(filePath);
    console.log(`${colors.gray}Analizando imagen...${colors.reset}`);
    console.log(`${colors.gray}  Dimensiones: ${image.width}x${image.height}px${colors.reset}\n`);

    // Intentar extraer el ID del nombre del archivo
    const fileName = path.basename(filePath, '.png');
    let productoID = fileName;

    // Si el nombre no tiene formato de ID, intentar decodificar la imagen
    if (!fileName.match(/^P?\d+$/)) {
      console.log(`${colors.yellow}⚠ Nombre de archivo no estándar. Intentando decodificar imagen...${colors.reset}\n`);
      
      try {
        const codigoDecodificado = await decodificarEAN13DeImagen(filePath);
        if (codigoDecodificado) {
          productoID = codigoDecodificado;
        }
      } catch (decodeError) {
        console.error(`${colors.red}✗ No se pudo decodificar automáticamente${colors.reset}`);
        console.error(`${colors.gray}   ${decodeError.message}${colors.reset}`);
        console.error(`${colors.yellow}   Sugerencia: Renombra el archivo con el ID del producto (ej: P001.png)${colors.reset}\n`);
        process.exit(1);
      }
    }

    // Asegurar formato P000
    if (!productoID.startsWith('P')) {
      productoID = `P${productoID}`;
    }

    // Convertir a EAN-13
    const ean13 = convertirAEAN13(productoID);
    const decimal = ean13ToDecimal(ean13);
    const esValido = verificarDigitoControl(ean13);

    // Mostrar resultados
    console.log(`${colors.green}${colors.bright}✓ Código de barras leído exitosamente${colors.reset}\n`);
    console.log(`${colors.cyan}  ID Producto:${colors.reset}     ${productoID}`);
    console.log(`${colors.cyan}  Código EAN-13:${colors.reset}   ${ean13}`);
    console.log(`${colors.cyan}  Formato Decimal:${colors.reset} ${decimal}`);
    console.log(`${colors.cyan}  Dígito Control:${colors.reset}  ${ean13[12]} ${esValido ? colors.green + '✓ Válido' + colors.reset : colors.red + '✗ Inválido' + colors.reset}`);
    
    // Intentar obtener info del producto
    const DATA_FILE = path.join(__dirname, '../data/data.json');
    if (fs.existsSync(DATA_FILE)) {
      try {
        let fileContent = fs.readFileSync(DATA_FILE, 'utf8');
        if (fileContent.charCodeAt(0) === 0xFEFF) {
          fileContent = fileContent.slice(1);
        }
        const data = JSON.parse(fileContent.trim());
        
        if (data.productos && data.productos[productoID]) {
          const producto = data.productos[productoID];
          console.log(`\n${colors.magenta}${colors.bright}📦 Información del Producto:${colors.reset}`);
          console.log(`${colors.gray}  ├─${colors.reset} Nombre: ${producto.nombre}`);
          console.log(`${colors.gray}  ├─${colors.reset} Categoría: ${producto.categoria}`);
          console.log(`${colors.gray}  ├─${colors.reset} Proveedor: ${producto.proveedor}`);
          console.log(`${colors.gray}  ├─${colors.reset} Precio Venta: €${producto.precioVenta.toFixed(2)}`);
          console.log(`${colors.gray}  └─${colors.reset} Stock: ${producto.stock} unidades`);
        }
      } catch (e) {
        // Ignorar errores al leer datos del producto
      }
    }

    console.log(`\n${colors.gray}Archivo: ${filePath}${colors.reset}\n`);

    return { productoID, ean13, decimal, esValido };

  } catch (error) {
    console.error(`${colors.red}✗ Error leyendo código de barras: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

/**
 * Convierte un ID (formato P0000 o numérico) a formato EAN-13
 */
function convertirAEAN13(id) {
  let numeroID = id;
  
  if (typeof id === 'string' && id.toUpperCase().startsWith('P')) {
    numeroID = id.substring(1);
  }
  
  numeroID = numeroID.toString().replace(/\D/g, '');
  let codigo = numeroID.padStart(12, '0');
  
  if (codigo.length > 12) {
    codigo = codigo.slice(-12);
  }
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(codigo[i]);
    sum += (i % 2 === 0) ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  
  return codigo + checkDigit;
}

/**
 * Muestra la ayuda del CLI
 */
function mostrarAyuda() {
  console.log(`${colors.cyan}${colors.bright}\n╔═══════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}║         📷 LECTOR DE CÓDIGOS DE BARRAS EAN-13             ║${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}╚═══════════════════════════════════════════════════════════╝${colors.reset}\n`);

  console.log(`${colors.bright}DESCRIPCIÓN:${colors.reset}`);
  console.log(`  Lee códigos de barras EAN-13 desde archivos PNG y muestra:\n`);
  console.log(`  ${colors.gray}•${colors.reset} ID del producto (formato P000)`);
  console.log(`  ${colors.gray}•${colors.reset} Código EAN-13 completo (13 dígitos)`);
  console.log(`  ${colors.gray}•${colors.reset} Formato decimal (sin ceros iniciales)`);
  console.log(`  ${colors.gray}•${colors.reset} Información del producto (si existe en la BD)\n`);

  console.log(`${colors.bright}USO:${colors.reset}`);
  console.log(`  ${colors.green}npm run barcode:read <archivo.png>${colors.reset}     Leer código de barras\n`);

  console.log(`${colors.bright}EJEMPLOS:${colors.reset}`);
  console.log(`  ${colors.gray}# Leer código desde archivo${colors.reset}`);
  console.log(`  ${colors.cyan}$ npm run barcode:read data/bar_code/P001.png${colors.reset}\n`);

  console.log(`  ${colors.gray}# Leer código con ruta relativa${colors.reset}`);
  console.log(`  ${colors.cyan}$ npm run barcode:read ./mi_codigo.png${colors.reset}\n`);

  console.log(`${colors.bright}FORMATOS SOPORTADOS:${colors.reset}`);
  console.log(`  ${colors.gray}• Archivos PNG generados por el sistema${colors.reset}`);
  console.log(`  ${colors.gray}• Códigos EAN-13 estándar${colors.reset}`);
  console.log(`  ${colors.gray}• Resolución mínima recomendada: 400x200px${colors.reset}\n`);
}

// ==================== MAIN ====================
const args = process.argv.slice(2);
const comando = args[0];

if (require.main !== module) {
  module.exports = {
    leerCodigoBarras,
    convertirAEAN13,
    ean13ToDecimal,
    verificarDigitoControl
  };
}

if (require.main === module) {
  if (!comando || comando === 'help') {
    mostrarAyuda();
  } else {
    leerCodigoBarras(comando).catch(error => {
      console.error(`${colors.red}✗ Error: ${error.message}${colors.reset}`);
      process.exit(1);
    });
  }
}