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

});
