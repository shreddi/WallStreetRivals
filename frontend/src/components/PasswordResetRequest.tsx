import { useState } from 'react';
import { resetPassword } from '../api/authService';
import { Button, Title, Text, TextInput } from '@mantine/core';

const PasswordResetRequest = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleResetPassword = () => {
        resetPassword(email)
            .then(() => {
                setError('')
                setMessage("An email with instructions on how to reset your password has been sent.")
            })
            .catch(() => {
                setMessage('')
                setError("Something went wrong. Please try again.")
            })
    }


    return (
        <div>
            <Title order={2}>Reset Your Password</Title>
            <TextInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
            />
            <Button onClick={() => handleResetPassword()}>Send Reset Link</Button>
            {message && <Text>{message}</Text>}
            {error && <Text c='red'>{error}</Text>}
        </div>
    );
};

export default PasswordResetRequest;
