// HK Collection - Main JavaScript
document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initCategoryCards();
    initSmoothScroll();
    initBackButton();
});

// Categories with subcategories (women/men)
const categoriesWithGender = ['accessories', 'perfumes', 'watches', 'wallets'];

// Current selection state
let currentCategory = null;
let currentGender = null;

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

// Render Products for a specific category (Newest to Oldest)
function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    if (products.length === 0) {
        grid.innerHTML = `
            <div class="no-products">
                <p>لا توجد منتجات في هذه الفئة حالياً</p>
            </div>
        `;
        return;
    }
    // Sort products by ID descending (newest first)
    const sortedProducts = [...products].sort((a, b) => b.id - a.id);
    grid.innerHTML = sortedProducts.map(product => `
        <div class="product-card" data-category="${product.category}">
            <div class="product-image">
                ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <div class="product-category">${product.categoryAr}</div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">${product.currency}${product.price}</div>
                <button class="product-btn" onclick="orderProduct('${product.name}', ${product.price}, '${product.categoryAr}')">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    اطلب الآن
                </button>
            </div>
        </div>
    `).join('');
}

// Category Cards - Show products or subcategories when clicked
function initCategoryCards() {
    // Update category counts dynamically
    updateCategoryCounts();

    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            const categoryName = card.querySelector('.category-name').textContent;

            currentCategory = category;

            // Check if this category has gender subcategories
            if (categoriesWithGender.includes(category)) {
                showGenderSelection(category, categoryName);
            } else {
                // Show products directly
                currentGender = null;
                showCategoryProducts(category, categoryName);
            }
        });
    });
}

// Show gender selection (Women's / Men's)
function showGenderSelection(category, categoryName) {
    // Hide categories
    document.getElementById('categories').style.display = 'none';

    // Show subcategory section
    const subcategorySection = document.getElementById('subcategories');
    subcategorySection.style.display = 'block';

    // Update title
    document.getElementById('subcategoryTitle').textContent = categoryName;

    // Update subcategory cards data
    document.querySelector('.subcategory-card[data-gender="women"]').dataset.category = category;
    document.querySelector('.subcategory-card[data-gender="men"]').dataset.category = category;

    // Update counts
    const womenCount = productsData.filter(p => p.category === category && p.gender === 'women').length;
    const menCount = productsData.filter(p => p.category === category && p.gender === 'men').length;

    document.getElementById('womenCount').textContent = womenCount === 1 ? `${womenCount} منتج` : `${womenCount} منتجات`;
    document.getElementById('menCount').textContent = menCount === 1 ? `${menCount} منتج` : `${menCount} منتجات`;

    // Scroll to top
    subcategorySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Initialize subcategory cards
function initSubcategoryCards() {
    document.querySelectorAll('.subcategory-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            const gender = card.dataset.gender;
            const genderName = gender === 'women' ? 'نسائي' : 'رجالي';
            const categoryName = document.getElementById('subcategoryTitle').textContent;

            currentGender = gender;

            // Filter products by category and gender
            const filtered = productsData.filter(p => p.category === category && p.gender === gender);

            // Update title
            document.getElementById('categoryTitle').textContent = `${categoryName} - ${genderName}`;

            // Render products
            renderProducts(filtered);

            // Hide subcategories and show products
            document.getElementById('subcategories').style.display = 'none';
            document.getElementById('products').style.display = 'block';

            // Scroll to products
            document.getElementById('products').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

// Show products for a specific category (no gender)
function showCategoryProducts(category, categoryName) {
    // Filter products by category
    const filtered = productsData.filter(p => p.category === category);

    // Update title
    document.getElementById('categoryTitle').textContent = categoryName;

    // Render products
    renderProducts(filtered);

    // Hide categories section and show products section
    document.getElementById('categories').style.display = 'none';
    document.getElementById('subcategories').style.display = 'none';
    document.getElementById('products').style.display = 'block';

    // Scroll to top of products section
    document.getElementById('products').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Back button functionality
function initBackButton() {
    // Back from products
    const backBtn = document.getElementById('backToCategories');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            document.getElementById('products').style.display = 'none';

            // If we came from subcategories, go back there
            if (currentGender && categoriesWithGender.includes(currentCategory)) {
                document.getElementById('subcategories').style.display = 'block';
                document.getElementById('subcategories').scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                document.getElementById('categories').style.display = 'block';
                document.getElementById('categories').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            currentGender = null;
        });
    }

    // Back from subcategories
    const backFromSubBtn = document.getElementById('backFromSubcategories');
    if (backFromSubBtn) {
        backFromSubBtn.addEventListener('click', () => {
            document.getElementById('subcategories').style.display = 'none';
            document.getElementById('categories').style.display = 'block';
            document.getElementById('categories').scrollIntoView({ behavior: 'smooth', block: 'start' });
            currentCategory = null;
        });
    }

    // Initialize subcategory cards
    initSubcategoryCards();
}

// Update category counts based on actual products
function updateCategoryCounts() {
    const categories = ['accessories', 'perfumes', 'watches', 'hometools', 'wallets', 'militarybags', 'makeup'];
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

// Order Product via WhatsApp - Enhanced Message
function orderProduct(name, price, category) {
    const message = encodeURIComponent(
        `🛒 *طلب جديد من HK Collection*
━━━━━━━━━━━━━━━━━━━━

📦 *المنتج:* ${name}
💰 *السعر:* $${price}
📂 *الفئة:* ${category || 'غير محدد'}

━━━━━━━━━━━━━━━━━━━━

مرحباً! أنا مهتم بشراء هذا المنتج.
أرجو التواصل معي لإتمام الطلب.

شكراً لكم! 🙏`
    );
    window.open(`https://wa.me/96171220195?text=${message}`, '_blank');
}
