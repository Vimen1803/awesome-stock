# Historial de Cambios - VimenStock

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [2.0.0] - 2025-09-29

### 🎉 Lanzamiento Mayor - Versión 2.0

Esta es una actualización importante que introduce múltiples funcionalidades profesionales y mejoras significativas en el sistema.

### ✨ Añadido

#### Códigos de Barras
- Generación automática de códigos de barras en formato Code 128 para cada producto
- Almacenamiento de códigos de barras en `docs/bar_code/`
- Visualización de códigos de barras en la tabla de productos
- Funcionalidad de ampliación de códigos de barras con clic
- Generación bajo demanda si el archivo no existe
- API endpoint: `POST /api/generar-codigo-barras`

#### Exportación a Excel
- Nueva funcionalidad completa de exportación a Excel usando ExcelJS
- Generación de archivo `data.xlsx` con 4 hojas:
  - **Productos**: Inventario completo con todos los campos
  - **Historial**: Todas las operaciones realizadas
  - **Finanzas**: Registros de ingresos y gastos
  - **Resumen**: Métricas generales y estadísticas
- Formato profesional con cabeceras en color y estilos
- API endpoint: `GET /api/exportar-excel`
- Botón de exportación en la interfaz principal

#### Sistema de Logs
- Implementación de Winston como sistema de logging profesional
- Log general de aplicación en `data/logs/app.log`
- Log específico de alertas de stock en `data/logs/stock_alerts.txt`
- Registro con timestamp, nivel y mensaje detallado
- Logs de todas las operaciones críticas del servidor

#### Alertas de Stock Bajo
- Sistema automático de detección de stock bajo (< 25 unidades)
- Registro automático después de cada venta
- Formato de alerta: `[ID] - [Nombre] - Stock Disponible: [X] - [Fecha y Hora]`
- Visualización destacada en la tabla (número en rojo y negrita)
- API endpoint: `POST /api/registrar-alerta-stock`

#### Página de Estadísticas
- Nueva sección completa de estadísticas avanzadas (`estadisticas.html`)
- **KPIs en tiempo real**:
  - Ingresos totales
  - Gastos totales
  - Beneficio neto
  - Margen bruto
  - Ventas totales
  - Ticket medio
- **Gráficos interactivos con Chart.js**:
  - Evolución de ventas (gráfico de línea temporal)
  - Categorías más rentables (gráfico de barras)
  - Distribución de stock (gráfico de dona)
  - Rotación de inventario (barras horizontales)
- **Tablas de análisis**:
  - Top 10 productos más vendidos
  - Productos con stock bajo (crítico/bajo/agotado)
- Filtros por período (7, 30, 90, 365 días o todo el tiempo)
- Cálculo de tendencias comparando con período anterior

#### Mejoras en Tickets PDF
- Diseño mejorado con mejor alineación y formato
- Posiciones fijas para mantener columnas alineadas
- Información de operación más clara
- Mejor manejo de nombres largos (truncado con "...")
- Fondos alternados en filas para mejor legibilidad
- Total destacado con fondo de color
- Mejor gestión de páginas múltiples

### 🔧 Cambiado

#### Estructura de Datos
- Operaciones múltiples ahora se almacenan con array de productos
- Campo `productos` en historial para operaciones con múltiples ítems
- Adición de `precioTotalOperacion` para el total de cada operación
- Campo `ticketID` y `ticketFile` para vincular tickets con operaciones

#### Interfaz de Usuario
- Reorganización del menú de navegación con nueva sección "Estadísticas"
- Mejoras en el diseño del modo oscuro
- Mejor feedback visual en todas las operaciones
- Indicadores visuales de stock bajo en la tabla principal
- Botón de exportación a Excel destacado en verde

#### Historial
- Visualización mejorada de operaciones múltiples
- Mostrar detalles de cada producto en operaciones complejas
- Enlaces directos a tickets PDF (texto azul subrayado)
- Mejor formato de fecha y hora
- Información detallada de precios unitarios y totales

#### Sistema de Archivos
- Creación automática de todas las carpetas necesarias
- Mejor organización de archivos:
  - `data/logs/` para logs
  - `data/tickets/compra/` y `data/tickets/venta/` para tickets
  - `docs/bar_code/` para códigos de barras
- Inicialización automática de `data.json` con estructura completa

### 🐛 Corregido
- Corrección en cálculo de balance de productos
- Mejor manejo de productos sin categoría (migración automática a "Otro")
- Corrección en filtros de historial para operaciones múltiples
- Mejora en la carga de imágenes de códigos de barras (fallback a generación)
- Corrección en ordenación de tabla por múltiples campos

