import { createContext, useState, useEffect } from 'react';
import { currentUser } from '../services/userService';

const UserContext = createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState('');

  useEffect(() => {
    let active = true;

    function expired() {
      localStorage.removeItem('token');
      setUser(null);
      setSessionError('Your session has expired. Please sign in again.');
    }

    window.addEventListener('session-expired', expired);

    async function restore() {
      const token = localStorage.getItem('token');
      
      try {
        if (token) {
          const current = await currentUser();
          
          if (active && localStorage.getItem('token') === token) {
            setUser(current);
          }
        }
      } catch (error) {
        if (active) {
          setSessionError(error.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    function syncSession(event) {
      if (event.key !== 'token') {
        return;
      }
      
      setUser(null);
      setSessionError('');
      setLoading(true);
      
      restore();
    }

    window.addEventListener('storage', syncSession);
    
    restore();

    return () => {
      active = false;
      window.removeEventListener('session-expired', expired);
      window.removeEventListener('storage', syncSession);
    };
  }, []);

  return (
    <UserContext.Provider 
      value={{ user, setUser, loading, sessionError, setSessionError }}
    >
      {children}
    </UserContext.Provider>
  );
}

export { UserProvider, UserContext };