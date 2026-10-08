export const API_BASE_URL = (
  import.meta.env.VITE_BACK_END_SERVER_URL || 'http://localhost:3000'
).replace(/\/$/, '');

export async function api(path, options = {}) {
  const token = localStorage.getItem('token');
  const multipart = options.body instanceof FormData;
  
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(!multipart && options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers
    },
    body: options.body && !multipart 
      ? JSON.stringify(options.body) 
      : options.body
  });
  
  let data;
  
  try {
    data = await response.json();
  } catch {
    throw new Error('The service returned an unexpected response. Please try again.');
  }
  
  if (!response.ok) {
    if (
      response.status === 401 && 
      token && 
      localStorage.getItem('token') === token && 
      !path.startsWith('/auth/login')
    ) {
      window.dispatchEvent(new Event('session-expired'));
    }
    
    throw new Error(
      data.error || 
      data.message || 
      data.err || 
      'The request could not be completed.'
    );
  }
  
  return data;
}

export const money = (value) => 
  new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(Number(value) || 0);

export const idOf = (value) => 
  typeof value === 'object' ? value?._id : value;

export function toFormData(values, image) {
  const data = new FormData();
  
  Object.entries(values).forEach(([key, value]) => {
    data.append(key, value);
  });
  
  if (image) {
    data.append('image', image);
  }
  
  return data;
}