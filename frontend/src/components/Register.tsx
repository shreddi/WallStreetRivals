import {
    Anchor,
    Stack,
    Button,
    Group,
    PasswordInput,
    Text,
    TextInput,
    Title,
    Select,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api/apiService';
import { defaultPlayer, Player } from '../types';
import { notifications } from '@mantine/notifications';
import moment from 'moment';

interface RegisterValidationError {
    username?: string;
    password?: string;
    email?: string;
    password2?: string;
    first_name?: string;
    last_name?: string;
    birthday?: string;
    city?: string;
    state?: string;
    here_for_the?: string;
    education?: string;
    gender?: string;
    response?: {
        data?: {
            non_field_errors: string;
        };
    };
}

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState<Player>(defaultPlayer)
    const [errors, setErrors] = useState<RegisterValidationError | undefined>()

    //convert date object to string.
    const dateToString = (date: Date): string => {
        const formattedDate = moment(date).format("YYYY-MM-DD")
        return formattedDate
    };

    //convert date to string object.
    const stringToDate = (date: string): Date => {
        const formattedDate = moment(date).toDate()
        return formattedDate
    }

    useEffect(() => {
        console.log(form.birthday)
    }, [form.birthday])

    const handleSubmit = async () => {
        setErrors(undefined); // Clear previous field-specific errors
        
        register(form)
        .then(() => {
            navigate('/login')
        })
        .catch((err) => {
            notifications.show({
                color: 'red',
                message: 'Please fix errors and try again.',
                position: 'top-center',
                autoClose: 1500
            })
            setErrors(err.response.data)
            console.log(err)
        })
    };

    return (
        <Stack w="600">
            <Title order={1} mt="md" style={{ textAlign: 'center' }}>
                Register
            </Title>
            <Text mt="sm" style={{ textAlign: 'center' }}>
                Create a new account
            </Text>

            <TextInput
                label="Username"
                placeholder="Enter your username"
                value={form.username ?? ""}
                onChange={(event) => setForm({...form, username: event.currentTarget.value})}
                error={errors?.username}
                autoComplete="off"
            />
            <TextInput
                label="First Name"
                placeholder="Enter your first name"
                value={form.first_name ?? ""}
                onChange={(event) => setForm({...form, first_name: event.currentTarget.value})}
                error={errors?.first_name}
            />
            <TextInput
                label="Last Name"
                placeholder="Enter your last name"
                value={form.last_name ?? ""} 
                onChange={(event) => setForm({...form, last_name: event.currentTarget.value})}
                error={errors?.last_name}
            />
            <TextInput
                label="Email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(event) => setForm({...form, email: event.currentTarget.value})}
                error={errors?.email}
            />
            <PasswordInput
                label="Password"
                placeholder="Enter your password"
                value={form.password ?? ""}
                onChange={(event) => setForm({...form, password: event.currentTarget.value})}
                error={errors?.password}
            />
            <PasswordInput
                label="Confirm Password"
                placeholder="Confirm your password"
                value={form.password2 ?? ""}
                onChange={(event) => setForm({...form, password2: event.currentTarget.value})}
                error={errors?.password2}
            />
            <Stack align='center'>
                <Text size='sm'>Choose Birthday</Text>
                {errors?.birthday && <Text c='red'>{errors.birthday}</Text>}
                <DatePicker
                    value={stringToDate(form.birthday)}
                    onChange={(date) => {
                        const formattedDate = dateToString(date!)
                        setForm({...form, birthday: formattedDate})
                    }}
                    mt="md"
                    maxDate={new Date()}
                    weekendDays={[]}
                />
            </Stack>
            <TextInput
                label="City"
                placeholder="Enter your city"
                value={form.city}
                onChange={(event) => setForm({...form, city: event.currentTarget.value})}
                error={errors?.city}
            />
            <TextInput
                label="State"
                placeholder="Enter your state"
                value={form.state}
                onChange={(event) => setForm({...form, state: event.currentTarget.value})}
                error={errors?.state}
            />
            <Select
                label="Here for the"
                value={form.here_for_the}
                onChange={(value) => setForm({...form, here_for_the: value ?? 'Competition'})}
                data={[
                    { value: 'Competition', label: 'Competition' },
                    { value: 'Cash Prizes', label: 'Cash Prizes' },
                    { value: 'Learning', label: 'Learning' },
                    { value: 'Strategy Testing', label: 'Strategy Testing' },
                    { value: 'Just Checking It Out', label: 'Just Checking It Out' },
                ]}
                mt="md"
                error={errors?.here_for_the}
            />
            <Select
                label="Education"
                value={form.education}
                onChange={(value) => setForm({...form, education: value ?? 'None'})}
                data={[
                    { value: 'None', label: 'None' },
                    { value: 'High School', label: 'High School' },
                    { value: 'College', label: 'College' },
                    { value: 'Post-Grad', label: 'Post-Grad' },
                ]}
                mt="md"
                error={errors?.education}
            />
            <Select
                label="Gender"
                value={form.gender}
                onChange={(value) => setForm({...form, gender: value ?? 'Male'})}
                data={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' },
                    { value: 'Prefer not to say', label: 'Prefer not to say' },
                ]}
                mt="md"
                error={errors?.gender}
            />
            <Button fullWidth mt="xl" onClick={() => handleSubmit()}>
                Register
            </Button>
            <Group justify='center' >
                <Text size="sm">
                    Have an account already?{' '}
                    <Anchor href="/login" fw={500}>
                        Login
                    </Anchor>
                </Text>
            </Group>
        </Stack>
    );
}