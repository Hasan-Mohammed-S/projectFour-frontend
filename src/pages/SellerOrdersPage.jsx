import { useState } from 'react';
import { useResource } from '../services/useResource';
import { api } from '../services/api';
import Feedback from '../components/Feedback';
import OrderCard from '../components/OrderCard';

export default function SellerOrdersPage() {
  const stores = useResource('/stores/mine');
  const orders = useResource('/orders', true);
  
  const [store, setStore] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function update(id, next) {
    if (busy) {
      return;
    }
    
    setBusy(id);
    setError('');
    setMessage('');
    
    try {
      await api(`/orders/${id}`, { 
        method: 'PUT', 
        body: { status: next } 
      });
      orders.refresh();
      setMessage('Order status updated successfully.');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy('');
    }
  }

  const list = (orders.data || []).filter(
    (o) => 
      (!store || (o.store?._id || o.store) === store) && 
      (!status || o.status === status)
  );

  return (
    <>
      <div className="section-heading page-heading">
        <div>
          <span className="eyebrow">Keep things moving</span>
          <h1>Store orders</h1>
          <p>Preparing → Ready / On the Way → Completed</p>
        </div>
        <button className="secondary" onClick={orders.refresh}>
          Refresh orders
        </button>
      </div>
      
      <div className="toolbar">
        <select 
          aria-label="Filter orders by store" 
          value={store} 
          onChange={(e) => setStore(e.target.value)}
        >
          <option value="">All my stores</option>
          {stores.data?.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
        
        <select 
          aria-label="Filter orders by status" 
          value={status} 
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready / On the Way</option>
          <option value="completed">Completed</option>
        </select>
        
        <span>
          {list.length} order{list.length === 1 ? '' : 's'}
        </span>
      </div>
      
      <Feedback 
        loading={orders.loading || stores.loading} 
        error={error || orders.error || stores.error} 
        message={message} 
      />
      
      <div className="order-list">
        {list.map((o) => (
          <OrderCard 
            key={o._id} 
            order={o} 
            seller 
            busy={Boolean(busy)} 
            onStatus={update} 
          />
        ))}
      </div>
      
      {!orders.loading && !orders.error && !list.length && (
        <div className="empty">
          <h2>No orders yet</h2>
          <p>Orders for your stores will appear here as buyers check out.</p>
        </div>
      )}
    </>
  );
}