const products = [
  {
    id: 1,
    name: "Replacement 1 inch Wire Shelf Clips",
    price: 5.00,
    image: "images/shelf-clip.png", // Ensure you add this image to your images folder
    images: ["images/shelf-clip.png", "https://via.placeholder.com/400x300?text=Side+View", "https://via.placeholder.com/400x300?text=Top+View"],
    description: "Sturdy replacement clips for standard 1-inch wire shelving units. 240-degree wrap for secure fit.",
    attribution: "Design by TRyanRogers1 (CC-BY-NC-SA)"
  },
  {
    id: 2,
    name: "Acer R241Y Vesa Mount Adapter",
    price: 15.00,
    image: "images/vesa-adapter.png",
    images: ["images/vesa-adapter.png", "https://via.placeholder.com/400x300?text=Mount+Plate", "https://via.placeholder.com/400x300?text=Installed"],
    description: "VESA mount adapter for Acer R241Y monitors. Includes mounting plate compatibility.",
    attribution: "Design by kreitnm (CC-BY-NC-SA)"
  },
  {
    id: 3,
    name: "Customizable BevelBox",
    price: 8.00,
    image: "images/bevel-box.png",
    images: ["images/bevel-box.png", "https://via.placeholder.com/400x300?text=Open+Box", "https://via.placeholder.com/400x300?text=Closed+Box"],
    description: "Parametric box with bevels. Friction fit lid. Great for small storage.",
    attribution: "Design by erik_wrenholt (CC-BY)"
  }
];

let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

function renderProducts() {
  const productContainer = document.getElementById('product-list');
  if (!productContainer) return;

  productContainer.innerHTML = products.map(product => `
    <div class="product-card">
      <a href="product.html?id=${product.id}" style="text-decoration: none; color: inherit;">
        <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300?text=No+Image'">
        <h3>${product.name}</h3>
      </a>
      <p>${product.description}</p>
      <small>${product.attribution}</small>
      <div class="price">$${product.price.toFixed(2)}</div>
      <button onclick="addToCart(${product.id})" class="btn">Add to Cart</button>
    </div>
  `).join('');
}

function renderProductDetails() {
  const container = document.getElementById('product-detail-container');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get('id'));
  const product = products.find(p => p.id === productId);

  if (!product) {
    container.innerHTML = '<p>Product not found.</p>';
    return;
  }

  const images = product.images || [product.image];

  container.innerHTML = `
    <div class="product-detail-wrapper">
      <div class="product-images">
        <img id="main-image" src="${images[0]}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400?text=No+Image'">
        <div class="thumbnails">
          ${images.map(img => `<img src="${img}" class="thumbnail" onclick="changeMainImage('${img}')" onerror="this.src='https://via.placeholder.com/100?text=No+Image'">`).join('')}
        </div>
      </div>
      <div class="product-info">
        <h1>${product.name}</h1>
        <p class="price">$${product.price.toFixed(2)}</p>
        <p>${product.description}</p>
        <small>${product.attribution}</small>
        <br><br>
        <button onclick="addToCart(${product.id})" class="btn">Add to Cart</button>
      </div>
    </div>
  `;
}

function changeMainImage(src) {
  const img = document.getElementById('main-image');
  if (img) img.src = src;
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  updateCart();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCart();
}

function updateCart() {
  localStorage.setItem('shoppingCart', JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  const cartContainer = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  const cartCount = document.getElementById('cart-count');

  let total = 0;
  let count = 0;

  cart.forEach(item => {
    total += item.price * item.quantity;
    count += item.quantity;
  });

  if (cartCount) cartCount.innerText = count;

  if (!cartContainer) return;

  if (cart.length === 0) {
    cartContainer.innerHTML = '<p>Your cart is empty.</p>';
    if (cartTotal) cartTotal.innerText = '0.00';
    return;
  }

  cartContainer.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.src='https://via.placeholder.com/60?text=No+Image'">
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <p>$${item.price.toFixed(2)} x ${item.quantity}</p>
        </div>
        <div class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</div>
        <button onclick="removeFromCart(${item.id})" class="remove-btn" title="Remove">&times;</button>
      </div>
    `).join('');

  if (cartTotal) cartTotal.innerText = total.toFixed(2);
}

function checkout() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  // Inject CSS for modal if not present
  if (!document.getElementById('paypal-modal-style')) {
    const style = document.createElement('style');
    style.id = 'paypal-modal-style';
    style.innerHTML = `
      #paypal-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
      .paypal-modal-content { background: white; padding: 2rem; border-radius: 8px; width: 100%; max-width: 400px; position: relative; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      .close-modal { position: absolute; top: 10px; right: 15px; font-size: 1.5rem; cursor: pointer; background: none; border: none; color: #666; }
      .close-modal:hover { color: #000; }
    `;
    document.head.appendChild(style);
  }

  // Create or show modal
  let modal = document.getElementById('paypal-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'paypal-modal';
    modal.innerHTML = `
      <div class="paypal-modal-content">
        <button class="close-modal" onclick="document.getElementById('paypal-modal').style.display='none'">&times;</button>
        <h2 style="margin-top:0; margin-bottom: 1rem; text-align: center;">Checkout</h2>
        <div id="paypal-button-container"></div>
      </div>
    `;
    document.body.appendChild(modal);
  } else {
    modal.style.display = 'flex';
  }

  // Load PayPal SDK
  if (!window.paypal) {
    const script = document.createElement('script');
    // Note: Replace 'sb' with your actual PayPal Client ID
    script.src = "https://www.paypal.com/sdk/js?client-id=sb&currency=USD";
    script.onload = renderPayPalButton;
    document.body.appendChild(script);
  } else {
    renderPayPalButton();
  }
}

function renderPayPalButton() {
  const container = document.getElementById('paypal-button-container');
  if (!container) return;
  container.innerHTML = '';

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);

  paypal.Buttons({
    createOrder: function(data, actions) {
      return actions.order.create({ purchase_units: [{ amount: { value: total } }] });
    },
    onApprove: function(data, actions) {
      return actions.order.capture().then(function(details) {
        alert('Transaction completed by ' + details.payer.name.given_name);
        cart = [];
        updateCart();
        document.getElementById('paypal-modal').style.display = 'none';
      });
    },
    onError: function(err) {
      console.error('PayPal Error:', err);
      alert('An error occurred during checkout.');
    }
  }).render('#paypal-button-container');
}

document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  renderCart();
  renderProductDetails();
});