const key = (userId) => `cart:${userId}`;

export function readCart(userId) {
  if (!userId) {
    return [];
  }
  
  try {
    const items = JSON.parse(localStorage.getItem(key(userId)) || '[]');
    
    return Array.isArray(items)
      ? items.filter((item) => 
          item?.product?._id && 
          Number.isSafeInteger(item.quantity) && 
          item.quantity > 0
        )
      : [];
  } catch {
    return [];
  }
}

export function writeCart(userId, items) {
  localStorage.setItem(key(userId), JSON.stringify(items));
  window.dispatchEvent(new Event('cart-changed'));
}

export function addToCart(userId, product, quantity) {
  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    throw new Error('Choose a valid whole quantity.');
  }
  
  const items = readCart(userId);
  const existing = items.find((item) => item.product._id === product._id);
  
  if (quantity + (existing?.quantity || 0) > product.stock) {
    throw new Error(
      `Only ${product.stock} available. Check the quantity already in your cart.`
    );
  }
  
  if (existing) {
    existing.quantity += quantity;
    existing.product = product;
  } else {
    items.push({ product, quantity });
  }
  
  writeCart(userId, items);
}

export function checkoutKey(userId, payload) {
  const storageKey = `checkout:${userId}:${payload.store}`;
  const signature = JSON.stringify(payload);
  let saved;
  
  try {
    saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
  } catch {
    saved = null;
  }
  
  if (saved?.signature === signature && saved?.key) {
    return saved.key;
  }
  
  const next = { 
    signature, 
    key: crypto.randomUUID() 
  };
  
  localStorage.setItem(storageKey, JSON.stringify(next));
  
  return next.key;
}

export function clearCheckoutKey(userId, storeId) {
  localStorage.removeItem(`checkout:${userId}:${storeId}`);
}