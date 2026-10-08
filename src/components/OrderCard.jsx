import { Link } from 'react-router-dom';
import Image from './Image';
import { money } from '../services/api';

const labels = {
  preparing: 'Preparing',
  ready: 'Ready / On the Way',
  completed: 'Completed',
  pending: 'Pending',
  processing: 'Preparing',
  cancelled: 'Cancelled'
};

export default function OrderCard({ order, seller = false, onStatus, busy = false }) {
  const next = {
    pending: 'preparing',
    processing: 'ready',
    preparing: 'ready',
    ready: 'completed'
  }[order.status];

  return (
    <article className="panel order-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            Order #{order._id.slice(-8).toUpperCase()}
          </span>
          <h2>{order.storeName || order.store?.name || 'Store unavailable'}</h2>
          <p>{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        
        <span className={`badge status-${order.status}`}>
          {labels[order.status] || order.status}
        </span>
      </div>

      {seller && (
        <div className="customer">
          <strong>
            Customer: {order.customerName || order.user?.username || 'Unavailable'}
          </strong>
          <span>
            Phone: {order.customerPhone || order.user?.phoneNumber || 'Unavailable'}
          </span>
        </div>
      )}

      <p>
        <strong>Delivery address:</strong> {order.shippingAddress}
      </p>

      <div className="order-items">
        {order.items.map((item, index) => (
          <div className="order-item" key={item._id || index}>
            <Image 
              src={item.image} 
              alt={item.productName || 'Ordered product'} 
              className="thumbnail" 
            />
            <div>
              <strong>{item.productName || item.name || 'Product'}</strong>
              <p>
                {item.quantity} × {money(item.price)} = {money(item.subtotal ?? item.quantity * item.price)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="row">
        <strong>
          Order Total <span className="price">{money(order.totalAmount)}</span>
        </strong>
        
        {seller && next && (
          <button disabled={busy} onClick={() => onStatus(order._id, next)}>
            {busy ? 'Updating…' : `Mark ${labels[next]}`}
          </button>
        )}
      </div>

      {order.statusHistory?.length > 0 && (
        <details>
          <summary>Status timeline</summary>
          <ul>
            {order.statusHistory.map((entry, i) => (
              <li key={entry._id || i}>
                {labels[entry.status] || entry.status} · {new Date(entry.changedAt).toLocaleString()}
              </li>
            ))}
          </ul>
        </details>
      )}

      {!seller && order.store?._id && (
        <Link to={`/stores/${order.store._id}`}>
          Visit store
        </Link>
      )}
    </article>
  );
}