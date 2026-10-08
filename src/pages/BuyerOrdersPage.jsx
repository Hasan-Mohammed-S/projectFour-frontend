import { Link } from 'react-router-dom';
import { useResource } from '../services/useResource';
import Feedback from '../components/Feedback';
import OrderCard from '../components/OrderCard';

export default function BuyerOrdersPage() {
  const { data, loading, error, refresh } = useResource('/orders/mine', true);

  return (
    <>
      <div className="section-heading page-heading">
        <div>
          <span className="eyebrow">From the maker to you</span>
          <h1>My Orders</h1>
          <p>Your order history and the latest status, all in one place.</p>
        </div>
        
        <button className="secondary" onClick={refresh}>
          Refresh orders
        </button>
      </div>
      
      <Feedback loading={loading} error={error} />
      
      <div className="order-list">
        {data?.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>
      
      {data?.length === 0 && (
        <div className="empty">
          <h2>Your story starts with a find</h2>
          <p>You haven’t placed an order yet.</p>
          
          <Link className="button" to="/products">
            Explore products
          </Link>
        </div>
      )}
    </>
  );
}