import { useState } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useResource } from '../services/useResource';
import { api, idOf, money } from '../services/api';
import { addToCart } from '../services/cartService';
import Feedback from '../components/Feedback';
import Image from '../components/Image';
import ProductForm from '../components/ProductForm';

export default function ProductDetails({ user }) {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: product, loading, error, refresh } = useResource(`/products/${id}`);
  
  const [quantity, setQuantity] = useState(1);
  const [edit, setEdit] = useState(location.pathname.includes('/edit/'));
  const [message, setMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  
  const isOwner = Boolean(user && product && user._id === idOf(product.store?.owner));
  
  function add(buyNow = false) {
    setActionError('');
    setMessage('');
    
    try {
      addToCart(user._id, product, quantity);
      setMessage(`${quantity} item${quantity === 1 ? '' : 's'} added to your cart.`);
      
      if (buyNow) {
        navigate('/cart');
      }
    } catch (e) {
      setActionError(e.message);
    }
  }
  
  async function remove() {
    if (!window.confirm('Remove this product from your catalog? Existing orders will be preserved.')) {
      return;
    }
    
    setBusy(true);
    
    try {
      await api(`/products/${id}`, { method: 'DELETE' });
      navigate('/owner-dashboard');
    } catch (e) {
      setActionError(e.message);
    } finally {
      setBusy(false);
    }
  }
  
  if (!product) {
    return (
      <>
        <Feedback loading={loading} error={error} />
        {error && <button onClick={refresh}>Try again</button>}
      </>
    );
  }
  
  return (
    <>
      <Link to={`/stores/${idOf(product.store)}`}>
        ← Back to {product.store?.name || 'store'}
      </Link>
      
      <Feedback error={actionError || error} message={message} />
      
      {edit && isOwner ? (
        <ProductForm 
          key={product.__v} 
          product={product} 
          onCancel={() => setEdit(false)} 
          onSaved={() => { 
            setEdit(false); 
            refresh(); 
            setMessage('Product updated successfully.'); 
          }} 
        />
      ) : (
        <article className="product-detail panel">
          <Image 
            src={product.image} 
            alt={product.name} 
            className="detail-image" 
          />
          
          <div>
            <span className="eyebrow">{product.category}</span>
            <h1>{product.name}</h1>
            
            <Link to={`/stores/${idOf(product.store)}`}>
              {product.store?.name}
            </Link>
            
            <p className="price">{money(product.price)}</p>
            
            <span className={`badge ${product.stock > 0 ? '' : 'muted'}`}>
              {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
            </span>
            
            <p className="description">{product.description}</p>
            
            {isOwner && (
              <div className="actions">
                <button onClick={() => setEdit(true)}>
                  Edit product
                </button>
                <button 
                  className="danger secondary" 
                  disabled={busy} 
                  onClick={remove}
                >
                  {busy ? 'Removing…' : 'Remove product'}
                </button>
              </div>
            )}
            
            {!user && (
              <Link className="button" to="/login">
                Log in to shop
              </Link>
            )}
            
            {user?.role === 'buyer' && !isOwner && (
              product.stock > 0 ? (
                <div>
                  <label>
                    Quantity
                    <input 
                      className="quantity" 
                      aria-label="Quantity" 
                      type="number" 
                      min="1" 
                      max={product.stock} 
                      step="1" 
                      value={quantity} 
                      onChange={e => setQuantity(Number(e.target.value))} 
                    />
                  </label>
                  
                  <div className="actions">
                    <button onClick={() => add()}>
                      Add to Cart
                    </button>
                    <button className="secondary" onClick={() => add(true)}>
                      Buy now
                    </button>
                  </div>
                </div>
              ) : (
                <p className="notice">This product is currently unavailable.</p>
              )
            )}
          </div>
        </article>
      )}
    </>
  );
}