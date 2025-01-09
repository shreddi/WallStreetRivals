import { useState } from 'react'
import { login as apiLogin } from '../api/apiService';
import { TextInput, Button, Title, Text, Anchor, Group, Container, Alert } from '@mantine/core';
import { usePlayer } from './contexts/usePlayer';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const kickedOut = !!localStorage.getItem('kicked_out')
  const { login } = usePlayer()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const loginResponse = await apiLogin(username, password);
      login(loginResponse.user, loginResponse.access, loginResponse.refresh)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message); // Access `message` safely
      } else {
        setError('An unexpected error occurred'); // Fallback for non-Error types
      }
    }
  };

  return (
    <>
      {kickedOut && <Alert>Your session has timed out. Please log in again.</Alert>}
      <Container size="xs">
        <Title order={2} style={{ textAlign: 'center' }} mt="md">
          Login
        </Title>
        <Text style={{ textAlign: 'center' }} mt="sm">
          Login to your account
        </Text>
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Username"
            placeholder="Your username"
            value={username}
            onChange={(e) => setUsername(e.currentTarget.value)}
            required
          />
          <TextInput
            label="Password"
            placeholder="Your password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            required
            mt="md"
          />
          {error && (
            <Text c="red" style={{ textAlign: 'center' }} mt="sm">
              {error}
            </Text>
          )}
          <Button type="submit" fullWidth mt="xl">
            Login
          </Button>
        </form>
        <Group style={{ justifyContent: 'center' }} mt="md">
          <Text size="sm">
            Don't have an account?{' '}
            <Anchor href="/register" style={{ fontWeight: 500 }}>
              Register
            </Anchor>
          </Text>
        </Group>
      </Container>
    </>
  );
};

export default Login