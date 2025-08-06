import React from 'react';

type Props = {
  username: string;
  password: string;
  setUsername: (val: string) => void;
  setPassword: (val: string) => void;
};

function Text({ username, password, setUsername, setPassword }: Props): JSX.Element {
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
    </div>
  );
}

export default Text;
