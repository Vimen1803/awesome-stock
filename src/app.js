let productos = {};
let historial = [];
let finanzas = [];
let categoriasGlobales = [];
let ultimaIDUsada = 0;

const STOCKBAJO = 25;

const tablaProductos = document.querySelector("#tabla-productos tbody");

const formAdd = document.getElementById("form-add");
const inputNombre = document.getElementById("nombre");
const inputProveedor = document.getElementById("proveedor");
const selectCategoria = document.getElementById("categoria");
const inputPrecioCompra = document.getElementById("precioCompra");
const inputPrecioVenta = document.getElementById("precioVenta");

const formComprar = document.getElementById("form-comprar");
const comprarContainer = document.getElementById("comprar-container");
const btnAddComprar = document.getElementById("btn-add-row-comprar");
const btnConfirmComprar = document.getElementById("btn-confirm-comprar");
const totalCompra = document.getElementById("total-compra");

const formVender = document.getElementById("form-vender");
const venderContainer = document.getElementById("vender-container");
const btnAddVender = document.getElementById("btn-add-row-vender");
const btnConfirmVender = document.getElementById("btn-confirm-vender");
const totalVenta = document.getElementById("total-venta");

const inputBusqueda = document.getElementById("busqueda-producto");
const filtroCategoriaSelect = document.getElementById("filtro-categoria");
const btnResetFiltros = document.getElementById("btn-reset-filtros");
const btnExportarExcel = document.getElementById("btn-exportar-excel");
let ordenActual = "id", ascendente = true;

// ------------------ GENERACIÓN DE CÓDIGO DE BARRAS (VÍA API) ------------------
async function generarCodigoBarras(id) {
  try {
    const response = await fetch("/api/generar-codigo-barras", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    
    if (!response.ok) {
      throw new Error("Error generando código de barras");
    }
    
    const data = await response.json();
    console.log(`Código de barras generado para ${id}: ${data.fileName}`);
    return data.imageData;
  } catch (error) {
    console.error("Error generando código de barras:", error);
    return generarCodigoBarrasLocal(id);
  }
}

function generarCodigoBarrasLocal(id) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = 200;
  canvas.height = 80;
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const code = id.replace('P', '');
  const barcodeData = generateBarcode128(code);
  
  ctx.fillStyle = '#000000';
  let x = 10;
  const barHeight = 50;
  const barWidth = 2;
  
  for (let i = 0; i < barcodeData.length; i++) {
    if (barcodeData[i] === '1') {
      ctx.fillRect(x, 10, barWidth, barHeight);
    }
    x += barWidth;
  }
  
  ctx.fillStyle = '#000000';
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(id, canvas.width / 2, canvas.height - 10);
  
  return canvas.toDataURL('image/png');
}

function generateBarcode128(text) {
  const patterns = {
    '0': '11011001100',
    '1': '11001101100',
    '2': '11001100110',
    '3': '10010011000',
    '4': '10010001100',
    '5': '10001001100',
    '6': '10011001000',
    '7': '10011000100',
    '8': '10001100100',
    '9': '11001001000'
  };
  
  let barcode = '11010010000';
  
  for (let char of text) {
    if (patterns[char]) {
      barcode += patterns[char];
    }
  }
  
  barcode += '1100011101011';
  
  return barcode;
}

// ------------------ EXPORTAR A EXCEL ------------------
async function exportarExcel() {
  try {
    mostrarNotificacion("Generando Excel, por favor espera...");
    
    const response = await fetch("/api/exportar-excel");
    
    if (!response.ok) {
      throw new Error("Error exportando a Excel");
    }
    
    const data = await response.json();
    
    if (data.success) {
      mostrarNotificacion(`Excel generado correctamente: ${data.fileName}`, true);
    } else {
      mostrarNotificacion("Error al generar Excel", false);
    }
  } catch (error) {
    console.error("Error exportando a Excel:", error);
    mostrarNotificacion("Error al exportar Excel", false);
  }
}

// ------------------ ALERTAS DE STOCK BAJO ------------------
async function registrarAlertasStock(productosStockBajo) {
  try {
    const response = await fetch("/api/registrar-alerta-stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productos: productosStockBajo })
    });
    
    if (!response.ok) {
      console.error("Error registrando alertas de stock");
      return;
    }
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`Alertas de stock registradas: ${data.alertasRegistradas}`);
    }
  } catch (error) {
    console.error("Error registrando alertas de stock:", error);
  }
}

// ------------------ MODO OSCURO ------------------
let modoOscuro = localStorage.getItem("modo") === "dark";
if(modoOscuro) document.body.classList.add("dark");
document.getElementById("toggle-dark").onclick = ()=>{
  document.body.classList.toggle("dark");
  localStorage.setItem("modo", document.body.classList.contains("dark")?"dark":"light");
}

