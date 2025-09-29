import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>404 - Page Not Found</h1>
      <p>Lo sentimos, la página que estás buscando no existe.</p>
      <Link to="/">Ir a inicio</Link>
      <br />
    </div>
  );
};

export default NotFound;
