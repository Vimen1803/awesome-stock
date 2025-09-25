const fs = require("fs");

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

const imagenesPorProducto = {
  "Leche": "https://www.mercadona.es/img/cms/var_prod_1000/03473314.png",
  "Pan": "https://www.mercadona.es/img/cms/var_prod_1000/01294019.png",
  "Huevos": "https://www.mercadona.es/img/cms/var_prod_1000/03473251.png",
  "Arroz": "https://www.mercadona.es/img/cms/var_prod_1000/03473235.png",
  "Aceite": "https://www.mercadona.es/img/cms/var_prod_1000/03090456.png",
  "Tomate": "https://www.mercadona.es/img/cms/var_prod_1000/01137435.png",
  "Queso": "https://www.mercadona.es/img/cms/var_prod_1000/03473321.png",
  "Yogur": "https://www.mercadona.es/img/cms/var_prod_1000/03121384.png",
  "Azúcar": "https://www.mercadona.es/img/cms/var_prod_1000/03090450.png",
  "Café": "https://www.mercadona.es/img/cms/var_prod_1000/03473323.png",
  "Juguete": "https://i.imgur.com/WyDphVo.png",
  "Peluche": "https://i.imgur.com/q4UzwKw.png",
  "Muñeca": "https://i.imgur.com/fPY8Pq7.png",
  "Futbolín": "https://i.imgur.com/mFvL8Rr.png",
  "Patinete": "https://i.imgur.com/q8WkR0h.png",
  "Lego": "https://i.imgur.com/2KNu73O.png",
  "Pista de carreras": "https://i.imgur.com/edS34bb.png",
  "Detergente": "https://i.imgur.com/JXqby8l.png",
  "Jabón": "https://i.imgur.com/MqNk13h.png",
  "Limpiador": "https://i.imgur.com/ROOsRII.png",
  "Esponja": "https://i.imgur.com/Tp6zNdw.png",
  "Cloro": "https://i.imgur.com/L6sUQyx.png",
  "Shampoo": "https://i.imgur.com/Z3Jfb26.png",
  "Papel higiénico": "https://i.imgur.com/Xu9N54M.png",
  "Smartphone": "https://i.imgur.com/g2OnCcm.png",
  "Tablet": "https://i.imgur.com/KtyZZ0m.png",
  "Ordenador": "https://i.imgur.com/uhNKvVz.png",
  "Televisor": "https://i.imgur.com/BWiZEm9.png",
  "Auriculares": "https://i.imgur.com/Vg0gOk1.png",
  "Cámara": "https://i.imgur.com/4mxXa0e.png",
  "Reloj inteligente": "https://i.imgur.com/ez0ptv7.png",
  "Silla": "https://i.imgur.com/tiIVYFE.png",
  "Mesa": "https://i.imgur.com/RoIgg6k.png",
  "Lámpara": "https://i.imgur.com/EbZ1JlP.png",
  "Alfombra": "https://i.imgur.com/AMhAoez.png",
  "Cortina": "https://i.imgur.com/BpvEZ5b.png",
  "Cojín": "https://i.imgur.com/DHjbYOt.png",
  "Mueble": "https://i.imgur.com/NbVq60X.png",
  "Decoración": "https://i.imgur.com/zlbZ6k1.png",
  "Crema": "https://i.imgur.com/Dz1eU6b.png",
  "Perfume": "https://i.imgur.com/WzU3YtQ.png",
  "Maquillaje": "https://i.imgur.com/5YtK9ZX.png",
  "Cepillo de dientes": "https://i.imgur.com/JjU2hhk.png",
  "Pasta de dientes": "https://i.imgur.com/QfG4mYq.png",
  "Jabón de manos": "https://i.imgur.com/xp05eD0.png"
};

const proveedores = [
  "Mercadona", "Carrefour", "El Corte Inglés", "Alcampo", "Lidl", "Dia", "Eroski", "BM Supermercados", 
  "Supercor", "Caprabo", "Ahorramas", "Auchan", "Consum", "Spar", "Supersol", "Acueducto", "Makro", 
  "Primark", "Amazon", "Ebay", "Aliexpress", "Zara", "Decathlon", "MediaMarkt", "Bricor", 
  "Fnac", "Corte Inglés", "Juguetilandia", "Game", "Kiwoko", "Carrefour Home", "Bricomart", "H&M", 
  "Ikea", "Leroy Merlin", "PcComponentes", "El Gato de la Lata", "Bricoventa", "Yoigo", "Telefonica", 
  "Orange", "Vodafone", "Worten", "AliExpress"
];

for(let i = 1; i <= 500; i++){
  const id = "P" + i.toString().padStart(3, "0");
  const nombreBase = nombres[Math.floor(Math.random() * nombres.length)];
  const nombre = nombreBase + " " + i;

  productos[id] = {
    nombre,
    proveedor: proveedores[Math.floor(Math.random() * proveedores.length)],
    precioCompra: parseFloat((Math.random() * 5 + 0.5).toFixed(2)),
    precioVenta: parseFloat((Math.random() * 8 + 1).toFixed(2)),
    stock: 0,
    ventasTotales: 0,
    imagen: imagenesPorProducto[nombreBase] || "https://victormenjon.es/favicon.ico",
    fechaAñadido: new Date(2023, 0, 1 + Math.floor(Math.random() * 1096), 8, 0, 0).toISOString()
  };

  const numOps = Math.floor(Math.random() * 200) + 10;
  for(let j = 0; j < numOps; j++){
    const tipo = Math.random() < 0.5 ? "Vendido" : "Comprado";
    const cantidad = Math.floor(Math.random() * 5) + 1;
    const fecha = new Date(2023, 0, 1 + Math.floor(Math.random() * 1096), 8 + j).toISOString();

    if(tipo === "Vendido" && productos[id].stock < cantidad) continue;

    historial.push({ fecha, accion: tipo, productoID: id, productoNombre: nombre, cantidad });
    finanzas.push({ fecha, tipo: tipo === "Vendido" ? "ingreso" : "gasto", monto: (tipo === "Vendido" ? productos[id].precioVenta : productos[id].precioCompra) * cantidad });

    if(tipo === "Vendido") productos[id].ventasTotales += cantidad;
    if(tipo === "Comprado") productos[id].stock += cantidad;
  }
}

fs.writeFileSync("data.json", JSON.stringify({ productos, historial, finanzas }, null, 2));
console.log("data.json generado con 500 productos, proveedores reales, imágenes y operaciones entre 2023 y 2025");
