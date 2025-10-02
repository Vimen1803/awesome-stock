# 📋 Historial de Cambios - VimenStock

> Todos los cambios notables en este proyecto son documentados en este archivo.
> 
> El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
> y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [2.1.0] - 2025-10-02

### 🎉 Lanzamiento Mayor - Herramientas CLI y Automatización

Esta versión introduce herramientas de línea de comandos profesionales, sistema de backups automatizado, códigos de barras EAN-13 y capacidad de gestión completa sin editar código.

---

### ✨ Añadido

#### 💾 Sistema de Backups Automatizado
- ✅ **Backups automáticos** cada 12 horas mientras el servidor está activo
- ✅ **CLI completo de gestión** con comandos intuitivos:
  - `npm run backup` - Crear backup manual
  - `npm run backup:list` - Listar todos los backups disponibles
  - `npm run backup:restore <índice>` - Restaurar backup específico
  - `npm run backup:delete <índice>` - Eliminar backup específico
  - `npm run backup:help` - Ayuda completa con ejemplos
- ✅ **Rotación automática** mantiene máximo 28 backups (elimina los más antiguos)
- ✅ **Formato organizado** con timestamp: `data-YYYY-MM-DDTHH-MM-SS-sssZ/`
- ✅ **Confirmaciones de seguridad** con espera de 3 segundos antes de operaciones críticas
- ✅ **Logs coloridos** en consola para mejor visualización
- ✅ **Backup inicial** automático al iniciar el servidor
- 📌 API endpoint: `POST /api/crear-backup`
- 📁 Ubicación: `backups/`

#### 🏷️ Sistema de Códigos de Barras EAN-13
- ✅ **Formato EAN-13** estándar internacional (13 dígitos)
- ✅ **Dígito de control** calculado automáticamente según estándar EAN
- ✅ **CLI completo de gestión**:
  - `npm run barcode:generate <ID>` - Generar código EAN-13
  - `npm run barcode:list` - Listar todos los códigos con detalles
  - `npm run barcode:delete <ID|all>` - Eliminar código(s)
  - `npm run barcode:help` - Ayuda completa
- ✅ **Alta calidad de impresión** (400x200px)
- ✅ **Compatible con lectores comerciales** estándar
- ✅ **Información detallada** en lista: nombre producto, EAN-13, tamaño, fecha
- 📌 Librería: **JsBarcode** para generación profesional
- 📁 Ubicación: `data/bar_code/`

#### 📷 Lector de Códigos de Barras
- ✅ **CLI para leer códigos** EAN-13 desde archivos PNG:
  - `npm run barcode:read <archivo.png>` - Leer y decodificar
  - `npm run barcode:read help` - Ayuda completa
- ✅ **Validación del dígito de control** EAN-13
- ✅ **Conversión de formatos** (EAN-13 ↔ Decimal ↔ ID Producto)
- ✅ **Información del producto** si existe en la base de datos
- ✅ **Detalles mostrados**:
  - ID del producto
  - Código EAN-13 completo
  - Formato decimal
  - Validación del dígito de control
  - Información del producto (nombre, categoría, stock, precio)
- 📌 Funciones exportables como módulo para integración

#### 📊 Sistema de Informes Personalizados
- ✅ **CLI completo de generación**:
  - `npm run informe:balance [pdf|excel]` - Balance general
  - `npm run informe:producto <ID>` - Informe individual
  - `npm run informe:categoria <nombre>` - Por categoría
  - `npm run informe:list [tipo]` - Listar informes generados
  - `npm run informe:help` - Ayuda completa
- ✅ **Balance General** (PDF/Excel):
  - KPIs principales (ingresos, gastos, beneficio, margen, ventas, ticket medio)
  - Top 10 productos más vendidos con proveedor
  - Productos con stock bajo (agotado/crítico/bajo)
  - Distribución de stock por categoría con porcentajes
  - Análisis de beneficios por categoría (ingresos - costos)
  - **Excel**: Incluye hoja adicional con todos los productos
- ✅ **Informe de Producto** (PDF):
  - Información completa del producto
  - Historial detallado de movimientos
  - Análisis financiero individual
  - Últimos 20 movimientos por defecto
