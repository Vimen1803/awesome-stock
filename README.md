<div align="center">

# 📦 VimenStock v2.0.0

### Sistema de Gestión de Inventario

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)]()

[![Made with Node.js](https://img.shields.io/badge/Made%20with-Node.js-43853d?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express)](https://expressjs.com/)

---

**Sistema de gestión de inventario con generación automática de tickets PDF, códigos de barras, exportación a Excel, análisis financiero avanzado y sistema completo de logs.**

[Documentación](#-uso) •
[Instalación](#-instalación) •
[Tecnologías](#-tecnologías-utilizadas)

</div>

<table>
<tr>
<td width="33%" align="center">

### 🗺 Road Map
Consulta el RoadMap para estar enterado de las futuras ideas

[Ver RoadMap](#%EF%B8%8F-roadmap)

</td>
<td width="33%" align="center">

### ❓ FAQ
Encuentra respuestas a preguntas y errores comunes

[Ver FAQ](#-solución-de-problemas)

</td>
<td width="33%" align="center">

### 📰 LICENCIA
Consulta el archivo licencia y las guías necesarias

[Ver LICENCIA](#-licencia-1)

</td>
</tr>
</table>

---

## 📸 Capturas de Pantalla

<details>
<summary>📦 <b>Gestión de Productos</b> (Click para expandir)</summary>

![Pantalla de productos](docs/screenshots/productos2.png)

```
1️⃣ AÑADIR PRODUCTO
   └─ Clic en "▼ AÑADIR PRODUCTO ▼"
   └─ Completar formulario
   └─ El código de barras se genera automáticamente

2️⃣ EDITAR PRODUCTO
   └─ Botón "Editar" en la tabla
   └─ Modificar campos necesarios
   └─ Guardar cambios

3️⃣ ELIMINAR PRODUCTO
   └─ Botón "Eliminar" en la tabla
   └─ Confirmar eliminación
   └─ Se registra en el historial

4️⃣ VER HISTORIAL
   └─ Botón "Historial" del producto
   └─ Visualiza todos sus movimientos

5️⃣ CÓDIGO DE BARRAS
   └─ Clic en la imagen para ampliar
   └─ Generación automática Code 128
```

### 🛒 Operaciones de Compra/Venta

#### 📥 Comprar

```
1. Clic en "▼ COMPRAR ▼"
2. Añadir filas con:
   ├─ Código de producto (P001, P002, etc.)
   └─ Cantidad
3. El sistema calcula automáticamente:
   ├─ Precio unitario
   ├─ Precio total por producto
   └─ Total de la operación
4. Confirmar compra
   └─ ✅ Actualiza stock
   └─ ✅ Genera ticket PDF
   └─ ✅ Registra en historial
```

#### 💰 Vender

```
1. Clic en "▼ VENDER ▼"
2. Añadir filas con:
   ├─ Código de producto
   └─ Cantidad (verificación automática de stock)
3. El sistema:
   ├─ Valida disponibilidad
   ├─ Calcula precios
   └─ Muestra total
4. Confirmar venta
   └─ ✅ Actualiza stock
   └─ ✅ Genera ticket PDF
   └─ ✅ Registra en historial
   └─ ⚠️ Alerta si queda stock bajo
```

</details>

<details>
<summary>🏷️ <b>Códigos de Barras</b> (Click para expandir)</summary>

![Códigos de barras](docs/screenshots/codigos_barras.png)

**Características:**
- ✅ Generación automática Code 128
- ✅ Almacenamiento en `docs/bar_code/`
- ✅ Opción de ampliación con clic
- ✅ Generación bajo demanda

</details>

<details>
<summary>📜 <b>Historial de Operaciones</b> (Click para expandir)</summary>

![Pantalla de historial](docs/screenshots/historial2.png)

**Filtros Disponibles:**

| Filtro | Opciones |
|--------|----------|
| 🔄 Tipo de Operación | Comprado, Vendido, Editado, Eliminado, Añadido |
| 📂 Categoría | Todas las categorías del sistema |
| 📅 Fecha | Fecha exacta o rango de fechas |
| 🔍 ID | Producto o Ticket específico |

**Funcionalidades:**
- 📥 **Descargar tickets**: Clic en el texto azul "Ticket: [ID]"
- 📊 **Operaciones múltiples**: Se expanden mostrando cada producto
- 🔗 **Enlaces directos**: A tickets PDF con efecto hover
- ⏰ **Ordenación**: Por fecha más reciente primero

</details>

<details>
<summary>💰 <b>Análisis Financiero</b> (Click para expandir)</summary>

![Pantalla de finanzas](docs/screenshots/finanzas.png)

```
📊 PERÍODOS DISPONIBLES
├─ 📅 Diario    → Ventas/compras del día
├─ 📅 Semanal   → Últimos 7 días
├─ 📅 Mensual   → Últimos 30 días
├─ 📅 Anual     → Últimos 365 días
└─ 📅 Siempre   → Histórico completo

🔍 FILTROS
├─ Por categoría
├─ Por ID de producto
└─ Rango de fechas personalizado

📈 GRÁFICO
├─ 💵 Ingresos (verde)
├─ 💸 Gastos (rojo)
└─ 💰 Beneficio total
```

</details>

<details>
<summary>📈 <b>Estadísticas Avanzadas</b> (Click para expandir)</summary>

![Pantalla de estadísticas](docs/screenshots/estadisticas.png)

**KPIs en Tiempo Real:**

| Métrica | Descripción | Cálculo |
|---------|-------------|---------|
| 💵 Ingresos | Total vendido | Suma de todas las ventas |
| 💸 Gastos | Total comprado | Suma de todas las compras |
| 💰 Beneficio | Ganancia neta | Ingresos - Gastos |
| 📊 Margen | Rentabilidad | (Beneficio / Ingresos) × 100 |
| 🛒 Ventas | Nº operaciones | Conteo de ventas |
| 🎯 Ticket Medio | Promedio venta | Ingresos / Nº ventas |

**Gráficos Interactivos:**

```
📈 Evolución de Ventas (Línea)
   └─ Ventas diarias en el período seleccionado
   └─ Hover para ver detalles exactos

📊 Categorías Rentables (Barras)
   └─ Beneficio por categoría
   └─ Ordenadas de mayor a menor

🍩 Distribución de Stock (Pie)
   └─ Stock por categoría
   └─ Porcentajes visuales
```

**Tablas de Análisis:**

| Tabla | Información |
|-------|-------------|
| 🏆 Top 10 Vendidos | Productos + vendidos con cantidades |
| ⚠️ Stock Bajo | Crítico (<10), Bajo (<25), Agotados (0) |

**Filtros por Período:**

</details>

<details>
<summary>📊 <b>Exportación a Excel</b> (Click para expandir)</summary>

![Excel exportado](docs/screenshots/excel_export.png)

```
🖱️ CÓMO USAR
1. Ir a la página de Productos
2. Clic en "📊 Exportar a Excel" (botón verde)
3. Se genera automáticamente "data.xlsx"
```

📄 HOJAS INCLUIDAS

📦 HOJA 1: Productos

📜 HOJA 2: Historial

💰 HOJA 3: Finanzas

📈 HOJA 4: Resumen

</details>

<details>
<summary>🎫 <b>Tickets PDF</b> (Click para expandir)</summary>

![Ticket PDF](docs/screenshots/ticket_pdf.png)

**Características:**
- ✅ Diseño profesional mejorado
- ✅ Información detallada
- ✅ Formato alineado y legible
- ✅ Soporte para múltiples productos

</details>

---

## 🌟 Características Destacadas

<div align="center">

| 🏷️ Códigos de Barras | 📊 Exportación Excel | 📈 Estadísticas | ⚠️ Alertas Stock |
|:---:|:---:|:---:|:---:|
| Automáticos Code 128 | 4 hojas profesionales | Dashboard completo | Detección automática |

</div>

<details>
<summary>📝 Sistema de Logs</summary>

- **Log de aplicación**: `data/logs/app.log` - Todas las operaciones del sistema
- **Formato estructurado**: Timestamp, nivel y mensaje detallado
</details>

<details>
<summary>⚠️ Alertas de Stock Bajo</summary>

**Sistema Automático:**

```
🔔 SE ACTIVA CUANDO:
└─ Stock < 25 unidades (configurable)

📝 REGISTRO EN LOG:
└─ Archivo: data/logs/stock_alerts.txt
└─ Formato: [ID] - [Nombre] - Stock: [X] - [Fecha]
└─ Ejemplo: P001 - Leche Entera - Stock Disponible: 15 - 29/09/2025 14:30

🎨 VISUALIZACIÓN:
└─ Número de stock en ROJO y NEGRITA en la tabla
└─ Fácil identificación visual
└─ Se actualiza en cada venta
```

**Configurar Umbral:**

Editar en `src/app.js`:
```javascript
const STOCKBAJO = 25; // Cambiar a tu preferencia
```

</details>

<details>
<summary>🎨 Interfaz y UX</summary>

- 🌙 **Modo Oscuro** persistente para reducir fatiga visual
- 🔔 **Notificaciones** visuales inmediatas
- 🧭 **Navegación intuitiva** con menú superior
- ⚡ **Feedback visual** en todas las operaciones
</details>

---

## 📁 Estructura del Proyecto

```
vimenstock/
│
├── 📂 data/                    # Datos y archivos generados
│   ├── 📄 data.json            # Base de datos JSON
│   ├── 📂 logs/                # Sistema de logs
│   │   ├── 📄 app.log          # Log general
│   │   └── 📄 stock_alerts.txt # Alertas de stock ⭐
│   └── 📂 tickets/             # Tickets PDF
│       ├── 📂 compra/          # Tickets de compra
│       └── 📂 venta/           # Tickets de venta
│
├── 📂 docs/                    # Documentación
│   ├── 📂 bar_code/            # Códigos de barras ⭐
│   └── 📂 screenshots/         # Capturas de pantalla
│
├── 📂 public/                  # Frontend
│   ├── 🌐 index.html           # Página de productos
│   ├── 🌐 historial.html       # Página de historial
│   ├── 🌐 finanzas.html        # Página de finanzas
│   ├── 🌐 estadisticas.html    # Dashboard estadísticas ⭐
│   └── 🎨 style.css            # Estilos principales
│
├── 📂 src/                     # Backend
│   ├── ⚙️ server.js            # Servidor Express + APIs ⭐
│   ├── 🔧 generateData.js      # Generador de datos
│   ├── 📱 app.js               # Lógica principal
│   ├── 📜 historial.js         # Gestión de historial
│   ├── 💰 finanzas.js          # Análisis financiero
│   ├── 📈 estadisticas.js      # Estadísticas avanzadas ⭐
│   └── 🌓 lightdark.js         # Control modo oscuro
│
├── 📄 .gitignore
├── 📋 CHANGELOG.md             # Historial de cambios ⭐
├── 📜 LICENSE
├── 📖 README.md
├── 📦 package.json
└── 🔒 package-lock.json

⭐ = Nuevos en v2.0.0
```

---

## 📋 Características Principales

### 📦 Gestión de Inventario

<table>
<tr>
<td>

**Productos**
- ➕ Añadir, editar y eliminar
- 🏷️ Códigos de barras automáticos
- 📊 Organización por categorías
- 🔍 Búsqueda y filtros avanzados
- ⚠️ Alertas de stock bajo

</td>
<td>

**Control de Stock**
- 🛒 Registro de compras
- 💰 Registro de ventas
- 🔄 Actualización automática
- 📈 Cálculo de balance
- 📊 Análisis de rotación

</td>
</tr>
</table>

### 🎫 Operaciones y Tickets

- ✅ **Tickets PDF profesionales** para cada operación
- ✅ **Operaciones múltiples** (varios productos en una transacción)
- ✅ **Historial completo** con filtros avanzados
- ✅ **Descarga directa** de tickets desde el historial
- ✅ **Registro detallado** de precios y cantidades

### 📊 Análisis y Reportes

<table>
<tr>
<td width="33%">

**KPIs en Tiempo Real**
- 💵 Ingresos totales
- 💸 Gastos totales
- 💰 Beneficio neto
- 📊 Margen bruto
- 🛒 Ventas totales
- 🎯 Ticket medio

</td>
<td width="33%">

**Gráficos Interactivos**
- 📈 Evolución de ventas
- 📊 Categorías rentables
- 🍩 Distribución de stock

</td>
<td width="33%">

**Exportación**
- 📊 Excel (4 hojas)
- 🎫 Tickets PDF
- 📜 Historial completo

</td>
</tr>
</table>

---

## 🚀 Instalación

<details>
<summary> 📋 Requisitos Previos</summary>

```bash
Node.js v14 o superior
npm v6 o superior
```

</details>

<details>
<summary> 📥 Guía de Instalación</summary>

```bash
# 1️⃣ Clonar el repositorio
git clone https://github.com/tu-usuario/vimenstock.git
cd vimenstock

# 2️⃣ Instalar dependencias
npm install

# 3️⃣ (Opcional) Generar datos de prueba
npm run data

# 4️⃣ Iniciar servidor
npm start

# Para desarrollo con auto-reload
npm run dev
```

</details>

<details>
<summary>🌐 Acceder a la Aplicación</summary> 

Abre tu navegador en: **http://localhost:3000**

</details>

---

## ⚙️ Configuración

<details>
<summary>🔌 Cambiar Puerto del Servidor</summary> 

```javascript
// Archivo: src/server.js
// Línea: ~15

const PORT = 3000; // Cambiar a 3001, 8080, etc.
```

**Puertos comunes:**
- `3000` - Por defecto
- `8080` - Alternativa popular
- `3001` - Si 3000 está ocupado
- `5000` - Otra alternativa común

</details>

---

<details>
<summary> 🎲 Configurar Datos de Prueba</summary>

```javascript
// Archivo: src/generateData.js

// Cambiar cantidad de productos generados
for (let i = 1; i <= 200; i++) { // Cambiar 200 por el número deseado
  // ... código de generación
}

// Personalizar rangos de precios
const precioCompra = (Math.random() * (50 - 1) + 1).toFixed(2);
//                                      ↑    ↑
//                                    Máx  Mín

// Personalizar stock inicial
const stock = Math.floor(Math.random() * (200 - 10) + 10);
//                                          ↑     ↑
//                                        Máx   Mín
```

</details>

---

<details>
<summary>🌐 Acceso desde Otros Dispositivos</summary> 

```bash
# 1️⃣ Encontrar tu IP local

# Windows:
ipconfig
# Buscar: "Dirección IPv4"

# Linux/macOS:
ifconfig
# O
ip addr show

# 2️⃣ Acceder desde otro dispositivo
# Formato: http://[TU_IP]:3000
# Ejemplo:
http://192.168.1.100:3000

# 3️⃣ Asegurarse que el firewall permite conexiones
# Windows: Permitir Node.js en el firewall
# Linux: sudo ufw allow 3000/tcp
```

</details>

---

## 💾 Backup y Recuperación

### 📦 Hacer Backup Manual

<details>
<summary><b>Linux / macOS</b></summary>

```bash
# Backup rápido del archivo principal
cp data/data.json data/backup_$(date +%Y%m%d).json

# Backup completo de la carpeta data
cp -r data/ backup_data_$(date +%Y%m%d)/

# Backup comprimido (recomendado)
tar -czf backup_vimenstock_$(date +%Y%m%d).tar.gz data/

# Listar backups
ls -lh backup_*.tar.gz
```

</details>

<details>
<summary><b>Windows</b></summary>

```bash
REM Backup del archivo principal
copy data\data.json data\backup_%date:~-4,4%%date:~-7,2%%date:~-10,2%.json

REM Backup completo de la carpeta
xcopy data backup_data_%date:~-4,4%%date:~-7,2%%date:~-10,2%\ /E /I

REM Comprimir con PowerShell
powershell Compress-Archive -Path data\ -DestinationPath backup_%date:~-4,4%%date:~-7,2%%date:~-10,2%.zip
```

</details>

---

### ♻️ Restaurar desde Backup

<details>
<summary><b>Linux / macOS</b></summary>
  
```bash
# 1️⃣ Detener el servidor
Ctrl + C

# 2️⃣ Restaurar archivo de datos
cp data/backup_20250828.json data/data.json

# 3️⃣ O restaurar carpeta completa
rm -rf data/
cp -r backup_data_20250828/ data/

# 4️⃣ Reiniciar servidor
npm start
```
</details>

<details>
<summary><b>Windows</b></summary>

```bash
# 1️⃣ Detener el servidor
Ctrl + C

# 2️⃣ Restaurar archivo de datos
copy data\backup_20250828.json data\data.json

# 3️⃣ O restaurar carpeta completa
rmdir /s /q data
xcopy /e /i backup_data_20250828 data

# 4️⃣ Reiniciar servidor
npm start
```

</details>

---

## 🛠️ Tecnologías Utilizadas

<details>
<summary>🔧 Backend</summary>

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Node.js** | ≥14.0.0 | Entorno de ejecución |
| **Express.js** | ^4.18.0 | Framework web |
| **PDFKit** | ^0.13.0 | Generación de tickets PDF |
| **Winston** | ^3.8.0 | Sistema de logs profesional |
| **Canvas** | ^2.11.0 | Generación códigos de barras |
| **ExcelJS** | ^4.3.0 | Exportación a Excel |
</details>

<details>
<summary>🎨 Frontend</summary>

| Tecnología | Fuente | Uso |
|------------|--------|-----|
| **HTML5/CSS3** | Nativo | Estructura y estilos |
| **JavaScript ES6+** | Nativo | Lógica del cliente |
| **Chart.js** | CDN | Gráficos interactivos |
| **Flatpickr** | CDN | Selector de fechas |
</details>

---

## 🏷️ Categorías

<details>
<summary>📂 Categorías Predefinidas</summary>

El sistema incluye **10 categorías** por defecto:

```javascript
// Editar: src/server.js
// Buscar: inicializarDataJSON()

const dataInicial = {
  categorias: [
    "Tu Categoría 1",
    "Tu Categoría 2",
    "Tu Categoría 3",
    // Añade las que necesites
  ],
  productos: {},
  historial: [],
  finanzas: [],
  ultimaIDUsada: 0
};
```
</details>

<details>
<summary>✏️ Personalizar Categorías</summary>

<details>
<summary><b>Opción 1: Antes del Primer Inicio</b> (Recomendado)</summary>

```javascript
// Editar: src/server.js
// Buscar: inicializarDataJSON()

const dataInicial = {
  categorias: [
    "Tu Categoría 1",
    "Tu Categoría 2",
    "Tu Categoría 3",
    // Añade las que necesites
  ],
  productos: {},
  historial: [],
  finanzas: [],
  ultimaIDUsada: 0
};
```

</details>

<details>
<summary><b>Opción 2: Después del Primer Inicio</b></summary>

```bash
# 1. Detener el servidor
Ctrl + C

# 2. Editar data/data.json
```

```json
{
  "categorias": [
    "Electrónica",
    "Muebles",
    "Decoración",
    "Accesorios"
  ],
  "productos": { ... },
  "historial": [ ... ]
}
```

```bash
# 3. Reiniciar
npm start
```

</details>
</details>

<details>
<summary>⚠️ Consideraciones Importantes</summary>


| Aspecto | Detalle |
|---------|---------|
| **Productos Existentes** | Mantienen su categoría asignada incluso si eliminas esa categoría del array |
| **Historial** | Las operaciones registradas conservan las categorías originales |
| **Finanzas** | Los registros financieros mantienen las categorías históricas |
| **Filtros** | Se actualizan automáticamente con las nuevas categorías |
| **Compatibilidad** | Los productos con categorías eliminadas seguirán funcionando |

**Recomendación:** Si vas a cambiar categorías con productos existentes, considera:
1. Hacer backup de `data/data.json`
2. Editar manualmente los productos para asignar nuevas categorías
3. O mantener las categorías antiguas como "legacy"

</details>

---

## 📝 Sistema de Logs

### 📄 Log de Aplicación

**Ubicación:** `data/logs/app.log`

**Formato:**
```
2025-09-29 14:30:45 info: Servidor corriendo en http://localhost:3000
2025-09-29 14:31:12 info: Ticket generado: ticket_venta_VENTA-1727621472123-456.pdf
2025-09-29 14:31:15 info: Excel exportado: data.xlsx
2025-09-29 14:32:00 info: Código de barras generado: P123.png
2025-09-29 14:32:30 warn: Intento de venta con stock insuficiente: P045
2025-09-29 14:33:00 error: Error al generar PDF: [detalles del error]
```

### ⚠️ Log de Alertas de Stock

**Ubicación:** `data/logs/stock_alerts.txt`

**Formato:**
```
P001 - Leche Entera - Stock Disponible: 18 - 29/09/2025 14:31:12
P045 - Café Molido - Stock Disponible: 12 - 29/09/2025 14:31:12
P089 - Azúcar Blanco - Stock Disponible: 8 - 29/09/2025 14:35:45
P123 - Pan Integral - Stock Disponible: 3 - 29/09/2025 14:40:20
```

**Niveles de Alerta:**
- 🔴 **Crítico** (0-10): Requiere atención inmediata
- 🟡 **Bajo** (11-24): Planificar reabastecimiento
- ⚪ **Normal** (≥25): Sin alertas

---

## ⚙️ Configuración

### 🔌 Puerto del Servidor

**Por defecto:** `3000`

```javascript
// Editar: src/server.js
const PORT = 3000; // Cambiar al puerto deseado
```

### ⚠️ Umbral de Stock Bajo

**Por defecto:** `25 unidades`

```javascript
// Editar: src/app.js
const STOCKBAJO = 25; // Ajustar según necesidades
```

### 🎲 Datos de Prueba

```javascript
// Editar: src/generateData.js
for (let i = 1; i <= 200; i++) { // Cambiar cantidad
  // Generación de productos
}
```

## 🔌 API Endpoints

<details>
<summary>📊 Datos</summary>

| Método | Endpoint | Descripción | Body/Params |
|--------|----------|-------------|-------------|
| `GET` | `/api/data` | Obtener todos los datos | - |
| `POST` | `/api/data` | Guardar/actualizar datos | JSON completo |
</details>

<details>
<summary>🎫 Tickets y Documentos</summary>

| Método | Endpoint | Descripción | Params |
|--------|----------|-------------|--------|
| `POST` | `/api/generar-ticket` | Generar ticket PDF | `{ tipo, operacion, productos, total }` |
| `GET` | `/api/descargar-ticket/:tipo/:fileName` | Descargar ticket | `tipo: compra\|venta` |
| `GET` | `/api/exportar-excel` | Exportar a Excel | - |
</details>

<details>
<summary>🏷️ Códigos de Barras</summary>

| Método | Endpoint | Descripción | Body |
|--------|----------|-------------|------|
| `POST` | `/api/generar-codigo-barras` | Generar código de barras | `{ productoID, nombre }` |
</details>

<details>
<summary>⚠️ Alertas</summary>

| Método | Endpoint | Descripción | Body |
|--------|----------|-------------|------|
| `POST` | `/api/registrar-alerta-stock` | Registrar alerta | `{ productoID, nombre, stock }` |
</details>

---

## 🔒 Seguridad

<details>
<summary>⚠️ Aviso Importante</summary>

Este sistema **NO incluye autenticación** y está diseñado para:
- ✅ Uso local (localhost)
- ✅ Redes privadas confiables
- ❌ NO para uso en internet público

**Recursos recomendados:**
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
</details>

---

## 🔧 Solución de Problemas

<details>
<summary>❌ <b>El servidor no inicia</b></summary>

**Posibles causas y soluciones:**

```bash
# Verificar puerto disponible
lsof -i :3000  # Linux/Mac
netstat -ano | findstr :3000  # Windows

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Verificar versión de Node
node --version  # Debe ser ≥14.0.0

# Revisar logs
cat data/logs/app.log
```

</details>

<details>
<summary>📄 <b>Los tickets no se generan</b></summary>

**Soluciones:**

```bash
# Verificar permisos
chmod -R 755 data/tickets

# Crear carpetas manualmente
mkdir -p data/tickets/compra data/tickets/venta

# Reinstalar PDFKit
npm uninstall pdfkit
npm install pdfkit

# Revisar logs
tail -f data/logs/app.log
```

</details>

<details>
<summary>🏷️ <b>Códigos de barras no se muestran</b></summary>

**Soluciones:**

```bash
# Verificar permisos
chmod -R 755 docs/bar_code

# Crear carpeta
mkdir -p docs/bar_code

# Reinstalar Canvas
npm uninstall canvas
npm install canvas

# En Windows, puede requerir herramientas adicionales
npm install --global windows-build-tools
```

</details>

<details>
<summary>📊 <b>Exportación a Excel falla</b></summary>

**Soluciones:**

```bash
# Verificar permisos en carpeta data
chmod 755 data/

# Reinstalar ExcelJS
npm uninstall exceljs
npm install exceljs

# Verificar espacio en disco
df -h  # Linux/Mac
```

</details>

<details>
<summary>🔌 <b>Error "EADDRINUSE"</b></summary>

**El puerto está ocupado:**

```bash
# Encontrar proceso
lsof -i :3000  # Linux/Mac
netstat -ano | findstr :3000  # Windows

# Matar proceso
kill -9 [PID]  # Linux/Mac
taskkill /PID [PID] /F  # Windows

# O cambiar puerto en src/server.js
const PORT = 3001;  // Usar otro puerto
```

</details>

<details>
<summary>💾 <b>Datos no se guardan</b></summary>

**Verificaciones:**

```bash
# Permisos del archivo
chmod 644 data/data.json

# Verificar que el archivo no esté corrupto
cat data/data.json | python -m json.tool

# Restaurar desde backup si está corrupto
cp data/backup_YYYYMMDD.json data/data.json
```

</details>

---

## ❓ Preguntas Frecuentes

<details>
<summary><b>¿Los datos se guardan automáticamente?</b></summary>

Sí, cada operación se guarda automáticamente en `data/data.json`. No es necesario hacer clic en guardar.

</details>

<details>
<summary><b>¿Puedo usar esto en múltiples tiendas?</b></summary>

No directamente. Cada instancia gestiona una sola base de datos local. Para múltiples tiendas:
- Opción 1: Ejecutar múltiples instancias en diferentes puertos
- Opción 2: Migrar a base de datos centralizada (futuro v3.0)

</details>

<details>
<summary><b>¿Hay límite de productos?</b></summary>

No hay límite establecido, pero por rendimiento con JSON se recomienda no superar **10,000 productos**. Para más, considera migrar a MongoDB (planificado v2.1).

</details>

<details>
<summary><b>¿Los códigos de barras son únicos?</b></summary>

Sí, cada producto tiene su código de barras único basado en su ID (P001, P002, etc.) en formato **Code 128**, uno de los más utilizados en retail.

</details>

<details>
<summary><b>¿Puedo exportar los datos?</b></summary>

Sí, tienes 2 opciones:
1. **Excel**: Botón "📊 Exportar a Excel" (4 hojas profesionales)
2. **JSON**: Copiar directamente `data/data.json`

</details>

<details>
<summary><b>¿Funciona sin conexión a internet?</b></summary>

Casi completamente. Solo necesita internet para las CDN de:
- Chart.js (gráficos)
- Flatpickr (selector de fechas)

Para uso 100% offline, descarga estas librerías localmente.

</details>

<details>
<summary><b>¿Puedo acceder desde otro dispositivo en mi red?</b></summary>

Sí:
```bash
# Encontrar tu IP
ipconfig  # Windows
ifconfig  # Linux/Mac

# Acceder desde otro dispositivo
http://TU_IP:3000
# Ejemplo: http://192.168.1.100:3000
```

</details>

<details>
<summary><b>¿Qué formato tienen los códigos de barras?</b></summary>

**Code 128**, uno de los formatos más utilizados en:
- Retail y supermercados
- LogÃ­stica y almacenes
- Bibliotecas
- Gestión de inventarios

Compatible con la mayoría de lectores de códigos de barras.

</details>

<details>
<summary><b>¿Puedo cambiar el umbral de stock bajo?</b></summary>

Sí, edita en `src/app.js`:
```javascript
const STOCKBAJO = 25; // Cambiar a tu preferencia
```

</details>

<details>
<summary><b>¿Cómo hago backup de mis datos?</b></summary>

Ver sección [💾 Backup y Recuperación](#-backup-y-recuperación) para instrucciones detalladas y scripts automáticos.

</details>

---

## 🗺️ Roadmap

### 📅 Versión 2.1.0 - Q4 2025

| Característica | Estado | Prioridad |
|----------------|--------|-----------|
| 🖨️ Impresión directa de códigos de barras | 🟡 Planificado | Alta |
| 📷 Lector de códigos con webcam | 🟡 Planificado | Alta |
| 📧 Notificaciones por email | 🟡 Planificado | Media |
| ☁️ Backup automático programado | 🟡 Planificado | Alta |
| 📱 PWA (Progressive Web App) | 🟡 Planificado | Media |
| 🔍 Búsqueda con autocompletado | 🟡 Planificado | Baja |

### 📅 Versión 3.0.0 - 2026

| Característica | Estado | Descripción |
|----------------|--------|-------------|
| 🗄️ Base de datos | 🔵 En consideración | MongoDB/PostgreSQL |
| 👥 Multiusuario | 🔵 En consideración | Autenticación y roles |
| 📡 API REST completa | 🔵 En consideración | Documentación Swagger |
| 📊 Dashboard en tiempo real | 🔵 En consideración | WebSockets |
| 🏢 Múltiples almacenes | 🔵 En consideración | Gestión distribuida |
| 🌍 Internacionalización | 🔵 En consideración | Múltiples idiomas |
| 📊 Informes personalizados | 🔵 En consideración | Reportes en PDF |

**Leyenda:**
- 🟢 Completado
- 🟡 Planificado
- 🔵 En consideración
- 🔴 En desarrollo

---

---

## 📜 Licencia

Este proyecto está bajo la licencia **MIT**.

```
MIT License

Copyright (c) 2025 Victor Menjon

Se concede permiso, de forma gratuita, a cualquier persona que obtenga una copia
de este software y archivos de documentación asociados (el "Software"), para usar
el Software sin restricciones, incluyendo sin limitación los derechos de usar,
copiar, modificar, fusionar, publicar, distribuir, sublicenciar y/o vender copias
del Software...

Ver archivo LICENSE para el texto completo.
```

---

<div align="center">
  
## 👨‍💻 Autor

**Victor Menjon**

[![Website](https://img.shields.io/badge/Website-victormenjon.es-blue?style=flat&logo=google-chrome)](https://victormenjon.es)
[![GitHub](https://img.shields.io/badge/GitHub-@Vimen1803-181717?style=flat&logo=github)](https://github.com/vimen1803)
[![Email](https://img.shields.io/badge/Email-victormnjfan@gmail.com-red?style=flat&logo=gmail)](mailto:victormnjfan@gmail.com)

</div>

---

<div align="center">

## ⭐ ¿Te gusta VimenStock?

Si este proyecto te ha sido útil, considera darle una estrella en GitHub ⭐

![GitHub repo size](https://img.shields.io/github/repo-size/vimen1803/awesome-stock)
![GitHub code size](https://img.shields.io/github/languages/code-size/vimen1803/awesome-stock)
![GitHub last commit](https://img.shields.io/github/last-commit/vimen1803/awesome-stock)

---

<div align="center">
  
[⬆ Volver arriba](#-vimenstock-v100)
  
--- 
Desarrollado con ❤️ para facilitar la gestión de inventarios

*v2.0.0 | Septiembre 2025*
</div>
</div>
