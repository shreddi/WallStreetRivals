import { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, TextInput, Title } from '@mantine/core';

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
      setTimeout(() => navigate('/login'), 3000); // Redirect after success
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.');
    }
  };

  return (
    <div>
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
    </div>
  );
};

export default PasswordResetConfirm;