- ✅ **Informe por Categoría** (PDF):
  - Lista de todos los productos de la categoría
  - Resumen: total productos y stock total
  - Historial de movimientos de la categoría (últimos 10)
- ✅ **Diseño profesional** con:
  - Cabecera corporativa con degradado azul
  - Tablas con formato alternado
  - Paginación automática
  - Pie de página con numeración
- ✅ **Organización automática** por tipo en subcarpetas
- 📌 API endpoint: `POST /api/generar-informe`
- 📁 Ubicación: `data/informes/{general,productos,categorias}/`

#### 📂 Categorías Dinámicas
- ✅ **Añadir desde la aplicación** sin editar código
- ✅ **Campo de texto emergente** al seleccionar "Otro"
- ✅ **Validación automática**:
  - Nombres únicos (no duplicados)
  - Trim de espacios en blanco
  - Verificación de campos vacíos
- ✅ **Ordenación alfabética** automática manteniendo "Otro" al final
- ✅ **Actualización en tiempo real** en todos los selectores
- ✅ **Notificaciones visuales** de éxito/error
- 📌 API endpoint: `POST /api/agregar-categoria`
- 💾 Persistencia automática en `data.json`

---

### 🔧 Cambiado

#### ⚙️ Sistema de Backups
- 🔄 **Migrado a CLI dedicado** (`src/backup-cli.js`)
- 🔄 **Integración con servidor** - backups automáticos cada 12 horas
- 🔄 **Mejoras en UI**:
  - Mensajes con colores en consola
  - Marcos decorativos con emojis
  - Información estructurada y clara
- 🔄 **Gestión de límites** - eliminación automática de backups antiguos

#### 🏷️ Códigos de Barras
- 🔄 **Actualizado a formato EAN-13** (antes Code 128)
- 🔄 **Migrado a CLI dedicado** (`src/barcode-cli.js`)
- 🔄 **Integración con Canvas y JsBarcode** para mayor calidad
- 🔄 **Mejor manejo de errores** con mensajes descriptivos
- 🔄 **Función modular** exportable para uso en servidor

#### 📊 Sistema de Informes
- 🔄 **Migrado a CLI dedicado** (`src/informes-cli.js`)
- 🔄 **Separación por tipos** en carpetas organizadas
- 🔄 **Mejoras en diseño PDF**:
  - Cabeceras profesionales con degradado
  - Tablas con mejor alineación y formato
  - Paginación mejorada
  - Información más completa
- 🔄 **Excel mejorado**:
  - Formatos numéricos correctos
  - Colores y estilos profesionales
  - Hoja adicional de productos completos
  - Ancho de columnas optimizado

#### 📝 Server.js
- 🔄 **Integración de CLIs** como módulos ejecutables
- 🔄 **Nuevos endpoints API** para todas las funcionalidades
- 🔄 **Mejoras en inicialización**:
  - Creación automática de todas las carpetas necesarias
  - Backup inicial al arrancar
  - Mensajes de inicio más informativos con colores
- 🔄 **Logs mejorados** con Winston en todas las operaciones

#### 🎨 Frontend (app.js)
- 🔄 **Integración de añadir categorías** desde UI
- 🔄 **Mejoras en notificaciones** con mejor feedback visual
- 🔄 **Generación de códigos EAN-13** al crear productos
- 🔄 **Carga optimizada** de imágenes de códigos de barras

---

### 🐛 Corregido

- ✅ **Generación de códigos de barras** - ahora usa EAN-13 correctamente
- ✅ **Cálculo de dígito de control** según estándar EAN-13
- ✅ **Rutas de informes** - corrección en descarga desde modal
- ✅ **Backup automático** - se ejecuta correctamente cada 12 horas
- ✅ **Validación de categorías** - previene duplicados y nombres vacíos
- ✅ **Formato de Excel** - columnas alineadas correctamente
- ✅ **Paginación de PDFs** - saltos de página mejorados
- ✅ **Encoding de caracteres** - mejor manejo de caracteres especiales

---

### 📚 Documentación

- ✅ **README.md completamente renovado**:
  - Sección de Herramientas CLI con ejemplos
  - Guía de uso de cada comando
  - Tabla de características actualizada
  - Capturas de pantalla actualizadas
  - Estructura del proyecto completa
  - Scripts disponibles organizados
