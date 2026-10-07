import React from 'react';

export default function Navbar({ user}) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>Platform Name</h2>
      </div>
      <ul className="navbar-links">
        <li><a href="/">Home</a></li>

        <li><a href="/stores">Stores</a></li>
        <li><a href="/products">Products</a></li>
        {user && user.role === 'seller' && (
          <li><a href="/owner-dashboard">Owner Dashboard</a></li>
        )}

      </ul>
      <div className="navbar-auth">
        <a href="/login" className="btn-login">Login</a>
        <a href="/signup" className="btn-signup">Sign Up</a>
      </div>
    </nav>
  );
}