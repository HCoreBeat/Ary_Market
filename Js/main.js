document.addEventListener('DOMContentLoaded', () => {
    let allProducts = [];
    const productGrid = document.getElementById('product-grid');
    const categoryList = document.getElementById('category-list');
    const searchInput = document.querySelector('.search-bar input');
    const suggestionsContainer = document.querySelector('.search-suggestions');
    const heroSection = document.querySelector('.hero-main').parentElement;

    // Cargar la configuración del hero
    async function loadHeroConfig() {
        try {
            const response = await fetch('data/hero.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const heroData = await response.json();
            updateHeroSection(heroData);
        } catch (error) {
            console.error("Error al cargar la configuración del hero:", error);
        }
    }

    // Actualizar la sección del hero
    function updateHeroSection(data) {
        heroSection.innerHTML = '';
        
        // Hero Main
        if (data.heroMain.enabled) {
            const heroMain = document.createElement('div');
            heroMain.className = 'hero-main';
            heroMain.innerHTML = `
                <div class="hero-content">
                    <h1>${data.heroMain.title}</h1>
                    <p>${data.heroMain.description}</p>
                    <button class="hero-btn">${data.heroMain.buttonText}</button>
                </div>
                <div class="hero-image">
                    <img src="${data.heroMain.image}" alt="${data.heroMain.imageAlt}">
                </div>
            `;
            heroSection.appendChild(heroMain);
        }

        // Hero Secondary
        if (data.heroSecondary.enabled) {
            const heroSecondary = document.createElement('div');
            heroSecondary.className = 'hero-secondary';

            data.heroSecondary.promoCards.forEach(card => {
                if (card.enabled) {
                    const promoCard = document.createElement('div');
                    promoCard.className = 'promo-card';

                    if (card.type === 'discount') {
                        promoCard.innerHTML = `
                            <div class="promo-content">
                                <p>Hasta un <span>${card.content.discountAmount}%</span></p>
                                <p>${card.content.description}</p>
                            </div>
                        `;
                    } else if (card.type === 'product') {
                        promoCard.innerHTML = `
                            <div class="promo-content">
                                <h3>${card.content.title}</h3>
                                <button class="shop-now-btn">${card.content.buttonText}</button>
                            </div>
                            <div class="promo-image">
                                <img src="${card.content.image}" alt="${card.content.imageAlt}">
                            </div>
                        `;
                    }
                    heroSecondary.appendChild(promoCard);
                }
            });

            heroSection.appendChild(heroSecondary);
        }
    }

    // Cargar hero al iniciar
    loadHeroConfig();

    async function loadProducts() {
        try {
            const response = await fetch('data/products.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            allProducts = await response.json();
            displayCategories(allProducts);
            displayProducts(allProducts);
            updateCartUI();
        } catch (error) {
            console.error("Error al cargar los productos:", error);
            productGrid.innerHTML = "<p>No se pudieron cargar los productos.</p>";
        }
    }

    function displayProducts(productsToDisplay, category = 'Todos') {
        productGrid.innerHTML = '';
        let filteredProducts;
        
        if (category === 'Todos') {
            filteredProducts = productsToDisplay;
        } else if (category === 'Próximamente') {
            filteredProducts = productsToDisplay.filter(p => p.soon === true);
        } else {
            filteredProducts = productsToDisplay.filter(p => p.categoria === category);
        }

        if (filteredProducts.length === 0) {
            productGrid.innerHTML = "<p>No hay productos que coincidan con la búsqueda.</p>";
            return;
        }

        filteredProducts.forEach(product => {
            const price = product.precio * (1 - product.descuento / 100);
            const originalPriceHTML = product.descuento > 0 ? `<span class="original-price">$${product.precio.toFixed(2)}</span>` : '';
            
            let badgesHTML = '<div class="badges">';
            if (product.oferta) badgesHTML += `<span class="badge sale">-${product.descuento}%</span>`;
            if (product.nuevo) badgesHTML += `<span class="badge new">Nuevo</span>`;
            if (product.mas_vendido) badgesHTML += `<span class="badge best-seller">Más Vendido</span>`;
            badgesHTML += '</div>';

            const productCard = document.createElement('div');
            productCard.className = `product-card ${!product.disponible ? 'disabled' : ''} ${product.soon ? 'coming-soon' : ''}`;
            productCard.dataset.id = product.nombre;
            // Asignar color de fondo de forma alternada
            const colorIndex = filteredProducts.indexOf(product) % 3 + 1;
            productCard.style.backgroundColor = `var(--producto${colorIndex})`;

            const imagePath = product.imagen.startsWith('Img/products/') ? product.imagen : `Img/products/${product.imagen}`;

            productCard.innerHTML = `
                ${badgesHTML}
                <div class="product-image-container">
                    <img src="${imagePath}" alt="${product.nombre}" onerror="this.src='https://via.placeholder.com/180x160.png?text=Imagen+no+disponible';">
                </div>
                <div class="product-info">
                    <span class="category">${product.categoria}</span>
                    <h3>${product.nombre}</h3>
                    ${!product.soon ? `
                    <div class="price-container">
                        <span class="price">$${price.toFixed(2)}</span>
                        ${originalPriceHTML}
                    </div>
                    ` : ''}
                </div>
                ${product.disponible ? `
                <div class="product-actions">
                    <div class="quantity-selector">
                        <button class="quantity-btn quantity-minus">-</button>
                        <input type="text" class="quantity-input" value="1" readonly>
                        <button class="quantity-btn quantity-plus">+</button>
                    </div>
                    <div class="product-buttons">
                        <button class="product-btn add-to-cart-btn">Añadir</button>
                        <button class="product-btn buy-now-btn">Comprar Ahora</button>
                    </div>
                </div>` : ``}
            `;
            productGrid.appendChild(productCard);
        });
    }

    function displayCategories(products) {
        const categories = ['Todos', ...new Set(products.map(p => p.categoria)), 'Próximamente'];
        categoryList.innerHTML = '';
        categories.forEach(category => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = category;
            a.dataset.category = category;
            if (category === 'Todos') a.classList.add('active');
            if (category === 'Próximamente') a.classList.add('coming-soon');
            li.appendChild(a);
            categoryList.appendChild(li);
        });
    }

    function handleSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        if (searchTerm.length > 0) {
            const suggestions = allProducts.filter(p => 
                p.nombre.toLowerCase().includes(searchTerm) || 
                p.categoria.toLowerCase().includes(searchTerm)
            );
            displaySuggestions(suggestions, searchTerm);
            displayProducts(suggestions);
        } else {
            suggestionsContainer.style.display = 'none';
            displayProducts(allProducts);
        }
    }

    function displaySuggestions(suggestions, searchTerm) {
        if (suggestions.length > 0) {
            suggestionsContainer.innerHTML = suggestions.slice(0, 5).map(p => {
                const imagePath = p.imagen.startsWith('Img/products/') ? p.imagen : `Img/products/${p.imagen}`;
                const searchRegex = new RegExp(`(${searchTerm})`, 'gi');
                const highlightedName = p.nombre.replace(searchRegex, '<strong>$1</strong>');
                const price = p.precio * (1 - p.descuento / 100);

                return `
                    <div class="suggestion-item" data-product-name="${p.nombre}">
                        <img src="${imagePath}" alt="${p.nombre}" class="suggestion-image">
                        <div class="suggestion-info">
                            <span class="suggestion-name">${highlightedName}</span>
                            <span class="suggestion-category">${p.categoria}</span>
                            <span class="suggestion-price">$${price.toFixed(2)}</span>
                        </div>
                    </div>`;
            }).join('');
            suggestionsContainer.style.display = 'block';
        } else {
            suggestionsContainer.innerHTML = `
                <div class="no-suggestions">
                    <p>No se encontraron productos que coincidan con tu búsqueda</p>
                </div>`;
            suggestionsContainer.style.display = 'block';
        }
    }

    searchInput.addEventListener('input', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = searchInput.value.toLowerCase();
            const filteredProducts = allProducts.filter(p => p.nombre.toLowerCase().includes(searchTerm));
            displayProducts(filteredProducts);
            suggestionsContainer.style.display = 'none';
        }
    });

    suggestionsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('suggestion-item')) {
            const productName = e.target.dataset.productName;
            searchInput.value = productName;
            const filteredProducts = allProducts.filter(p => p.nombre === productName);
            displayProducts(filteredProducts);
            suggestionsContainer.style.display = 'none';
        }
    });

    categoryList.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target.tagName === 'A') {
            const selectedCategory = e.target.dataset.category;
            document.querySelectorAll('#category-list a').forEach(a => a.classList.remove('active'));
            e.target.classList.add('active');
            displayProducts(allProducts, selectedCategory);
        }
    });

    productGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        if (!card || card.classList.contains('disabled')) return;

        const productId = card.dataset.id;
        const quantityInput = card.querySelector('.quantity-input');
        let quantity = parseInt(quantityInput.value, 10);

        if (e.target.classList.contains('quantity-plus')) {
            quantityInput.value = ++quantity;
        } else if (e.target.classList.contains('quantity-minus')) {
            if (quantity > 1) quantityInput.value = --quantity;
        } else if (e.target.classList.contains('add-to-cart-btn')) {
            addToCart(productId, quantity, allProducts);
        } else if (e.target.classList.contains('buy-now-btn')) {
            let message = `¡Hola! Estoy interesado en comprar ${quantity} unidad(es) de *${productId}*.`;

            // Get user profile from local storage
            const savedProfile = localStorage.getItem('userProfile');
            if (savedProfile) {
                const userProfile = JSON.parse(savedProfile);
                if (userProfile.fullName) {
                    message += `\n\n--- Datos del Cliente ---\n`;
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
    });

    const cartIcon = document.getElementById('cart-icon');
    const cartModal = document.getElementById('cart-modal');
    const closeCartBtn = document.getElementById('close-cart-btn');

    cartIcon.addEventListener('click', () => {
        cartModal.classList.add('open');
        document.body.classList.add('no-scroll');
    });
    closeCartBtn.addEventListener('click', () => {
        cartModal.classList.remove('open');
        document.body.classList.remove('no-scroll');
    });
    cartModal.addEventListener('click', (e) => { if (e.target === cartModal) { cartModal.classList.remove('open'); document.body.classList.remove('no-scroll'); } });

    document.getElementById('cart-items-container').addEventListener('click', (e) => {
        const target = e.target;
        const cartItemDiv = target.closest('.cart-item');
        if (!cartItemDiv) return;
        
        const productId = cartItemDiv.dataset.id;
        let itemInCart = cart.find(item => item.nombre === productId);
        if(!itemInCart) return;

        if (target.matches('.cart-quantity-plus, .cart-quantity-plus *')) {
             updateCartQuantity(productId, itemInCart.quantity + 1);
        } else if (target.matches('.cart-quantity-minus, .cart-quantity-minus *')) {
            updateCartQuantity(productId, itemInCart.quantity - 1);
        } else if (target.matches('.remove-from-cart-btn, .remove-from-cart-btn *')) {
            removeFromCart(productId);
        }
    });
    
    document.getElementById('checkout-whatsapp').addEventListener('click', generateCartWhatsAppMessage);

    loadProducts();
});
