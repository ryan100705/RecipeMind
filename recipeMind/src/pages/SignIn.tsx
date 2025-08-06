// import React from 'react';
// import TextBox from '../components/TextBox';
// import AccountButton from '../components/accountButton';

// const SignIn: React.FC = () => {
//     return(
//         <div>
//             <h1>Sign in</h1>
//             <p>Email & Password: </p>
//             <TextBox/>
//             <br />
//             <br />
//             <AccountButton></AccountButton>
//         </div>
            
//     )
// }

// export default SignIn;

import React, { useState } from 'react';
import TextBox from '../components/Text';
import AccountButton from '../components/accountButton';

const SignIn: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) throw new Error(await response.text());
      localStorage.setItem('username', username);
      window.location.href = '/Home';
      setMessage(await response.text());
    } catch (err: any) {
      setMessage(err.message || 'Login failed');
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) throw new Error(await response.text());
      setMessage(await response.text());
    } catch (err: any) {
      setMessage(err.message || 'Account creation failed');
    }
  };

  return (
    <div>
      <h1>Sign in</h1>
      <p>Email & Password:</p>
      <TextBox
        username={username}
        password={password}
        setUsername={setUsername}
        setPassword={setPassword}
      />
      <br />
      <button onClick={handleLogin}>Login</button>
      <span style={{ padding: '0 10px' }} />
      <AccountButton onCreate={handleCreate} />
      <p>{message}</p>
    </div>
  );
};

export default SignIn;