### 📚 Documentación
- README completamente actualizado para versión 2.0
- Nueva sección de Sistema de Logs
- Documentación de todas las nuevas APIs
- Sección expandida de Estructura del Proyecto
- Guía de uso de nuevas funcionalidades
- Creación de CHANGELOG.md

### 🔒 Seguridad
- Mejor manejo de errores en todas las operaciones
- Validación de permisos de escritura en carpetas críticas
- Logs de auditoría para todas las operaciones importantes

### ⚡ Rendimiento
- Optimización en la generación de códigos de barras
- Mejor gestión de memoria en exportación a Excel
- Carga bajo demanda de códigos de barras
- Límite de 1000 registros en visualización de historial

---

## [1.0.0] - 2024-01-01

### 🎉 Lanzamiento Inicial

Primera versión estable de VimenStock con funcionalidades básicas de gestión de inventario.

### ✨ Añadido

#### Sistema Base
- Sistema de gestión de inventario basado en Node.js y Express
- Base de datos JSON para almacenamiento local
- Interfaz web responsive con HTML/CSS/JavaScript

#### Gestión de Productos
- CRUD completo de productos (Crear, Leer, Actualizar, Eliminar)
- Campos: ID, Nombre, Categoría, Proveedor, Precio Compra, Precio Venta, Stock
- Generación automática de IDs secuenciales (P001, P002, etc.)
- Sistema de categorías predefinidas (10 categorías)

#### Operaciones
- Sistema de compra de productos
- Sistema de venta de productos
- Actualización automática de stock
- Cálculo automático de balance por producto
- Generación básica de tickets PDF

#### Historial
- Registro completo de todas las operaciones
- Tipos de operación: Añadido, Comprado, Vendido, Editado, Eliminado
- Filtros por tipo de operación
- Filtros por fecha (exacta o rango con Flatpickr)
- Filtros por categoría
- Visualización cronológica descendente

#### Análisis Financiero
- Página de finanzas con gráfico de ingresos vs gastos
- Calendario interactivo para selección de fechas
- Filtros por período (diario, semanal, mensual, anual, siempre)
- Filtros por categoría y producto
- Cálculo de beneficio total
- Gráfico tipo pie con Chart.js

#### Interfaz
- Diseño moderno y limpio
- Modo oscuro persistente (localStorage)
- Navegación entre 3 páginas: Productos, Historial, Finanzas
- Formularios colapsables
- Notificaciones visuales de operaciones
- Confirmaciones antes de operaciones críticas

#### Utilidades
- Generador de datos de prueba (`generateData.js`)
- Ordenación de tabla por columnas (ID, Stock, Ventas, Balance, Proveedor)
- Búsqueda de productos por ID o nombre
- Filtros múltiples en tabla principal

### 📦 Dependencias Iniciales
- express: Framework web
- pdfkit: Generación de PDFs
- Chart.js: Gráficos (CDN)
- Flatpickr: Selector de fechas (CDN)

---

## Tipos de Cambios

- `✨ Añadido` - para funcionalidades nuevas
- `🔧 Cambiado` - para cambios en funcionalidades existentes
- `❌ Obsoleto` - para funcionalidades que serán eliminadas
- `🗑️ Eliminado` - para funcionalidades eliminadas
- `🐛 Corregido` - para corrección de errores
- `🔒 Seguridad` - para vulnerabilidades corregidas
- `📚 Documentación` - para cambios en documentación
- `⚡ Rendimiento` - para mejoras de rendimiento

---

## Roadmap Futuro

### [2.1.0] - Planificado
- Impresión directa de códigos de barras
- Lector de códigos de barras con webcam
- Notificaciones por email para alertas de stock
- Backup automático programado

### [3.0.0] - En Consideración
- Migración a base de datos (MongoDB)
- Sistema de autenticación y autorización multiusuario
- API REST completa documentada con Swagger
- Dashboard en tiempo real con WebSockets
- Soporte para múltiples almacenes

---

**Notas sobre versionado:**
- **MAJOR** (X.0.0): Cambios incompatibles con versiones anteriores
- **MINOR** (0.X.0): Nuevas funcionalidades compatibles con versiones anteriores
- **PATCH** (0.0.X): Correcciones de errores compatibles con versiones anteriores

---

*Última actualización: 29 de Septiembre de 2025*