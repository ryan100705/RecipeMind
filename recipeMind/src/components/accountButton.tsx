import React from 'react';

function AccountButton(): JSX.Element {
  const goToCreateAccount = () => {
    window.location.href = '/create'; // adjust path if needed
  };

  return (
    <button onClick={goToCreateAccount}>
      Create Account
    </button>
  );
}

export default AccountButton;
