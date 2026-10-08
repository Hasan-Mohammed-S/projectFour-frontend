import { api } from './api';

async function authenticate(path, formData) {
  const data = await api(path, { method: 'POST', body: formData });
  localStorage.setItem('token', data.token);
  return data.user;
}

export const signUp = (formData) => authenticate('/auth/signup', formData);

export const signIn = (formData) => authenticate('/auth/login', formData);