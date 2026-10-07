// src/services/authService.js

// Use the `VITE_BACK_END_SERVER_URL` environment variable to set the base URL.
// Note the `/auth` path added to the server URL that forms the base URL for
// all the requests in this service.
const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/auth`;

const signUp = async (formData) => {
  try {
    const res = await fetch(`${BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (data.err) {
      throw new Error(data.err);
    }

    if (data.token) {
      // first save the raw token in local storage
      localStorage.setItem('token', data.token);
      // then extract the payload (second part of the token)
      const payload = data.token.split('.')[1]

      // Convert the serialized payload into JSON
      const tokenJSON = atob(payload)

      // Take that json and convert it back into JS
      return JSON.parse(tokenJSON)
    }

    throw new Error('Invalid response from server');
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

const signIn = async (formData) => {
  try {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (data.err) {
      throw new Error(data.err);
    }

    if (data.token) {
      // first save the raw token in local storage
      localStorage.setItem('token', data.token);
      // then extract the payload (second part of the token)
      const payload = data.token.split('.')[1]

      // Convert the serialized payload into JSON
      const tokenJSON = atob(payload)

      // Take that json and convert it back into JS
      return JSON.parse(tokenJSON)
    }

    throw new Error('Invalid response from server');
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

export {
  signUp,
  signIn,
};