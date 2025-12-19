document.addEventListener('DOMContentLoaded', () => {
    loadRentalProducts();
});

let currentProduct = null;
let currentQuote = null;

async function loadRentalProducts() {
    const grid = document.getElementById('rental-products-grid');
    grid.innerHTML = '<div class="col-span-full text-center py-12"><i class="fa-solid fa-spinner fa-spin text-4xl text-pixsoft-primary mb-4"></i><p>Cargando equipos disponibles...</p></div>';

    try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/leasing/products/');
        if (!response.ok) throw new Error('Error al cargar productos');

        const products = await response.json();

        grid.innerHTML = '';

        if (products.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center py-12"><p class="text-slate-500">No hay equipos disponibles para renta en este momento.</p></div>';
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'glass-card rounded-2xl p-6 bg-white border border-slate-100 hover:shadow-xl transition-all group flex flex-col h-full';

            // Image handling (placeholder if none)
            const imgSrc = product.image ? product.image : 'https://placehold.co/400x300?text=No+Image';

            card.innerHTML = `
                <div class="h-48 mb-6 overflow-hidden rounded-xl bg-slate-50 flex items-center justify-center relative">
                    <img src="${imgSrc}" alt="${product.name}" class="object-contain h-full w-full group-hover:scale-105 transition-transform duration-500">
                    <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-slate-700 shadow-sm">
                        ${product.category_name || 'Equipo'}
                    </div>
                </div>
                
                <div class="flex-1">
                    <h3 class="text-xl font-bold text-slate-900 mb-2 leading-tight">${product.name}</h3>
                    <p class="text-slate-500 text-sm mb-4 line-clamp-2">${product.description}</p>
                    
                    <div class="space-y-2 mb-6">
                        ${Object.entries(product.specifications || {}).slice(0, 3).map(([key, val]) => `
                            <div class="flex justify-between text-xs">
                                <span class="text-slate-400 capitalize">${key}:</span>
                                <span class="text-slate-700 font-medium">${val}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="mt-auto pt-4 border-t border-slate-100">
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-xs text-slate-500 flex items-center gap-1">
                            <i class="fa-solid fa-circle text-[10px] ${product.is_available ? 'text-green-500' : 'text-red-500'}"></i>
                            ${product.is_available ? 'Disponible' : 'Agotado'}
                        </span>
                    </div>
                    <button onclick='openQuoteModal(${JSON.stringify(product).replace(/'/g, "&#39;")})' 
                        class="w-full btn-primary py-2.5 shadow-lg shadow-pixsoft-primary/20"
                        ${!product.is_available ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
                        <i class="fa-solid fa-file-invoice-dollar mr-2"></i> Cotizar Renta
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        grid.innerHTML = '<div class="col-span-full text-center py-12 text-red-500"><p>Error al cargar el catálogo.</p></div>';
    }
}

function openQuoteModal(product) {
    currentProduct = product;

    document.getElementById('modalProductName').innerText = product.name;
    document.getElementById('modalProductSku').innerText = `SKU: ${product.sku}`;
    document.getElementById('modalProductTitle').innerText = product.name;
    document.getElementById('modalProductDesc').innerText = product.description;
    document.getElementById('productId').value = product.id;

    const imgContainer = document.getElementById('modalProductImage');
    const imgSrc = product.image ? product.image : 'https://placehold.co/100x100?text=IMG';
    imgContainer.innerHTML = `<img src="${imgSrc}" class="object-cover w-full h-full rounded-lg">`;

    // Reset Form
    document.getElementById('quoteForm').reset();
    document.getElementById('quoteResult').classList.add('hidden');

    // Set default dates (today + 1 month)
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').value = today;

    // Show Modal
    const modal = document.getElementById('quoteModal');
    modal.classList.remove('hidden');
    modal.querySelector('.bg-white').classList.remove('scale-95', 'opacity-0');
}

function closeQuoteModal() {
    const modal = document.getElementById('quoteModal');
    modal.classList.add('hidden');
    currentProduct = null;
    currentQuote = null;
}

async function calculateQuote() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const period = document.getElementById('rentalPeriod').value;

    if (!startDate || !endDate) {
        alert('Por favor selecciona las fechas de inicio y fin.');
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/leasing/quote/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product_id: currentProduct.id,
                start_date: startDate,
                end_date: endDate,
                period: period
            })
        });

        const result = await response.json();

        if (!response.ok) {
            // Handle specific case where plan doesn't exist
            if (response.status === 404 && result.available_plans) {
                alert(`Este equipo no tiene un plan configurado para periodo ${period}.\nPlanes disponibles: ${result.available_plans.join(', ')}`);
            } else {
                alert(result.error || 'Error al calcular la cotización.');
            }
            return;
        }

        // Show Results
        currentQuote = result; // Store for add-to-cart

        document.getElementById('resDuration').innerText = `${result.duration_days} días`;
        document.getElementById('resTotal').innerText = `$${result.total_cost.toFixed(2)}`;
        document.getElementById('contractPreview').innerText = result.contract_document;

        document.getElementById('quoteResult').classList.remove('hidden');

    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión al calcular la cotización.');
    }
}

async function addToCart(quote) {
    if (!quote) return;

    const token = localStorage.getItem('accessToken');
    if (!token) {
        alert('Debes iniciar sesión para agregar al carrito.');
        window.location.href = '../Login.html';
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/orders/cart/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                product_id: quote.product_id,
                product_type: 'rental',
                rental_plan_id: quote.plan_id,
                quantity: 1,
                rental_start_date: quote.start_date,
                rental_end_date: quote.end_date
            })
        });

        if (response.ok) {
            // Success in Backend
            const result = await response.json(); // Get the created item (now that view returns it)

            // --- SYNC WITH LOCALSTORAGE FOR FRONTEND VISIBILITY ---
            let cart = JSON.parse(localStorage.getItem('pixsoft_cart') || '[]');

            // Construir objeto compatible con cart.js
            const cartItem = {
                id: `rental-${quote.product_id}-${quote.plan_id}`, // Unique ID for rental
                real_id: quote.product_id, // backend ID
                name: `Alquiler: ${quote.product_name} (${quote.plan_period})`,
                price: quote.total_cost, // Use total cost of the period
                image: currentProduct.image || 'https://placehold.co/100x100?text=Rent',
                quantity: 1,
                type: 'rental',
                rental_data: quote
            };

            cart.push(cartItem);
            localStorage.setItem('pixsoft_cart', JSON.stringify(cart));
            // -----------------------------------------------------

            alert('¡Equipo agregado al carrito exitosamente!');
            closeQuoteModal();
            window.location.href = '../cart.html';
        } else {
            if (response.status === 401) {
                alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
                localStorage.removeItem('accessToken');
                window.location.href = '../Login.html';
                return;
            }
            const data = await response.json();
            console.error('Add to cart error:', data);
            alert('Error al agregar al carrito:\n' + JSON.stringify(data));
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Error de red al agregar al carrito.');
    }
}