// ------------------ POBLAR SELECTS DE CATEGORÍAS ------------------
function poblarSelectsCategorias() {
  selectCategoria.innerHTML = "";
  categoriasGlobales.forEach(categoria => {
    const option = document.createElement("option");
    option.value = categoria;
    option.textContent = categoria;
    if (categoria === "Otro") option.selected = true;
    selectCategoria.appendChild(option);
  });

  filtroCategoriaSelect.innerHTML = '<option value="todos">Todos</option>';
  categoriasGlobales.forEach(categoria => {
    const option = document.createElement("option");
    option.value = categoria;
    option.textContent = categoria;
    filtroCategoriaSelect.appendChild(option);
  });
}

// ------------------ CARGAR / GUARDAR ------------------
async function cargarDatos(){
  try{
    const res = await fetch("/api/data");
    if(!res.ok) throw new Error("Error al cargar datos");
    const data = await res.json();
    productos = data.productos||{};
    historial = data.historial||[];
    finanzas = data.finanzas||[];
    categoriasGlobales = data.categorias||[];
    ultimaIDUsada = data.ultimaIDUsada || 0;
    
    if(!data.ultimaIDUsada) {
      const ids = Object.keys(productos).map(id=>parseInt(id.replace("P",""))).filter(n=>!isNaN(n));
      ultimaIDUsada = ids.length ? Math.max(...ids) : 0;
    }
    
    poblarSelectsCategorias();
    
    for(const id of Object.keys(productos)) {
      if(!productos[id].categoria) {
        productos[id].categoria = "Otro";
      }
      if(!productos[id].imagen) {
        const imagenBarras = await generarCodigoBarras(id);
        productos[id].imagen = imagenBarras;
        await guardarDatos();
      }
    }
    
    renderTabla();
  }catch(err){
    console.error(err);
    productos = {}; historial = []; finanzas = []; categoriasGlobales = []; ultimaIDUsada = 0;
    renderTabla();
  }
}

async function guardarDatos(){
  try{
    await fetch("/api/data",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({categorias: categoriasGlobales, productos, historial, finanzas, ultimaIDUsada}, null, 2)
    });
  }catch(err){
    console.error("Error al guardar datos", err);
    mostrarNotificacion("Error al guardar datos", false);
  }
}

// ------------------ ID AUTOMÁTICO ------------------
function generarID(){
  ultimaIDUsada++;
  return `P${ultimaIDUsada.toString().padStart(3,"0")}`;
}

// ------------------ NOTIFICACIONES Y CONFIRMACIONES ------------------
function mostrarNotificacion(mensaje, exito=true){
  const notif = document.createElement("div");
  notif.className = "notificacion";
  notif.style.position = "fixed";
  notif.style.top = "50%";
  notif.style.left = "50%";
  notif.style.transform = "translate(-50%, -50%)";
  notif.style.padding = "15px 25px";
  notif.style.borderRadius = "8px";
  notif.style.backgroundColor = exito ? "#28a745" : "#dc3545";
  notif.style.color = "white";
  notif.style.fontWeight = "bold";
  notif.style.fontSize = "1.1rem";
  notif.style.opacity = "0";
  notif.style.transition = "opacity 0.5s ease";
  notif.style.zIndex = "10000";

  notif.innerText = mensaje;
  document.body.appendChild(notif);

  requestAnimationFrame(() => { notif.style.opacity = "1"; });

  setTimeout(() => { 
    notif.style.opacity = "0";
    setTimeout(() => notif.remove(), 500);
  }, 2000);
}

function mostrarConfirmacion(mensaje, callback){
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";
  modal.style.opacity = "0";
  modal.style.transition = "opacity 0.3s ease";

  modal.innerHTML = `<div class="modal-content" style="
    width:350px; padding:20px; border-radius:12px;
    background-color:black; color:white; text-align:center;
    transform: translateY(-20px); transition: transform 0.3s ease;">
    <p>${mensaje}</p>
    <button id="confirm-yes" style="width:45%; margin:5px; padding:8px; border:none; border-radius:6px; background-color:#28a745; color:white; cursor:pointer;">Sí</button>
    <button id="confirm-no" style="width:45%; margin:5px; padding:8px; border:none; border-radius:6px; background-color:#dc3545; color:white; cursor:pointer;">No</button>
  </div>`;

  document.body.appendChild(modal);
  requestAnimationFrame(()=>{ modal.style.opacity="1"; modal.querySelector(".modal-content").style.transform="translateY(0)"; });

  modal.querySelector("#confirm-yes").onclick=()=>{
    callback();
    modal.remove();
  };
  modal.querySelector("#confirm-no").onclick=()=> modal.remove();
  modal.onclick = e => { if(e.target===modal) modal.remove(); };
}

