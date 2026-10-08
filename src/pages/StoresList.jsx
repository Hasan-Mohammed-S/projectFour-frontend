import { useState } from 'react';
import { useResource } from '../services/useResource';
import { StoreCard } from '../components/CatalogCards';
import Feedback from '../components/Feedback';

export default function StoresList() {
  const { data, loading, error, refresh } = useResource('/stores');
  const [search, setSearch] = useState('');
  
  const stores = (data || []).filter((s) => 
    `${s.name} ${s.description}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">The people behind the pieces</span>
        <h1>Stores</h1>
        <p>Find independent makers and explore their collections.</p>
      </div>
      
      <div className="toolbar">
        <input 
          aria-label="Search stores" 
          placeholder="Search stores…" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
        <span>
          {stores.length} store{stores.length === 1 ? '' : 's'}
        </span>
      </div>
      
      <Feedback error={error} loading={loading} />
      
      {error && <button onClick={refresh}>Try again</button>}
      
      <div className="card-grid">
        {stores.map((s) => (
          <StoreCard key={s._id} store={s} />
        ))}
      </div>
      
      {!loading && !error && !stores.length && (
        <div className="empty">
          No stores found.{' '}
          {search && (
            <button className="secondary" onClick={() => setSearch('')}>
              Reset search
            </button>
          )}
        </div>
      )}
    </>
  );
}