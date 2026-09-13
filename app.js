const CART_KEY = 'metriko_demo_cart_v1';
const ORDER_KEY = 'metriko_demo_last_order_v1';
const PROMO_KEY = 'metriko_demo_promo_v1';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; }
  catch { return {}; }
}

function setCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function cartCount() {
  return Object.values(getCart()).reduce((sum, qty) => sum + qty, 0);
}

function updateCartBadge() {
  document.querySelectorAll('[data-cart-count]').forEach(el => el.textContent = cartCount());
}

function ecommerceProduct(product, quantity = 1, position = null, list = 'Каталог') {
  const result = {
    id: product.id,
    name: product.name,
    price: product.price,
    brand: product.brand,
    category: product.category,
    quantity,
    list
  };
  if (position) result.position = position;
  return result;
}

function addToCart(id, quantity = 1, source = 'Каталог') {
  const product = getProduct(id);
  if (!product) return;
  const cart = getCart();
  cart[id] = (cart[id] || 0) + quantity;
  setCart(cart);

  trackGoal('add_to_cart', { product_id: id, product_name: product.name, order_price: product.price, currency: 'RUB' });
  pushEcommerce('add', [ecommerceProduct(product, quantity, null, source)]);
  showToast(`${product.name} добавлен в корзину`);
}

function removeFromCart(id, quantity = null) {
  const product = getProduct(id);
  const cart = getCart();
  const current = cart[id] || 0;
  const removeQty = quantity || current;
  if (!product || !current) return;

  if (removeQty >= current) delete cart[id]; else cart[id] = current - removeQty;
  setCart(cart);
  trackGoal('remove_from_cart', { product_id: id, product_name: product.name });
  pushEcommerce('remove', [ecommerceProduct(product, removeQty, null, 'Корзина')]);
}

function getCartItems() {
  const cart = getCart();
  return Object.entries(cart)
    .map(([id, qty]) => ({ product: getProduct(id), qty }))
    .filter(x => x.product);
}

function getCartSubtotal() {
  return getCartItems().reduce((sum, item) => sum + item.product.price * item.qty, 0);
}

function getDiscount() {
  const promo = localStorage.getItem(PROMO_KEY);
  return promo === 'METRIKA10' ? Math.round(getCartSubtotal() * 0.10) : 0;
}

function getCartTotal() {
  return Math.max(0, getCartSubtotal() - getDiscount());
}

function showToast(text) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function renderHeader() {
  const header = document.querySelector('[data-header]');
  if (!header) return;
  header.innerHTML = `
    <header class="site-header">
      <div class="container header-inner">
        <a class="logo" href="index.html"><span>V</span>OLT</a>
        <nav class="nav">
          <a href="index.html#catalog">Каталог</a>
          <a href="index.html#benefits">Доставка</a>
          <a href="index.html#about">О магазине</a>
        </nav>
        <a class="cart-link" href="cart.html" aria-label="Корзина">
          <span>Корзина</span><b data-cart-count>0</b>
        </a>
      </div>
    </header>`;
}

function renderFooter() {
  const footer = document.querySelector('[data-footer]');
  if (!footer) return;
  footer.innerHTML = `
    <footer class="footer">
      <div class="container footer-grid">
        <div><a class="logo footer-logo" href="index.html"><span>V</span>OLT</a><p>Учебный интернет-магазин для практики аналитики.</p></div>
        <div><strong>Помощь</strong><a href="mailto:study@example.com" data-goal-email>Email</a><a href="tel:+79990000000" data-goal-phone>+7 999 000-00-00</a></div>
        <div><strong>Практика</strong><span>Яндекс Метрика</span><span>Цели и события</span><span>E-commerce</span></div>
      </div>
    </footer>`;

  footer.querySelector('[data-goal-email]')?.addEventListener('click', () => trackGoal('email_click'));
  footer.querySelector('[data-goal-phone]')?.addEventListener('click', () => trackGoal('phone_click'));
}