// ------------------ RENDER TABLA ------------------
async function renderTabla(){
  tablaProductos.innerHTML="";
  let arr = Object.entries(productos);

  const busq = inputBusqueda.value.toLowerCase();
  if(busq) arr = arr.filter(([id,prod])=>id.toLowerCase().includes(busq) || prod.nombre.toLowerCase().includes(busq));

  const categoriaFiltro = filtroCategoriaSelect.value;
  if(categoriaFiltro !== "todos") {
    arr = arr.filter(([id,prod]) => prod.categoria === categoriaFiltro);
  }

  arr.sort((a, b) => {
    let valA, valB;

    if (ordenActual === "id") {
      valA = parseInt(a[0].replace("P", ""));
      valB = parseInt(b[0].replace("P", ""));
    }
    else if (ordenActual === "stock" || ordenActual === "ventasTotales" || ordenActual == "balance") {
      valA = a[1][ordenActual];
      valB = b[1][ordenActual];
    }
    else if (ordenActual === "proveedor") {
      valA = a[1].proveedor.toLowerCase();
      valB = b[1].proveedor.toLowerCase();
      return ascendente ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    else if (ordenActual === "fechaAñadido") {
      valA = new Date(a[1].fechaAñadido);
      valB = new Date(b[1].fechaAñadido);
    }

    return ascendente ? valA - valB : valB - valA;
  });

  for(const [id, prod] of arr) {
    const tr = document.createElement("tr");
    const balance = prod.balance || 0.00;
    
    const imagenBarras = `/bar_code/${id}.png`;
    
    const stockBajo = prod.stock < STOCKBAJO;
    const stockHTML = stockBajo 
      ? `<span style="color: #dc3545; font-weight: bold; font-size: 1.1em;">${prod.stock}</span>`
      : prod.stock;
    
    tr.innerHTML = `<td>${id}</td>
      <td>${prod.nombre}</td>
      <td>${prod.categoria || "Otro"}</td>
      <td>${prod.proveedor}</td>
      <td>${prod.precioCompra.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
      <td>${prod.precioVenta.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
      <td>${stockHTML}</td>
      <td>${prod.ventasTotales}</td>
      <td>${balance.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
      <td><img src="${imagenBarras}" style="width:100px; height:auto; cursor:pointer;" title="Clic para ampliar" data-id="${id}"></td>
      <td>
        <div class="acciones-producto">
          <div class="acciones-row">
            <button class="editar" style="color: black;">Editar</button>
            <button class="eliminar" style="color: black;">Eliminar</button>
          </div>
          <div class="acciones-row">
            <button class="historial-btn" style="color: black;">Historial</button>
          </div>
        </div>
      </td>`;

    const imgElement = tr.querySelector("img");
    
    imgElement.onerror = async function() {
      console.log(`Código de barras no encontrado para ${id}, generando...`);
      try {
        const imagenGenerada = await generarCodigoBarras(id);
        this.src = imagenGenerada;
        this.onerror = null;
        
        productos[id].imagen = imagenGenerada;
        await guardarDatos();
      } catch (error) {
        console.error(`Error generando código de barras para ${id}:`, error);
        this.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'40\'%3E%3Crect fill=\'%23ddd\' width=\'100\' height=\'40\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\' fill=\'%23666\' font-size=\'10\'%3EError%3C/text%3E%3C/svg%3E';
      }
    };
    
    imgElement.onclick = () => ampliarCodigoBarras(imagenBarras, id);
    tr.querySelector(".editar").onclick = () => abrirEditar(id);
    tr.querySelector(".eliminar").onclick = () => eliminarProducto(id);
    tr.querySelector(".historial-btn").onclick = () => mostrarHistorialProducto(id);
    tablaProductos.appendChild(tr);
  }
}

// ------------------ AMPLIAR CÓDIGO DE BARRAS ------------------
function ampliarCodigoBarras(imgSrc, id) {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";
  modal.style.opacity = "0";
  modal.style.transition = "opacity 0.3s ease";

  const bgColor = modoOscuro ? "#2c2c2c" : "#fff";

  modal.innerHTML = `<div class="modal-content" style="
    width:400px; padding:20px; border-radius:12px;
    background-color:${bgColor}; text-align:center;
    transform: translateY(-20px); transition: transform 0.3s ease;">
    <h3>Código de Barras - ${id}</h3>
    <img src="${imgSrc}" style="width:100%; height:auto; margin:20px 0;">
    <button id="btn-cerrar" style="width:100%; padding:10px; border:none; border-radius:6px; background-color:#0078d7; color:white; font-weight:bold; cursor:pointer;">Cerrar</button>
  </div>`;

  document.body.appendChild(modal);
  requestAnimationFrame(() => {
    modal.style.opacity = "1";
    modal.querySelector(".modal-content").style.transform = "translateY(0)";
  });

  modal.querySelector("#btn-cerrar").onclick = () => {
    modal.style.opacity = "0";
    setTimeout(() => modal.remove(), 300);
  };
  modal.onclick = e => {
    if (e.target === modal) {
      modal.style.opacity = "0";
      setTimeout(() => modal.remove(), 300);
    }
  };
}

// ------------------ FORMULARIOS ------------------
formAdd.onsubmit=async (e)=>{
  e.preventDefault();
  if(Object.values(productos).some(p=>p.nombre===inputNombre.value)){
    mostrarNotificacion("Producto ya existe", false);
    return;
  }
  mostrarConfirmacion("¿Añadir nuevo producto?", async ()=>{
    const codigo=generarID();
    const imagenBarras = await generarCodigoBarras(codigo);
    const nuevo={
      nombre: inputNombre.value,
      categoria: selectCategoria.value,
      proveedor: inputProveedor.value,
      precioCompra: parseFloat(inputPrecioCompra.value),
      precioVenta: parseFloat(inputPrecioVenta.value),
      stock:0, ventasTotales:0, balance:0,
      imagen: imagenBarras,
      fechaAñadido: new Date().toISOString()
    };
    productos[codigo]=nuevo;
    historial.push({
      fecha:new Date().toISOString(),
      accion:"Añadido",
      productoID:codigo,
      productoNombre:nuevo.nombre,
      categoria:nuevo.categoria,
      cantidad:0
    });
    await guardarDatos();
    renderTabla();
    formAdd.reset();
    selectCategoria.value = "Otro";
    mostrarNotificacion("Producto añadido con éxito");
  });
}

// ------------------ COMPRAR / VENDER ------------------
function crearFila(tipo){
  const div=document.createElement("div");
  div.className="operacion-row";
  div.innerHTML=`<input type="text" class="op-codigo" placeholder="Código Producto">
    <input type="text" class="op-nombre" placeholder="Nombre" readonly>
    <input type="number" class="op-cantidad" placeholder="Cantidad">
    <input type="text" class="op-precio" placeholder="Precio" readonly>
    <input type="text" class="op-total" placeholder="Total" readonly>
    <button type="button" class="btn-remove" id="btn-remove">-</button>`;
  const container = tipo==="compra"?comprarContainer:venderContainer;
  container.appendChild(div);

  const inputID = div.querySelector(".op-codigo");
  const inputNombre = div.querySelector(".op-nombre");
  const inputCantidad = div.querySelector(".op-cantidad");
  const inputPrecio = div.querySelector(".op-precio");
  const inputTotal = div.querySelector(".op-total");
  const btnRemove = div.querySelector(".btn-remove");

  function actualizarFila(){
    const prod = productos[inputID.value.toUpperCase()];
    if(prod){
      inputNombre.value = prod.nombre;
      const precio = tipo === "compra" ? prod.precioCompra : prod.precioVenta;
      const cantidad = parseInt(inputCantidad.value) || 0;
      const total = precio * cantidad;

      inputPrecio.value = precio.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
      inputTotal.value = total.toFixed(2).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
    } else {
      inputNombre.value = "";
      inputPrecio.value = "";
      inputTotal.value = "";
    }
    actualizarTotal(tipo);
  }

  inputID.addEventListener("input", actualizarFila);
  inputCantidad.addEventListener("input", actualizarFila);
  btnRemove.onclick=()=>{ div.remove(); actualizarTotal(tipo); };
}

function actualizarTotal(tipo){
  const container = tipo==="compra"?comprarContainer:venderContainer;
  const filas=[...container.querySelectorAll(".operacion-row")];
  let total=0;
  filas.forEach(f=>{
    const val=parseFloat(f.querySelector(".op-total").value);
    if(!isNaN(val)) total+=val;
  });
  if(tipo==="compra") totalCompra.value = total.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  else totalVenta.value = total.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

btnAddComprar.onclick=()=>crearFila("compra");
btnAddVender.onclick=()=>crearFila("venta");

async function operar(tipo){
  const container = tipo==="compra"?comprarContainer:venderContainer;
  const filas=[...container.querySelectorAll(".operacion-row")];
  if(filas.length===0){ mostrarNotificacion("No hay filas para procesar", false); return; }

  mostrarConfirmacion(`¿Confirmar ${tipo==="compra"?"compra":"venta"}?`, async ()=>{
    let cambios=false;
    let operacionesTicket = [];
    let productosStockBajo = [];
    const fechaOperacion = new Date().toISOString();
    
    for(const fila of filas){
      const cod=fila.querySelector(".op-codigo").value.trim().toUpperCase();
      const cant=parseInt(fila.querySelector(".op-cantidad").value);
      if(!cod || isNaN(cant)||cant<=0) continue;
      if(!productos[cod]){ mostrarNotificacion(`Producto ${cod} no existe`, false); continue; }
      if(tipo==="venta" && productos[cod].stock<cant){ mostrarNotificacion(`Stock insuficiente de ${cod}`, false); continue; }

      cambios=true;
      const precioUnitario = tipo==="venta" ? productos[cod].precioVenta : productos[cod].precioCompra;
      const montoTotal = precioUnitario * cant;

      operacionesTicket.push({
        codigo: cod,
        nombre: productos[cod].nombre,
        cantidad: cant,
        precioUnitario: precioUnitario,
        total: montoTotal
      });

      if(tipo === "venta") {
        productos[cod].stock -= cant;
        productos[cod].ventasTotales += cant;
        productos[cod].balance += montoTotal;
        
        if(productos[cod].stock < STOCKBAJO) {
          productosStockBajo.push({
            id: cod,
            nombre: productos[cod].nombre,
            stock: productos[cod].stock
          });
        }
        
        finanzas.push({
          fecha: fechaOperacion,
          tipo: "ingreso",
          monto: montoTotal,
          categoria: productos[cod].categoria,
          productoID: cod,
        });
      } else {
        productos[cod].stock += cant;
        productos[cod].balance -= montoTotal;
        finanzas.push({
          fecha: fechaOperacion,
          tipo: "gasto",
          monto: montoTotal,
          categoria: productos[cod].categoria,
          productoID: cod,
        });
      }
    }
    
    if(tipo === "venta" && productosStockBajo.length > 0) {
      await registrarAlertasStock(productosStockBajo);
    }

    if(cambios){
      try {
        const totalOperacion = operacionesTicket.reduce((sum, op) => sum + op.total, 0);
        const ticketResponse = await fetch("/api/generar-ticket", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            tipo: tipo,
            operaciones: operacionesTicket,
            total: totalOperacion,
            fecha: fechaOperacion
          })
        });

        const ticketData = await ticketResponse.json();

        if (ticketData.success) {
          historial.push({
            fecha: fechaOperacion,
            accion: tipo==="compra"?"Comprado":"Vendido",
            productos: operacionesTicket.map(op => ({
              productoID: op.codigo,
              productoNombre: op.nombre,
              categoria: productos[op.codigo].categoria,
              cantidad: op.cantidad,
              precioUnitario: op.precioUnitario,
              precioTotal: op.total
            })),
            precioTotalOperacion: totalOperacion,
            ticketID: ticketData.operacionID,
            ticketFile: ticketData.fileName
          });

          await guardarDatos();
          renderTabla();
          mostrarNotificacion(`Operación ${tipo==="compra"?"compra":"venta"} realizada con éxito. Ticket generado: ${ticketData.fileName}`);
        } else {
          historial.push({
            fecha: fechaOperacion,
            accion: tipo==="compra"?"Comprado":"Vendido",
            productos: operacionesTicket.map(op => ({
              productoID: op.codigo,
              productoNombre: op.nombre,
              categoria: productos[op.codigo].categoria,
              cantidad: op.cantidad,
              precioUnitario: op.precioUnitario,
              precioTotal: op.total
            })),
            precioTotalOperacion: totalOperacion
          });

          await guardarDatos();
          renderTabla();
          mostrarNotificacion(`Operación ${tipo==="compra"?"compra":"venta"} realizada con éxito, pero error generando ticket`);
        }
      } catch (error) {
        console.error("Error generando ticket:", error);
        historial.push({
          fecha: fechaOperacion,
          accion: tipo==="compra"?"Comprado":"Vendido",
          productos: operacionesTicket.map(op => ({
            productoID: op.codigo,
            productoNombre: op.nombre,
            categoria: productos[op.codigo].categoria,
            cantidad: op.cantidad,
            precioUnitario: op.precioUnitario,
            precioTotal: op.total
          })),
          precioTotalOperacion: operacionesTicket.reduce((sum, op) => sum + op.total, 0)
        });

        await guardarDatos();
        renderTabla();
        mostrarNotificacion(`Operación ${tipo==="compra"?"compra":"venta"} realizada con éxito, pero error generando ticket`);
      }
    }else{
      mostrarNotificacion("No se pudo completar la operación", false);
    }

    filas.forEach(f=>{
      f.querySelector(".op-codigo").value="";
      f.querySelector(".op-nombre").value="";
      f.querySelector(".op-cantidad").value="";
      f.querySelector(".op-precio").value="";
      f.querySelector(".op-total").value="";
    });
    actualizarTotal(tipo);
  });
}

