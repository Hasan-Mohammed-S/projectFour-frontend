import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);


  useEffect(() => {
    fetchProducts();
  }, []);


  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, products]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3000/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);


      const uniqueCategories = [
        ...new Set(data.map((prod) => prod.category).filter(Boolean)),
      ];
      setCategories(uniqueCategories);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let result = [...products];


    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (prod) =>
          prod.name?.toLowerCase().includes(query) ||
          prod.description?.toLowerCase().includes(query)
      );
    }



    if (selectedCategory !== '') {
      result = result.filter((prod) => prod.category === selectedCategory);
    }

    setFilteredProducts(result);
  };

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Explore Products</h2>

      {/* Search and Category Filter Controls */}
      <div>
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {(searchQuery || selectedCategory) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('');
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      <hr />

      {filteredProducts.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div>
          {filteredProducts.map((product) => (
            <div key={product._id}>
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  width="150"
                  height="150"
                />
              )}
              <h3>{product.name}</h3>
              <p>
                <strong>Store:</strong>{' '}
                {product.store?.name || 'Independent Seller'}
              </p>
              <p>
                <strong>Category:</strong> {product.category}
              </p>
              <p>
                <strong>Price:</strong> ${product.price}
              </p>
              <p>
                <strong>Stock:</strong>{' '}
                {product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}
              </p>
              <p>{product.description}</p>

              <div>
                <Link to={`/products/${product._id}`}>View Details</Link>
              </div>
              <hr />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsList;