import React, { useState } from 'react';

const CreateAccount: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  const handleCreate = async () => {
    const res = await fetch('http://localhost:3000/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      setStatus('Account created! (go to sign in)');
      setUsername('');
      setPassword('');
    } else {
      setStatus('Error creating account');
    }
  };

  return (
    <div>
      <h2>Create Account</h2>
      <input
        placeholder="Email"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleCreate}>Create Account</button>
      <p>{status}</p>
    </div>
  );
};

export default CreateAccount;
