// HK Collection - Main JavaScript
document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initProductsGrid();
    initFilters();
    initCategoryCards();
    initSmoothScroll();
});

// Mobile Menu
function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const menu = document.getElementById('mobileMenu');

    btn.addEventListener('click', () => {
        menu.classList.toggle('active');
        btn.classList.toggle('active');
    });

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('active');
            btn.classList.remove('active');
        });
    });
}

// Products Grid
function initProductsGrid() {
    renderProducts(productsData);
}

function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = products.map(product => `
        <div class="product-card" data-category="${product.category}">
            <div class="product-image">
                ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <div class="product-category">${product.categoryAr}</div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">${product.currency}${product.price}</div>
                <button class="product-btn" onclick="orderProduct('${product.name}', ${product.price})">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    اطلب الآن
                </button>
            </div>
        </div>
    `).join('');
}

// Filter Products
function initFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            const filtered = filter === 'all'
                ? productsData
                : productsData.filter(p => p.category === filter);
            renderProducts(filtered);
        });
    });
}

// Category Cards
function initCategoryCards() {
    // Update category counts dynamically
    updateCategoryCounts();

    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.filter === category);
            });
            const filtered = productsData.filter(p => p.category === category);
            renderProducts(filtered);
            document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// Update category counts based on actual products
function updateCategoryCounts() {
    const categories = ['perfumes', 'watches', 'accessories'];
    categories.forEach(category => {
        const count = productsData.filter(p => p.category === category).length;
        const card = document.querySelector(`.category-card[data-category="${category}"]`);
        if (card) {
            const countElement = card.querySelector('.category-count');
            if (countElement) {
                countElement.textContent = count === 1 ? `${count} منتج` : `${count} منتجات`;
            }
        }
    });
}

// Smooth Scroll
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

// Order Product via WhatsApp
function orderProduct(name, price) {
    const message = encodeURIComponent(`مرحباً، أريد طلب المنتج:\n\n📦 المنتج: ${name}\n💰 السعر: $${price}\n\nشكراً لكم!`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
}
