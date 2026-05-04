document.addEventListener('DOMContentLoaded', () => {

    // ---- Lógica del Carrusel Múltiple ----
    const carousels = document.querySelectorAll('.product-carousel');

    if (carousels.length > 0) {
        carousels.forEach(carousel => {
            const prevButton = carousel.parentNode.querySelector('.prev-button');
            const nextButton = carousel.parentNode.querySelector('.next-button');

            // Función para calcular el ancho de desplazamiento dinámicamente
            const getScrollStep = () => {
                const card = carousel.querySelector('.product-card');
                if (card) {
                    // Ancho de tarjeta + gap (asumimos 30px de gap del CSS)
                    return card.offsetWidth + 30;
                }
                return 300; // Valor por defecto
            };

            const scrollCarousel = (direction) => {
                const step = getScrollStep();
                const currentScroll = carousel.scrollLeft;
                const newScroll = direction === 'left' ? currentScroll - step : currentScroll + step;
                carousel.scrollTo({ left: newScroll, behavior: 'smooth' });
            };

            if (prevButton && nextButton) {
                prevButton.addEventListener('click', () => scrollCarousel('left'));
                nextButton.addEventListener('click', () => scrollCarousel('right'));
            }

            // Desplazamiento automático
            let autoScrollInterval;

            const startAutoScroll = () => {
                // Evitar múltiples intervalos
                if (autoScrollInterval) clearInterval(autoScrollInterval);

                autoScrollInterval = setInterval(() => {
                    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
                    const step = getScrollStep();

                    // Si llegamos al final (con un margen de error), volvemos al principio
                    if (Math.ceil(carousel.scrollLeft) >= maxScroll - 10) {
                        carousel.scrollTo({ left: 0, behavior: 'smooth' });
                    } else {
                        carousel.scrollTo({ left: carousel.scrollLeft + step, behavior: 'smooth' });
                    }
                }, 4000);
            };

            const stopAutoScroll = () => {
                clearInterval(autoScrollInterval);
            };

            // Iniciar auto-scroll
            startAutoScroll();

            // Pausar al pasar el mouse por encima del contenedor
            const container = carousel.parentNode;
            if (container) {
                container.addEventListener('mouseenter', stopAutoScroll);
                container.addEventListener('mouseleave', startAutoScroll);

                // Pausar al tocar en móviles
                container.addEventListener('touchstart', stopAutoScroll);
                container.addEventListener('touchend', startAutoScroll);
            }
        });
    }

    // ---- Lógica de Animación al Desplazarse (Mejorada para Stagger) ----
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px" // Trigger a bit earlier before bottom
    };



    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');

                // Si el elemento es un contenedor de grid, animar sus hijos en cascada
                if (entry.target.classList.contains('staggered-parent')) {
                    const children = entry.target.children;
                    Array.from(children).forEach((child, index) => {
                        const delayIndex = (index % 6) + 1;
                        child.classList.add(`stagger-delay-${delayIndex}`);
                        child.classList.add('active');
                        child.style.opacity = '1';
                        child.style.transform = 'translateY(0)';
                    });
                }

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const sectionsToAnimate = document.querySelectorAll('.reveal-on-scroll');
    sectionsToAnimate.forEach(section => {
        observer.observe(section);
    });

    // ---- Animación de Entrada del Hero ----
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        // Asignar clases de animación secuencial a los hijos directos
        const children = heroContent.children; // h1, p, hr, p, a
        if (children.length >= 4) {
            children[0].classList.add('hero-animate-1'); // H1
            children[1].classList.add('hero-animate-2'); // Price
            children[2].classList.add('hero-animate-2'); // Divider
            children[3].classList.add('hero-animate-3'); // Description
            children[4].classList.add('hero-animate-4'); // Button
        }
    }

    // ---- Lógica del Menú Móvil (Sidebar) ----
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const mainNav = document.getElementById('main-nav');
    const menuOverlay = document.getElementById('menu-overlay');
    const closeMenuBtn = document.getElementById('close-menu');

    const toggleMenu = (show) => {
        if (show) {
            mainNav.classList.add('active');
            menuOverlay.classList.add('active');
        } else {
            mainNav.classList.remove('active');
            menuOverlay.classList.remove('active');
        }
    };

    if (mobileMenuBtn && mainNav && menuOverlay && closeMenuBtn) {
        // Abrir menú
        mobileMenuBtn.addEventListener('click', () => toggleMenu(true));

        // Cerrar menú con botón X
        closeMenuBtn.addEventListener('click', () => toggleMenu(false));

        // Cerrar menú con overlay
        menuOverlay.addEventListener('click', () => toggleMenu(false));

        // Cerrar menú al hacer click en un enlace
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => toggleMenu(false));
        });
    }

    // ---- FAQ Accordion ----
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentNode;
            item.classList.toggle('active');
        });
    });

    // ---- Contadores Animados ----
    const counters = document.querySelectorAll('.counter');
    if (counters.length > 0) {
        const speed = 200;

        const animateCounters = () => {
            counters.forEach(counter => {
                const updateCount = () => {
                    const target = +counter.getAttribute('data-target');
                    const count = +counter.innerText;
                    const inc = target / speed;

                    if (count < target) {
                        counter.innerText = Math.ceil(count + inc);
                        setTimeout(updateCount, 20);
                    } else {
                        counter.innerText = target;
                    }
                };
                updateCount();
            });
        };

        let fired = false;
        const statsSection = document.querySelector('.stats-section');
        if (statsSection) {
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && !fired) {
                    animateCounters();
                    fired = true;
                }
            });
            observer.observe(statsSection);
        }
    }

    // ---- Botones Flotantes ----
    const createFloatingButtons = () => {
        const container = document.createElement('div');
        container.className = 'floating-container';

        const backToTopBtn = document.createElement('button');
        backToTopBtn.className = 'back-to-top';
        backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        backToTopBtn.setAttribute('aria-label', 'Volver arriba');

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        const whatsappBtn = document.createElement('a');
        whatsappBtn.href = 'https://wa.me/message/64V6VK7FANWBB1';
        whatsappBtn.className = 'whatsapp-float';
        whatsappBtn.target = '_blank';
        whatsappBtn.innerHTML = '<i class="fab fa-whatsapp"></i>';
        whatsappBtn.setAttribute('aria-label', 'Contactar por WhatsApp');

        container.appendChild(backToTopBtn);
        container.appendChild(whatsappBtn);
        document.body.appendChild(container);

        const toggleBackToTop = () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        };
        window.addEventListener('scroll', toggleBackToTop);
    };

    createFloatingButtons();

    // ---- Lógica del Carrito de Compras ----
    const initCart = () => {
        // 1. Inyectar HTML del carrito si no existe
        if (!document.getElementById('cart-drawer')) {
            const cartHTML = `
                <div class="cart-overlay" id="cart-overlay"></div>
                <div class="cart-drawer" id="cart-drawer">
                    <div class="cart-header">
                        <h2>Tu Carrito</h2>
                        <i class="fas fa-times" id="close-cart-btn"></i>
                    </div>
                    <div class="cart-items-container" id="cart-items">
                        <!-- Items will be injected here -->
                    </div>
                    <div class="cart-footer">
                        <div class="cart-total-row">
                            <span class="cart-total-label">Total:</span>
                            <div class="cart-total-amount">
                                <span id="cart-total-price">$0.00</span>
                                <span id="cart-total-ves">Bs. 0,00</span>
                            </div>
                        </div>
                        <button class="checkout-btn" id="checkout-btn">
                            <i class="fab fa-whatsapp"></i> Pedir por WhatsApp
                        </button>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', cartHTML);
        }

        // Variables
        const TASA_VES = 500;
        let cart = JSON.parse(localStorage.getItem('inverferreteria_cart')) || [];
        const cartBadges = document.querySelectorAll('.cart-badge');
        const cartDrawer = document.getElementById('cart-drawer');
        const cartOverlay = document.getElementById('cart-overlay');
        const closeCartBtn = document.getElementById('close-cart-btn');
        const openCartBtns = document.querySelectorAll('.cart-icon-nav');
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotalPrice = document.getElementById('cart-total-price');
        const cartTotalVES = document.getElementById('cart-total-ves');
        const checkoutBtn = document.getElementById('checkout-btn');

        // Guardar y renderizar
        const saveCart = () => {
            localStorage.setItem('inverferreteria_cart', JSON.stringify(cart));
            updateCartUI();
        };

        const toggleCart = (show) => {
            if (show) {
                cartDrawer.classList.add('active');
                cartOverlay.classList.add('active');
            } else {
                cartDrawer.classList.remove('active');
                cartOverlay.classList.remove('active');
            }
        };

        const attachCartEvents = () => {
            document.querySelectorAll('.qty-btn.plus').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = e.target.getAttribute('data-index');
                    cart[index].qty++;
                    saveCart();
                });
            });
            document.querySelectorAll('.qty-btn.minus').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = e.target.getAttribute('data-index');
                    if (cart[index].qty > 1) {
                        cart[index].qty--;
                    } else {
                        cart.splice(index, 1);
                    }
                    saveCart();
                });
            });
            document.querySelectorAll('.remove-item-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const target = e.target.closest('.remove-item-btn');
                    const index = target.getAttribute('data-index');
                    cart.splice(index, 1);
                    saveCart();
                });
            });
        };

        const updateCartUI = () => {
            // Count
            const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
            cartBadges.forEach(badge => badge.innerText = totalItems);

            // Items HTML
            cartItemsContainer.innerHTML = '';
            let totalPrice = 0;

            if (cart.length === 0) {
                cartItemsContainer.innerHTML = '<p class="cart-empty-message">Tu carrito está vacío.</p>';
            } else {
                cart.forEach((item, index) => {
                    const itemTotal = item.price * item.qty;
                    totalPrice += itemTotal;
                    
                    const itemEl = document.createElement('div');
                    itemEl.className = 'cart-item';
                    itemEl.innerHTML = `
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <div class="cart-item-price">
                                <span class="cart-item-usd">$${item.price.toFixed(2)}</span>
                                <span class="cart-item-ves">Bs. ${(item.price * TASA_VES).toLocaleString('de-DE', {minimumFractionDigits: 2})}</span>
                            </div>
                        </div>
                        <div class="cart-item-controls">
                            <button class="qty-btn minus" data-index="${index}">-</button>
                            <span class="cart-item-qty">${item.qty}</span>
                            <button class="qty-btn plus" data-index="${index}">+</button>
                            <button class="remove-item-btn" data-index="${index}"><i class="fas fa-trash"></i></button>
                        </div>
                    `;
                    cartItemsContainer.appendChild(itemEl);
                });
            }

            cartTotalPrice.innerText = `$${totalPrice.toFixed(2)}`;
            if (cartTotalVES) {
                cartTotalVES.innerText = `Bs. ${(totalPrice * TASA_VES).toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            }

            if (cart.length === 0) {
                checkoutBtn.classList.add('disabled');
            } else {
                checkoutBtn.classList.remove('disabled');
            }
            
            attachCartEvents();
        };

        // Bindings de UI básicos del Carrito
        openCartBtns.forEach(btn => btn.addEventListener('click', () => toggleCart(true)));
        closeCartBtn.addEventListener('click', () => toggleCart(false));
        cartOverlay.addEventListener('click', () => toggleCart(false));

        // Add to cart local page bindings (GLOBAL EXPOSED)
        window.bindCartEventsToDynamicProducts = (buttons) => {
            buttons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const card = e.target.closest('.product-card') || e.target.closest('.pc-card');
                    const id = card.getAttribute('data-id');
                    const name = card.getAttribute('data-name');
                    const price = parseFloat(card.getAttribute('data-price') || 0);

                    const existingItem = cart.find(item => item.id === id);
                    if (existingItem) {
                        existingItem.qty++;
                    } else {
                        cart.push({ id, name, price, qty: 1 });
                    }
                    saveCart();
                    
                    // Visual feedback
                    const originalText = e.target.innerText;
                    e.target.innerText = '¡Agregado!';
                    e.target.style.backgroundColor = '#25d366';
                    e.target.style.color = '#fff';
                    setTimeout(() => {
                        e.target.innerText = originalText;
                        e.target.style.backgroundColor = '';
                        e.target.style.color = '';
                    }, 1000);
                });
            });
        };
        // Bind inicial a los estáticos si los hay en index
        window.bindCartEventsToDynamicProducts(document.querySelectorAll('.add-to-cart-btn'));

        // Checkout Button
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) return;
            
            let message = "Hola INVERFERRETERIA FM, me gustaría hacer el siguiente pedido:\n\n";
            let total = 0;
            cart.forEach(item => {
                message += `- ${item.qty}x ${item.name} ($${item.price.toFixed(2)})\n`;
                total += item.price * item.qty;
            });
            
            message += `\n*Total estimado: $${total.toFixed(2)}*\n`;
            message += `*Total en Bolívares: Bs. ${(total * TASA_VES).toLocaleString('de-DE', {minimumFractionDigits: 2})}*\n`;
            message += `(Tasa del día: Bs. ${TASA_VES})\n\n¿Podrían confirmarme disponibilidad?`;
            
            const whatsappNumber = "584244362082";
            const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
            
            window.open(whatsappURL, '_blank');
        });

        updateCartUI();
    };

    initCart();

});
