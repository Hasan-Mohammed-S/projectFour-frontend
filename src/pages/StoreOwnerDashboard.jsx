import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useResource } from '../services/useResource';
import { api, idOf, money } from '../services/api';
import Feedback from '../components/Feedback';
import StoreForm from '../components/StoreForm';
import Image from '../components/Image';

export default function StoreOwnerDashboard() {
  const stores = useResource('/stores/mine');
  const products = useResource('/products/mine');

  const [selection, setSelection] = useState('');
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const selected = stores.data?.find((s) => s._id === selection) || stores.data?.[0];
  const list = (products.data || []).filter((p) => idOf(p.store) === selected?._id);

  async function remove(product) {
    if (!window.confirm(`Remove ${product.name} from your catalog?`)) {
      return;
    }

    setBusy(product._id);
    setError('');

    try {
      await api(`/products/${product._id}`, { method: 'DELETE' });
      products.refresh();
      setMessage('Product removed. Existing orders are preserved.');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy('');
    }
  }

  return (
    <>
      <div className="section-heading page-heading">
        <div>
          <span className="eyebrow">Your maker space</span>
          <h1>Store dashboard</h1>
          <p>Manage your stores, products, and incoming orders.</p>
        </div>

        <div className="actions">
          <Link className="button secondary" to="/seller/orders">
            View orders
          </Link>
          <button onClick={() => setCreating(!creating)}>
            {creating ? 'Close form' : '+ Create store'}
          </button>
        </div>
      </div>

      <Feedback
        loading={stores.loading || products.loading}
        error={error || stores.error || products.error}
        message={message}
      />

      {creating && (
        <StoreForm
          onCancel={() => setCreating(false)}
          onSaved={(store) => {
            setCreating(false);
            setSelection(store._id);
            stores.refresh();
            setMessage('Store created successfully.');
          }}
        />
      )}

      {stores.data?.length === 0 && (
        <div className="empty">
          <h2>Your store starts here</h2>
          <p>Create a store to add products and receive orders.</p>
          <button onClick={() => setCreating(true)}>
            Create your first store
          </button>
        </div>
      )}

      {selected && (
        <>
          <div className="toolbar">
            <label>
              My stores
              <select
                value={selected._id}
                onChange={(e) => setSelection(e.target.value)}
              >
                {stores.data.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="panel section-heading">
            <div>
              <h2>{selected.name}</h2>
              <p>{selected.description}</p>
              <p>{selected.address}</p>
            </div>

            <div className="actions">
              <Link className="button secondary" to={`/stores/edit/${selected._id}`}>
                Edit store
              </Link>
              <Link className="button" to={`/products/new?storeId=${selected._id}`}>
                + Add product
              </Link>
            </div>
          </div>

          <section>
            <h2>Products · {list.length}</h2>

            {!list.length ? (
              <div className="empty">Add your first product to this store.</div>
            ) : (
              <div className="table-wrap panel">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((p) => (
                      <tr key={p._id}>
                        <td>
                          <div className="order-item">
                            <Image
                              className="thumbnail"
                              src={p.image}
                              alt={p.name}
                            />
                            <Link to={`/products/${p._id}`}>{p.name}</Link>
                          </div>
                        </td>
                        <td>{p.category}</td>
                        <td>{money(p.price)}</td>
                        <td>
                          <span className={`badge ${p.stock ? '' : 'muted'}`}>
                            {p.stock || 'Out of stock'}
                          </span>
                        </td>
                        <td>
                          <div className="actions">
                            <Link to={`/products/edit/${p._id}`}>Edit</Link>
                            <button
                              className="secondary danger small"
                              disabled={Boolean(busy)}
                              onClick={() => remove(p)}
                            >
                              {busy === p._id ? 'Removing…' : 'Remove'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}