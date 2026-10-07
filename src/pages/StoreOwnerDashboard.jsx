import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const StoreOwnerDashboard = () => {
  // 1. States for stores, selected store, products, and UI management
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // States for creating a new store form
  const [showCreateStoreForm, setShowCreateStoreForm] = useState(false);
  const [newStoreData, setNewStoreData] = useState({
    name: '',
    description: '',
    address: '',
  });

  // 2. Fetch all stores owned by the current seller
  useEffect(() => {
    fetchOwnerStores();
  }, []);

  const fetchOwnerStores = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      // Request all stores belonging to the seller
      const response = await fetch('http://localhost:3000/stores/mine', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stores');
      }

      const storesData = await response.json();
      const storesList = Array.isArray(storesData) ? storesData : storesData ? [storesData] : [];
      
      setStores(storesList);

      // Default to selecting the first store
      if (storesList.length > 0) {
        setSelectedStore(storesList[0]);
        fetchStoreProducts(storesList[0]._id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Fetch products for a specific selected store
  const fetchStoreProducts = async (storeId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/products', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const allProducts = await response.json();
        const storeProducts = allProducts.filter(
          (prod) => prod.store?._id === storeId || prod.store === storeId
        );
        setProducts(storeProducts);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  // 4. Handle store selection switch
  const handleSelectStore = (store) => {
    setSelectedStore(store);
    fetchStoreProducts(store._id);
  };

  // 5. Handle creation of a new store
  const handleNewStoreChange = (e) => {
    const { name, value } = e.target;
    setNewStoreData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateStoreSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newStoreData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create store');
      }

      // Reset form and refresh stores
      setNewStoreData({ name: '', description: '', address: '' });
      setShowCreateStoreForm(false);
      fetchOwnerStores();
    } catch (err) {
      alert(err.message);
    }
  };

  // 6. Handle product deletion
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete product');

      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Store Owner Dashboard</h1>

      {/* Button to toggle New Store Form */}
      <div>
        <button onClick={() => setShowCreateStoreForm(!showCreateStoreForm)}>
          {showCreateStoreForm ? 'Cancel' : '+ Create Another Store'}
        </button>
      </div>

      {/* New Store Creation Form */}
      {showCreateStoreForm && (
        <div>
          <h3>Create a New Store</h3>
          <form onSubmit={handleCreateStoreSubmit}>
            <div>
              <label>Store Name</label>
              <input
                type="text"
                name="name"
                value={newStoreData.name}
                onChange={handleNewStoreChange}
                required
              />
            </div>
            <div>
              <label>Description</label>

              <textarea
                name="description"
                value={newStoreData.description}
                onChange={handleNewStoreChange}
                required
              />
            </div>
            <div>
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={newStoreData.address}
                onChange={handleNewStoreChange}
                required
              />
            </div>
            <button type="submit">Save Store</button>
          </form>
          <hr />
        </div>
      )}

      {/* Stores Switcher Header */}
      <div>
        <h2>My Stores List ({stores.length})</h2>
        {stores.length === 0 ? (
          <p>No stores created yet.</p>
        ) : (
          <div>
            {stores.map((st) => (
              <button
                key={st._id}
                onClick={() => handleSelectStore(st)}
                disabled={selectedStore?._id === st._id}
              >
                {st.name} {selectedStore?._id === st._id ? '(Active)' : ''}
              </button>
            ))}
          </div>
        )}
      </div>

      <hr />

      {/* Details of Selected Store */}
      {selectedStore && (
        <div>
          <div>
            <h2>Active Store: {selectedStore.name}</h2>
            <p><strong>Description:</strong> {selectedStore.description}</p>
            <p><strong>Address:</strong> {selectedStore.address}</p>
            <p><strong>Status:</strong> {selectedStore.isActive ? 'Active' : 'Inactive'}</p>
            <Link to={`/stores/edit/${selectedStore._id}`}>Edit Store Details</Link>
          </div>

          <hr />

          {/* Products Management for Selected Store */}
          <div>
            <h3>Products for {selectedStore.name}</h3>
            <Link to={`/products/new?storeId=${selectedStore._id}`}>Add Product to {selectedStore.name}</Link>

            {products.length === 0 ? (
              <p>No products available for this store.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>${product.price}</td>
                      <td>{product.stock}</td>
                      <td>
                        <Link to={`/products/edit/${product._id}`}>Edit</Link>
                        {' | '}
                        <button onClick={() => handleDeleteProduct(product._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreOwnerDashboard;