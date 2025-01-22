import { useState, useEffect } from 'react';
import {
    TextInput,
    Button,
    Checkbox,
    FileInput,
    Avatar,
    Group,
    Stack,
    Title,
    Loader,
    Text,
} from '@mantine/core';
import { Account, AccountValidationErrors, defaultAccount } from '../types';
import { useAccount } from './contexts/useAccount';
import AppShell from './AppShell';
import { updateAccount } from '../api/authService';
import { isEqual } from 'lodash';

export default function ProfileSettings() {
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<Account>(defaultAccount);
    const [picture, setPicture] = useState<File | undefined>();
    const [errors, setErrors] = useState<AccountValidationErrors | undefined>()
    const { currentAccount, setCurrentAccount } = useAccount();
    const wasChanged = !isEqual(currentPlayer, form) || picture

    useEffect(() => {
        setForm(currentPlayer);
        console.log(currentPlayer);
    }, [currentPlayer]);

    const handleSave = async () => {
        if (!form) return;

        setSaving(true);
        setErrors({}); // Clear previous errors

        const formData = new FormData();
        formData.append('username', form.username);
        formData.append('first_name', form.first_name);
        formData.append('last_name', form.last_name);

        if (picture) {
            formData.append('profile_picture', picture);
        }

        Object.entries(form.alert_preferences).forEach(([key, value]) => {
            formData.append(`alert_preferences.${key}`, String(value));
        });

        try {
            const data = await updateAccount(form.id, formData);
            setForm(data);
            setCurrentPlayer(data);
            setPicture(undefined)
            alert('Profile updated successfully!');
        } catch (e) {
            const error = e as unknown
            console.error('Error updating profile:', error);

            // Extract error details from the response
            if (error.response?.data) {
                setErrors(error.response.data); // Assume error response contains field-specific errors
            } else {
                alert('An unexpected error occurred. Please try again.');
            }
        } finally {
            setSaving(false);
        }
    };

    const discardChanges = () => {
        setForm(currentPlayer);
        setPicture(undefined)
        setErrors({});
    }

    if (!currentPlayer) {
        return <Loader />;
    }

    if (!form) {
        return <p>Failed to load user data</p>;
    }

    return (
        <AppShell>
            <Stack w={600} >
                <Title tt="uppercase" order={2} mb="lg">
                    Profile Settings
                </Title>

                <Group>
                    <Avatar
                        src={picture ? URL.createObjectURL(picture) : form.profile_picture}
                        radius="150"
                        size="300px"
                    />
                    <FileInput
                        label="Change Profile Picture"
                        placeholder="Choose file"
                        onChange={(file) => file && setPicture(file)}
                        accept="image/*"
                    />
                </Group>

                <TextInput
                    label="Username"
                    value={form.username}
                    onChange={(e) =>
                        setForm({ ...form, username: e.currentTarget.value })
                    }
                    error={errors.username?.[0]} // Display the first error for 'username'
                />

                <TextInput
                    label="First Name"
                    value={form.first_name}
                    onChange={(e) =>
                        setForm({ ...form, first_name: e.currentTarget.value })
                    }
                    error={errors.first_name?.[0]} // Display the first error for 'first_name'
                />

                <TextInput
                    label="Last Name"
                    value={form.last_name}
                    onChange={(e) =>
                        setForm({ ...form, last_name: e.currentTarget.value })
                    }
                    error={errors.last_name?.[0]} // Display the first error for 'last_name'
                />

                <TextInput
                    label="Email"
                    value={form.email}
                    disabled
                />

                <Title mt='20px' tt="uppercase" order={2} mb="lg">
                    Notification Settings
                </Title>

                <Checkbox
                    label="Weekly Summary"
                    checked={form.alert_preferences.weekly_summary}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            alert_preferences: {
                                ...form.alert_preferences,
                                weekly_summary: e.currentTarget.checked,
                            },
                        })
                    }
                    error={errors['alert_preferences.weekly_summary']?.[0]} // Error for weekly summary
                />

                <Checkbox
                    label="Daily Summary"
                    checked={form.alert_preferences.daily_summary}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            alert_preferences: {
                                ...form.alert_preferences,
                                daily_summary: e.currentTarget.checked,
                            },
                        })
                    }
                    error={errors['alert_preferences.daily_summary']?.[0]} // Error for daily summary
                />

                <Checkbox
                    label="Contest Rank Change"
                    checked={form.alert_preferences.contest_rank_change}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            alert_preferences: {
                                ...form.alert_preferences,
                                contest_rank_change: e.currentTarget.checked,
                            },
                        })
                    }
                    error={errors['alert_preferences.contest_rank_change']?.[0]} // Error for contest rank change
                />


                {/* General Error Message */}
                {Object.keys(errors).length > 0 && (
                    <Text c="red">Please fix the errors above and try again.</Text>
                )}

                {wasChanged &&
                    <>
                        <Button mt='md' onClick={handleSave} loading={saving} fullWidth>
                            Save Changes
                        </Button>
                        <Button onClick={() => { discardChanges() }} fullWidth>
                            Discard changes
                        </Button>
                    </>
                }
            </Stack>
        </AppShell>
    );
}
