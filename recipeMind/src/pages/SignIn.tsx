import React from 'react';
import TextBox from '../components/TextBox';

const SignIn: React.FC = () => {
    return(
        <div>
            <h1>Sign in</h1>
            <p>Email: </p>
            <TextBox/>
            <p>Password: </p>
            <TextBox/>
        </div>
            
    )
}

export default SignIn;