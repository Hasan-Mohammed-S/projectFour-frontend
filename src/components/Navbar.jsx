import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { readCart } from '../services/cartService';

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => {
      setCount(
        readCart(user?._id).reduce((sum, item) => sum + item.quantity, 0)
      );
    };
    
    const initial = setTimeout(update, 0);
    
    window.addEventListener('cart-changed', update);
    window.addEventListener('storage', update);
    
    return () => {
      clearTimeout(initial);
      window.removeEventListener('cart-changed', update);
      window.removeEventListener('storage', update);
    };
  }, [user?._id]);

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  }

  return (
    <nav className="navbar" aria-label="Main navigation">
      <Link className="brand" to="/">
        <span className="brand-mark">✦</span> Handmade Market
      </Link>
      
      <div className="nav-links">
        <NavLink to="/stores/list">Stores</NavLink>
        <NavLink to="/products">Products</NavLink>
        
        {user?.role === 'buyer' && (
          <>
            <NavLink to="/orders">My Orders</NavLink>
            <NavLink to="/cart">
              Cart <span className="cart-count">{count}</span>
            </NavLink>
          </>
        )}
        
        {user?.role === 'seller' && (
          <>
            <NavLink to="/owner-dashboard">Dashboard</NavLink>
            <NavLink to="/seller/orders">Store Orders</NavLink>
          </>
        )}
        
        {user ? (
          <>
            <NavLink to="/profile">{user.username}</NavLink>
            <button className="secondary small" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Log in</NavLink>
            <Link className="button small" to="/signup">
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}