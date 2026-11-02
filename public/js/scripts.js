// js/scripts.js — updated version with full cart and badge support

const PRODUCTS = [
  // 🌞 Summer Collection
  {id:1, title:'Summer Floral Dress', price:70, category:'women', img:'assets/images/su1.png', desc:'Lightweight floral summer dress perfect for warm days.'},
  {id:2, title:'Casual Beach Dress', price:65, category:'women', img:'assets/images/su2.png', desc:'Comfortable cotton dress ideal for seaside strolls.'},
  {id:3, title:'Sleeveless Linen Dress', price:80, category:'women', img:'assets/images/su3.png', desc:'Breathable linen design that combines elegance and comfort.'},

  // ❄️ Winter Collection
  {id:4, title:'Winter Wool Dress', price:95, category:'women', img:'assets/images/wi1.png', desc:'Cozy wool-blend dress to stay warm in style.'},
  {id:5, title:'Knitted Long Dress', price:90, category:'women', img:'assets/images/wi2.png', desc:'Chic knitted dress perfect for layering during winter.'},
  ];


$(function(){
  $('#year').text(new Date().getFullYear());

  // Populate featured products
  if($('#featuredRow').length){
    PRODUCTS.slice(0,3).forEach(p => $('#featuredRow').append(cardHtml(p)));
  }

  // Update cart badge on every page load
  updateCartBadge();

  // Products page
  if($('#productsRow').length){
    renderProducts(PRODUCTS);
    $('#filterPrice').on('input', function(){ $('#priceVal').text(this.value); filterAndRender(); });
    $('#filterCategory').on('change', filterAndRender);
    $('#searchForm').on('submit', function(e){ e.preventDefault(); const q=$('#searchInput').val().trim(); localStorage.setItem('lastSearch', q); window.location='search.html?q='+encodeURIComponent(q); });
  }

  // Search page
  if($('#searchResults').length){
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || localStorage.getItem('lastSearch') || '';
    const results = PRODUCTS.filter(p=>p.title.toLowerCase().includes(q.toLowerCase())||p.desc.toLowerCase().includes(q.toLowerCase()));
    if(results.length===0) $('#searchResults').append('<p>No results found.</p>');
    else renderProducts(results, '#searchResults');
  }

  // Product details
  if($('#productDetail').length){
    const params = new URLSearchParams(location.search);
    const id = parseInt(params.get('id')) || null;
    const product = PRODUCTS.find(p=>p.id===id) || PRODUCTS[0];
    const html = `
      <div class="col-md-6"><img src="${product.img}" class="img-fluid" alt="${product.title}"></div>
      <div class="col-md-6">
        <h2>${product.title}</h2>
        <p>${product.desc}</p>
        <h4>${product.price} AED</h4>
        <div class="mb-3" style="max-width:120px;">
          <label class="form-label">Quantity</label>
          <input id="qty" type="number" value="1" min="1" class="form-control">
        </div>
        <button id="addToCart" class="btn btn-success">Add to Cart</button>
      </div>`;
    $('#productDetail').html(html);
    $('#addToCart').on('click', function(){
      const qty = parseInt($('#qty').val());
      addToCart(product.id, qty);
      alert('Added to cart');
      updateCartBadge();
    });
  }

  // Cart page
  if($('#cartContainer').length){
    renderCartPage();
  }

  // Register form
  $('#registerForm').on('submit', function(e){
    e.preventDefault();
    const pw = $('#regPassword').val(), cpw = $('#confirmPassword').val();
    if(pw!==cpw){ $('#confirmPassword').addClass('is-invalid'); return; } else { $('#confirmPassword').removeClass('is-invalid'); }
    const user = {first:$('#firstName').val(), last:$('#lastName').val(), email:$('#regEmail').val()};
    localStorage.setItem('user', JSON.stringify(user));
    window.location='welcome.html';
  });

  // Login form
  $('#loginForm').on('submit', function(e){
    e.preventDefault();
    const email=$('#email').val(), pw=$('#password').val();
    if(!email||!pw){ $('#email,#password').addClass('is-invalid'); return; }
    const user={email:email,name:email.split('@')[0]};
    localStorage.setItem('user', JSON.stringify(user));
    window.location='welcome.html';
  });

  // Welcome page
  if($('#welcomeName').length){
    const u = JSON.parse(localStorage.getItem('user')||'null');
    if(u) $('#welcomeName').text('Welcome, '+(u.name||u.first||'User'));
  }

  // Payment page
  $('#paymentForm').on('submit', function(e){
    e.preventDefault();
    const card=$('#cardNumber').val().replace(/\\s+/g,'');
    if(card.length<12){ $('#cardNumber').addClass('is-invalid'); return; }
    alert('Payment simulated: Thank you for your purchase!');
    localStorage.removeItem('cart');
    window.location='index.html';
  });

  // Utility: Render product cards
  function cardHtml(p){
    return `<div class="col-md-4 mb-4">
      <div class="card product-card">
        <img src="${p.img}" class="card-img-top" alt="${p.title}">
        <div class="card-body">
          <h5 class="card-title">${p.title}</h5>
          <p class="card-text">${p.price} AED</p>
          <a href="product-details.html?id=${p.id}" class="btn btn-outline-primary">View</a>
          <button class="btn btn-success add-cart" data-id="${p.id}">Add</button>
        </div>
      </div>
    </div>`;
  }

  function renderProducts(list, containerSelector='#productsRow'){
    $(containerSelector).empty();
    list.forEach(p=>$(containerSelector).append(cardHtml(p)));
    $('.add-cart').on('click', function(){
      addToCart(parseInt($(this).data('id')),1);
      alert('Added to cart');
      updateCartBadge();
    });
  }

  function filterAndRender(){
    const cat=$('#filterCategory').val(), maxPrice=parseInt($('#filterPrice').val());
    let filtered=PRODUCTS.filter(p=>p.price<=maxPrice);
    if(cat!=='all') filtered=filtered.filter(p=>p.category===cat);
    renderProducts(filtered);
  }

  function addToCart(id, qty){
    const cart=JSON.parse(localStorage.getItem('cart')||'{}');
    cart[id]=(cart[id]||0)+qty;
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  function updateCartBadge(){
    const cart=JSON.parse(localStorage.getItem('cart')||'{}');
    const totalItems=Object.values(cart).reduce((a,b)=>a+b,0);
    $('#cartCount').text(totalItems);
  }

  // Render Cart page
  function renderCartPage(){
    const cart=JSON.parse(localStorage.getItem('cart')||'{}');
    const keys=Object.keys(cart);
    if(keys.length===0){
      $('#cartContainer').html('<p>Your cart is empty. <a href="products.html">Shop now</a></p>');
      return;
    }

    let total=0;
    let html='<table class="table table-striped"><thead><tr><th>Product</th><th>Price (AED)</th><th>Qty</th><th>Subtotal</th><th></th></tr></thead><tbody>';
    keys.forEach(id=>{
      const p=PRODUCTS.find(prod=>prod.id==id);
      if(!p) return;
      const qty=cart[id];
      const sub=p.price*qty;
      total+=sub;
      html+=`<tr><td>${p.title}</td><td>${p.price}</td><td>${qty}</td><td>${sub}</td><td><button class="btn btn-sm btn-danger remove-item" data-id="${id}">X</button></td></tr>`;
    });
    html+=`</tbody></table>
      <div class="text-end">
        <h4>Total: ${total} AED</h4>
        <a href="payment.html" class="btn btn-success mt-3">Proceed to Payment</a>
      </div>`;
    $('#cartContainer').html(html);

    $('.remove-item').on('click', function(){
      const id=$(this).data('id');
      delete cart[id];
      localStorage.setItem('cart', JSON.stringify(cart));
      renderCartPage();
      updateCartBadge();
    });
  }
});
