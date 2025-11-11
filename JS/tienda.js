document.addEventListener('DOMContentLoaded', function () {
	const addButtons = document.querySelectorAll('.producto button');
	const cartPanel = document.getElementById('cart-panel');
	const cartOverlay = document.getElementById('cart-overlay');
	const cartToggle = document.getElementById('cart-toggle');
	const cartClose = document.getElementById('cart-close');
	const cartItemsList = document.getElementById('cart-items');
	const cartTotalEl = document.getElementById('cart-total');
	const cartToggleBottom = document.getElementById('cart-toggle-bottom');

	let cart = JSON.parse(localStorage.getItem('viviria_cart') || '[]');

	function formatPrice(num) {
		return '$' + String(num).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
	}

	function saveCart() {
		localStorage.setItem('viviria_cart', JSON.stringify(cart));
	}

	function calculateTotal() {
		return cart.reduce((s, it) => s + (it.price * it.qty), 0);
	}

	function renderCart() {
		cartItemsList.innerHTML = '';
		if (cart.length === 0) {
			cartItemsList.innerHTML = '<li style="padding:12px;color:#666">No hay productos en el carrito.</li>';
		} else {
			cart.forEach((item, idx) => {
				const li = document.createElement('li');
				li.className = 'cart-item';
				li.dataset.index = idx;
				li.innerHTML = `
					<div class="meta">
						<div class="name">${escapeHtml(item.name)}</div>
						<div class="price">${formatPrice(item.price)}</div>
					</div>
					<div class="controls">
						<button class="dec">-</button>
						<div class="qty">${item.qty}</div>
						<button class="inc">+</button>
						<button class="remove">Eliminar</button>
					</div>
				`;
				cartItemsList.appendChild(li);
			});
		}
		cartTotalEl.textContent = formatPrice(calculateTotal());
		saveCart();
	}

	function openCart() {
		cartPanel.classList.add('open');
		cartPanel.setAttribute('aria-hidden', 'false');
		cartOverlay.hidden = false;
		cartToggle.setAttribute('aria-expanded', 'true');
	}
	function closeCart() {
		cartPanel.classList.remove('open');
		cartPanel.setAttribute('aria-hidden', 'true');
		cartOverlay.hidden = true;
		cartToggle.setAttribute('aria-expanded', 'false');
	}

	function escapeHtml(text) {
		return text.replace(/[&<>"]/g, function (m) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]; });
	}

	addButtons.forEach(btn => {
		btn.addEventListener('click', (e) => {
			const productEl = e.currentTarget.closest('.producto');
			if (!productEl) return;
			const name = productEl.querySelector('h3') ? productEl.querySelector('h3').textContent.trim() : 'Producto';
			const priceText = productEl.querySelector('p') ? productEl.querySelector('p').textContent.trim() : '$0';
			const price = parseInt(priceText.replace(/[^\d]/g,'')) || 0;

			const existing = cart.find(it => it.name === name && it.price === price);
			if (existing) {
				existing.qty += 1;
			} else {
				cart.push({ name: name, price: price, qty: 1 });
			}
			renderCart();
			openCart();
		});
	});

    cartItemsList.addEventListener('click', (e) => {
        const li = e.target.closest('.cart-item');
        if (!li) return;
        const idx = Number(li.dataset.index);
        if (e.target.classList.contains('inc')) {
            const item = cart[idx];
            cart.push({ ...item }); 
            renderCart();
        } else if (e.target.classList.contains('dec')) {
            cart[idx].qty = Math.max(1, cart[idx].qty - 1); renderCart();
        } else if (e.target.classList.contains('remove')) {
            cart.splice(idx,1); renderCart();
        }
    });	
	cartToggle && cartToggle.addEventListener('click', () => { openCart(); });
	cartClose && cartClose.addEventListener('click', () => { closeCart(); });
	cartToggleBottom && cartToggleBottom.addEventListener('click', () => { closeCart(); });
	cartOverlay && cartOverlay.addEventListener('click', () => { closeCart(); });

	const cartPay = document.getElementById('cart-pay');
	if (cartPay) {
		cartPay.addEventListener('click', () => {
			if (cart.length === 0) {
				alert('Tu carrito está vacío. Agrega productos antes de pagar.');
				return;
			}
			const total = formatPrice(calculateTotal());
			const summary = cart.map(it => `${it.qty} x ${it.name} — ${formatPrice(it.price * it.qty)}`).join('\n');
			const confirmMsg = `Resumen de compra:\n\n${summary}\n\nTotal: ${total}\n\n¿Confirmas el pago?`;
			if (confirm(confirmMsg)) {
				
				cart = [];
				renderCart();
				closeCart();
				alert('Pago simulado exitoso. Gracias por tu compra.');
			}
		});
	}
	renderCart();
});