btnConfirmComprar.onclick=()=>operar("compra");
btnConfirmVender.onclick=()=>operar("venta");

// ------------------ EDITAR / HISTORIAL / ELIMINAR ------------------
function abrirEditar(id){
  const prod = productos[id];
  const modal = document.createElement("div");
  modal.className="modal";
  modal.style.justifyContent="center";
  modal.style.alignItems="center";
  modal.style.opacity="0";
  modal.style.transition="opacity 0.3s ease";

  const bgColor = modoOscuro ? "#2c2c2c" : "#fff";
  const textColor = modoOscuro ? "#fff" : "#000";

  const categoriasOptions = categoriasGlobales.map(cat => 
    `<option value="${cat}" ${prod.categoria === cat ? 'selected' : ''}>${cat}</option>`
  ).join('');

  modal.innerHTML=`<div class="modal-content" style="
      width:400px; max-height:600px; overflow-y:auto;
      border-radius:12px; padding:20px;
      background-color:${bgColor}; color:${textColor};
      transform: translateY(-20px); transition: transform 0.3s ease;">
      <h3>Editar ${prod.nombre}</h3>
      <label>Nombre<input value="${prod.nombre}" id="edit-nombre" style="margin-top:5px; padding:5px; border-radius:6px; border:1px solid #ccc; width:100%;"></label>
      <label>Categoría<select id="edit-categoria" style="margin-top:5px; padding:5px; border-radius:6px; border:1px solid #ccc; width:100%;">${categoriasOptions}</select></label>
      <label>Proveedor<input value="${prod.proveedor}" id="edit-proveedor" style="margin-top:5px; padding:5px; border-radius:6px; border:1px solid #ccc; width:100%;"></label>
      <label>Precio Compra (€)<input type="number" value="${prod.precioCompra}" id="edit-compra" style="margin-top:5px; padding:5px; border-radius:6px; border:1px solid #ccc; width:100%;"></label>
      <label>Precio Venta (€)<input type="number" value="${prod.precioVenta}" id="edit-venta" style="margin-top:5px; padding:5px; border-radius:6px; border:1px solid #ccc; width:100%;"></label>
      <button id="btn-save" style="width:100%; padding:10px; border:none; border-radius:6px; background-color:#28a745; color:white; font-weight:bold; cursor:pointer; margin-top:10px;">Guardar</button>
      <button id="btn-close" style="width:100%; padding:10px; border:none; border-radius:6px; background-color:#dc3545; color:white; font-weight:bold; cursor:pointer; margin-top:10px;">Cerrar</button>
    </div>`;

  document.body.appendChild(modal);
  requestAnimationFrame(()=>{ modal.style.opacity="1"; modal.querySelector(".modal-content").style.transform="translateY(0)"; });

  const valoresOriginales = {
    nombre: prod.nombre,
    categoria: prod.categoria || "Otro",
    proveedor: prod.proveedor,
    precioCompra: prod.precioCompra,
    precioVenta: prod.precioVenta
  };

  function hayCambios(){
    return (
      modal.querySelector("#edit-nombre").value !== valoresOriginales.nombre ||
      modal.querySelector("#edit-categoria").value !== valoresOriginales.categoria ||
      modal.querySelector("#edit-proveedor").value !== valoresOriginales.proveedor ||
      parseFloat(modal.querySelector("#edit-compra").value) !== valoresOriginales.precioCompra ||
      parseFloat(modal.querySelector("#edit-venta").value) !== valoresOriginales.precioVenta
    );
  }

  function avisoSalirSinGuardar(){
    if(!hayCambios()){ modal.remove(); return; }

    const aviso = document.createElement("div");
    aviso.className = "modal";
    aviso.style.justifyContent="center";
    aviso.style.alignItems="center";
    aviso.style.opacity="0";
    aviso.style.transition="opacity 0.3s ease";

    aviso.innerHTML=`<div class="modal-content" style="
      width:350px; padding:20px; border-radius:12px;
      background-color:black; color:#fff; text-align:center;
      transform: translateY(-20px); transition: transform 0.3s ease;">
      <p>Hay cambios sin aplicar</p>
      <button id="apply-changes" style="width:45%; margin:5px; padding:8px; border:none; border-radius:6px; background-color:#28a745; color:white; cursor:pointer;">Aplicar cambios</button>
      <button id="exit-without" style="width:45%; margin:5px; padding:8px; border:none; border-radius:6px; background-color:#dc3545; color:white; cursor:pointer;">Salir</button>
    </div>`;

    document.body.appendChild(aviso);
    requestAnimationFrame(()=>{ aviso.style.opacity="1"; aviso.querySelector(".modal-content").style.transform="translateY(0)"; });

    aviso.querySelector("#apply-changes").onclick = ()=>{
      aviso.remove();
      guardarCambios();
    };
    aviso.querySelector("#exit-without").onclick = ()=>{ aviso.remove(); modal.remove(); };
    aviso.onclick = e=>{ if(e.target===aviso) aviso.remove(); };
  }

  function guardarCambios(){
    mostrarConfirmacion("¿Guardar cambios?", async ()=>{
      const cambios = [];
      const nuevoNombre = modal.querySelector("#edit-nombre").value;
      const nuevaCategoria = modal.querySelector("#edit-categoria").value;
      const nuevoProveedor = modal.querySelector("#edit-proveedor").value;
      const nuevoPrecioCompra = parseFloat(modal.querySelector("#edit-compra").value);
      const nuevoPrecioVenta = parseFloat(modal.querySelector("#edit-venta").value);

      if(nuevoNombre !== valoresOriginales.nombre) cambios.push(`Nombre: ${valoresOriginales.nombre} → ${nuevoNombre}`);
      if(nuevaCategoria !== valoresOriginales.categoria) cambios.push(`Categoría: ${valoresOriginales.categoria} → ${nuevaCategoria}`);
      if(nuevoProveedor !== valoresOriginales.proveedor) cambios.push(`Proveedor: ${valoresOriginales.proveedor} → ${nuevoProveedor}`);
      if(nuevoPrecioCompra !== valoresOriginales.precioCompra) cambios.push(`P.Compra: ${valoresOriginales.precioCompra}€ → ${nuevoPrecioCompra}€`);
      if(nuevoPrecioVenta !== valoresOriginales.precioVenta) cambios.push(`P.Venta: ${valoresOriginales.precioVenta}€ → ${nuevoPrecioVenta}€`);

      prod.nombre = nuevoNombre;
      prod.categoria = nuevaCategoria;
      prod.proveedor = nuevoProveedor;
      prod.precioCompra = nuevoPrecioCompra;
      prod.precioVenta = nuevoPrecioVenta;

      historial.push({
        fecha:new Date().toISOString(),
        accion:"Editado",
        productoID:id,
        productoNombre:prod.nombre,
        categoria:prod.categoria,
        cantidad:0,
        cambios:cambios
      });

      await guardarDatos();
      renderTabla();
      mostrarNotificacion("Producto editado con éxito");
      modal.remove();
    });
  }

  modal.querySelector("#btn-save").onclick = guardarCambios;
  modal.querySelector("#btn-close").onclick = avisoSalirSinGuardar;
  modal.onclick = e=>{ if(e.target===modal) avisoSalirSinGuardar(); };
}

