const API_BASE_URL = 'https://workforceanalyticssystem.onrender.com/api';

const PRODUCT_DATA = {
    "Basic Socks (Cotton)": [
        { id: "basic_cotton_white", name: "Classic White Cotton", price: 15, description: "Pure white cotton socks for daily formal/casual wear.", image: "basic.png" },
        { id: "basic_cotton_black", name: "Classic Black Cotton", price: 15, description: "Durable black cotton socks for formal wear.", image: "basic.png" }
    ],
    "Sports Socks": [
        { id: "sports_cushion", name: "Cushioned Athletic", price: 25, description: "Extra padding for high-impact sports.", image: "sports.png" },
        { id: "sports_compression", name: "Compression Sport", price: 35, description: "Technological compression for better blood flow.", image: "sports.png" }
    ],
    "Woolen Socks": [
        { id: "wool_heavy", name: "Heavy Winter Wool", price: 45, description: "Pure sheep wool for extreme cold.", image: "woolen.png" },
        { id: "wool_blend", name: "Lite Wool Blend", price: 30, description: "Wool-cotton blend for early winters.", image: "woolen.png" }
    ],
    "Ankle Socks": [
        { id: "ankle_low", name: "Low-Cut Ankle", price: 12, description: "Invisible look for sneakers.", image: "ankle.png" },
        { id: "ankle_ribbed", name: "Ribbed Ankle", price: 18, description: "Enhanced grip and style.", image: "ankle.png" }
    ],
    "Kids Socks Pack": [
        { id: "kids_cartoon", name: "Cartoon Print Pack", price: 20, description: "Set of 5 pairs with fun prints.", image: "kids.png" },
        { id: "kids_cotton_set", name: "Soft Cotton Set", price: 15, description: "Ultra-soft cotton for sensitive skin.", image: "kids.png" }
    ]
};

let CART = [];

