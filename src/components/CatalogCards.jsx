import { Link } from 'react-router-dom';
import Image from './Image';
import { money } from '../services/api';

export function ProductCard({ product }) {
  return (
    <article className="catalog-card">
      <Link to={`/products/${product._id}`}>
        <Image 
          src={product.image} 
          alt={product.name} 
          className="card-image" 
        />
      </Link>
      
      <div className="card-body">
        <span className="eyebrow">{product.category}</span>
        
        <h3>
          <Link to={`/products/${product._id}`}>
            {product.name}
          </Link>
        </h3>
        
        <p>{product.store?.name || 'Store unavailable'}</p>
        
        <div className="row">
          <strong>{money(product.price)}</strong>
          <span className={`badge ${product.stock ? '' : 'muted'}`}>
            {product.stock ? `${product.stock} available` : 'Out of stock'}
          </span>
        </div>
        
        <Link className="button secondary" to={`/products/${product._id}`}>
          View details →
        </Link>
      </div>
    </article>
  );
}

export function StoreCard({ store }) {
  return (
    <article className="catalog-card">
      <Link to={`/stores/${store._id}`}>
        <Image 
          src={store.image || store.logo} 
          alt={store.name} 
          className="card-image store-image" 
        />
      </Link>
      
      <div className="card-body">
        <span className="eyebrow">Independent maker</span>
        <h3>{store.name}</h3>
        <p className="clamp">{store.description}</p>
        
        <Link className="button secondary" to={`/stores/${store._id}`}>
          Visit store →
        </Link>
      </div>
    </article>
  );
}