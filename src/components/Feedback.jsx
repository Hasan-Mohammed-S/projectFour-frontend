export default function Feedback({ error, message, loading }) {
  return (
    <>
      {loading && (
        <div className="notice" role="status">
          Loading…
        </div>
      )}
      
      {error && (
        <div className="notice error" role="alert">
          {error}
        </div>
      )}
      
      {message && (
        <div className="notice success" role="status">
          {message}
        </div>
      )}
    </>
  );
}