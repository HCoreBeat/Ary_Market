// El número de teléfono para WhatsApp
const WHATSAPP_NUMBER = '+5353980510';

// Cargar el carrito desde localStorage o inicializarlo como un array vacío
let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

// Función para guardar el carrito en localStorage
function saveCart() {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
}

// Función para añadir un producto al carrito (usa el nombre como ID)
function addToCart(productName, quantity, productData) {
    const existingProductIndex = cart.findIndex(item => item.nombre === productName);

    if (existingProductIndex > -1) {
        cart[existingProductIndex].quantity += quantity;
    } else {
        const product = productData.find(p => p.nombre === productName);
        if (product) {
            cart.push({ ...product, quantity: quantity });
        }
    }
    saveCart();
    updateCartUI();
}

// Función para actualizar la cantidad de un item en el carrito (usa el nombre como ID)
function updateCartQuantity(productName, newQuantity) {
    const productIndex = cart.findIndex(item => item.nombre === productName);
    if (productIndex > -1) {
        if (newQuantity > 0) {
            cart[productIndex].quantity = newQuantity;
        } else {
            cart.splice(productIndex, 1);
        }
        saveCart();
        updateCartUI();
    }
}

// Función para eliminar un producto del carrito (usa el nombre como ID)
function removeFromCart(productName) {
    cart = cart.filter(item => item.nombre !== productName);
    saveCart();
    updateCartUI();
}

// Función para actualizar la interfaz del carrito (modal y contador del ícono)
function updateCartUI() {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalPriceEl = document.getElementById('cart-total-price');
    const cartCounter = document.getElementById('cart-counter');
    const cartEmptyMessage = document.getElementById('cart-empty-message');
    const cartSummary = document.querySelector('.cart-summary');

    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartEmptyMessage.style.display = 'block';
        cartSummary.style.display = 'none';
    } else {
        cartEmptyMessage.style.display = 'none';
        cartSummary.style.display = 'block';

        let totalPrice = 0;
        cart.forEach(item => {
            const itemPrice = (item.precio * (1 - item.descuento / 100)) * item.quantity;
            totalPrice += itemPrice;

            // MODIFICACIÓN: Construye la ruta de la imagen aquí
            const imagePath = `Img/products/${item.imagen}`;

            const cartItemHTML = `
                <div class="cart-item" data-id="${item.nombre}">
                    <img src="${imagePath}" alt="${item.nombre}">
                    <div class="cart-item-info">
                        <h4>${item.nombre}</h4>
                        <p>$${(item.precio * (1 - item.descuento / 100)).toFixed(2)} x ${item.quantity}</p>
                    </div>
                    <div class="cart-item-actions">
                         <button class="quantity-btn cart-quantity-minus">-</button>
                         <input type="text" class="quantity-input" value="${item.quantity}" readonly>
                         <button class="quantity-btn cart-quantity-plus">+</button>
                         <button class="remove-from-cart-btn"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `;
            cartItemsContainer.innerHTML += cartItemHTML;
        });
        cartTotalPriceEl.textContent = `$${totalPrice.toFixed(2)}`;
    }

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCounter.textContent = totalItems;
    cartCounter.style.display = totalItems > 0 ? 'flex' : 'none';
}

// Función para generar el mensaje de WhatsApp para todo el carrito
function generateCartWhatsAppMessage() {
    if (cart.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }

    let message = "¡Hola! Quisiera hacer el siguiente pedido:\n\n";
    let totalPrice = 0;

    cart.forEach(item => {
        const price = item.precio * (1 - item.descuento / 100);
        totalPrice += price * item.quantity;
        message += `*Producto:* ${item.nombre}\n`;
        message += `*Cantidad:* ${item.quantity}\n\n`;
    });

    message += `*Total del Pedido: ${totalPrice.toFixed(2)}*`;

    // Get user profile from local storage
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
        const userProfile = JSON.parse(savedProfile);
        if (userProfile.fullName) {
            message += `\n--- Datos del Cliente ---\n`;
            message += `*Nombre:* ${userProfile.fullName}\n`;
            if (userProfile.homeDelivery && userProfile.shippingAddress) {
                message += `*Dirección de Envío:* ${userProfile.shippingAddress}\n`;
                message += `*Envío a Domicilio:* Sí\n`;
            } else if (userProfile.homeDelivery) {
                message += `*Envío a Domicilio:* Sí (Dirección no proporcionada)\n`;
            } else {
                message += `*Envío a Domicilio:* No\n`;
            }
        }
    }

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}