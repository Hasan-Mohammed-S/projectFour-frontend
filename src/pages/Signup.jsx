import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUp } from '../services/authService';
import { UserContext } from '../contexts/UserContext';
import Feedback from '../components/Feedback';

export default function Signup({ setUser }) {
  const [values, setValues] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'buyer'
  });
  
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  
  const { setSessionError } = useContext(UserContext);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    
    if (busy) {
      return;
    }
    
    setBusy(true);
    setError('');
    
    try {
      const user = await signUp(values);
      setSessionError('');
      setUser(user);
      navigate(user.role === 'seller' ? '/owner-dashboard' : '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const change = (e) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="auth-container panel">
      <span className="eyebrow">Find your handmade favorites</span>
      <h1>Create an account</h1>
      
      <Feedback error={error} />
      
      <form onSubmit={submit}>
        <fieldset disabled={busy}>
          <label>
            Username
            <input
              name="username"
              value={values.username}
              onChange={change}
              minLength={2}
              maxLength={50}
              autoComplete="username"
              required
            />
          </label>
          
          <label>
            Email address
            <input
              type="email"
              name="email"
              value={values.email}
              onChange={change}
              autoComplete="email"
              required
            />
          </label>
          
          <label>
            Phone number
            <input
              type="tel"
              name="phoneNumber"
              value={values.phoneNumber}
              onChange={change}
              maxLength={20}
              autoComplete="tel"
              required
            />
          </label>
          
          <label>
            Password
            <input
              type="password"
              name="password"
              value={values.password}
              onChange={change}
              minLength={8}
              autoComplete="new-password"
              required
            />
          </label>
          <p className="hint">At least 8 characters. Maximum 72 bytes.</p>
          
          <label>
            Account type
            <select name="role" value={values.role} onChange={change}>
              <option value="buyer">Buyer</option>
              <option value="seller">Seller / Store Owner</option>
            </select>
          </label>
          
          <button>{busy ? 'Creating account…' : 'Sign up'}</button>
        </fieldset>
      </form>
      
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}