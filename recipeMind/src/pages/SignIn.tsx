import React from 'react';
import TextBox from '../components/TextBox';
import AccountButton from '../components/accountButton';

const SignIn: React.FC = () => {
    return(
        <div>
            <h1>Sign in</h1>
            <p>Email & Password: </p>
            <TextBox/>
            <br />
            <br />
            <AccountButton></AccountButton>
        </div>
            
    )
}

export default SignIn;