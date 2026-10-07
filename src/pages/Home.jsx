import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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
    <div>
      <header>
        <h1>Welcome to Our Platform</h1>
        <p>Explore the best stores and diverse products easily without signing up in advance.</p>
        <a href="#stores">Browse Stores Now</a>
      </header>

      <section id="stores">
        <h2>Available Stores</h2>

        {loading && <p>Loading stores from database...</p>}
        {error && <p>Error: {error}</p>}

        {!loading && !error && stores.length === 0 && (
          <p>No stores found in the database.</p>
        )}

        <div>
          {stores.map(store => {
            const storeId = store._id || store.id;
            return (
              <div key={storeId}>
                <img src={store.image || 'https://via.placeholder.com/300x150'} alt={store.name} />
                <div>
                  <h3>{store.name}</h3>
                  <p>{store.description}</p>
                  <Link to={`/stores/${storeId}`}>
                    Visit Store
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}