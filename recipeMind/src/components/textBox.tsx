import React, { useState} from 'react'

type Props = {}

function TextBox(): JSX.Element {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const saveInfo = async () => {
    await fetch('http://localhost:3000/api/save', {
      method : 'POST',
      headers: {'Content-Type' : 'application/json'},
      body : JSON.stringify({username , password}),
    });
  };

  return (
    <div>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={saveInfo}>Submit</button>
    </div>
  );
}

export default TextBox