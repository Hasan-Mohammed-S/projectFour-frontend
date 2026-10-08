import { useState } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useResource } from '../services/useResource';
import { idOf } from '../services/api';
import Feedback from '../components/Feedback';
import Image from '../components/Image';
import StoreForm from '../components/StoreForm';
import { ProductCard } from '../components/CatalogCards';

export default function StoreDetails({ user }) {
  const { storeId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const store = useResource(`/stores/${storeId}`);
  const products = useResource(`/products?store=${storeId}`);
  
  const [edit, setEdit] = useState(location.pathname.includes('/edit/'));
  const [message, setMessage] = useState('');
  
  const owned = user?._id === idOf(store.data?.owner);
  
  if (!store.data) {
    return <Feedback error={store.error} loading={store.loading} />;
  }

  return (
    <>
      <Link to="/stores/list">← All stores</Link>
      
      <Feedback message={message} error={store.error} />
      
      {edit && owned ? (
        <StoreForm 
          store={store.data} 
          onCancel={() => { 
            setEdit(false); 
            navigate(`/stores/${storeId}`); 
          }} 
          onSaved={() => { 
            setEdit(false); 
            store.refresh(); 
            setMessage('Store updated successfully.'); 
            navigate(`/stores/${storeId}`); 
          }} 
        />
      ) : (
        <header className="panel store-header">
          <Image src={store.data.image} alt={store.data.name} />
          <div>
            <span className="eyebrow">Independent maker</span>
            <h1>{store.data.name}</h1>
            <p>{store.data.description}</p>
            <p>{store.data.address}</p>
            
            {owned && (
              <div className="actions">
                <button className="secondary" onClick={() => setEdit(true)}>
                  Edit store
                </button>
                <Link className="button" to={`/products/new?storeId=${storeId}`}>
                  Add product
                </Link>
              </div>
            )}
          </div>
        </header>
      )}
      
      <section>
        <h2>Store products</h2>
        <Feedback loading={products.loading} error={products.error} />
        
        <div className="card-grid">
          {products.data?.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
        
        {products.data?.length === 0 && (
          <div className="empty">This store has no products yet.</div>
        )}
      </section>
    </>
  );
}