- ✅ **Ayuda integrada en CLIs**:
  - `npm run backup:help`
  - `npm run barcode:help`
  - `npm run informe:help`
- ✅ **Ejemplos de uso** en cada herramienta CLI
- ✅ **Actualización de CHANGELOG.md** (este archivo)

---

### 🔒 Seguridad

- ✅ **Validación de rutas** en descarga de informes
- ✅ **Sanitización de nombres** de categorías
- ✅ **Confirmaciones** antes de operaciones destructivas (restore/delete)
- ✅ **Verificación de existencia** de archivos antes de operaciones
- ✅ **Manejo de errores** mejorado en todos los CLIs

---

### ⚡ Rendimiento

- ✅ **Backups asíncronos** no bloquean el servidor
- ✅ **Generación de códigos bajo demanda** (lazy loading)
- ✅ **Optimización de PDFs** con mejor gestión de memoria
- ✅ **Excel streaming** para archivos grandes
- ✅ **Caché de categorías** en memoria

---

### 📦 Dependencias

#### Nuevas Dependencias
- ✅ **jsbarcode@^3.11.5** - Generación de EAN-13

#### Dependencias Actualizadas
- 🔄 **canvas@^2.11.0** - Actualizado para mejor compatibilidad
- 🔄 **exceljs@^4.3.0** - Mejoras en rendimiento

---

## [2.0.0] - 2025-09-29

### 🎉 Lanzamiento Mayor - Versión 2.0

Esta es una actualización importante que introduce múltiples funcionalidades profesionales y mejoras significativas en el sistema de gestión de inventario.

---

### ✨ Añadido

#### 🏷️ Sistema de Códigos de Barras
- ✅ Generación automática de códigos de barras en formato **Code 128** para cada producto
- ✅ Almacenamiento organizado en `docs/bar_code/`
- ✅ Visualización integrada en la tabla de productos
- ✅ Funcionalidad de ampliación con clic para mejor visibilidad
- ✅ Generación bajo demanda si el archivo no existe (optimización)
- 🔌 API endpoint: `POST /api/generar-codigo-barras`

#### 📊 Exportación a Excel
- ✅ Nueva funcionalidad completa de exportación usando **ExcelJS**
- ✅ Generación de archivo `data.xlsx` con **4 hojas profesionales**:
  - **📦 Productos**: Inventario completo con todos los campos
  - **📜 Historial**: Todas las operaciones realizadas
  - **💰 Finanzas**: Registros de ingresos y gastos
  - **📈 Resumen**: Métricas generales y estadísticas
- ✅ Formato profesional con cabeceras en color y estilos personalizados
- 🔌 API endpoint: `GET /api/exportar-excel`
- 🎨 Botón de exportación destacado en verde en la interfaz principal

#### ⚠️ Sistema de Alertas de Stock Bajo
- ✅ Detección automática de stock bajo (< 25 unidades)
- ✅ Registro automático después de cada venta
- ✅ Formato de alerta: `[ID] - [Nombre] - Stock Disponible: [X] - [Fecha y Hora]`
- ✅ Visualización destacada en la tabla (número en rojo y negrita)
- ✅ Archivo de log dedicado: `data/logs/stock_alerts.txt`
- 🔌 API endpoint: `POST /api/registrar-alerta-stock`

#### 📈 Página de Estadísticas Avanzadas
Nueva sección completa de estadísticas (`estadisticas.html`) con:

**📊 KPIs en tiempo real:**
- 💵 Ingresos totales
- 💸 Gastos totales
- 💰 Beneficio neto
- 📊 Margen bruto
- 🛒 Ventas totales
- 🎯 Ticket medio

**📉 Gráficos interactivos con Chart.js:**
- 📈 Evolución de ventas (gráfico de línea temporal)
- 📊 Categorías más rentables (gráfico de barras)
- 🍩 Distribución de stock (gráfico circular)

**📋 Tablas de análisis:**
- 🏆 Top 10 productos más vendidos
- ⚠️ Productos con stock bajo (crítico/bajo/agotado)

**🔍 Funcionalidades adicionales:**
- ⏰ Filtros por período (7, 30, 90, 365 días o todo el tiempo)
- 📊 Cálculo de tendencias comparando con período anterior
- 🎨 Diseño responsive y profesional

