import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signIn } from '../services/authService';
import { UserContext } from '../contexts/UserContext';
import Feedback from '../components/Feedback';

export default function Login({ setUser }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  
  const { sessionError, setSessionError } = useContext(UserContext);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    
    if (busy) {
      return;
    }
    
    setBusy(true);
    setError('');
    
    try {
      const user = await signIn({ identifier, password });
      setSessionError('');
      setUser(user);
      navigate(user.role === 'seller' ? '/owner-dashboard' : '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-container panel">
      <span className="eyebrow">Welcome back</span>
      <h1>Log in</h1>
      <p>Your next thoughtful find is waiting.</p>
      
      <Feedback error={error || sessionError} />
      
      <form onSubmit={submit}>
        <fieldset disabled={busy}>
          <label>
            Username, email, or phone number
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          
          <button>{busy ? 'Logging in…' : 'Log in'}</button>
        </fieldset>
      </form>
      
      <p>
        New here? <Link to="/signup">Create an account</Link>
      </p>
    </div>
  );
}