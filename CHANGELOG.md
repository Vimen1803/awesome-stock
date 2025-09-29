# 📋 Historial de Cambios - VimenStock

> Todos los cambios notables en este proyecto son documentados en este archivo.
> 
> El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
> y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

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

### [2.1.0] - Planificado Q4 2025
- [ ] 🖨️ Impresión directa de códigos de barras
- [ ] 📷 Lector de códigos de barras con webcam
- [ ] 📧 Notificaciones por email para alertas de stock
- [ ] ☁️ Backup automático programado
- [ ] 📱 Aplicación móvil (PWA)
- [ ] 🔍 Búsqueda avanzada con autocompletado

### [3.0.0] - En Consideración 2026
- [ ] 🗄️ Migración a base de datos (MongoDB/PostgreSQL)
- [ ] 👥 Sistema de autenticación y autorización multiusuario
- [ ] 📡 API REST completa documentada con Swagger
- [ ] 📊 Dashboard en tiempo real con WebSockets
- [ ] 🏢 Soporte para múltiples almacenes
- [ ] 🌍 Internacionalización (i18n)
- [ ] 📊 Informes personalizados en PDF

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


