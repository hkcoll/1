// API Configuration
const API_URL = 'https://hkcoll-1.vercel.app/api';

// HK Collection - Admin Panel JavaScript
// Uses API (primary) with data.js as fallback

let products = [];
let editingId = null;
let deleteId = null;
let useAPI = false; // Flag to track if API is working

// Category mappings
const categoryNames = {
    accessories: 'اكسسوارات',
    perfumes: 'عطور',
    watches: 'ساعات',
    hometools: 'أدوات منزلية وكهربائية',
    wallets: 'جزادين نسائية ورجالية',
    militarybags: 'حقائب عسكرية ورياضية',
    makeup: 'مستحضرات تجميل'
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
    updateStats();
    initEventListeners();
    createToastContainer();
});

// 🔔 Toast Notification System
function createToastContainer() {
    if (!document.getElementById('toastContainer')) {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) createToastContainer();

    const toast = document.createElement('div');
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6',
        warning: '#f59e0b'
    };

    toast.style.cssText = `
        background: ${colors[type] || colors.info};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-family: 'Cairo', sans-serif;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        pointer-events: auto;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;

    // Add animation styles if not exists
    if (!document.getElementById('toastStyles')) {
        const style = document.createElement('style');
        style.id = 'toastStyles';
        style.textContent = `
            @keyframes slideIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes slideOut {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(-20px); }
            }
        `;
        document.head.appendChild(style);
    }

    document.getElementById('toastContainer').appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Load products - Try API first, fallback to data.js
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        if (response.ok) {
            products = await response.json();
            useAPI = true;
            console.log('✅ Admin: Products loaded from API');
        } else {
            throw new Error('API returned error');
        }
    } catch (error) {
        console.log('⚠️ Admin: API unavailable, using local data.js');
        useAPI = false;
        if (typeof productsData !== 'undefined') {
            products = [...productsData];
        }
    }
    renderProducts();
}

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

    const genderNames = {
        women: 'نسائي 👩',
        men: 'رجالي 👨'
    };

    tbody.innerHTML = data.map(product => `
        <tr>
            <td><img src="${product.image}" alt="${product.name}" class="product-thumb"></td>
            <td class="product-name-cell">${product.name}</td>
            <td><span class="product-category-badge">${categoryNames[product.category] || product.category}</span></td>
            <td><span class="product-gender-badge ${!product.gender ? 'empty' : ''}">${genderNames[product.gender] || '—'}</span></td>
            <td><strong>${product.currency}${product.price}</strong></td>
            <td><span class="product-badge ${!product.badge ? 'empty' : ''}">${product.badge || 'بدون وسم'}</span></td>
            <td>
                <div class="action-btns">
                    <button class="action-btn edit" onclick="openModal('${product._id || product.id}')" title="تعديل">✏️</button>
                    <button class="action-btn delete" onclick="openDeleteModal('${product._id || product.id}')" title="حذف">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Update statistics
