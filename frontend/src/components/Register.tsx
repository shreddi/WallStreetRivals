// import { useState } from 'react'
import { Alert, Anchor, Button, Container, Group, PasswordInput, Text, TextInput, Title } from '@mantine/core';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api/apiService'
// import { useNavigate } from 'react-router-dom';

interface RegisterValidationError {
    username: string
    password: string
    email: string
    password2: string
    first_name: string
    last_name: string
    response: {
        data: {
            non_field_errors: string
        }
    }
}

function Register() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');

    // Separate error states for each field
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});

    const navigate = useNavigate();

    const handleSubmit = async () => {
        setError(null);
        setFieldErrors({}); // Clear previous field-specific errors

        try {
            await register(username, email, password, password2, firstname, lastname);
            navigate('/login');
        } catch (e: unknown) {
            const err = e as RegisterValidationError
            // Detailed field-specific errors
            if (err?.username) {
                setFieldErrors((prev) => ({ ...prev, username: err.username }));
            }
            if (err?.email) {
                setFieldErrors((prev) => ({ ...prev, email: err.email }));
            }
            if (err?.password) {
                setFieldErrors((prev) => ({ ...prev, password: err.password }));
            }
            if (err?.password2) {
                setFieldErrors((prev) => ({ ...prev, password2: err.password2 }));
            }
            if (err?.first_name) {
                setFieldErrors((prev) => ({ ...prev, first_name: err.first_name }));
            }
            if (err?.last_name) {
                setFieldErrors((prev) => ({ ...prev, last_name: err.last_name }));
            }

            // Fallback for general error
            setError(err.response?.data?.non_field_errors || 'Registration failed');
        }
    };

    return (
        <Container size="xs">
            <Title order={2} mt="md" style={{ textAlign: 'center' }}>Register</Title>
            <Text mt="sm" style={{ textAlign: 'center' }}>Create a new account</Text>

            {error && <Alert title="Error" color="red" mt="md">{error}</Alert>}

            <TextInput
                label="Username"
                placeholder="Enter your username"
                value={username}
                onChange={(event) => setUsername(event.currentTarget.value)}
                required
                mt="md"
                error={fieldErrors.username} // Display error under the username field
            />
            <TextInput
                label="First Name"
                placeholder="Enter your first name"
                value={firstname}
                onChange={(event) => setFirstname(event.currentTarget.value)}
                required
                mt="md"
                error={fieldErrors.first_name} // Display error under the first name field
            />
            <TextInput
                label="Last Name"
                placeholder="Enter your last name"
                value={lastname}
                onChange={(event) => setLastname(event.currentTarget.value)}
                required
                mt="md"
                error={fieldErrors.last_name} // Display error under the last name field
            />
            <TextInput
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
                required
                mt="md"
                error={fieldErrors.email} // Display error under the email field
            />
            <PasswordInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
                required
                mt="md"
                error={fieldErrors.password} // Display error under the password field
            />
            <PasswordInput
                label="Confirm Password"
                placeholder="Confirm your password"
                value={password2}
                onChange={(event) => setPassword2(event.currentTarget.value)}
                required
                mt="md"
                error={fieldErrors.password2} // Display error under the confirm password field
            />
            <Button fullWidth mt="xl" onClick={handleSubmit}>Register</Button>
            <Group style={{ justifyContent: 'center' }} mt="md">
                <Text size="sm">
                    Have an account already?{' '}
                    <Anchor href="/login" style={{ fontWeight: 500 }}>
                        Login
                    </Anchor>
                </Text>
            </Group>
        </Container>
    );
};

export default Register