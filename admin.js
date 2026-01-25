// HK Collection - Admin Panel JavaScript
let products = [...productsData];
let editingId = null;
let deleteId = null;

// Category mappings
const categoryNames = {
    perfumes: 'عطور',
    watches: 'ساعات',
    accessories: 'اكسسوارات'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateStats();
    initEventListeners();
});

function initEventListeners() {
    // Add product button
    document.getElementById('addProductBtn').addEventListener('click', () => openModal());

    // Modal controls
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('productModal').addEventListener('click', (e) => {
        if (e.target.id === 'productModal') closeModal();
    });

    // Delete modal controls
    document.getElementById('closeDeleteModal').addEventListener('click', closeDeleteModal);
    document.getElementById('cancelDelete').addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDelete').addEventListener('click', deleteProduct);
    document.getElementById('deleteModal').addEventListener('click', (e) => {
        if (e.target.id === 'deleteModal') closeDeleteModal();
    });

    // Form submission
    document.getElementById('productForm').addEventListener('submit', saveProduct);

    // Image upload
    const imagePreview = document.getElementById('imagePreview');
    const imageInput = document.getElementById('imageInput');
    imagePreview.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', handleImageUpload);

    // Category filter
    document.getElementById('categoryFilter').addEventListener('change', filterProducts);

    // Sidebar navigation
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            if (section === 'export') {
                document.querySelector('.table-container').style.display = 'none';
                document.querySelector('.stats-grid').style.display = 'none';
                document.getElementById('exportSection').style.display = 'block';
            } else {
                document.querySelector('.table-container').style.display = 'block';
                document.querySelector('.stats-grid').style.display = 'grid';
                document.getElementById('exportSection').style.display = 'none';
            }
        });
    });

    // Export functions
    document.getElementById('generateExport').addEventListener('click', generateExportCode);
    document.getElementById('copyExport').addEventListener('click', copyExportCode);
    document.getElementById('downloadExport').addEventListener('click', downloadExportFile);
}

// Render products table
function renderProducts(filteredProducts = null) {
    const tbody = document.getElementById('productsTableBody');
    const data = filteredProducts || products;

    tbody.innerHTML = data.map(product => `
        <tr>
            <td><img src="${product.image}" alt="${product.name}" class="product-thumb"></td>
            <td class="product-name-cell">${product.name}</td>
            <td><span class="product-category-badge">${categoryNames[product.category] || product.category}</span></td>
            <td><strong>${product.currency}${product.price}</strong></td>
            <td><span class="product-badge ${!product.badge ? 'empty' : ''}">${product.badge || 'بدون وسم'}</span></td>
            <td>
                <div class="action-btns">
                    <button class="action-btn edit" onclick="openModal(${product.id})" title="تعديل">✏️</button>
                    <button class="action-btn delete" onclick="openDeleteModal(${product.id})" title="حذف">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Update statistics
function updateStats() {
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('perfumesCount').textContent = products.filter(p => p.category === 'perfumes').length;
    document.getElementById('watchesCount').textContent = products.filter(p => p.category === 'watches').length;
}

// Filter products
function filterProducts() {
    const filter = document.getElementById('categoryFilter').value;
    if (filter === 'all') {
        renderProducts();
    } else {
        renderProducts(products.filter(p => p.category === filter));
    }
}

// Open modal for add/edit
function openModal(id = null) {
    editingId = id;
    const modal = document.getElementById('productModal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('productForm');

    form.reset();
    document.getElementById('imagePreview').innerHTML = '<span class="placeholder">اضغط لرفع صورة</span>';
    document.getElementById('imageData').value = '';

    if (id) {
        const product = products.find(p => p.id === id);
        if (product) {
            title.textContent = 'تعديل المنتج';
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productBadge').value = product.badge || '';
            document.getElementById('imageData').value = product.image;
            document.getElementById('imagePreview').innerHTML = `<img src="${product.image}" alt="Preview">`;
        }
    } else {
        title.textContent = 'إضافة منتج جديد';
    }

    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('productModal').classList.remove('active');
    editingId = null;
}

// Handle image upload
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Resize and convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxSize = 400;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxSize) {
                    height *= maxSize / width;
                    width = maxSize;
                }
            } else {
                if (height > maxSize) {
                    width *= maxSize / height;
                    height = maxSize;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const base64 = canvas.toDataURL('image/jpeg', 0.8);
            document.getElementById('imageData').value = base64;
            document.getElementById('imagePreview').innerHTML = `<img src="${base64}" alt="Preview">`;
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// Save product
function saveProduct(e) {
    e.preventDefault();

    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const badge = document.getElementById('productBadge').value || null;
    const image = document.getElementById('imageData').value;

    if (!image) {
        alert('الرجاء رفع صورة للمنتج');
        return;
    }

    if (editingId) {
        // Update existing product
        const index = products.findIndex(p => p.id === editingId);
        if (index !== -1) {
            products[index] = {
                ...products[index],
                name,
                category,
                categoryAr: categoryNames[category],
                price,
                badge,
                image
            };
        }
    } else {
        // Add new product
        const newId = Math.max(...products.map(p => p.id), 0) + 1;
        products.push({
            id: newId,
            name,
            category,
            categoryAr: categoryNames[category],
            price,
            currency: '$',
            image,
            badge
        });
    }

    renderProducts();
    updateStats();
    closeModal();
    filterProducts();
}

// Delete modal
function openDeleteModal(id) {
    deleteId = id;
    const product = products.find(p => p.id === id);
    if (product) {
        document.getElementById('deleteProductName').textContent = product.name;
        document.getElementById('deleteModal').classList.add('active');
    }
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
    deleteId = null;
}

function deleteProduct() {
    if (deleteId) {
        products = products.filter(p => p.id !== deleteId);
        renderProducts();
        updateStats();
        closeDeleteModal();
        filterProducts();
    }
}

// Export functions
function generateExportCode() {
    const code = `// Sample products data
const productsData = ${JSON.stringify(products, null, 4)};
const WHATSAPP_NUMBER = "${WHATSAPP_NUMBER}";`;

    document.getElementById('exportCode').value = code;
}

function copyExportCode() {
    const textarea = document.getElementById('exportCode');
    if (!textarea.value) {
        generateExportCode();
    }
    textarea.select();
    document.execCommand('copy');
    alert('تم نسخ الكود بنجاح!');
}

function downloadExportFile() {
    if (!document.getElementById('exportCode').value) {
        generateExportCode();
    }
    const code = document.getElementById('exportCode').value;
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.js';
    a.click();
    URL.revokeObjectURL(url);
}
