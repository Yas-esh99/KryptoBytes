import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1 style={{ fontSize: '72px', margin: '0' }}>404</h1>
      <p style={{ fontSize: '24px' }}>Oops! The page you are looking for does not exist.</p>
      <Link to="/" style={{ color: '#646cff', textDecoration: 'underline' }}>
        Go back to Home
      </Link>
    </div>
  );
};

export default NotFound;
