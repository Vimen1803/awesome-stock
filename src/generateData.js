const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const categorias = [
  "Alimentación", "Bebidas", "Limpieza", "Tecnología", "Hogar", 
  "Juguetes", "Cosmética", "Ropa", "Deportes", "Otro"
];

const proveedores = [
  "Mercadona", "Carrefour", "El Corte Inglés", "Lidl", "Dia", 
  "Alcampo", "Amazon", "Walmart", "Mediamarkt", "Decathlon"
];

const productos = {};
const historial = [];
const finanzas = [];
const nombres = [
  "Leche", "Pan", "Huevos", "Arroz", "Aceite", "Tomate", "Queso", "Yogur", "Azúcar", "Café",
  "Juguete", "Peluche", "Muñeca", "Futbolín", "Patinete", "Lego", "Pista de carreras",
  "Detergente", "Jabón", "Limpiador", "Esponja", "Cloro", "Shampoo", "Papel higiénico",
  "Smartphone", "Tablet", "Ordenador", "Televisor", "Auriculares", "Cámara", "Reloj inteligente",
  "Silla", "Mesa", "Lámpara", "Alfombra", "Cortina", "Cojín", "Mueble", "Decoración",
  "Crema", "Perfume", "Maquillaje", "Cepillo de dientes", "Pasta de dientes", "Jabón de manos",
];

const startDate = new Date(2024, 0, 1);
const today = new Date(); 

function getRandomDate(start, end) {
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  randomDate.setHours(Math.floor(Math.random() * 24));
  randomDate.setMinutes(Math.floor(Math.random() * 60));
  randomDate.setSeconds(Math.floor(Math.random() * 60));
  randomDate.setMilliseconds(0);
  return randomDate.toISOString();
}

// Obtener el número de productos a generar desde los argumentos de la línea de comandos
const numProductos = process.argv[2] ? parseInt(process.argv[2]) : 20;  // Por defecto 20 productos

for (let i = 1; i <= numProductos; i++) {
  const id = "P" + i.toString().padStart(3, "0");
  const nombreBase = nombres[Math.floor(Math.random() * nombres.length)];
  const nombre = nombreBase + (i > nombres.length ? " " + Math.ceil(i / nombres.length) : "");
  const categoria = categorias[Math.floor(Math.random() * categorias.length)]; // Categoria aleatoria
  const proveedor = proveedores[Math.floor(Math.random() * proveedores.length)]; // Proveedor aleatorio

  productos[id] = {
    nombre,
    categoria,
    proveedor,
    precioCompra: parseFloat((Math.random() * 10 + 0.5).toFixed(2)),
    precioVenta: parseFloat((Math.random() * 20 + 2).toFixed(2)),
    stock: Math.floor(Math.random() * 100),
    ventasTotales: Math.floor(Math.random() * 50),
    balance: 0.00,
    imagen: "",
    fechaAñadido: getRandomDate(startDate, today)
  };

  const numOps = Math.floor(Math.random() * 10) + 5;
  for (let j = 0; j < numOps; j++) {
    const tipo = Math.random() < 0.6 ? "Vendido" : "Comprado";
    const cantidad = Math.floor(Math.random() * 20) + 1;
    const fecha = getRandomDate(startDate, today);

    if (tipo === "Vendido" && productos[id].stock < cantidad) continue;

    const precioUnitario = tipo === "Vendido" ? productos[id].precioVenta : productos[id].precioCompra;
    const precioTotal = precioUnitario * cantidad;

    if (tipo === "Vendido") {
      historial.push({
        fecha,
        accion: tipo,
        productos: [{
          productoID: id,
          productoNombre: productos[id].nombre,
          categoria: productos[id].categoria,
          cantidad,
          precioUnitario,
          precioTotal
        }],
        precioTotalOperacion: precioTotal,
        ticketID: `VENTA-ID-PRUEBA`,
        ticketFile: `ticket_venta_VENTA-ID-PRUEBA.pdf`
      });
    } else {
      historial.push({
        fecha,
        accion: tipo,
        productos: [{
          productoID: id,
          productoNombre: productos[id].nombre,
          categoria: productos[id].categoria,
          cantidad,
          precioUnitario,
          precioTotal
        }],
        precioTotalOperacion: precioTotal,
        ticketID: `COMPRA-ID-PRUEBA`,
        ticketFile: `ticket_compra_COMPRA-ID-PRUEBA.pdf`
      });
    }

    finanzas.push({
      fecha,
      tipo: tipo === "Vendido" ? "ingreso" : "gasto",
      monto: precioTotal,
      categoria,
      productoID: id
    });

    if (tipo === "Vendido") {
      productos[id].stock -= cantidad;
      productos[id].ventasTotales += cantidad;
    } else {
      productos[id].stock += cantidad;
    }
  }
}

const dataCompleta = {
  categorias,
  productos,
  historial,
  finanzas
};

fs.writeFileSync(path.join(dataDir, "data.json"), JSON.stringify(dataCompleta, null, 2));

console.log("data.json generado exitosamente con:");
console.log(`- ${categorias.length} categorías`);
console.log(`- ${Object.keys(productos).length} productos`);
console.log(`- ${historial.length} entradas de historial`);
console.log(`- ${finanzas.length} registros financieros`);
