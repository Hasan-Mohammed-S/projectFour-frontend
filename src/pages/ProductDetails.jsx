import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const ProductDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
  });


  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3000/products/${id}`);
      if (!response.ok) {
        throw new Error('Product not found');
      }

      const data = await response.json();
      setProduct(data);
      setEditFormData({
        name: data.name || '',
        description: data.description || '',
        price: data.price || '',
        category: data.category || '',
        stock: data.stock || '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const isOwner = user && product && (
    user._id === product.store?.owner ||
    user._id === product.store?.seller?._id
  );



  const handleQuantityChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) {
      setQuantity(1);
    } else if (product && val > product.stock) {
      setQuantity(product.stock);
    } else {
      setQuantity(val);
    }
  };



  const handleAddToCart = () => {
    if (!product || product.stock <= 0) return;

    const existingCart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItemIndex = existingCart.findIndex(
      (item) => item.product._id === product._id
    );

    if (existingItemIndex > -1) {
      const newQuantity = existingCart[existingItemIndex].quantity + quantity;
      existingCart[existingItemIndex].quantity = Math.min(newQuantity, product.stock);
    } else {
      existingCart.push({
        product: {
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          store: product.store,
        },
        quantity,
      });
    }

    localStorage.setItem('cart', JSON.stringify(existingCart));
    setSuccessMessage(`${quantity} item(s) added to your cart!`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };



  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };



  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };



  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        throw new Error('Failed to update product details');
      }

      const updatedProduct = await response.json();
      setProduct(updatedProduct);
      setIsEditing(false);
      setSuccessMessage('Product updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };


  const handleDeleteProduct = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      const storeId = product.store?._id || product.store;
      navigate(`/stores/${storeId}`);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div>Loading product details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>No product found.</div>;

  return (
    <div>
      {/* Navigation Link */}
      <div>
        <Link to={`/stores/${product.store?._id || product.store}`}>
          ← Back to Store
        </Link>
      </div>

      <hr />

      {/* Success Notification */}
      {successMessage && <div>{successMessage}</div>}

      {!isEditing ? (
        /* View Mode */
        <div>
          {/* Product Image */}
          <div>
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                width="300"
                height="300"
              />
            ) : (
              <div>No Image Available</div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h2>{product.name}</h2>
            <p>
              <strong>Store:</strong>{' '}
              {product.store?.name ? (
                <Link to={`/stores/${product.store._id}`}>
                  {product.store.name}
                </Link>
              ) : (
                'Independent Seller'
              )}
            </p>
            <p>
              <strong>Category:</strong> {product.category}
            </p>
            <p>
              <strong>Price:</strong> ${product.price}
            </p>
            <p>
              <strong>Availability:</strong>{' '}
              {product.stock > 0 ? `${product.stock} units in stock` : 'Out of Stock'}
            </p>

            <p>
              <strong>Description:</strong>
            </p>
            <p>{product.description}</p>

            <hr />

            {/* Store Owner Controls */}
            {isOwner && (
              <div>
                <h3>Store Owner Controls</h3>
                <button onClick={() => setIsEditing(true)}>Edit Product</button>
                <button onClick={handleDeleteProduct}>Delete Product</button>
                <hr />
              </div>
            )}

            {/* Buyer Purchase Actions */}
            {product.stock > 0 ? (
              <div>
                <div>
                  <label>Quantity: </label>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={handleQuantityChange}
                  />
                </div>

                <div>
                  <button onClick={handleAddToCart}>Add to Cart</button>
                  <button onClick={handleBuyNow}>Buy Now</button>
                </div>
              </div>
            ) : (
              <div>
                <button disabled>Currently Unavailable</button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Owner Edit Form Mode */
        <div>
          <h2>Edit Product Information</h2>
          <form onSubmit={handleUpdateSubmit}>
            <div>
              <label>Product Name</label>
              <input
                type="text"
                name="name"
                value={editFormData.name}
                onChange={handleEditChange}
                required
              />
            </div>

            <div>
              <label>Description</label>
              <textarea
                name="description"
                value={editFormData.description}
                onChange={handleEditChange}
                required
              />
            </div>

            <div>
              <label>Price ($)</label>
              <input
                type="number"
                name="price"
                value={editFormData.price}
                onChange={handleEditChange}
                step="0.01"
                min="0"
                required
              />
            </div>

            <div>
              <label>Category</label>
              <input
                type="text"
                name="category"
                value={editFormData.category}
                onChange={handleEditChange}
                required
              />
            </div>

            <div>
              <label>Stock Quantity</label>
              <input
                type="number"
                name="stock"
                value={editFormData.stock}
                onChange={handleEditChange}
                min="0"
                required
              />
            </div>

            <div>
              <button type="submit">Save Changes</button>
              <button type="button" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;