#### 🎫 Mejoras en Tickets PDF
- ✅ Diseño mejorado con mejor alineación y formato
- ✅ Posiciones fijas para mantener columnas alineadas
- ✅ Información de operación más clara y legible
- ✅ Mejor manejo de nombres largos (truncado con "..." para evitar desbordamiento)
- ✅ Fondos alternados en filas para mejor legibilidad
- ✅ Total destacado con fondo de color
- ✅ Mejor gestión de páginas múltiples para operaciones grandes

---

### 🔧 Cambiado

#### 🗄️ Estructura de Datos
- 🔄 Operaciones múltiples ahora se almacenan con array de productos
- 🔄 Campo `productos` en historial para operaciones con múltiples ítems
- 🔄 Adición de `precioTotalOperacion` para el total de cada operación
- 🔄 Campo `ticketID` y `ticketFile` para vincular tickets con operaciones

#### 🎨 Interfaz de Usuario
- 🔄 Reorganización del menú de navegación con nueva sección "Estadísticas"
- 🔄 Mejoras en el diseño del modo oscuro para reducir fatiga visual
- 🔄 Mejor feedback visual en todas las operaciones (notificaciones mejoradas)
- 🔄 Indicadores visuales de stock bajo en la tabla principal
- 🔄 Botón de exportación a Excel destacado en verde

#### 📜 Sistema de Historial
- 🔄 Visualización mejorada de operaciones múltiples
- 🔄 Mostrar detalles de cada producto en operaciones complejas
- 🔄 Enlaces directos a tickets PDF (texto azul subrayado, hover effect)
- 🔄 Mejor formato de fecha y hora (más legible)
- 🔄 Información detallada de precios unitarios y totales

#### 📁 Sistema de Archivos
- 🔄 Creación automática de todas las carpetas necesarias
- 🔄 Mejor organización de archivos:
  - `data/logs/` → Logs de aplicación y alertas
  - `data/tickets/compra/` → Tickets de compra
  - `data/tickets/venta/` → Tickets de venta
  - `docs/bar_code/` → Códigos de barras generados
- 🔄 Inicialización automática de `data.json` con estructura completa

---

### 🐛 Corregido

- ✅ Corrección en cálculo de balance de productos
- ✅ Mejor manejo de productos sin categoría (migración automática a "Otro")
- ✅ Corrección en filtros de historial para operaciones múltiples
- ✅ Mejora en la carga de imágenes de códigos de barras (fallback a generación)
- ✅ Corrección en ordenación de tabla por múltiples campos
- ✅ Fix en cálculo de margen cuando no hay ventas
- ✅ Corrección de errores de encoding en tickets PDF

---

### 📚 Documentación

- ✅ README completamente actualizado para versión 2.0
- ✅ Nueva sección de Sistema de Logs con ejemplos
- ✅ Documentación de todas las nuevas APIs
- ✅ Sección expandida de Estructura del Proyecto con emojis
- ✅ Guía de uso de nuevas funcionalidades
- ✅ Creación de CHANGELOG.md (este archivo)
- ✅ Capturas de pantalla actualizadas
- ✅ Sección de troubleshooting ampliada

---

### 🔒 Seguridad

- ✅ Mejor manejo de errores en todas las operaciones
- ✅ Validación de permisos de escritura en carpetas críticas
- ✅ Logs de auditoría para todas las operaciones importantes
- ✅ Sanitización básica de inputs
- ✅ Protección contra rutas de archivos maliciosas

---

### ⚡ Rendimiento

- ✅ Optimización en la generación de códigos de barras
- ✅ Mejor gestión de memoria en exportación a Excel
- ✅ Carga bajo demanda de códigos de barras (lazy loading)
- ✅ Límite de 1000 registros en visualización de historial
- ✅ Caché de imágenes de códigos de barras
- ✅ Optimización de consultas a data.json

---

## [1.0.0] - 2025-08-28

### 🎉 Lanzamiento Inicial

Primera versión estable de VimenStock con funcionalidades básicas de gestión de inventario.

---

### ✨ Añadido

#### 🏗️ Sistema Base
- ✅ Sistema de gestión de inventario basado en **Node.js** y **Express**
- ✅ Base de datos JSON para almacenamiento local
- ✅ Interfaz web responsive con HTML/CSS/JavaScript vanilla

#### 📦 Gestión de Productos
- ✅ CRUD completo de productos (Crear, Leer, Actualizar, Eliminar)
- ✅ Campos: ID, Nombre, Categoría, Proveedor, Precio Compra, Precio Venta, Stock
- ✅ Generación automática de IDs secuenciales (P001, P002, etc.)
- ✅ Sistema de categorías predefinidas (10 categorías)

#### 🛒 Operaciones
- ✅ Sistema de compra de productos con actualización de stock
- ✅ Sistema de venta de productos con validación de disponibilidad
- ✅ Actualización automática de stock después de operaciones
- ✅ Cálculo automático de balance por producto
- ✅ Generación básica de tickets PDF

#### 📜 Historial
- ✅ Registro completo de todas las operaciones
- ✅ Tipos de operación: Añadido, Comprado, Vendido, Editado, Eliminado
- ✅ Filtros por tipo de operación
- ✅ Filtros por fecha (exacta o rango con **Flatpickr**)
- ✅ Filtros por categoría
- ✅ Visualización cronológica descendente

#### 💰 Análisis Financiero
- ✅ Página de finanzas con gráfico de ingresos vs gastos
- ✅ Calendario interactivo para selección de fechas (**Flatpickr**)
- ✅ Filtros por período (diario, semanal, mensual, anual, siempre)
- ✅ Filtros por categoría y producto
- ✅ Cálculo de beneficio total
- ✅ Gráfico tipo pie con **Chart.js**

#### 🎨 Interfaz
- ✅ Diseño moderno y limpio
- ✅ Modo oscuro persistente (localStorage)
- ✅ Navegación entre 3 páginas: Productos, Historial, Finanzas
- ✅ Formularios colapsables para mejor UX
- ✅ Notificaciones visuales de operaciones
- ✅ Confirmaciones antes de operaciones críticas

#### 🛠️ Utilidades
- ✅ Generador de datos de prueba (`generateData.js`)
- ✅ Ordenación de tabla por columnas (ID, Stock, Ventas, Balance, Proveedor)
- ✅ Búsqueda de productos por ID o nombre
- ✅ Filtros múltiples en tabla principal

---

### 📦 Dependencias Iniciales
- **express**: Framework web para Node.js
- **pdfkit**: Generación de PDFs para tickets
- **winston**: Sistema de logging profesional
- **Chart.js**: Gráficos interactivos (CDN)
- **Flatpickr**: Selector de fechas avanzado (CDN)

---

## 🗺️ Roadmap Futuro

<details>
<summary> Versión 2.1.0 (en desarrollo)</summary>
   
- [ ] **📋 Backup automático**: Se programa un back-up que hace realiza copias de seguridad de los datos para evitar pérdidas

- [ ] **📊 Informes personalizados**: Se permitirá generar informes formato PDF/xlsx sobre distintos datos almacenados, productos y estadísticas a tiempo real

- [ ] **📋 + Categorías**: Sistema que permite añadir nuevas categorías desde la aplicacion, sin necesidad de acceder al código

</details>

<details>
<summary> Versión 2.2.0 (futuro)</summary>

- [ ] **💻 Base de datos**: Mudanza de base de datos online (MongoDB)

</details>

<details>
<summary> Versión 3.0.0 (futuro)</summary>
   
- [ ] **📡 API REST completa**: Finalizar la API REST, completamente documentada, para facilitar su implementación

</details>

---

## 📝 Notas sobre Versionado

Seguimos [Semantic Versioning](https://semver.org/):

```
MAJOR.MINOR.PATCH
```

- **MAJOR** (X.0.0): Cambios incompatibles con versiones anteriores
- **MINOR** (0.X.0): Nuevas funcionalidades compatibles hacia atrás
- **PATCH** (0.0.X): Correcciones de errores compatibles hacia atrás

---

<div align="center">

**Última actualización:** 29 de Septiembre de 2025

**Mantenido con** ❤️ **por** [Victor Menjon](https://victormenjon.es)

[![GitHub](https://img.shields.io/badge/GitHub-VimenStock-blue?style=flat&logo=github)](https://github.com/tu-usuario/vimenstock)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>



