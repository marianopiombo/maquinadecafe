const Producto = function (nombre, precio, stock) {
    this.nombre = nombre;
    this.precio = precio;
    this.stock = stock;
}

let lista = [];
const nombresCafeDiv = document.getElementById('nombresCafe');
const buscarBtn = document.getElementById('buscar');
const nombreCafeInput = document.getElementById('nombreCafe');
const infoCafeDiv = document.getElementById('infoCafe');
const nombreNuevoCafeInput = document.getElementById('nombreNuevoCafe');
const precioNuevoCafeInput = document.getElementById('precioNuevoCafe');
const stockNuevoCafeInput = document.getElementById('stockNuevoCafe');
const agregarBtn = document.getElementById('agregar');
const mensajeDiv = document.getElementById('mensaje');
const carritoLista = document.getElementById('carritoLista');
const totalCarritoSpan = document.getElementById('totalCarrito');
const finalizarCompraBtn = document.getElementById('finalizarCompra');

let carrito = [];

function mostrarNombresCafe() {
    nombresCafeDiv.innerHTML = '';
    lista.forEach(producto => {
        const nombreCafe = document.createElement('div');
        nombreCafe.classList.add('nombre-cafe');
        nombreCafe.textContent = producto.nombre;
        nombresCafeDiv.appendChild(nombreCafe);
    });
}

function mostrarInfoCafe(nombre) {
    const cafe = lista.find(producto => producto.nombre.toLowerCase() === nombre.toLowerCase());
    if (cafe) {
        infoCafeDiv.innerHTML = `<p>Nombre: ${cafe.nombre}</p><p>Precio: $${cafe.precio}</p><p>Stock: ${cafe.stock}</p>
        <label for="cantidadCafe">Cantidad:</label>
        <input type="number" id="cantidadCafe" min="1" max="${cafe.stock}">
        <button id="agregarAlCarrito">Agregar al Carrito</button>`;

        const agregarAlCarritoBtn = document.getElementById('agregarAlCarrito');
        agregarAlCarritoBtn.addEventListener('click', () => {
            const cantidad = parseInt(document.getElementById('cantidadCafe').value) || 1;

            if (cantidad > 0 && cantidad <= cafe.stock) {
                cafe.stock -= cantidad;
                agregarAlCarrito(cafe, cantidad);
                mostrarNombresCafe();
                infoCafeDiv.innerHTML = ''; 
            } else {
                Swal.fire({
                    title: 'Error',
                    text: `Cantidad no válida. El stock actual es de ${cafe.stock}.`,
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        });
    } else {
        infoCafeDiv.innerHTML = 'No se encontró información para el café especificado.';
    }
}

function buscarCafe() {
    const nombreCafe = nombreCafeInput.value.trim();
    mostrarInfoCafe(nombreCafe);
}

function agregarCafe() {
    const nombre = nombreNuevoCafeInput.value.trim();
    const precio = parseFloat(precioNuevoCafeInput.value);
    const stock = parseInt(stockNuevoCafeInput.value);

    if (!nombre || isNaN(precio) || isNaN(stock)) {
        mostrarMensaje("Por favor, ingresa datos válidos , en precio van numeros y en stock van numeros", 'error');
        return;
    }

    const nuevoCafe = new Producto(nombre, precio, stock);
    lista.push(nuevoCafe);
    mostrarNombresCafe();
    mostrarMensaje('Café agregado correctamente', 'success');
    nombreNuevoCafeInput.value = '';
    precioNuevoCafeInput.value = '';
    stockNuevoCafeInput.value = '';
}

function mostrarMensaje(mensaje, tipo) {
    mensajeDiv.textContent = mensaje;
    mensajeDiv.className = `mensaje ${tipo}`;
    setTimeout(() => {
        mensajeDiv.textContent = '';
        mensajeDiv.className = 'mensaje';
    }, 3000);
}

function actualizarCarrito() {
    carritoLista.innerHTML = '';
    let totalCarrito = 0;

    carrito.forEach(item => {
        const li = document.createElement('li');
        li.classList.add('carrito-item');
        li.textContent = `${item.nombre} x${item.cantidad} - $${item.precio * item.cantidad}`;
        const btnEliminar = document.createElement('button');
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.addEventListener('click', () => eliminarDelCarrito(item));
        li.appendChild(btnEliminar);
        carritoLista.appendChild(li);

        totalCarrito += item.precio * item.cantidad;
    });

    totalCarritoSpan.textContent = totalCarrito.toFixed(2);
}

function agregarAlCarrito(producto, cantidad) {
    const itemIndex = carrito.findIndex(item => item.nombre === producto.nombre);

    if (itemIndex !== -1) {
        carrito[itemIndex].cantidad += cantidad;
    } else {
        carrito.push({
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: cantidad
        });
    }

    actualizarCarrito();
}

function eliminarDelCarrito(item) {
    const confirmarEliminacion = async () => {
        const resultado = await Swal.fire({
            title: `Eliminar ${item.nombre} del carrito`,
            text: `¿Estás seguro que deseas eliminar ${item.cantidad} unidad(es) de ${item.nombre} del carrito?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });

        if (resultado.isConfirmed) {
            const index = carrito.indexOf(item);
            if (index !== -1) {
                carrito.splice(index, 1);
                const producto = lista.find(product => product.nombre === item.nombre);
                if (producto) {
                    producto.stock += item.cantidad;
                }
                actualizarCarrito();
                mostrarNombresCafe();
                Swal.fire({
                    title: 'Eliminado',
                    text: `Se eliminó ${item.cantidad} unidad(es) de ${item.nombre} del carrito.`,
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                });
            }
        }
    };

    confirmarEliminacion();
}

const cargarDatos = async () => {
    try {
        const response = await fetch('productos.json');
        const data = await response.json();
        lista = data.map(item => new Producto(item.nombre, item.precio, item.stock));
        mostrarNombresCafe();
    } catch (error) {
        console.error('Error al cargar datos:', error);
    }
};

cargarDatos();

nombresCafeDiv.addEventListener('click', e => {
    if (e.target.classList.contains('nombre-cafe')) {
        const nombreCafe = e.target.textContent;
        mostrarInfoCafe(nombreCafe);
    }
});

buscarBtn.addEventListener('click', buscarCafe);

agregarBtn.addEventListener('click', agregarCafe);

finalizarCompraBtn.addEventListener('click', () => {
    if (carrito.length > 0) {
        const totalCarrito = carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);

        Swal.fire({
            title: 'Compra Finalizada',
            text: `Total: $${totalCarrito.toFixed(2)}`,
            icon: 'success',
            confirmButtonText: '¡Excelente!'
        });

        carrito.forEach(item => {
            const producto = lista.find(product => product.nombre === item.nombre);
            if (producto) {
                producto.stock += item.cantidad;
            }
        });

        carrito = [];
        actualizarCarrito();
        mostrarNombresCafe();
    } else {
        Swal.fire({
            title: 'Error',
            text: 'El carrito está vacío. Agrega productos antes de finalizar la compra.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
});
