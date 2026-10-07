import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const StoreDetails = ({ user }) => {
  const { storeId } = useParams();
  const navigate = useNavigate();

  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStoreAndProducts = async () => {
      try {

        const storeRes = await fetch(`http://localhost:3000/stores/${storeId}`);
        if (!storeRes.ok) throw new Error('Store not found');
        const storeData = await storeRes.json();
        setStore(storeData);


        const prodRes = await fetch(`http://localhost:3000/products/store/${storeId}`);
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(prodData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreAndProducts();
  }, [storeId]);

  if (loading) return <div>Loading store...</div>;
  if (error) return <div>Error: {error}</div>;


  const isOwner = user && (user._id === store?.owner || user._id === store?.owner?._id);

  return (
    <div>
      <div>
        <h1>{store?.name}</h1>
        <p>{store?.description}</p>
        <p><strong>Address:</strong> {store?.address}</p>
      </div>

      <hr />

      <div>
        <h2>Store Products</h2>
        {isOwner && (
          <button onClick={() => navigate(`/products/new?storeId=${store._id}`)}>
            + Add New Product to this Store
          </button>
        )}
      </div>

      {products.length === 0 ? (
        <p>No products in this store yet.</p>
      ) : (
        <div>
          {products.map((prod) => (
            <div key={prod._id}>
              {prod.image && <img src={prod.image} alt={prod.name} width="100" />}
              <h3>

                <Link to={`/products/${prod._id}`}>{prod.name}</Link>
              </h3>
              <p>Price: ${prod.price}</p>
              <p>Stock: {prod.stock}</p>
              <hr />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoreDetails;