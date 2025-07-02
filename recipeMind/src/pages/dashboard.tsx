import React, { useEffect } from 'react';

const Dashboard: React.FC = () => {
  const username = localStorage.getItem('username');

  // Redirect to login if not signed in
  useEffect(() => {
    if (!username) {
      window.location.href = '/';
    }
  }, [username]);

  const handleLogout = () => {
    localStorage.removeItem('username');
    window.location.href = '/';
  };

  if (!username) return null; // prevent rendering if not logged in

  return (
    <div>
      <h1>Welcome, {username}!</h1>
      <p>This is your personalized dashboard.</p>
      <p>(we can put the ai stuff on this page)</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
