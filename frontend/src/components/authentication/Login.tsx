import { useState } from 'react'
import { login as apiLogin } from '../../api/apiService';
import { TextInput, Button, Title, Text, Anchor, Group, Alert, Stack, Center } from '@mantine/core';
import { useAccount } from '../../contexts/useAccount';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const kickedOut = !!localStorage.getItem('kicked_out')
  const { login } = useAccount()

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
      <Center>
        <Stack w="600px">
          <Title order={1}  mt="md">
            Login
          </Title>
          <form onSubmit={handleSubmit}>
            <TextInput
              // tt = 'uppercase'
              label="Username"
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.currentTarget.value)}
              required
            />
            <TextInput
              // tt='uppercase'
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
            <Text size="sm">
              Don't have an account?{' '}
              <Anchor href="/register" style={{ fontWeight: 500 }}>
                Register
              </Anchor>
            </Text>
            <Text size="sm">
            Forgot your password?{' '}
            <Anchor href="/reset_password" style={{ fontWeight: 500 }}>
              Reset Password
            </Anchor>
          </Text>
        </Stack>
      </Center>
    </>
  );
};

export default Login