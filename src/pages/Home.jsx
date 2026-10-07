import React, { useState, useEffect } from 'react';
import '../CSS/Home.css';

export default function Home() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/stores')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch stores from the database');
        }
        return response.json();
      })
      .then((data) => {
        setStores(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="home-page">
      
      
      <header className="hero-section">
        <h1>Welcome to Our Platform</h1>
        <p>Explore the best stores and diverse products easily without signing up in advance.</p>
        <a href="#stores" className="cta-button">Browse Stores Now</a>
      </header>

      <section id="stores" className="stores-section">
        <h2>Available Stores</h2>

        {loading && <p style={{ textAlign: 'center' }}>Loading stores from database...</p>}
        {error && <p style={{ textAlign: 'center', color: 'red' }}>Error: {error}</p>}

        {!loading && !error && stores.length === 0 && (
          <p style={{ textAlign: 'center' }}>No stores found in the database.</p>
        )}

        <div className="stores-grid">
          {stores.map(store => (
            <div key={store._id || store.id} className="store-card">
              <img src={store.image || 'https://via.placeholder.com/300x150'} alt={store.name} />
              <div className="store-info">
                <h3>{store.name}</h3>
                <p>{store.description}</p>
                <button className="btn-visit">Visit Store</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}