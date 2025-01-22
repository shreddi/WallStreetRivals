import { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Stack, TextInput, Title } from '@mantine/core';

const PasswordResetConfirm = () => {
  const { uidb64, token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleResetConfirm = async () => {
    try {
      const response = await axios.post(`http://localhost:8000/api/password_reset_confirm/${uidb64}/${token}/`, {
        new_password: newPassword,
      });
      setMessage(response.data.message);
      setError(''); // Clear any previous errors
      setTimeout(() => navigate('/login'), 3000); // Redirect after success
    } catch (err) {
      // Display errors from the backend
      const errorMessage = err.response?.data?.error || 'Something went wrong.';
      if (Array.isArray(errorMessage)) {
        // If the error is a list of validation errors, join them
        setError(errorMessage.join(' '));
      } else {
        setError(errorMessage);
      }
    }
  };

  return (
    <Stack p="md">
      <Title order={2}>Set a New Password</Title>
      <TextInput
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Enter new password"
      />
      <Button onClick={handleResetConfirm}>Reset Password</Button>
      {message && <p>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </Stack>
  );
};

export default PasswordResetConfirm;
