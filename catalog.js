// ============================================================
//  CATÁLOGO INVERFERRETERIA FM — conectado a Firebase Firestore
//  Lee los productos de la nube en tiempo real (VERSIÓN COMPAT)
// ============================================================

// ── Configuración Firebase ─────────────
const firebaseConfig = {
    apiKey:            "AIzaSyBEVqWvU6g6QwwboiWkjMWrwtdgRm0cG_w",
    authDomain:        "inverferreteria-48181.firebaseapp.com",
    projectId:         "inverferreteria-48181",
    storageBucket:     "inverferreteria-48181.firebasestorage.app",
    messagingSenderId: "355994579495",
    appId:             "1:355994579495:web:709e52df9a0bd6a5fe1402",
    measurementId:     "G-E5F5QJY7FM"
};

// Inicializar Firebase (usa el objeto global 'firebase' inyectado en el HTML)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// ── Datos de categoría (badge color) ─────────────────────────────
const catMeta = {
    herramientas: { label: "Herramientas", color: "#ff6b00" },
    construccion:  { label: "Construcción",  color: "#2563eb" },
    plomeria:      { label: "Plomería",      color: "#0891b2" },
    pinturas:      { label: "Pinturas",      color: "#7c3aed" }
};

// ── IntersectionObserver para lazy-load de imágenes ───────────────
const imageObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        img.src = img.dataset.src;
        img.onload  = () => img.classList.add('loaded');
        img.onerror = () => img.classList.add('loaded');
        obs.unobserve(img);
    });
}, { rootMargin: '300px' });

// ── Construir una tarjeta premium ─────────────────────────────────
function buildCard(item, index) {
    const meta = catMeta[item.cat] || { label: item.cat, color: '#888' };

    const card = document.createElement('article');
    card.className = 'pc-card';
    card.dataset.id    = item.id;
    card.dataset.name  = item.name;
    card.dataset.price = item.price;
    card.dataset.cat   = item.cat;
    card.style.animationDelay = `${Math.min(index * 0.04, 0.5)}s`;

    const img = document.createElement('img');
    img.alt      = item.name;
    img.width    = 300;
    img.height   = 200;
    img.className = 'pc-img';
    img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";
    img.dataset.src = item.img || 'image.png';
    imageObserver.observe(img);

    const badge = document.createElement('span');
    badge.className = 'pc-badge';
    badge.textContent = meta.label;
    badge.style.setProperty('--badge-color', meta.color);

    const body   = document.createElement('div');
    body.className = 'pc-body';

    const h3 = document.createElement('h3');
    h3.className   = 'pc-name';
    h3.textContent = item.name;

    const desc = document.createElement('p');
    desc.className   = 'pc-desc';
    desc.textContent = item.desc || '';

    const footer = document.createElement('div');
    footer.className = 'pc-footer';

    const price = document.createElement('span');
    price.className   = 'pc-price';
    price.textContent = `$${Number(item.price).toFixed(2)}`;

    const btn = document.createElement('button');
    btn.className   = 'pc-btn add-to-cart-btn';
    btn.textContent = 'Añadir';

    footer.appendChild(price);
    footer.appendChild(btn);
    body.appendChild(h3);
    body.appendChild(desc);
    body.appendChild(footer);
    card.appendChild(img);
    card.appendChild(badge);
    card.appendChild(body);
    return card;
}

// ── Renderizar lista de productos en el grid ──────────────────────
function renderProducts(list) {
    const grid = document.getElementById('main-product-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (list.length === 0) {
        grid.innerHTML = '<p class="pc-empty">No hay productos en esta categoría.</p>';
        return;
    }

    const frag = document.createDocumentFragment();
    list.forEach((item, i) => frag.appendChild(buildCard(item, i)));
    grid.appendChild(frag);

    // Actualizar contador
    const countEl = document.getElementById('product-count');
    if (countEl) countEl.textContent = `${list.length} producto${list.length !== 1 ? 's' : ''}`;

    // Rebind carrito
    if (typeof window.bindCartEventsToDynamicProducts === 'function') {
        window.bindCartEventsToDynamicProducts(grid.querySelectorAll('.add-to-cart-btn'));
    }
}

// ── Mostrar spinner de carga ──────────────────────────────────────
function mostrarCargando() {
    const grid = document.getElementById('main-product-grid');
    if (!grid) return;
    grid.innerHTML = `
        <div class="pc-loading" style="grid-column:1/-1; text-align:center; padding:3rem; color:#aaa;">
            <div class="pc-spinner"></div>
            <p style="margin-top:1rem; font-size:0.95rem;">Cargando productos...</p>
        </div>`;
}

// ── Cargar productos desde Firestore ─────────────────────────────
async function cargarProductos(filtro = 'all') {
    mostrarCargando();

    try {
        const colRef = db.collection('productos');
        const q = filtro === 'all'
            ? colRef.orderBy('name')
            : colRef.where('cat', '==', filtro).orderBy('name');

        const snapshot = await q.get();
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderProducts(lista);

    } catch (error) {
        console.error('Error al cargar productos:', error);
        
        let errorMessage = "⚠️ No se pudieron cargar los productos.<br><small>Intenta recargar la página.</small>";
        if (String(error).includes("index")) {
            errorMessage = "⚠️ Firebase está construyendo el índice de búsqueda (tarda 3-5 mins).<br><small>Por favor recarga en un par de minutos.</small>";
        }

        const grid = document.getElementById('main-product-grid');
        if (grid) grid.innerHTML = `
            <p class="pc-empty" style="color: #ff6b00;">
                ${errorMessage}
            </p>`;
    }
}

// ── Inicialización ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Primera carga
    cargarProductos('all');

    // Filtros
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            cargarProductos(btn.dataset.filter);
        });
    });
});
