import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const username = localStorage.getItem('username');
  return username ? children : <Navigate to="/" />;
};

export default ProtectedRoute;