function productCard(product, index) {
  return `
    <article class="product-card" data-category="${product.category.toLowerCase()}" data-name="${product.name.toLowerCase()}">
      <a class="product-media" href="product.html?id=${product.id}" data-product-link="${product.id}" data-position="${index + 1}">
        <span class="badge">${product.badge}</span>
        <img src="${product.image}" alt="${product.name}">
      </a>
      <div class="product-body">
        <div class="rating">★ ${product.rating} <span>${product.reviews} отзывов</span></div>
        <a class="product-title" href="product.html?id=${product.id}" data-product-link="${product.id}" data-position="${index + 1}">${product.name}</a>
        <div class="price-row"><strong>${formatPrice(product.price)}</strong>${product.oldPrice ? `<s>${formatPrice(product.oldPrice)}</s>` : ''}</div>
        <button class="btn btn-dark btn-block" data-add="${product.id}">В корзину</button>
      </div>
    </article>`;
}

function initHome() {
  const grid = document.querySelector('[data-products]');
  if (!grid) return;
  let activeCategory = 'all';
  let query = '';

  function rerender() {
    const filtered = PRODUCTS.filter(p => {
      const catOk = activeCategory === 'all' || p.category.toLowerCase().includes(activeCategory);
      const textOk = !query || `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(query);
      return catOk && textOk;
    });
    grid.innerHTML = filtered.map(productCard).join('');
    bindProductActions(grid);
    document.querySelector('[data-empty]').hidden = filtered.length > 0;
  }

  document.querySelectorAll('[data-filter]').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCategory = btn.dataset.filter;
    trackGoal('category_filter', { category: activeCategory });
    rerender();
  }));

  document.querySelector('[data-search]')?.addEventListener('input', e => {
    query = e.target.value.trim().toLowerCase();
    rerender();
  });

  document.querySelector('[data-search]')?.addEventListener('change', e => {
    if (e.target.value.trim()) trackGoal('search', { query: e.target.value.trim() });
  });

  document.querySelector('[data-hero-cta]')?.addEventListener('click', () => trackGoal('hero_catalog_click'));
  document.querySelector('[data-promo]')?.addEventListener('click', () => trackGoal('promo_click', { promo: 'METRIKA10' }));

  pushEcommerce('impressions', PRODUCTS.map((p, i) => ({...ecommerceProduct(p, 1, i + 1, 'Главная / Каталог'), quantity: undefined})).map(obj => {
    const {quantity, ...rest} = obj; return rest;
  }));

  rerender();
}

function bindProductActions(scope = document) {
  scope.querySelectorAll('[data-add]').forEach(btn => btn.addEventListener('click', () => addToCart(btn.dataset.add, 1, 'Главная / Каталог')));
  scope.querySelectorAll('[data-product-link]').forEach(link => link.addEventListener('click', () => {
    const p = getProduct(link.dataset.productLink);
    if (!p) return;
    trackGoal('product_click', { product_id: p.id, product_name: p.name });
    pushEcommerce('click', [ecommerceProduct(p, 1, Number(link.dataset.position || 1), 'Главная / Каталог')]);
  }));
}

function initProduct() {
  const root = document.querySelector('[data-product-page]');
  if (!root) return;
  const id = new URLSearchParams(location.search).get('id') || PRODUCTS[0].id;
  const product = getProduct(id) || PRODUCTS[0];
  document.title = `${product.name} — VOLT`;
  root.innerHTML = `
    <div class="breadcrumbs"><a href="index.html">Главная</a><span>→</span><a href="index.html#catalog">Каталог</a><span>→</span><span>${product.name}</span></div>
    <div class="product-detail">
      <div class="detail-media"><span class="badge">${product.badge}</span><img src="${product.image}" alt="${product.name}"></div>
      <div class="detail-info">
        <div class="eyebrow">${product.brand} · ${product.category}</div>
        <h1>${product.name}</h1>
        <div class="rating big">★ ${product.rating} <span>${product.reviews} отзывов</span></div>
        <p class="lead">${product.description}</p>
        <div class="detail-price"><strong>${formatPrice(product.price)}</strong>${product.oldPrice ? `<s>${formatPrice(product.oldPrice)}</s>` : ''}</div>
        <div class="detail-actions">
          <button class="btn btn-accent" data-add-detail>Добавить в корзину</button>
          <a class="btn btn-light" href="cart.html">Открыть корзину</a>
        </div>
        <div class="specs">
          <div><span>Доставка</span><b>1–2 дня</b></div>
          <div><span>Гарантия</span><b>12 месяцев</b></div>
          <div><span>Оплата</span><b>При получении</b></div>
        </div>
      </div>
    </div>`;

  pushEcommerce('detail', [ecommerceProduct(product, 1, 1, 'Карточка товара')]);
  trackGoal('product_view', { product_id: product.id, product_name: product.name });
  root.querySelector('[data-add-detail]').addEventListener('click', () => addToCart(product.id, 1, 'Карточка товара'));
}

function initCart() {
  const root = document.querySelector('[data-cart-page]');
  if (!root) return;

  function render() {
    const items = getCartItems();
    if (!items.length) {
      root.innerHTML = `<div class="empty-state"><div class="empty-icon">🛒</div><h1>Корзина пустая</h1><p>Добавь несколько товаров, чтобы протестировать воронку.</p><a class="btn btn-accent" href="index.html#catalog">Перейти в каталог</a></div>`;
      return;
    }

    root.innerHTML = `
      <div class="page-heading"><div><div class="eyebrow">Шаг 1 из 2</div><h1>Корзина</h1></div><a href="index.html#catalog">← Продолжить покупки</a></div>
      <div class="cart-layout">
        <div class="cart-list">
          ${items.map(({product, qty}) => `
            <article class="cart-item">
              <img src="${product.image}" alt="${product.name}">
              <div class="cart-item-main"><a href="product.html?id=${product.id}">${product.name}</a><span>${product.brand}</span><b>${formatPrice(product.price)}</b></div>
              <div class="qty"><button data-dec="${product.id}">−</button><span>${qty}</span><button data-inc="${product.id}">+</button></div>
              <button class="remove" data-remove="${product.id}">Удалить</button>
            </article>`).join('')}
        </div>
        <aside class="summary-card">
          <h3>Ваш заказ</h3>
          <div><span>Товары</span><b>${formatPrice(getCartSubtotal())}</b></div>
          <div><span>Скидка</span><b>− ${formatPrice(getDiscount())}</b></div>
          <div class="summary-total"><span>Итого</span><strong>${formatPrice(getCartTotal())}</strong></div>
          <div class="promo-row"><input data-promo-input placeholder="Промокод"><button data-apply-promo>OK</button></div>
          <small>Для теста: <b>METRIKA10</b></small>
          <a class="btn btn-accent btn-block" href="checkout.html" data-checkout>Оформить заказ</a>
        </aside>
      </div>`;

    root.querySelectorAll('[data-inc]').forEach(btn => btn.addEventListener('click', () => { addToCart(btn.dataset.inc, 1, 'Корзина'); render(); }));
    root.querySelectorAll('[data-dec]').forEach(btn => btn.addEventListener('click', () => { removeFromCart(btn.dataset.dec, 1); render(); }));
    root.querySelectorAll('[data-remove]').forEach(btn => btn.addEventListener('click', () => { removeFromCart(btn.dataset.remove); render(); }));
    root.querySelector('[data-apply-promo]').addEventListener('click', () => {
      const value = root.querySelector('[data-promo-input]').value.trim().toUpperCase();
      if (value === 'METRIKA10') {
        localStorage.setItem(PROMO_KEY, value);
        trackGoal('promo_use', { promo: value, discount: Math.round(getCartSubtotal() * .10) });
        showToast('Промокод применён: −10%');
        render();
      } else showToast('Промокод не найден');
    });
    root.querySelector('[data-checkout]').addEventListener('click', () => trackGoal('begin_checkout', { order_price: getCartTotal(), currency: 'RUB' }));
  }

  trackGoal('open_cart', { cart_items: cartCount(), order_price: getCartTotal(), currency: 'RUB' });
  render();
}

function initCheckout() {
  const root = document.querySelector('[data-checkout-page]');
  if (!root) return;
  const items = getCartItems();
  if (!items.length) { location.href = 'cart.html'; return; }

  root.innerHTML = `
    <div class="page-heading"><div><div class="eyebrow">Шаг 2 из 2</div><h1>Оформление заказа</h1></div><a href="cart.html">← Назад в корзину</a></div>
    <div class="checkout-layout">
      <form class="checkout-form" data-order-form>
        <section class="form-card"><h3>Контактные данные</h3><div class="form-grid">
          <label>Имя<input required name="name" placeholder="Егор"></label>
          <label>Телефон<input required name="phone" type="tel" placeholder="+7 999 123-45-67"></label>
          <label class="full">Email<input required name="email" type="email" placeholder="mail@example.com"></label>
        </div></section>
        <section class="form-card"><h3>Доставка</h3><div class="form-grid">
          <label class="full">Город<input required name="city" placeholder="Ростов-на-Дону"></label>
          <label class="full">Адрес<input required name="address" placeholder="Улица, дом, квартира"></label>
        </div></section>
        <section class="form-card"><h3>Способ оплаты</h3>
          <label class="radio-card"><input type="radio" name="payment" value="card" checked><span><b>Картой онлайн</b><small>Учебная форма, деньги не списываются</small></span></label>
          <label class="radio-card"><input type="radio" name="payment" value="delivery"><span><b>При получении</b><small>Наличными или картой курьеру</small></span></label>
        </section>
        <button class="btn btn-accent btn-large" type="submit">Подтвердить заказ</button>
        <p class="form-note">Это учебный сайт. Никакие реальные платежи не выполняются.</p>
      </form>
      <aside class="summary-card checkout-summary"><h3>Состав заказа</h3>
        ${items.map(({product, qty}) => `<div class="checkout-line"><span>${product.name} × ${qty}</span><b>${formatPrice(product.price * qty)}</b></div>`).join('')}
        <div><span>Скидка</span><b>− ${formatPrice(getDiscount())}</b></div>
        <div class="summary-total"><span>К оплате</span><strong>${formatPrice(getCartTotal())}</strong></div>
      </aside>
    </div>`;

  root.querySelector('[data-order-form]').addEventListener('submit', e => {
    e.preventDefault();
    const orderId = 'ORD-' + Date.now().toString().slice(-8);
    const total = getCartTotal();
    const products = getCartItems().map(({product, qty}) => ecommerceProduct(product, qty, null, 'Оформление заказа'));
    const formData = Object.fromEntries(new FormData(e.currentTarget).entries());

    // Ecommerce purchase отправляем в момент подтверждения заказа,
    // а затем сохраняем данные для страницы «Спасибо».
    pushEcommerce('purchase', products, { id: orderId, revenue: total, coupon: localStorage.getItem(PROMO_KEY) || undefined });
    trackGoal('order_complete', { order_id: orderId, order_price: total, currency: 'RUB', payment: formData.payment });

    localStorage.setItem(ORDER_KEY, JSON.stringify({ id: orderId, total, products, name: formData.name }));
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(PROMO_KEY);
    location.href = 'thanks.html';
  });
}

function initThanks() {
  const root = document.querySelector('[data-thanks-page]');
  if (!root) return;
  let order = null;
  try { order = JSON.parse(localStorage.getItem(ORDER_KEY)); } catch {}
  root.innerHTML = `
    <div class="success-card">
      <div class="success-icon">✓</div>
      <div class="eyebrow">Цель достигнута</div>
      <h1>Заказ оформлен</h1>
      <p>${order?.name ? `${order.name}, ` : ''}это учебное подтверждение заказа. Проверь событие <b>order_complete</b> и e-commerce покупку в Метрике.</p>
      ${order ? `<div class="order-meta"><div><span>Номер заказа</span><b>${order.id}</b></div><div><span>Сумма</span><b>${formatPrice(order.total)}</b></div></div>` : ''}
      <a class="btn btn-accent" href="index.html">Вернуться в магазин</a>
    </div>`;
}

document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
  renderFooter();
  updateCartBadge();
  initHome();
  initProduct();
  initCart();
  initCheckout();
  initThanks();
});
