# VimenStock

VimenStock es un sistema de gestión de inventario y finanzas para productos, pensado para pequeñas empresas o tiendas. Permite llevar un historial de operaciones, visualizar finanzas y generar datos de prueba.

---

## Características

* Gestión de productos con stock, precios de compra/venta, proveedor e imagen.
* Historial de operaciones: Compras, Ventas, Añadidos y Ediciones.
* Filtros avanzados en historial: por tipo de operación, fecha y ID de producto.
* Finanzas: visualización de ingresos y gastos diarios, semanales, mensuales y anuales.
* Calendario interactivo para seleccionar fechas y visualizar operaciones.
* Tema claro/oscuro con toggle.

---

## Estructura del proyecto

```
VimenStock/
├─ index.html           # Página principal de productos
├─ historial.html       # Historial de operaciones
├─ finanzas.html        # Finanzas y gráfico
├─ style.css            # Estilos principales
├─ historial.js         # Lógica de historial
├─ finanzas.js          # Lógica de finanzas y calendario
├─ lightdark.js         # Toggle de tema claro/oscuro
├─ generateData.js      # Generador de datos de prueba
└─ data.json            # Datos generados por generateData.js
```

---

## Instalación y uso

1. **Clonar o descargar el repositorio:**

```bash
git clone <url-del-repo>
cd VimenStock
```

2. **Instalar dependencias (para Node.js, solo si quieres generar datos de prueba):**

```bash
npm init -y
npm install fs
```

3. **Generar datos de prueba:**

```bash
node generateData.js
```

Esto creará `data.json` con 500 productos, proveedores reales y operaciones entre 2023 y 2025.

4. **Abrir la aplicación:**

   * Simplemente abrir `index.html`, `historial.html` o `finanzas.html` en tu navegador.
   * Se recomienda usar un servidor local para evitar problemas de CORS al cargar `data.json`:

```bash
node server.js
```

---

## Funcionalidades principales

### Historial

* Filtrado por:

  * Tipo de operación: Añadido, Comprado, Vendido, Editado.
  * Fecha exacta.
  * Rango de fechas.
  * ID de producto.
* Visualización de los últimos 10,000 registros.
* Botón para reiniciar filtros.
* Toggle para mostrar/ocultar filtros.

### Finanzas

* Selección de periodo: diaria, semanal, mensual, anual.
* Visualización de calendario interactivo.
* Cálculo automático de beneficio total.
* Gráfico de ingresos vs gastos.

---

## Datos de prueba

* Productos generados automáticamente con `generateData.js`.
* Imágenes asociadas según tipo de producto.
* Operaciones entre 1/1/2023 y 31/12/2025.
* Proveedores reales de supermercados, tiendas y marcas conocidas.

---

## Dependencias externas

* [Flatpickr](https://flatpickr.js.org/) → Selector de fechas.
* [Chart.js](https://www.chartjs.org/) → Gráficos de finanzas.
* Íconos y favicon personalizados.
* `fs` de Node.js (solo para generar datos de prueba).

---

## Personalización

* Puedes añadir más productos, proveedores o tipos de operaciones editando `generateData.js`.
* Cambiar estilos y temas en `style.css`.
* Añadir nuevas métricas en finanzas modificando `finanzas.js`.

---

## Autor

Victor Menjón

---

## Licencia

Este proyecto es de uso personal y educativo. Modifícalo libremente para tus pruebas o demos.
