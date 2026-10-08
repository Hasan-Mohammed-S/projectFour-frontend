import { api } from './api';
export const currentUser = () => api('/auth/me');
