import { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StoreOwnerDashboard from './pages/StoreOwnerDashboard';
import AddProduct from './pages/AddProduct';
import ProductsList from './pages/ProductsList';
import StoreDetails from './pages/StoreDetails';
import ProductDetails from './pages/ProductDetails';
import StoresList from './pages/StoresList';
import Navbar from './components/Navbar';
import { UserContext } from './contexts/UserContext';
import ProfilePage from './pages/ProfilePage';
import SellerOrdersPage from './pages/SellerOrdersPage';
import BuyerOrdersPage from './pages/BuyerOrdersPage';
import Cart from './pages/Cart';
import Feedback from './components/Feedback';
import './App.css';

function Protected({ role, children }) {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return <Feedback loading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return (
      <div className="empty">
        <h2>This page requires a {role} account.</h2>
        <Link to="/">Return home</Link>
      </div>
    );
  }

  return children;
}

export default function App() {
  const { user, setUser } = useContext(UserContext);

  return (
    <Router>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <Navbar user={user} setUser={setUser} />

      <main id="main" className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup setUser={setUser} />} />

          <Route
            path="/owner-dashboard"
            element={
              <Protected role="seller">
                <StoreOwnerDashboard />
              </Protected>
            }
          />
          <Route
            path="/dashboard"
            element={<Navigate to="/owner-dashboard" replace />}
          />

          <Route
            path="/products/new"
            element={
              <Protected role="seller">
                <AddProduct />
              </Protected>
            }
          />
          <Route
            path="/products/edit/:id"
            element={
              <Protected role="seller">
                <ProductDetails user={user} />
              </Protected>
            }
          />
          <Route path="/products" element={<ProductsList />} />

          <Route path="/stores/list" element={<StoresList />} />
          <Route
            path="/stores/edit/:storeId"
            element={
              <Protected role="seller">
                <StoreDetails user={user} />
              </Protected>
            }
          />
          <Route path="/stores/:storeId" element={<StoreDetails user={user} />} />

          <Route path="/products/:id" element={<ProductDetails user={user} />} />

          <Route
            path="/profile"
            element={
              <Protected>
                <ProfilePage />
              </Protected>
            }
          />

          <Route
            path="/seller/orders"
            element={
              <Protected role="seller">
                <SellerOrdersPage />
              </Protected>
            }
          />

          <Route
            path="/orders"
            element={
              <Protected role="buyer">
                <BuyerOrdersPage />
              </Protected>
            }
          />

          <Route
            path="/cart"
            element={
              <Protected role="buyer">
                <Cart user={user} />
              </Protected>
            }
          />

          <Route
            path="*"
            element={
              <div className="empty">
                <h1>Page not found</h1>
                <Link className="button" to="/">
                  Return home
                </Link>
              </div>
            }
          />
        </Routes>
      </main>

      <footer>
        Handmade Market <span>Thoughtful finds. Independent makers.</span>
      </footer>
    </Router>
  );
}