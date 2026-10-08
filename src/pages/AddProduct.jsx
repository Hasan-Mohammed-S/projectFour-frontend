import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useResource } from '../services/useResource';
import ProductForm from '../components/ProductForm';
import Feedback from '../components/Feedback';

export default function AddProduct() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { data, loading, error } = useResource('/stores/mine');

  return (
    <>
      <div className="page-heading">
        <h1>Add a product</h1>
        <p>Share your next handmade piece with buyers.</p>
      </div>
      
      <Feedback loading={loading} error={error} />
      
      {data?.length > 0 && (
        <ProductForm 
          stores={data} 
          selectedStore={params.get('storeId') || ''} 
          onSaved={() => navigate('/owner-dashboard')} 
          onCancel={() => navigate('/owner-dashboard')} 
        />
      )}
      
      {data?.length === 0 && (
        <div className="empty">
          Create a store before adding products.{' '}
          <Link to="/owner-dashboard">Open dashboard</Link>
        </div>
      )}
    </>
  );
}