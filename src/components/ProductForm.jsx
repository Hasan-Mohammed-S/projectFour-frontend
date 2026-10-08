import { useState } from 'react';
import { api, toFormData } from '../services/api';
import Feedback from './Feedback';
import Image from './Image';

export default function ProductForm({ product, stores = [], selectedStore = '', onSaved, onCancel }) {
  const [values, setValues] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || '',
    price: product?.price ?? '',
    stock: product?.stock ?? '',
    store: selectedStore || stores[0]?._id || ''
  });
  
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const change = (event) => {
    setValues((old) => ({
      ...old,
      [event.target.name]: event.target.value
    }));
  };

  async function submit(event) {
    event.preventDefault();
    
    if (busy) {
      return;
    }
    
    setBusy(true);
    setError('');
    
    try {
      const body = toFormData(
        { ...values, ...(product ? { version: product.__v ?? 0 } : {}) },
        image
      );
      
      const saved = await api(
        product ? `/products/${product._id}` : '/products',
        { 
          method: product ? 'PUT' : 'POST', 
          body 
        }
      );
      
      onSaved(saved);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="panel form-panel" onSubmit={submit}>
      <Feedback error={error} />
      
      <fieldset disabled={busy}>
        {!product && (
          <label>
            Store
            <select name="store" value={values.store} onChange={change} required>
              <option value="">Choose a store</option>
              {stores.map((store) => (
                <option key={store._id} value={store._id}>
                  {store.name}
                </option>
              ))}
            </select>
          </label>
        )}
        
        <label>
          Product name
          <input 
            name="name" 
            value={values.name} 
            onChange={change} 
            maxLength={150} 
            required 
          />
        </label>
        
        <label>
          Description
          <textarea 
            name="description" 
            value={values.description} 
            onChange={change} 
            maxLength={3000} 
            required 
          />
        </label>
        
        <div className="form-grid">
          <label>
            Price ($)
            <input 
              type="number" 
              name="price" 
              min="0" 
              max="1000000" 
              step="0.01" 
              value={values.price} 
              onChange={change} 
              required 
            />
          </label>
          
          <label>
            Stock quantity
            <input 
              type="number" 
              name="stock" 
              min="0" 
              max="1000000" 
              step="1" 
              value={values.stock} 
              onChange={change} 
              required 
            />
          </label>
        </div>
        
        <label>
          Category
          <input 
            name="category" 
            value={values.category} 
            onChange={change} 
            maxLength={80} 
            required 
          />
        </label>
        
        {product?.image && (
          <Image 
            className="thumbnail" 
            src={product.image} 
            alt="Current product image" 
          />
        )}
        
        <label>
          {product ? 'Replace image (optional)' : 'Product image (optional)'}
          <input 
            type="file" 
            accept="image/jpeg,image/png,image/webp" 
            onChange={(e) => setImage(e.target.files[0] || null)} 
          />
        </label>
        <p className="hint">JPG, PNG or WebP. Maximum 5 MB.</p>
        
        <div className="actions">
          <button disabled={!product && !stores.length}>
            {busy ? 'Saving…' : 'Save product'}
          </button>
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </fieldset>
    </form>
  );
}