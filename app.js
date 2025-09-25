let productos = {};
let historial = [];
let finanzas = [];

const tablaProductos = document.querySelector("#tabla-productos tbody");

// Form añadir
const formAdd = document.getElementById("form-add");
const inputNombre = document.getElementById("nombre");
const inputProveedor = document.getElementById("proveedor");
const inputPrecioCompra = document.getElementById("precioCompra");
const inputPrecioVenta = document.getElementById("precioVenta");
const inputImagen = document.getElementById("imagen");

// Comprar / vender
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

// Filtros
const inputBusqueda = document.getElementById("busqueda-producto");
const btnResetFiltros = document.getElementById("btn-reset-filtros");
let ordenActual = "id", ascendente = true;

// ------------------ MODO OSCURO ------------------
let modoOscuro = localStorage.getItem("modo") === "dark";
if(modoOscuro) document.body.classList.add("dark");
document.getElementById("toggle-dark").onclick = ()=>{
  document.body.classList.toggle("dark");
  localStorage.setItem("modo", document.body.classList.contains("dark")?"dark":"light");
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
    renderTabla();
  }catch(err){
    console.error(err);
    productos = {}; historial = []; finanzas = [];
    renderTabla();
  }
}

async function guardarDatos(){
  try{
    await fetch("/api/data",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({productos, historial, finanzas}, null, 2)
    });
  }catch(err){
    console.error("Error al guardar datos", err);
    mostrarNotificacion("Error al guardar datos", false);
  }
}

