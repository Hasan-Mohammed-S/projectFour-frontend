import { createContext, useState } from 'react';

const UserContext = createContext();

function getUserFromToken(){
    // pull the raw token from local storage
    const token = localStorage.getItem('token');

    // if there is no token, then the user is not signed in
    if(!token) return null

    // then extract the payload (second part of the token)
    const payload = token.split('.')[1]

    // Convert the serialized payload into JSON
    const tokenJSON = atob(payload)

    // Take that json and convert it back into JS
    return JSON.parse(tokenJSON)
}

function UserProvider({ children }) {

 const [user, setUser] = useState(getUserFromToken())

 const value = { user, setUser }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export { UserProvider, UserContext };