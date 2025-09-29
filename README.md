# VimenStock

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)

Sistema de gestión de inventario con generación automática de tickets PDF, análisis financiero y seguimiento completo de operaciones.

## 📋 Características

* **Gestión de Productos**: Añadir, editar y eliminar productos con información detallada
* **Control de Inventario**: Registro de compras y ventas con actualización automática de stock
* **Tickets PDF**: Generación automática de tickets para cada operación
* **Historial Completo**: Seguimiento detallado de todas las operaciones
* **Análisis Financiero**: Visualización de ingresos, gastos y beneficios con gráficos
* **Categorización**: Organización de productos por categorías personalizables
* **Filtros Avanzados**: Búsqueda y filtrado por múltiples criterios
* **Modo Oscuro**: Interfaz adaptable para mayor comodidad visual
* **Sistema de Logs**: Registro de operaciones con Winston

## 📸 Capturas de pantalla

### Gestión de Productos
![Pantalla de productos](docs/screenshots/productos.png)
*Vista principal con tabla de productos, filtros y controles de compra/venta*

### Historial de Operaciones
![Pantalla de historial](docs/screenshots/historial.png)
*Seguimiento completo de operaciones con filtros avanzados y descarga de tickets*

### Análisis Financiero
![Pantalla de finanzas](docs/screenshots/finanzas.png)
*Gráficos de ingresos vs gastos con calendario y filtros por período*

## 🚀 Instalación

### Requisitos previos

* Node.js (v14 o superior)
* npm (v6 o superior)

### Pasos de instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/tu-usuario/vimenstock.git
cd vimenstock
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Generar datos de prueba (opcional)**

```bash
npm run data
```

4. **Iniciar el servidor**

```bash
npm start
```

Para desarrollo con recarga automática:

```bash
npm run dev
```

5. **Acceder a la aplicación** Abrir el navegador en `http://localhost:3000`

## 📁 Estructura del proyecto

```
vimenstock/
├── data/
│   ├── data.json           # Base de datos JSON
│   ├── logs/              # Archivos de registro
│   └── tickets/           # Tickets PDF generados
│       ├── compra/        # Tickets de compra
│       └── venta/         # Tickets de venta
│
├── public/
│   ├── index.html         # Página de productos
│   ├── historial.html     # Página de historial
│   ├── finanzas.html      # Página de finanzas
│   └── style.css          # Estilos principales
│
├── src/
│   ├── server.js          # Servidor Express
│   ├── generateData.js    # Generador de datos de prueba
│   └── *.js               # Módulos del servidor
│
├── .gitignore
├── LICENSE
├── README.md
├── package-lock.json
└── package.json
```

## 🎯 Uso

### Gestión de Productos

1. **Añadir producto**: Clic en "▼ AÑADIR PRODUCTO ▼" y completar el formulario
2. **Editar producto**: Botón "Editar" en la tabla de productos
3. **Eliminar producto**: Botón "Eliminar" en la tabla de productos
4. **Ver historial**: Botón "Historial" para ver movimientos del producto

### Operaciones de Compra/Venta

1. **Comprar**:
   * Clic en "▼ COMPRAR ▼"
   * Añadir filas con código de producto y cantidad
   * Confirmar compra
2. **Vender**:
   * Clic en "▼ VENDER ▼"
   * Añadir filas con código de producto y cantidad
   * Confirmar venta

### Historial

* **Filtros disponibles**:
  * Por tipo de operación (Comprado, Vendido, Editado, etc.)
  * Por categoría
  * Por fecha (exacta o rango)
  * Por ID de producto o ticket
* **Descargar tickets**: Clic en el ID del ticket (texto azul subrayado)

### Análisis Financiero

* **Períodos**: Diario, semanal, mensual, anual o siempre
* **Filtros**: Por categoría o ID de producto
* **Calendario**: Selección visual de fechas
* **Gráfico**: Visualización de ingresos vs gastos

## 💡 Ejemplos de uso

### Caso 1: Tienda de barrio
Gestiona el inventario de productos de consumo diario, controla compras a proveedores y ventas a clientes con tickets automáticos.

### Caso 2: Almacén familiar
Lleva registro de productos del hogar, fechas de compra y consumo, con control de gastos.

