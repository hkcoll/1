// Script to import products from data.js to MongoDB via API
const API_URL = 'https://hkcoll-1.vercel.app/api';

// Read data.js file
const fs = require('fs');
const path = require('path');

// Read the data.js file content
const dataJsPath = path.join(__dirname, '..', 'data.js');
const dataJsContent = fs.readFileSync(dataJsPath, 'utf8');

// Extract productsData array using regex
const match = dataJsContent.match(/const productsData = (\[[\s\S]*?\]);/);
if (!match) {
    console.error('Could not find productsData in data.js');
    process.exit(1);
}

// Parse the products array
let productsData;
try {
    productsData = eval(match[1]);
} catch (e) {
    console.error('Error parsing productsData:', e);
    process.exit(1);
}

console.log(`Found ${productsData.length} products to import`);

// Import products one by one
async function importProducts() {
    let success = 0;
    let failed = 0;

    for (const product of productsData) {
        try {
            const response = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: product.name,
                    category: product.category,
                    categoryAr: product.categoryAr,
                    price: product.price,
                    currency: product.currency || '$',
                    image: product.image,
                    gender: product.gender || null,
                    badge: product.badge || null
                })
            });

            if (response.ok) {
                success++;
                console.log(`✅ Imported: ${product.name}`);
            } else {
                failed++;
                console.log(`❌ Failed: ${product.name}`);
            }
        } catch (error) {
            failed++;
            console.log(`❌ Error: ${product.name} - ${error.message}`);
        }
    }

    console.log(`\n=== Import Complete ===`);
    console.log(`✅ Success: ${success}`);
    console.log(`❌ Failed: ${failed}`);
}

importProducts();
