import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  // Protect the route
  useEffect(() => {
    if (!username) {
      navigate('/');  //  navigate used properly inside useEffect
    }
  }, [username, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('username');
    navigate('/');  //  navigate used properly inside a function
  };

  return (
    <div>
      <h1>Welcome, {username}!</h1>
      <p>This is your personalized home page.</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Home;
