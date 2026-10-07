import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AddProduct = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get storeId from URL query parameter if available (e.g. /products/new?storeId=XYZ)
  const queryStoreId = searchParams.get('storeId') || '';

  // Form input state matching backend product model fields
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    store: queryStoreId,
  });

  const [imageFile, setImageFile] = useState(null);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch the current seller's stores
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication required');

        const response = await fetch('http://localhost:3000/stores/mine', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch stores');

        const data = await response.json();
        const storeList = Array.isArray(data) ? data : data ? [data] : [];
        setStores(storeList);

        // Auto-select the first store if store query parameter was not passed
        if (!queryStoreId && storeList.length > 0) {
          setFormData((prev) => ({ ...prev, store: storeList[0]._id }));
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchStores();
  }, [queryStoreId]);

  // Handle text field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file input selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      // Use FormData for file upload handling (multer)
      const productFormData = new FormData();
      productFormData.append('name', formData.name);
      productFormData.append('description', formData.description);
      productFormData.append('price', formData.price);
      productFormData.append('category', formData.category);
      productFormData.append('stock', formData.stock);
      productFormData.append('store', formData.store);

      if (imageFile) {
        productFormData.append('image', imageFile);
      }

      const response = await fetch('http://localhost:3000/products', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: productFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to create product');
      }

      // Redirect back to dashboard on successful creation
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Add New Product</h2>

      {error && <div>Error: {error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Select Store */}
        {/* <div>
          <label>Select Store</label>
          <select
            name="store"
            value={formData.store}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Store --</option>
            {stores.map((st) => (
              <option key={st._id} value={st._id}>
                {st.name}
              </option>
            ))}
          </select>
        </div> */}

        {/* Product Name */}
        <div>
          <label>Product Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g. Handmade Ceramic Mug"
          />
        </div>

        {/* Description */}
        <div>
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Product details and description"
          />
        </div>

        {/* Price */}
        <div>
          <label>Price ($)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
            placeholder="0.00"
          />
        </div>

        {/* Category */}
        <div>
          <label>Category</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            placeholder="e.g. Home & Living, Crafts"
          />
        </div>

        {/* Stock */}
        <div>
          <label>Stock Quantity</label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            min="0"
            required
            placeholder="10"
          />
        </div>

        {/* Product Image */}
        <div>
          <label>Product Image</label>
          <input
            type="file"
            name="image"
            accept="image/jpeg, image/png, image/webp"
            onChange={handleFileChange}
          />
        </div>

        {/* Submit / Cancel Buttons */}
        <div>
          <button type="submit" disabled={loading}>
            {loading ? 'Creating Product...' : 'Add Product'}
          </button>
          <button type="button" onClick={() => navigate('/dashboard')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;