### Caso 3: Pequeño negocio online
Control de stock en tiempo real, generación de tickets para envíos y análisis detallado de ventas por categoría.

## 🛠️ Tecnologías utilizadas

### Backend

* **Express.js**: Framework web
* **PDFKit**: Generación de tickets PDF
* **Winston**: Sistema de logs
* **Node.js**: Entorno de ejecución

### Frontend

* **HTML5/CSS3**: Estructura y estilos
* **JavaScript (ES6+)**: Lógica del cliente
* **Chart.js**: Gráficos financieros
* **Flatpickr**: Selector de fechas

## 📊 Categorías

### Categorías predefinidas

El sistema incluye 10 categorías por defecto que se crean automáticamente al iniciar el servidor:

* Alimentación
* Bebidas
* Limpieza
* Tecnología
* Hogar
* Juguetes
* Cosmética
* Ropa
* Deportes
* Otro

### Cómo editar las categorías

Hay dos formas de personalizar las categorías según tus necesidades:

#### Opción 1: Antes del primer inicio (Recomendado)

Si aún no has iniciado el servidor, puedes editar las categorías directamente en el código:

1. Abrir el archivo `src/server.js`
2. Buscar la función `inicializarDataJSON()`
3. Modificar el array de `categorias`:

```javascript
const dataInicial = {
  categorias: [
    "Tu Categoría 1",
    "Tu Categoría 2",
    "Tu Categoría 3",
    // ... añade las que necesites
  ],
  productos: {},
  historial: [],
  finanzas: [],
  ultimaIDUsada: 0
};
```

4. Guardar el archivo y ejecutar `npm start`

#### Opción 2: Después del primer inicio

Si ya has iniciado el servidor y existe el archivo `data.json`:

1. **Detener el servidor** (Ctrl + C)
2. Abrir el archivo `data/data.json`
3. Modificar el array de `categorias`:

```json
{
  "categorias": [
    "Electrónica",
    "Muebles",
    "Decoración",
    "Accesorios"
  ],
  "productos": { ... },
  "historial": [ ... ],
  "finanzas": [ ... ]
}
```

4. Guardar el archivo
5. Reiniciar el servidor con `npm start`

### Consideraciones importantes

⚠️ **Advertencias al modificar categorías:**

* **Productos existentes**: Los productos ya creados mantendrán su categoría asignada, incluso si eliminas esa categoría de la lista. Para evitar inconsistencias, considera reasignar productos antes de eliminar categorías.

* **Historial y finanzas**: Los registros históricos conservarán las categorías originales con las que fueron creados.

* **Filtros**: Los filtros en las páginas de Historial y Finanzas se actualizarán automáticamente con las nuevas categorías al recargar la página.

### Añadir categorías sin perder datos

Si solo quieres **añadir** nuevas categorías sin modificar las existentes:

1. Editar `data/data.json`
2. Añadir las nuevas categorías al final del array:

```json
{
  "categorias": [
    "Alimentación",
    "Bebidas",
    "Limpieza",
    "Tecnología",
    "Hogar",
    "Juguetes",
    "Cosmética",
    "Ropa",
    "Deportes",
    "Otro",
    "Mi Nueva Categoría 1",
    "Mi Nueva Categoría 2"
  ],
  ...
}
```

3. Guardar y reiniciar el servidor

Las nuevas categorías aparecerán automáticamente en todos los selects del sistema.

## 🔧 Configuración

### Puerto del servidor

Por defecto: `3000`

Para cambiar el puerto, editar en `src/server.js`:

```javascript
const PORT = 3000; // Cambiar aquí
```

### Datos iniciales

El archivo `src/generateData.js` puede generar datos de prueba. Para modificar la cantidad:

```javascript
for (let i = 1; i <= 200; i++) { // Cambiar el número aquí
  // ...
}
```

## 💾 Backup y Recuperación

### Hacer backup manual

```bash
# Copiar el archivo de datos
cp data/data.json data/backup_$(date +%Y%m%d).json

# O copiar toda la carpeta data
cp -r data/ backup_data/
```

### Restaurar desde backup