document.addEventListener('DOMContentLoaded', () => {
    const submitBtn = document.getElementById('submitBtn');
    const statusMsg = document.getElementById('statusMsg');
    const formSection = document.getElementById('formSection');
    const successView = document.getElementById('successView');
    const orderIdDisplay = document.getElementById('orderIdDisplay');
    const dishSection = document.getElementById('dishSelection');
    const dishGrid = document.getElementById('dishGrid');

    // Global select function for products
    window.selectProduct = function(productName) {
        const items = PRODUCT_DATA[productName];
        if (!items) return;

        document.getElementById('selectedCategoryTitle').textContent = productName;
        dishGrid.innerHTML = '';

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'dish-card';
            card.innerHTML = `
                <img src="${item.image}" 
                     class="dish-thumb" 
                     alt="${item.name}"
                     onerror="this.src='https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=600&q=80'">
                <div class="dish-info">
                    <h4>${item.name}</h4>
                    <p>${item.description}</p>
                    <span class="price">₹${item.price} per unit</span>
                    <div class="qty-control">
                        <label>Units (Pairs):</label>
                        <input type="number" id="qty_${item.id}" value="100" min="1" class="qty-input">
                    </div>
                </div>
                <button onclick="addToCart('${encodeURIComponent(JSON.stringify(item))}', 'qty_${item.id}')">Add to Production List</button>
            `;
            dishGrid.appendChild(card);
        });

        document.getElementById('products').classList.add('hidden');
        dishSection.classList.remove('hidden');
        dishSection.scrollIntoView({ behavior: 'smooth' });
    };

    window.addToCart = function(itemStr, qtyId) {
        const item = JSON.parse(decodeURIComponent(itemStr));
        const quantity = parseInt(document.getElementById(qtyId).value) || 100;
        
        const existingItem = CART.find(i => i.id === item.id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            CART.push({ ...item, quantity });
        }
        
        updateCartUI();
        showStatus(statusMsg, `Added ${quantity} pairs of ${item.name} to production list!`, 'success');
    };

    window.removeFromCart = function(index) {
        CART.splice(index, 1);
        updateCartUI();
    };

    window.updateCartUI = function() {
        const cartCount = document.getElementById('cartCount');
        const cartCountNav = document.getElementById('cartCountNav');
        const cartItems = document.getElementById('cartItems');
        const totalPriceEl = document.getElementById('totalPrice');
        
        const totalUnits = CART.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCount) cartCount.textContent = totalUnits;
        if (cartCountNav) cartCountNav.textContent = totalUnits;
        
        if (cartItems) {
            cartItems.innerHTML = '';
            let total = 0;
            CART.forEach((item, index) => {
                const subtotal = item.price * item.quantity;
                total += subtotal;
                const li = document.createElement('div');
                li.className = 'cart-item';
                li.innerHTML = `
                    <div class="cart-item-main">
                        <strong>${item.name}</strong>
                        <span class="qty-badge">${item.quantity} pairs</span>
                    </div>
                    <div class="cart-item-price">
                        <span>₹${subtotal}</span>
                        <button onclick="removeFromCart(${index})" class="btn-remove">×</button>
                    </div>
                `;
                cartItems.appendChild(li);
            });
            totalPriceEl.textContent = total;
        }

        if (CART.length > 0) {
            document.getElementById('checkoutBtn').classList.remove('hidden');
        } else {
            document.getElementById('checkoutBtn').classList.add('hidden');
        }
    };

    window.goToCheckout = function() {
        dishSection.classList.add('hidden');
        formSection.classList.remove('hidden');
        formSection.scrollIntoView({ behavior: 'smooth' });
        
        const details = CART.map(i => `${i.name} (${i.quantity} pairs @ ₹${i.price})`).join('\n');
        document.getElementById('orderDesc').value = details;

        const totalQty = CART.reduce((sum, i) => sum + i.quantity, 0);
        document.getElementById('orderQty').value = totalQty;
    };

    window.showTrackSection = function() {
        document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
        document.getElementById('trackSection').classList.remove('hidden');
    };

    window.backToProducts = function() {
        dishSection.classList.add('hidden');
        document.getElementById('products').classList.remove('hidden');
        formSection.classList.add('hidden');
    };

    // Order Placement Logic
    if (submitBtn) {
        submitBtn.addEventListener('click', async () => {
            const clientName = document.getElementById('custName').value.trim();
            const customerPhone = document.getElementById('custPhone').value.trim();
            const customerAddress = document.getElementById('custAddress').value.trim();
            const customerCity = document.getElementById('custCity').value.trim();
            const customerZip = document.getElementById('custZip').value.trim();
            const quantity = parseInt(document.getElementById('orderQty').value);
            const priority = document.getElementById('orderPriority').value;
            const totalCost = parseInt(document.getElementById('totalPrice').textContent);

            if (CART.length === 0) {
                showStatus(statusMsg, 'Production list is empty!', 'error');
                return;
            }

            if (!clientName || !customerPhone || !customerAddress) {
                showStatus(statusMsg, 'Please fill in all required fields.', 'error');
                return;
            }

            setLoading(submitBtn, true);

            // Using the requested order structure
            const orderPayload = {
                clientName: clientName,
                productType: CART[0].name, // Using primary product type
                units: quantity,
                costPerUnit: CART[0].price,
                totalCost: totalCost,
                date: new Date().toISOString().split('T')[0],
                // Metadata for backend
                customerPhone,
                customerAddress: `${customerAddress}, ${customerCity}, ${customerZip}`,
                orderDescription: document.getElementById('orderDesc').value,
                priority
            };

            try {
                const response = await fetch(`${API_BASE_URL}/placeOrder`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderPayload),
                });

                if (!response.ok) throw new Error('Failed to create production order');

                const order = await response.json();
                
                // --- TASK INTEGRATION ---
                await generateProductionTasks(order.orderId, quantity);
                
                document.getElementById('confName').textContent = clientName;
                document.getElementById('confPhone').textContent = customerPhone;
                document.getElementById('confAddress').textContent = `${customerAddress}, ${customerCity}, ${customerZip}`;
                
                orderIdDisplay.textContent = order.orderId;
                formSection.classList.add('hidden');
                successView.classList.remove('hidden');
                CART = [];
                updateCartUI();

            } catch (error) {
                console.error('Error:', error);
                showStatus(statusMsg, 'Error connecting to production server.', 'error');
            } finally {
                setLoading(submitBtn, false);
            }
        });
    }

    async function generateProductionTasks(orderId, units) {
        const tasks = [
            "Knitting", "Dyeing", "Drying", "Quality Check", 
            "Packaging", "Labeling", "Dispatch"
        ];
        
        console.log(`Generating ${tasks.length} tasks for order ${orderId}...`);
        
        // Attempt to call a task creation API if it exists
        // In this implementation, we'll simulation sequential task creation
        for (const taskName of tasks) {
            try {
                await fetch(`${API_BASE_URL}/tasks`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        taskName: taskName,
                        orderId: orderId,
                        description: `Production task: ${taskName} for ${units} units.`,
                        status: 'Pending'
                    })
                });
            } catch (e) {
                console.warn(`Could not auto-generate task ${taskName}: Backend might not support separate task creation.`);
            }
        }
    }

    // Tracking Logic
    const trackBtn = document.getElementById('trackBtn');
    if (trackBtn) {
        trackBtn.addEventListener('click', async () => {
            const orderId = document.getElementById('trackOrderId').value.trim();
            if (!orderId) { showStatus(statusMsg, 'Enter Order ID.', 'error'); return; }

            setLoading(trackBtn, true);
            const trackResult = document.getElementById('trackResult');
            trackResult.classList.add('hidden');

            try {
                const response = await fetch(`${API_BASE_URL}/orderByCode?orderId=${encodeURIComponent(orderId)}`);
                if (!response.ok) throw new Error('Order not found');
                const order = await response.json();
                
                if (order) {
                    trackResult.innerHTML = `
                        <div class="order-details-card">
                            <div class="detail-row"><label>PO ID:</label> <strong>${order.orderId}</strong></div>
                            <div class="detail-row"><label>Client:</label> <span>${order.clientName || order.customerName}</span></div>
                            <div class="detail-row"><label>Product:</label> <span>${order.productType || 'Mixed Socks'}</span></div>
                            <div class="detail-row"><label>Status:</label> <span class="status-badge" id="resStatus">${order.status}</span></div>
                        </div>
                    `;
                    
                    const statusEl = document.getElementById('resStatus');
                    let bgColor = '#f59e0b';
                    if (order.status === 'In Progress') bgColor = '#3b82f6';
                    if (order.status === 'Completed') bgColor = '#10b981';
                    statusEl.style.backgroundColor = bgColor;
                    statusEl.style.color = 'white';
                    statusEl.style.padding = '4px 8px';
                    statusEl.style.borderRadius = '4px';
                    
                    trackResult.classList.remove('hidden');
                }
            } catch (error) {
                showStatus(statusMsg, 'Order not found.', 'error');
            } finally {
                setLoading(trackBtn, false);
            }
        });
    }

    function showStatus(el, text, type) {
        if (!el) return;
        el.textContent = text;
        el.style.color = type === 'error' ? '#ef4444' : '#10b981';
        setTimeout(() => { el.textContent = ''; }, 5000);
    }

    function setLoading(btn, isLoading) {
        if (isLoading) {
            btn.disabled = true;
            btn.dataset.prevHtml = btn.innerHTML;
            btn.innerHTML = `<span>Processing...</span>`;
        } else {
            btn.disabled = false;
            btn.innerHTML = btn.dataset.prevHtml || 'Submit';
        }
    }
});

function copyOrderId() {
    const id = document.getElementById('orderIdDisplay').textContent;
    navigator.clipboard.writeText(id).then(() => { alert('Order ID copied: ' + id); });
}
