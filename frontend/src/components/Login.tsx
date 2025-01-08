import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { login } from '../api/apiService';
import { TextInput, Button, Title, Text, Anchor, Group, Stack, Alert, Center } from '@mantine/core';

function Login() {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const kickedOut = !!localStorage.getItem('kicked_out')
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      localStorage.removeItem('kicked_out')
      navigate('/portfolio');
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
      <Center>
        <Stack w="600px">
          <Title order={2} style={{ textAlign: 'center' }} mt="md">
            Login
          </Title>
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
        </Stack>
      </Center>
    </>
  );
};

export default Login