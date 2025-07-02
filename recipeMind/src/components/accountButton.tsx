import React from 'react';

type Props = {
  onCreate: () => void;
};

function AccountButton({ onCreate }: Props): JSX.Element {
  return (
    <button onClick={onCreate}>
      Create Account
    </button>
  );
}

export default AccountButton;