function updateStats() {
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('accessoriesCount').textContent = products.filter(p => p.category === 'accessories').length;
    document.getElementById('perfumesCount').textContent = products.filter(p => p.category === 'perfumes').length;
    document.getElementById('watchesCount').textContent = products.filter(p => p.category === 'watches').length;
    document.getElementById('hometoolsCount').textContent = products.filter(p => p.category === 'hometools').length;
    document.getElementById('walletsCount').textContent = products.filter(p => p.category === 'wallets').length;
    document.getElementById('militarybagsCount').textContent = products.filter(p => p.category === 'militarybags').length;
    document.getElementById('makeupCount').textContent = products.filter(p => p.category === 'makeup').length;
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
        const product = products.find(p => (p._id || p.id) == id);
        if (product) {
            title.textContent = 'تعديل المنتج';
            document.getElementById('productId').value = product._id || product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productGender').value = product.gender || '';
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

// Handle image upload with compression
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Show loading state
    document.getElementById('imagePreview').innerHTML = '<span class="placeholder">جاري ضغط الصورة...</span>';

    // Resize and compress to base64
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            // Reduced from 400 to 300 for better compression
            const maxSize = 300;
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

            // Reduced quality from 0.8 to 0.6 for better compression
            const base64 = canvas.toDataURL('image/jpeg', 0.6);

            // Show size info
            const sizeKB = Math.round(base64.length * 0.75 / 1024);
            console.log(`✅ Image compressed: ${sizeKB} KB`);

            document.getElementById('imageData').value = base64;
            document.getElementById('imagePreview').innerHTML = `<img src="${base64}" alt="Preview"><span style="font-size:12px;color:#666">حجم: ${sizeKB} KB</span>`;
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// Save product - Instant UI update then sync to server
async function saveProduct(e) {
    e.preventDefault();

    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const gender = document.getElementById('productGender').value || null;
    const badge = document.getElementById('productBadge').value || null;
    const image = document.getElementById('imageData').value;

    if (!image) {
        showToast('الرجاء رفع صورة للمنتج', 'error');
        return;
    }

    const productData = {
        name,
        category,
        categoryAr: categoryNames[category],
        price,
        currency: '$',
        gender,
        badge,
        image
    };

    // ✨ Instant UI Update - Update locally first
    const tempId = 'temp_' + Date.now();
    if (editingId) {
        const index = products.findIndex(p => (p._id || p.id) == editingId);
        if (index !== -1) {
            products[index] = { ...products[index], ...productData };
        }
    } else {
        products.unshift({ _id: tempId, ...productData });
    }

    // Update UI immediately
    renderProducts();
    updateStats();
    closeModal();
    showToast(editingId ? 'جاري تحديث المنتج...' : 'جاري إضافة المنتج...', 'info');

    if (useAPI) {
        // Sync to API in background
        try {
            let response;
            if (editingId) {
                response = await fetch(`${API_URL}/products/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData)
                });
            } else {
                response = await fetch(`${API_URL}/products`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData)
                });
            }

            if (response.ok) {
                // Refresh from server to get proper IDs
                await loadProducts();
                updateStats();
                showToast(editingId ? '✅ تم تحديث المنتج!' : '✅ تم إضافة المنتج!', 'success');
            } else {
                showToast('⚠️ حدث خطأ في الحفظ', 'error');
                await loadProducts(); // Restore original data
            }
        } catch (error) {
            console.error('Error saving product:', error);
            showToast('⚠️ فشل الاتصال بالخادم', 'error');
            await loadProducts(); // Restore original data
        }
    }
}

// Delete modal
function openDeleteModal(id) {
    deleteId = id;
    const product = products.find(p => (p._id || p.id) === id || (p._id || p.id) == id);
    if (product) {
        document.getElementById('deleteProductName').textContent = product.name;
        document.getElementById('deleteModal').classList.add('active');
    }
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
    deleteId = null;
}

// Delete product - Instant UI update then sync to server
async function deleteProduct() {
    if (!deleteId) return;

    // Save the ID before closing modal (closeDeleteModal resets deleteId to null)
    const productIdToDelete = deleteId;

    // ✨ Instant UI Update - Remove from local array first
    const deletedProduct = products.find(p => (p._id || p.id) == productIdToDelete);
    products = products.filter(p => (p._id || p.id) != productIdToDelete);

    // Update UI immediately
    renderProducts();
    updateStats();
    closeDeleteModal();
    showToast('جاري حذف المنتج...', 'info');

    if (useAPI) {
        try {
            const response = await fetch(`${API_URL}/products/${productIdToDelete}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showToast('✅ تم حذف المنتج!', 'success');
            } else {
                showToast('⚠️ حدث خطأ أثناء الحذف', 'error');
                // Restore product on error
                if (deletedProduct) {
                    products.push(deletedProduct);
                    renderProducts();
                    updateStats();
                }
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            showToast('⚠️ فشل الاتصال بالخادم', 'error');
            // Restore product on error
            if (deletedProduct) {
                products.push(deletedProduct);
                renderProducts();
                updateStats();
            }
        }
    }
}

// Export functions
function generateExportCode() {
    const code = `// Sample products data
const productsData = ${JSON.stringify(products, null, 4)};
const WHATSAPP_NUMBER = "${typeof WHATSAPP_NUMBER !== 'undefined' ? WHATSAPP_NUMBER : ''}";`;

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