// ------------------ ID AUTOMÁTICO ------------------
function generarID(){
  const ids = Object.keys(productos).map(id=>parseInt(id.replace("P",""))).filter(n=>!isNaN(n));
  const maxID = ids.length ? Math.max(...ids) : 0;
  return `P${(maxID+1).toString().padStart(3,"0")}`;
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

  notif.innerText = mensaje;
  document.body.appendChild(notif);

  // Fade in
  requestAnimationFrame(() => { notif.style.opacity = "1"; });

  // Fade out y remover
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
// ------------------ RENDER TABLA ------------------
function renderTabla(){
  tablaProductos.innerHTML="";
  let arr = Object.entries(productos);

  // Filtro búsqueda
  const busq = inputBusqueda.value.toLowerCase();
  if(busq) arr = arr.filter(([id,prod])=>id.toLowerCase().includes(busq) || prod.nombre.toLowerCase().includes(busq));

  // Orden
  arr.sort((a, b) => {
    let valA, valB;

    // Ordenar por "id"
    if (ordenActual === "id") {
      valA = parseInt(a[0].replace("P", ""));
      valB = parseInt(b[0].replace("P", ""));
    }
    // Ordenar por "stock" o "ventasTotales"
    else if (ordenActual === "stock" || ordenActual === "ventasTotales") {
      valA = a[1][ordenActual];
      valB = b[1][ordenActual];
    }
    // Ordenar por "proveedor"
    else if (ordenActual === "proveedor") {
      valA = a[1].proveedor.toLowerCase();  // Asegúrate de que la comparación no sea sensible al caso
      valB = b[1].proveedor.toLowerCase();
      return ascendente ? valA.localeCompare(valB) : valB.localeCompare(valA);  // Comparación alfabética
    }
    // Ordenar por fecha añadida (si lo agregas)
    else if (ordenActual === "fechaAñadido") {
      valA = new Date(a[1].fechaAñadido);
      valB = new Date(b[1].fechaAñadido);
    }

    // Orden ascendente o descendente
    return ascendente ? valA - valB : valB - valA;
  });

  arr.forEach(([id, prod]) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${id}</td>
      <td>${prod.nombre}</td>
      <td>${prod.proveedor}</td>
      <td>${prod.precioCompra.toFixed(2)}</td>
      <td>${prod.precioVenta.toFixed(2)}</td>
      <td>${prod.stock}</td>
      <td>${prod.ventasTotales}</td>
      <td>${prod.imagen ? `<img src="${prod.imagen}">` : ""}</td>
      <td>
        <div class="acciones-producto">
          <div class="acciones-row">
            <button class="editar">Editar</button>
            <button class="eliminar">Eliminar</button>
          </div>
          <div class="acciones-row">
            <button class="historial-btn">Historial</button>
          </div>
        </div>
      </td>`;

    tr.querySelector(".editar").onclick = () => abrirEditar(id);
    tr.querySelector(".eliminar").onclick = () => eliminarProducto(id);
    tr.querySelector(".historial-btn").onclick = () => mostrarHistorialProducto(id);
    tablaProductos.appendChild(tr);
  });
}


// ------------------ FORMULARIOS ------------------

// Añadir producto
formAdd.onsubmit=async (e)=>{
  e.preventDefault();
  if(Object.values(productos).some(p=>p.nombre===inputNombre.value)){
    mostrarNotificacion("Producto ya existe", false);
    return;
  }
  mostrarConfirmacion("¿Añadir nuevo producto?", async ()=>{
    const codigo=generarID();
    const nuevo={
      nombre: inputNombre.value,
      proveedor: inputProveedor.value,
      precioCompra: parseFloat(inputPrecioCompra.value),
      precioVenta: parseFloat(inputPrecioVenta.value),
      stock:0, ventasTotales:0,
      imagen: inputImagen.value,
      fechaAñadido: new Date().toISOString()
    };
    productos[codigo]=nuevo;
    historial.push({fecha:new Date().toISOString(),accion:"Añadido",productoID:codigo,productoNombre:nuevo.nombre,cantidad:0});
    await guardarDatos();
    renderTabla();
    formAdd.reset();
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
    const prod = productos[inputID.value];
    if(prod){
      inputNombre.value=prod.nombre;
      inputPrecio.value=(tipo==="compra"?prod.precioCompra:prod.precioVenta).toFixed(2);
      inputTotal.value=((tipo==="compra"?prod.precioCompra:prod.precioVenta)*(parseInt(inputCantidad.value)||0)).toFixed(2);
    }else{ inputNombre.value=""; inputPrecio.value=""; inputTotal.value=""; }
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
  if(tipo==="compra") totalCompra.value=total.toFixed(2)+" €";
  else totalVenta.value=total.toFixed(2)+" €";
}

btnAddComprar.onclick=()=>crearFila("compra");
btnAddVender.onclick=()=>crearFila("venta");

async function operar(tipo){
  const container = tipo==="compra"?comprarContainer:venderContainer;
  const filas=[...container.querySelectorAll(".operacion-row")];
  if(filas.length===0){ mostrarNotificacion("No hay filas para procesar", false); return; }

  mostrarConfirmacion(`¿Confirmar ${tipo==="compra"?"compra":"venta"}?`, async ()=>{
    let cambios=false;
    for(const fila of filas){
      const cod=fila.querySelector(".op-codigo").value.trim();
      const cant=parseInt(fila.querySelector(".op-cantidad").value);
      if(!cod || isNaN(cant)||cant<=0) continue;
      if(!productos[cod]){ mostrarNotificacion(`Producto ${cod} no existe`, false); continue; }
      if(tipo==="venta" && productos[cod].stock<cant){ mostrarNotificacion(`Stock insuficiente de ${cod}`, false); continue; }

      cambios=true;
      if(tipo==="venta"){
        productos[cod].stock-=cant;
        productos[cod].ventasTotales+=cant;
        finanzas.push({fecha:new Date().toISOString(),tipo:"ingreso",monto:productos[cod].precioVenta*cant});
      }else{
        productos[cod].stock+=cant;
        finanzas.push({fecha:new Date().toISOString(),tipo:"gasto",monto:productos[cod].precioCompra*cant});
      }

      historial.push({
        fecha:new Date().toISOString(),
        accion:tipo==="compra"?"Comprado":"Vendido",
        productoID:cod,
        productoNombre:productos[cod].nombre,
        cantidad:cant
      });
    }

    if(cambios){
      await guardarDatos();
      renderTabla();
      mostrarNotificacion(`Operación ${tipo==="compra"?"compra":"venta"} realizada con éxito`);
    }else mostrarNotificacion("No se pudo completar la operación", false);

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

  modal.innerHTML=`<div class="modal-content" style="
      width:400px; max-height:600px; overflow-y:auto;
      border-radius:12px; padding:20px;
      background-color:${bgColor}; color:${textColor};
      transform: translateY(-20px); transition: transform 0.3s ease;">
      <h3>Editar ${prod.nombre}</h3>
      <label>Nombre<input value="${prod.nombre}" id="edit-nombre" style="margin-top:5px; padding:5px; border-radius:6px; border:1px solid #ccc; width:100%;"></label>
      <label>Proveedor<input value="${prod.proveedor}" id="edit-proveedor" style="margin-top:5px; padding:5px; border-radius:6px; border:1px solid #ccc; width:100%;"></label>
      <label>Precio Compra<input type="number" value="${prod.precioCompra}" id="edit-compra" style="margin-top:5px; padding:5px; border-radius:6px; border:1px solid #ccc; width:100%;"></label>
      <label>Precio Venta<input type="number" value="${prod.precioVenta}" id="edit-venta" style="margin-top:5px; padding:5px; border-radius:6px; border:1px solid #ccc; width:100%;"></label>
      <label>Imagen<input value="${prod.imagen}" id="edit-img" style="margin-top:5px; padding:5px; border-radius:6px; border:1px solid #ccc; width:100%;"></label>
      <button id="btn-save" style="width:100%; padding:10px; border:none; border-radius:6px; background-color:#28a745; color:white; font-weight:bold; cursor:pointer; margin-top:10px;">Guardar</button>
      <button id="btn-close" style="width:100%; padding:10px; border:none; border-radius:6px; background-color:#dc3545; color:white; font-weight:bold; cursor:pointer; margin-top:10px;">Cerrar</button>
    </div>`;

  document.body.appendChild(modal);
  requestAnimationFrame(()=>{ modal.style.opacity="1"; modal.querySelector(".modal-content").style.transform="translateY(0)"; });

  const valoresOriginales = {
    nombre: prod.nombre,
    proveedor: prod.proveedor,
    precioCompra: prod.precioCompra,
    precioVenta: prod.precioVenta,
    imagen: prod.imagen
  };

  function hayCambios(){
    return (
      modal.querySelector("#edit-nombre").value !== valoresOriginales.nombre ||
      modal.querySelector("#edit-proveedor").value !== valoresOriginales.proveedor ||
      parseFloat(modal.querySelector("#edit-compra").value) !== valoresOriginales.precioCompra ||
      parseFloat(modal.querySelector("#edit-venta").value) !== valoresOriginales.precioVenta ||
      modal.querySelector("#edit-img").value !== valoresOriginales.imagen
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
      prod.nombre=modal.querySelector("#edit-nombre").value;
      prod.proveedor=modal.querySelector("#edit-proveedor").value;
      prod.precioCompra=parseFloat(modal.querySelector("#edit-compra").value);
      prod.precioVenta=parseFloat(modal.querySelector("#edit-venta").value);
      prod.imagen=modal.querySelector("#edit-img").value;
      historial.push({fecha:new Date().toISOString(),accion:"Editado",productoID:id,productoNombre:prod.nombre,cantidad:0});
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
    historial.push({fecha:new Date().toISOString(),accion:"Eliminado",productoID:id,productoNombre:productos[id].nombre,cantidad:0});
    delete productos[id];
    await guardarDatos();
    renderTabla();
    mostrarNotificacion("Producto eliminado con éxito");
  });
}

function mostrarHistorialProducto(id){
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";
  modal.style.opacity = "0";
  modal.style.transition = "opacity 0.3s ease";

  const historialProd = historial.filter(h => h.productoID === id).sort((a,b)=>new Date(b.fecha)-new Date(a.fecha));

  function formatFecha(d){
    const dia = String(d.getDate()).padStart(2,'0');
    const mes = String(d.getMonth()+1).padStart(2,'0');
    const anio = d.getFullYear();
    const hora = String(d.getHours()).padStart(2,'0');
    const min = String(d.getMinutes()).padStart(2,'0');
    const seg = String(d.getSeconds()).padStart(2,'0');
    return `${dia}/${mes}/${anio} ${hora}:${min}:${seg}`;
  }

  function getColor(accion){
    switch(accion){
      case "Añadido": return modoOscuro ? "#5a4b20" : "#fff3cd";
      case "Comprado": return modoOscuro ? "#5c1f1f" : "#f8d7da";
      case "Vendido": return modoOscuro ? "#1f5c1f" : "#d4edda";
      case "Editado": return modoOscuro ? "#1f4b5c" : "#d1ecf1";
      case "Eliminado": return modoOscuro ? "#5c1f1f" : "#f8d7da";
      default: return modoOscuro ? "#444" : "#eee";
    }
  }

  const textColor = modoOscuro ? "#fff" : "#000";

  modal.innerHTML=`<div class="modal-content" style="
      width:800px; max-height:600px; overflow-y:auto; scrollbar-width:none;
      -ms-overflow-style:none; border-radius:12px; padding:20px;
      background-color:${modoOscuro?"#2c2c2c":"#fff"}; color:${textColor};
      transform: translateY(-20px); transition: transform 0.3s ease;">
      <h3>Historial de ${id}</h3>
      <ul style="list-style:none; padding:0; margin:10px 0;">
        ${historialProd.map(h=>`<li style="
          padding:8px 12px; margin-bottom:6px; border-radius:6px;
          background-color:${getColor(h.accion)}; color:${textColor};
          display:flex; justify-content:space-between; align-items:center;">
          <span><strong>${h.accion}</strong> ${h.cantidad>0?h.cantidad:""}</span>
          <span style="font-size:0.8rem; opacity:0.8;">${formatFecha(new Date(h.fecha))}</span>
        </li>`).join("")}
      </ul>
      <button id="btn-close" style="width:100%; padding:10px; border:none; border-radius:6px; background-color:#0078d7; color:white; font-weight:bold; cursor:pointer; margin-top:10px;">Cerrar</button>
    </div>`;

  document.body.appendChild(modal);
  requestAnimationFrame(()=>{ modal.style.opacity="1"; modal.querySelector(".modal-content").style.transform="translateY(0)"; });

  modal.querySelector("#btn-close").onclick = ()=>{
    modal.style.opacity="0";
    modal.querySelector(".modal-content").style.transform="translateY(-20px)";
    setTimeout(()=>modal.remove(), 300);
  };
  modal.onclick = e => { if(e.target===modal){ modal.style.opacity="0"; modal.querySelector(".modal-content").style.transform="translateY(-20px)"; setTimeout(()=>modal.remove(),300); } };
}

// ------------------ FILTROS ------------------
inputBusqueda.addEventListener("input", renderTabla);

btnResetFiltros.onclick=()=>{
  inputBusqueda.value="";
  ordenActual="id";
  ascendente=true;
  renderTabla();
};

// ------------------ ORDEN POR CLIC EN CABECERA CON FLECHAS ------------------
const ths = document.querySelectorAll("#tabla-productos thead th");
ths.forEach((th, index) => {
  const text = th.textContent;
  if(!["ID","Stock","Ventas Totales","Proveedor"].includes(text)) return; // solo estas columnas
  th.style.cursor = "pointer";

  // Crear span para flecha
  const arrow = document.createElement("span");
  arrow.style.marginLeft = "5px";
  th.appendChild(arrow);

  th.onclick = () => {
    let key;
    if(text==="ID") key="id";
    else if(text==="Stock") key="stock";
    else if(text==="Ventas Totales") key="ventasTotales";
    else if(text==="Proveedor") key="proveedor";

    // Alternar ascendente/descendente si ya está la misma columna
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
       (text == "Proveedor" && ordenActual=="proveedor") ||
       (text==="Ventas Totales" && ordenActual==="ventasTotales")){
      span.textContent = ascendente ? "↑" : "↓";
    } else {
      span.textContent = "";
    }
  });
}

// Llamamos para que al cargar la página muestre la flecha inicial
actualizarFlechas();


// ------------------ INICIAL ------------------
cargarDatos();
crearFila("compra");
crearFila("venta");
