const fallback = '/placeholder.svg';

export default function Image({ src, alt, className = '', ...props }) {
  const safe = typeof src === 'string' && /^(https?:\/\/|\/[^/])/.test(src) 
    ? src 
    : fallback;

  return (
    <img 
      {...props} 
      className={className} 
      src={safe} 
      alt={alt} 
      loading="lazy" 
      onError={(event) => { 
        event.currentTarget.onerror = null; 
        event.currentTarget.src = fallback; 
      }} 
    />
  );
}