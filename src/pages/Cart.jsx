import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api, idOf, money } from '../services/api';
import { readCart, writeCart, checkoutKey, clearCheckoutKey } from '../services/cartService';
import Feedback from '../components/Feedback';
import Image from '../components/Image';

async function freshCart(userId, signal) {
  const saved = readCart(userId);
  const results = await Promise.allSettled(
    saved.map(item => api(`/products/${item.product._id}`, { signal }))
  );
  
  return saved.map((item, i) => 
    results[i].status === 'fulfilled' 
      ? { ...item, product: results[i].value, unavailable: false } 
      : { ...item, unavailable: true }
  );
}

export default function Cart({ user }) {
  const [items, setItems] = useState(() => readCart(user._id));
  const [address, setAddress] = useState('');
  const [busy, setBusy] = useState('');
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const lock = useRef(false);

  const update = useCallback(
    next => {
      setItems(next);
      writeCart(user._id, next);
    },
    [user._id]
  );

  const verify = useCallback(async () => {
    const fresh = await freshCart(user._id);
    update(fresh);
    setChecking(false);
    return fresh;
  }, [update, user._id]);

  useEffect(() => {
    const controller = new AbortController();
    
    freshCart(user._id, controller.signal)
      .then(fresh => {
        if (!controller.signal.aborted) {
          update(fresh);
          setChecking(false);
        }
      })
      .catch(e => {
        if (!controller.signal.aborted) {
          setError(e.message);
          setChecking(false);
        }
      });
      
    return () => controller.abort();
  }, [update, user._id]);

  function quantity(id, value) {
    if (!Number.isSafeInteger(value) || value < 1) {
      setError('Choose a positive whole quantity.');
      return;
    }
    
    const item = items.find(i => i.product._id === id);
    
    if (value > item.product.stock) {
      setError(`Only ${item.product.stock} available for ${item.product.name}.`);
      return;
    }
    
    setError('');
    update(items.map(i => (i.product._id === id ? { ...i, quantity: value } : i)));
  }

  const groups = Object.values(
    items.reduce((result, item) => {
      const id = idOf(item.product.store) || 'unavailable';
      result[id] ||= { 
        id, 
        name: item.product.store?.name || 'Unavailable store', 
        items: [] 
      };
      result[id].items.push(item);
      return result;
    }, {})
  );

  const total = list => 
    list.reduce(
      (sum, i) => sum + Math.round(i.product.price * 100) * i.quantity, 
      0
    ) / 100;

  async function checkout(group) {
    if (lock.current) return;
    
    if (!address.trim()) {
      setError('Enter a delivery address before placing your order.');
      return;
    }
    
    lock.current = true;
    setBusy(group.id);
    setError('');
    setMessage('');
    
    const payload = {
      store: group.id,
      shippingAddress: address.trim(),
      items: group.items.map(i => ({ 
        product: i.product._id, 
        quantity: i.quantity 
      }))
    };
    
    try {
      const order = await api('/orders', {
        method: 'POST',
        headers: { 'Idempotency-Key': checkoutKey(user._id, payload) },
        body: payload
      });
      
      const purchased = new Set(group.items.map(i => i.product._id));
      update(readCart(user._id).filter(i => !purchased.has(i.product._id)));
      clearCheckoutKey(user._id, group.id);
      
      setMessage(`Order #${order._id.slice(-8).toUpperCase()} placed successfully for ${group.name}.`);
    } catch (e) {
      setError(e.message);
      await verify().catch(() => {});
    } finally {
      lock.current = false;
      setBusy('');
    }
  }

  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">A few lovely things</span>
        <h1>Shopping cart</h1>
        <p>Orders are placed separately for each store. Stock is reserved only when checkout succeeds.</p>
      </div>
      
      <Feedback loading={checking} error={error} message={message} />
      
      {message && (
        <p>
          <Link className="button secondary" to="/orders">
            View My Orders →
          </Link>
        </p>
      )}
      
      {!items.length ? (
        <div className="empty">
          <h2>Your cart is empty</h2>
          <p>There’s something special waiting to be discovered.</p>
          <Link className="button" to="/products">
            Browse products
          </Link>
        </div>
      ) : (
        <>
          <div className="panel checkout-address">
            <label>
              Delivery address
              <textarea
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Building, road, block, area, and any delivery instructions"
                maxLength={500}
                required
                disabled={Boolean(busy)}
              />
            </label>
            <div className="row">
              <strong>Cart Total: {money(total(items))}</strong>
              <button
                className="secondary danger small"
                disabled={Boolean(busy)}
                onClick={() => {
                  if (window.confirm('Clear all items from your cart?')) update([]);
                }}
              >
                Clear cart
              </button>
            </div>
          </div>
          
          {groups.map(group => {
            const invalid = group.items.some(
              i => i.unavailable || !i.product.store?.isActive || i.product.stock < i.quantity
            );
            
            return (
              <section className="panel" key={group.id}>
                <h2>{group.name}</h2>
                <div className="cart-items">
                  {group.items.map(item => (
                    <div className="cart-item" key={item.product._id}>
                      <Image
                        className="thumbnail"
                        src={item.product.image}
                        alt={item.product.name}
                      />
                      <div className="cart-item-info">
                        <Link to={`/products/${item.product._id}`}>
                          <strong>{item.product.name}</strong>
                        </Link>
                        <p>
                          {item.quantity} × {money(item.product.price)} ={' '}
                          <strong>
                            {money((Math.round(item.product.price * 100) * item.quantity) / 100)}
                          </strong>
                        </p>
                        <p
                          className={
                            item.unavailable || item.product.stock < item.quantity
                              ? 'text-error'
                              : 'hint'
                          }
                        >
                          {item.unavailable
                            ? 'Product unavailable. Remove it to continue.'
                            : `${item.product.stock} available${
                                item.product.stock < item.quantity
                                  ? ' — reduce quantity or remove this item.'
                                  : ''
                              }`}
                        </p>
                      </div>
                      <div className="actions">
                        <label className="sr-only" htmlFor={`qty-${item.product._id}`}>
                          Quantity for {item.product.name}
                        </label>
                        <input
                          id={`qty-${item.product._id}`}
                          className="quantity"
                          type="number"
                          min="1"
                          max={item.product.stock}
                          step="1"
                          value={item.quantity}
                          disabled={Boolean(busy) || checking || item.unavailable}
                          onChange={e => quantity(item.product._id, Number(e.target.value))}
                        />
                        <button
                          className="secondary small"
                          disabled={Boolean(busy)}
                          onClick={() =>
                            update(items.filter(i => i.product._id !== item.product._id))
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="row checkout-total">
                  <strong>
                    Order Total <span className="price">{money(total(group.items))}</span>
                  </strong>
                  <button
                    onClick={() => checkout(group)}
                    disabled={Boolean(busy) || checking || invalid}
                  >
                    {busy === group.id ? 'Placing order…' : 'Place Order'}
                  </button>
                </div>
                
                {invalid && (
                  <p className="text-error">
                    Adjust unavailable items before placing this order.
                  </p>
                )}
              </section>
            );
          })}
        </>
      )}
    </>
  );
}