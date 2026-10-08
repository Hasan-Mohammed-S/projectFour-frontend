import { Link } from 'react-router-dom';
import { useResource } from '../services/useResource';
import { ProductCard, StoreCard } from '../components/CatalogCards';
import Feedback from '../components/Feedback';

export default function Home() {
  const stores = useResource('/stores');
  const products = useResource('/products');

  return (
    <>
      <header className="hero">
        <div>
          <span className="eyebrow">Small shops. Something special.</span>
          <h1>
            Discover a little<br />more handmade.
          </h1>
          <p>
            Thoughtful gifts, beautiful details, and one-of-a-kind pieces from independent makers.
          </p>
          <div className="actions">
            <Link className="button" to="/products">
              Explore products →
            </Link>
            <Link className="button secondary" to="/stores/list">
              Meet the stores
            </Link>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <span>✦</span>
          <p>
            Made by hand.<br />Chosen with care.
          </p>
        </div>
      </header>

      <section id="stores">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Meet the makers</span>
            <h2>Stores</h2>
          </div>
          <Link to="/stores/list">View all stores →</Link>
        </div>
        
        <Feedback loading={stores.loading} error={stores.error} />
        
        <div className="card-grid">
          {stores.data?.slice(0, 4).map((store) => (
            <StoreCard key={store._id} store={store} />
          ))}
        </div>
        
        {stores.data?.length === 0 && (
          <div className="empty">
            Our makers are setting up their stores. Check back soon.
          </div>
        )}
      </section>

      <section>
        <div className="section-heading">
          <div>
            <span className="eyebrow">Find your next favorite</span>
            <h2>Products</h2>
          </div>
          <Link to="/products">View all products →</Link>
        </div>
        
        <Feedback loading={products.loading} error={products.error} />
        
        <div className="card-grid">
          {products.data?.slice(0, 8).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
        
        {products.data?.length === 0 && (
          <div className="empty">
            New handmade pieces are on their way.
          </div>
        )}
      </section>
    </>
  );
}