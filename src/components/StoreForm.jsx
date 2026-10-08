import { useState } from 'react';
import { api, toFormData } from '../../../../../../../Downloads/FrontEnd/FrontEnd/src/services/api';
import Feedback from './Feedback';
import Image from './Image';

export default function StoreForm({ store, onSaved, onCancel }) {
  const [values, setValues] = useState({
    name: store?.name || '',
    description: store?.description || '',
    address: store?.address || ''
  });
  
  const [image, setImage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    
    if (busy) {
      return;
    }
    
    setBusy(true);
    setError('');
    
    try {
      const response = await api(
        store ? `/stores/${store._id}` : '/stores',
        { 
          method: store ? 'PUT' : 'POST', 
          body: toFormData(values, image) 
        }
      );
      onSaved(response);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="panel form-panel" onSubmit={submit}>
      <h2>{store ? 'Edit store' : 'Create a store'}</h2>
      
      <Feedback error={error} />
      
      <fieldset disabled={busy}>
        {['name', 'description', 'address'].map((name) => (
          <label key={name}>
            {name === 'name' 
              ? 'Store name' 
              : name === 'address' 
                ? 'Store address' 
                : 'Description'}
                
            {name === 'description' ? (
              <textarea
                name={name}
                value={values[name]}
                required
                maxLength={3000}
                onChange={(e) => setValues({ ...values, [name]: e.target.value })}
              />
            ) : (
              <input
                name={name}
                value={values[name]}
                required
                maxLength={name === 'name' ? 150 : 500}
                onChange={(e) => setValues({ ...values, [name]: e.target.value })}
              />
            )}
          </label>
        ))}
        
        {store?.image && (
          <Image 
            src={store.image} 
            alt="Current store image" 
            className="thumbnail" 
          />
        )}
        
        <label>
          Store image (optional)
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setImage(e.target.files[0] || null)}
          />
        </label>
        <p className="hint">JPG, PNG or WebP. Maximum 5 MB.</p>
        
        <div className="actions">
          <button>{busy ? 'Saving…' : 'Save store'}</button>
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </fieldset>
    </form>
  );
}