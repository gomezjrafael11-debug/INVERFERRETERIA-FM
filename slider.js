document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.getElementById('productCarousel');
    const prevButton = document.querySelector('.prev-button');
    const nextButton = document.querySelector('.next-button');
    const cardWidth = 330; // Ancho de la tarjeta (300px) + el espacio (30px)

    let scrollAmount = 0;
    const scrollStep = cardWidth; // Cantidad de píxeles a desplazar

    // Desplazamiento manual al hacer clic en las flechas
    prevButton.addEventListener('click', () => {
        scrollAmount -= scrollStep;
        if (scrollAmount < 0) {
            scrollAmount = 0;
        }
        carousel.scrollTo({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });

    nextButton.addEventListener('click', () => {
        scrollAmount += scrollStep;
        if (scrollAmount > carousel.scrollWidth - carousel.clientWidth) {
            scrollAmount = carousel.scrollWidth - carousel.clientWidth;
        }
        carousel.scrollTo({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });

    // Desplazamiento automático
    setInterval(() => {
        if (scrollAmount < carousel.scrollWidth - carousel.clientWidth) {
            scrollAmount += scrollStep;
        } else {
            scrollAmount = 0; // Regresa al inicio al llegar al final
        }
        carousel.scrollTo({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }, 4000); // Mueve el carrusel cada 4 segundos
});