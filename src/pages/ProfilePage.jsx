import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { api } from '../services/api';
import Feedback from '../components/Feedback';

export default function ProfilePage() {
  const { user, setUser } = useContext(UserContext);

  const [values, setValues] = useState({
    username: user.username,
    email: user.email,
    phoneNumber: user.phoneNumber
  });

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function save(event) {
    event.preventDefault();

    setBusy(true);
    setError('');
    setMessage('');

    try {
      const updatedUser = await api('/auth/me', {
        method: 'PUT',
        body: values
      });

      setUser(updatedUser);
      setMessage('Profile updated successfully.');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="page-heading">
        <h1>Your profile</h1>
        <p>Keep your contact details up to date.</p>
      </div>

      <Feedback error={error} message={message} />

      <form className="panel form-panel" onSubmit={save}>
        <span className="badge">{user.role} account</span>

        <fieldset disabled={busy}>
          {['username', 'email', 'phoneNumber'].map((name) => (
            <label key={name}>
              {name === 'phoneNumber'
                ? 'Phone number'
                : name === 'email'
                  ? 'Email address'
                  : 'Username'}
              <input
                type={
                  name === 'email'
                    ? 'email'
                    : name === 'phoneNumber'
                      ? 'tel'
                      : 'text'
                }
                name={name}
                value={values[name]}
                maxLength={
                  name === 'username'
                    ? 50
                    : name === 'email'
                      ? 254
                      : 20
                }
                required
                onChange={(e) =>
                  setValues({ ...values, [name]: e.target.value })
                }
              />
            </label>
          ))}

          <button>{busy ? 'Saving…' : 'Save changes'}</button>
        </fieldset>

        <Link to={user.role === 'seller' ? '/seller/orders' : '/orders'}>
          {user.role === 'seller' ? 'Manage store orders →' : 'View My Orders →'}
        </Link>
      </form>
    </>
  );
}