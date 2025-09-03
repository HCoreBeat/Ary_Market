// El número de teléfono para WhatsApp
const WHATSAPP_NUMBER = '+5353980510';

// Claves para localStorage
const CART_KEY = 'shoppingCart';
const PURCHASE_HISTORY_KEY = 'purchaseHistory';
const PURCHASE_TTL_MS = 48 * 60 * 60 * 1000; // 48 horas en ms

// Cargar el carrito desde localStorage o inicializarlo como un array vacío
let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

// Función para guardar el carrito en localStorage
function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// --- Historial de compras ---
function getPurchaseHistory() {
    cleanupExpiredPurchases();
    return JSON.parse(localStorage.getItem(PURCHASE_HISTORY_KEY)) || [];
}

function savePurchaseHistory(historyArr) {
    localStorage.setItem(PURCHASE_HISTORY_KEY, JSON.stringify(historyArr));
}

function addPurchaseToHistory(purchase) {
    const history = getPurchaseHistory();
    history.unshift(purchase); // agregar al inicio
    savePurchaseHistory(history);
}

function cleanupExpiredPurchases() {
    const now = Date.now();
    const history = JSON.parse(localStorage.getItem(PURCHASE_HISTORY_KEY)) || [];
    const filtered = history.filter(entry => {
        return !(entry.expiresAt && entry.expiresAt <= now);
    });
    if (filtered.length !== history.length) {
        savePurchaseHistory(filtered);
    }
}

// Función para añadir un producto al carrito (usa el nombre como ID)
function addToCart(productName, quantity, productData) {
    const existingProductIndex = cart.findIndex(item => item.nombre === productName);
    const product = productData.find(p => p.nombre === productName);

    if (existingProductIndex > -1) {
        cart[existingProductIndex].quantity += quantity;
        window.toastNotification.show({
            title: 'Cantidad actualizada',
            message: `Se actualizó la cantidad de ${productName} en el carrito`,
            type: 'success'
        });
    } else {
        if (product) {
            cart.push({ ...product, quantity: quantity });
            window.toastNotification.show({
                title: 'Producto agregado',
                message: `${productName} fue agregado al carrito`,
                type: 'success'
            });
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
    window.toastNotification.show({
        title: 'Producto eliminado',
        message: `${productName} fue eliminado del carrito`,
        type: 'success'
    });
    saveCart();
    updateCartUI();
}

// Función para renderizar el historial dentro del modal del carrito
function renderPurchaseHistoryUI(container) {
    const history = getPurchaseHistory();
    // Crear un contenedor para el historial si no existe
    let historyContainer = document.getElementById('cart-history-container');
    if (!historyContainer) {
        historyContainer = document.createElement('div');
        historyContainer.id = 'cart-history-container';
        historyContainer.className = 'cart-history-container';
        // Asegurar que el contenedor de items tenga la clase usada por CSS
        if (!container.classList.contains('cart-items-wrapper')) container.classList.add('cart-items-wrapper');
        // Insertar después del contenedor de items
        container.parentElement.insertBefore(historyContainer, container.nextSibling);
    }

    if (!history || history.length === 0) {
        historyContainer.innerHTML = '';
        return;
    }

    // Construir HTML para cada entrada del historial (mostrar foto, nombre, cantidad y total)
    historyContainer.innerHTML = '<h3>Historial de compras (últimas 48 horas)</h3>';
    history.forEach(entry => {
        // Fecha legible
        const date = new Date(entry.createdAt);
        const dateStr = date.toLocaleString();

        let itemsHTML = '';
        entry.items.forEach(it => {
            const imagePath = it.imagen ? (it.imagen.startsWith('Img/products/') ? it.imagen : `Img/products/${it.imagen}`) : '';
            itemsHTML += `
                <div class="history-item-row">
                    <img src="${imagePath}" alt="${it.nombre}" />
                    <div class="history-item-info">
                        <strong>${it.nombre}</strong>
                        <div>Cant.: ${it.quantity}</div>
                        <div>Precio und.: $${it.unitPrice.toFixed(2)}</div>
                    </div>
                </div>
            `;
        });

        const entryHTML = `
            <div class="purchase-history-entry" data-id="${entry.id}">
                <div class="purchase-history-header">
                    <span class="purchase-date">${dateStr}</span>
                    <span class="purchase-total">Total: $${entry.totalPrice.toFixed(2)}</span>
                </div>
                <div class="purchase-items">${itemsHTML}</div>
            </div>
        `;
        historyContainer.innerHTML += entryHTML;
    });
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
            const unitPrice = (item.precio * (1 - item.descuento / 100));
            const itemPrice = unitPrice * item.quantity;
            totalPrice += itemPrice;

            // Construye la ruta de la imagen aquí
            const imagePath = item.imagen ? `Img/products/${item.imagen}` : '';

            const cartItemHTML = `
                <div class="cart-item" data-id="${item.nombre}">
                    <img src="${imagePath}" alt="${item.nombre}"">
                    <div class="cart-item-info">
                        <h4>${item.nombre}</h4>
                        <p>$${unitPrice.toFixed(2)} x ${item.quantity}</p>
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

    // Renderizar historial (si existe)
    renderPurchaseHistoryUI(cartItemsContainer);
}

// Función para generar el mensaje de WhatsApp para todo el carrito
function generateCartWhatsAppMessage() {
    if (cart.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }

    let message = "¡Hola! Quisiera hacer el siguiente pedido:\n\n";
    let totalPrice = 0;

    const purchaseItems = cart.map(item => {
        const unitPrice = item.precio * (1 - item.descuento / 100);
        totalPrice += unitPrice * item.quantity;
        message += `*Producto:* ${item.nombre}\n`;
        message += `*Cantidad:* ${item.quantity}\n\n`;

        return {
            nombre: item.nombre,
            quantity: item.quantity,
            unitPrice: unitPrice,
            imagen: item.imagen || ''
        };
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
    // Abrir WhatsApp en nueva pestaña
    window.open(whatsappUrl, '_blank');

    // Guardar la compra en el historial con TTL de 48 horas
    const now = Date.now();
    const purchaseEntry = {
        id: now,
        items: purchaseItems,
        totalPrice: totalPrice,
        createdAt: now,
        expiresAt: now + PURCHASE_TTL_MS
    };
    addPurchaseToHistory(purchaseEntry);

    // Vaciar carrito y actualizar UI
    cart = [];
    saveCart();
    updateCartUI();
}

// Limpiar historial expirado al cargar el script
cleanupExpiredPurchases();