```bash
# 1. Detener el servidor (Ctrl + C)

# 2. Restaurar el archivo
cp data/backup_YYYYmmdd.json data/data.json

# 3. Reiniciar el servidor
npm start
```

## 📝 API Endpoints

* `GET /api/data` - Obtener todos los datos
* `POST /api/data` - Guardar datos
* `POST /api/generar-ticket` - Generar ticket PDF
* `GET /api/descargar-ticket/:tipo/:fileName` - Descargar ticket

## 🎨 Características adicionales

* **Modo oscuro**: Persistente con localStorage
* **Ordenación**: Clic en cabeceras de tabla (ID, Stock, Ventas, Balance)
* **Formato de moneda**: Automático en formato español (€)
* **Validaciones**: Control de stock, productos duplicados, etc.
* **Notificaciones**: Feedback visual de operaciones
* **Responsive**: Interfaz adaptable (parcial)

## 🔒 Seguridad

⚠️ **Importante**: Este sistema NO incluye autenticación y está diseñado para uso local o en redes privadas.

### **Nota**: Este es un sistema de gestión local. Para uso en producción, considerar:

* ✅ HTTPS con certificados SSL/TLS
* ✅ Validación y sanitización de entradas en el servidor
* ✅ Rate limiting para prevenir abusos
* ✅ Configuración adecuada de CORS
* ✅ Hash de contraseñas (bcrypt)
* ✅ Logs de auditoría
* ✅ Protección contra inyección SQL (si migras a BD relacional)

## 🐛 Solución de problemas

### El servidor no inicia

* Verificar que el puerto 3000 esté disponible
* Comprobar instalación de dependencias: `npm install`
* Revisar logs en `data/logs/app.log`

### Los tickets no se generan

* Verificar permisos de escritura en carpeta `data/tickets`
* Revisar logs en `data/logs/app.log`
* Comprobar que PDFKit esté instalado correctamente

### Datos no se guardan

* Verificar permisos de escritura en `data/data.json`
* Comprobar espacio en disco
* Revisar logs del servidor

### Error "EADDRINUSE"

El puerto 3000 está ocupado. Opciones:
```bash
# Opción 1: Encontrar y cerrar el proceso
lsof -i :3000  # Linux/Mac
netstat -ano | findstr :3000  # Windows

# Opción 2: Cambiar el puerto en src/server.js
```

## ❓ Preguntas Frecuentes

**¿Los datos se guardan automáticamente?**
Sí, cada operación (añadir, editar, comprar, vender) se guarda automáticamente en `data/data.json`.

**¿Puedo usar esto en múltiples tiendas?**
No directamente. Cada instancia gestiona una sola base de datos local. Para múltiples tiendas necesitarías múltiples instancias o migrar a una base de datos centralizada.

**¿Hay límite de productos?**
No hay límite establecido, pero por rendimiento se recomienda no superar 10,000 productos con el almacenamiento JSON actual.

**¿Puedo exportar los datos?**
Sí, puedes copiar el archivo `data/data.json` para hacer backups, migraciones o análisis externos.

**¿Funciona sin conexión a internet?**
Sí, completamente. Solo necesita internet para las CDN de librerías (Chart.js, Flatpickr) en el frontend.

**¿Puedo acceder desde otro dispositivo en mi red?**
Sí, usa la IP local del servidor: `http://192.168.1.X:3000` (reemplaza X con tu IP)

## 🗺️ Roadmap

### Versión 2.0 (en proceso)
- [ ] Exportar datos a Excel/CSV
- [ ] Códigos de barras QR para productos
- [ ] Alertas de stock mínimo por email
- [ ] Estadísticas avanzadas (productos más vendidos, etc.)

### Version 3.0 (futuro)
- [ ] Integración con lectores de código de barras
- [ ] Base de datos SQL (MongoDB)
- [ ] Autenticación y autorización

## 📄 Licencia

MIT License - Ver archivo [LICENSE](LICENSE) para más detalles

## 👨‍💻 Autor

[Victor Menjon](https://victormenjon.es)

## 📮 Soporte

* Consultar la sección de [Preguntas Frecuentes](#-preguntas-frecuentes)
* Revisar los [logs del sistema](#-solución-de-problemas)

---

**Desarrollado con ❤️ para facilitar la gestión de inventarios**