function eliminarProducto(id){
  mostrarConfirmacion("¿Eliminar producto?", async ()=>{
    historial.push({
      fecha:new Date().toISOString(),
      accion:"Eliminado",
      productoID:id,
      productoNombre:productos[id].nombre,
      categoria:productos[id].categoria,
      cantidad:0
    });
    delete productos[id];
    await guardarDatos();
    renderTabla();
    mostrarNotificacion("Producto eliminado con éxito");
  });
}

function mostrarHistorialProducto(id) {
  console.log(`Buscando historial para el producto con ID: ${id}`);

  const modal = document.createElement("div");
  modal.className = "modal";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";
  modal.style.opacity = "0";
  modal.style.transition = "opacity 0.3s ease";

  const historialProd = historial.filter(h => {
    if (h.productos) {
      return h.productos.some(producto => producto.productoID === id);
    }
    return h.productoID === id;
  });

  console.log("Historial filtrado:", historialProd);

  historialProd.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  if (historialProd.length === 0) {
    console.log("No se encontró historial para este producto.");
    modal.innerHTML = `<div class="modal-content" style="width:400px; padding:20px; background-color:#fff; color:#000; border-radius:12px;">
      <h3>No hay historial disponible</h3>
      <button id="btn-close" style="width:100%; padding:10px; border:none; border-radius:6px; background-color:#0078d7; color:white; font-weight:bold; cursor:pointer; margin-top:10px;">Cerrar</button>
    </div>`;
    document.body.appendChild(modal);
    requestAnimationFrame(() => {
      modal.style.opacity = "1";
      modal.querySelector(".modal-content").style.transform = "translateY(0)";
    });
    modal.querySelector("#btn-close").onclick = () => {
      modal.style.opacity = "0";
      modal.querySelector(".modal-content").style.transform = "translateY(-20px)";
      setTimeout(() => modal.remove(), 300);
    };
    return;
  }

  function formatFecha(d) {
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();
    const hora = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const seg = String(d.getSeconds()).padStart(2, '0');
    return `${dia}/${mes}/${anio} ${hora}:${min}:${seg}`;
  }

  function getColor(accion) {
    switch (accion) {
      case "Añadido": return modoOscuro ? "#5a4b20" : "#fff3cd";
      case "Comprado": return modoOscuro ? "#5c1f1f" : "#f8d7da";
      case "Vendido": return modoOscuro ? "#1f5c1f" : "#d4edda";
      case "Editado": return modoOscuro ? "#1f4b5c" : "#d1ecf1";
      case "Eliminado": return "#f8d7da";
      default: return "#eee";
    }
  }

  const bgColor = modoOscuro ? "#2c2c2c" : "#fff";
  const textColor = modoOscuro ? "#fff" : "#000";

  modal.innerHTML = `<div class="modal-content" style="width:800px; max-height:600px; overflow-y:auto; border-radius:12px; padding:20px; background-color:${bgColor}; color:${textColor};">
    <h3>Historial de ${id}</h3>
    <ul style="list-style:none; padding:0; margin:10px 0;">
      ${historialProd.map(h => {
        if (h.productos) {
          return h.productos.map(producto => {
            let detalles = `${h.accion} - ${producto.productoNombre}`;
            if (producto.cantidad > 0) detalles += ` ${producto.cantidad} unidades. - `;
            if (producto.precioUnitario) detalles += `<small> ${Number(producto.precioUnitario).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€/unidad</small>`;
            if (producto.precioTotal) detalles += ` - <small>Total: ${Number(producto.precioTotal).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</small>`;
            return `<li style="
              padding:8px 12px; margin-bottom:6px; border-radius:6px;
              background-color:${getColor(h.accion)}; color:#fff;
              display:flex; justify-content:space-between; align-items:center;">
              <span>${detalles}</span>
              <span style="font-size:0.8rem; opacity:0.8;">${formatFecha(new Date(h.fecha))}</span>
            </li>`;
          }).join("");
        } else if (h.accion === "Editado" && h.cambios && h.cambios.length > 0) {
          let detalles = `${h.accion} - ${h.productoNombre}<br>`;
          detalles += h.cambios.map(cambio => `<small style="display:block; margin-left:15px;">${cambio}</small>`).join('');
          
          return `<li style="
            padding:8px 12px; margin-bottom:6px; border-radius:6px;
            background-color:${getColor(h.accion)}; color:#fff;
            display:flex; justify-content:space-between; align-items:flex-start;">
            <span>${detalles}</span>
            <span style="font-size:0.8rem; opacity:0.8; white-space:nowrap; margin-left:10px;">${formatFecha(new Date(h.fecha))}</span>
          </li>`;
        } else {
          let detalles = `${h.accion} - ${h.productoNombre}`;
          if (h.cantidad > 0) detalles += ` ${h.cantidad} unidades.`;
          return `<li style="
            padding:8px 12px; margin-bottom:6px; border-radius:6px;
            background-color:${getColor(h.accion)}; color:#fff;
            display:flex; justify-content:space-between; align-items:center;">
            <span>${detalles}</span>
            <span style="font-size:0.8rem; opacity:0.8;">${formatFecha(new Date(h.fecha))}</span>
          </li>`;
        }
      }).join("")}
    </ul>
    <button id="btn-close" style="width:100%; padding:10px; border:none; border-radius:6px; background-color:#0078d7; color:white; font-weight:bold; cursor:pointer; margin-top:10px;">Cerrar</button>
  </div>`;

  document.body.appendChild(modal);
  requestAnimationFrame(() => {
    modal.style.opacity = "1";
    modal.querySelector(".modal-content").style.transform = "translateY(0)";
  });

  modal.querySelector("#btn-close").onclick = () => {
    modal.style.opacity = "0";
    modal.querySelector(".modal-content").style.transform = "translateY(-20px)";
    setTimeout(() => modal.remove(), 300);
  };
  modal.onclick = e => {
    if (e.target === modal) {
      modal.style.opacity = "0";
      modal.querySelector(".modal-content").style.transform = "translateY(-20px)";
      setTimeout(() => modal.remove(), 300);
    }
  };
}

// ------------------ FILTROS ------------------
inputBusqueda.addEventListener("input", renderTabla);
filtroCategoriaSelect.addEventListener("change", renderTabla);

btnResetFiltros.onclick = () => {
  inputBusqueda.value = "";
  filtroCategoriaSelect.value = "todos";
  ordenActual = "id";
  ascendente = true;
  renderTabla();
  actualizarFlechas();
};

btnExportarExcel.onclick = () => {
  exportarExcel();
};

// ------------------ ORDEN POR CLIC EN CABECERA CON FLECHAS ------------------
const ths = document.querySelectorAll("#tabla-productos thead th");
ths.forEach((th, index) => {
  const text = th.textContent;
  if(!["ID","Stock","Ventas Totales","Proveedor", "Balance (€)"].includes(text)) return;
  th.style.cursor = "pointer";

  const arrow = document.createElement("span");
  arrow.style.marginLeft = "5px";
  th.appendChild(arrow);

  th.onclick = () => {
    let key;
    if(text==="ID") key="id";
    else if(text==="Stock") key="stock";
    else if(text==="Ventas Totales") key="ventasTotales";
    else if(text==="Proveedor") key="proveedor";
    else if(text == "Balance (€)") key="balance";

    if(ordenActual === key) ascendente = !ascendente;
    else { ordenActual = key; ascendente = true; }

    renderTabla();
    actualizarFlechas();
  };
});

function actualizarFlechas(){
  ths.forEach(th=>{
    const span = th.querySelector("span");
    if(!span) return;
    const text = th.textContent.replace("↑","").replace("↓","");
    if((text==="ID" && ordenActual==="id") || 
       (text==="Stock" && ordenActual==="stock") ||
       (text==="Proveedor" && ordenActual==="proveedor") ||
       (text==="Ventas Totales" && ordenActual==="ventasTotales") ||
      (text==="Balance (€)" && ordenActual==="balance")){
      span.textContent = ascendente ? "↑" : "↓";
    } else {
      span.textContent = "";
    }
  });
}

actualizarFlechas();

// ------------------ INICIAL ------------------
cargarDatos();
crearFila("compra");

crearFila("venta");
