import { useState } from 'react';
import { useResource } from '../services/useResource';
import { ProductCard } from '../components/CatalogCards';
import Feedback from '../components/Feedback';

export default function ProductsList() {
  const { data: products = [], loading, error, refresh } = useResource('/products');
  
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');
  
  const list = (products || [])
    .filter((p) => {
      const searchTerms = `${p.name} ${p.description} ${p.store?.name || ''}`.toLowerCase();
      const matchesSearch = searchTerms.includes(search.toLowerCase());
      const matchesCategory = !category || p.category === category;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sort === 'low') return a.price - b.price;
      if (sort === 'high') return b.price - a.price;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">Discover something special</span>
        <h1>Explore products</h1>
        <p>Browse handcrafted pieces from independent stores.</p>
      </div>
      
      <div className="toolbar">
        <input 
          aria-label="Search products" 
          placeholder="Search products or stores…" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
        
        <select 
          aria-label="Product category" 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {[...new Set((products || []).map((p) => p.category))].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        
        <select 
          aria-label="Sort products" 
          value={sort} 
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="newest">Newest first</option>
          <option value="low">Price: low to high</option>
          <option value="high">Price: high to low</option>
        </select>
      </div>
      
      <Feedback loading={loading} error={error} />
      
      {error && <button onClick={refresh}>Try again</button>}
      
      <div className="card-grid">
        {list.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
      
      {!loading && !error && !list.length && (
        <div className="empty">
          <h2>No products found</h2>
          <p>Try a different search or category.</p>
          <button 
            className="secondary" 
            onClick={() => { 
              setSearch(''); 
              setCategory(''); 
            }}
          >
            Reset filters
          </button>
        </div>
      )}
    </>
  );
}