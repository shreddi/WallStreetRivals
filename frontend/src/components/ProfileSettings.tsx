import { useState, useEffect } from 'react';
import {
    TextInput,
    Button,
    Checkbox,
    FileInput,
    Avatar,
    Group,
    Stack,
    Box,
    Title,
    Loader,
    Text,
} from '@mantine/core';
import { Player } from '../types';
import { usePlayer } from './contexts/usePlayer';
import AppShell from './AppShell';
import { updatePlayer } from '../api/authService';
import { isEqual } from 'lodash';

export default function ProfileSettings() {
    const [saving, setSaving] = useState(false);
    const [playerData, setPlayerData] = useState<Player | null>(null);
    const [picture, setPicture] = useState<File | undefined>();
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
    const [successAlert, setSuccessAlert] = useState(false)
    const { currentPlayer, setCurrentPlayer } = usePlayer();
    const wasChanged = !isEqual(currentPlayer, playerData) || picture

    useEffect(() => {
        setPlayerData(currentPlayer);
        console.log(currentPlayer);
    }, [currentPlayer]);

    const handleSave = async () => {
        if (!playerData) return;

        setSaving(true);
        setErrors({}); // Clear previous errors

        const formData = new FormData();
        formData.append('username', playerData.username);
        formData.append('first_name', playerData.first_name);
        formData.append('last_name', playerData.last_name);

        if (picture) {
            formData.append('profile_picture', picture);
        }

        Object.entries(playerData.alert_preferences).forEach(([key, value]) => {
            formData.append(`alert_preferences.${key}`, String(value));
        });

        try {
            const data = await updatePlayer(playerData.id, formData);
            setPlayerData(data);
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
        setPlayerData(currentPlayer);
        setPicture(undefined)
        setErrors({});
    }

    if (!currentPlayer) {
        return <Loader />;
    }

    if (!playerData) {
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
                        src={picture ? URL.createObjectURL(picture) : playerData.profile_picture}
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
                    value={playerData.username}
                    onChange={(e) =>
                        setPlayerData({ ...playerData, username: e.currentTarget.value })
                    }
                    error={errors.username?.[0]} // Display the first error for 'username'
                />

                <TextInput
                    label="First Name"
                    value={playerData.first_name}
                    onChange={(e) =>
                        setPlayerData({ ...playerData, first_name: e.currentTarget.value })
                    }
                    error={errors.first_name?.[0]} // Display the first error for 'first_name'
                />

                <TextInput
                    label="Last Name"
                    value={playerData.last_name}
                    onChange={(e) =>
                        setPlayerData({ ...playerData, last_name: e.currentTarget.value })
                    }
                    error={errors.last_name?.[0]} // Display the first error for 'last_name'
                />

                <TextInput
                    label="Email"
                    value={playerData.email}
                    disabled
                />

                <Title mt='20px' tt="uppercase" order={2} mb="lg">
                    Notification Settings
                </Title>

                <Checkbox
                    label="Weekly Summary"
                    checked={playerData.alert_preferences.weekly_summary}
                    onChange={(e) =>
                        setPlayerData({
                            ...playerData,
                            alert_preferences: {
                                ...playerData.alert_preferences,
                                weekly_summary: e.currentTarget.checked,
                            },
                        })
                    }
                    error={errors['alert_preferences.weekly_summary']?.[0]} // Error for weekly summary
                />

                <Checkbox
                    label="Daily Summary"
                    checked={playerData.alert_preferences.daily_summary}
                    onChange={(e) =>
                        setPlayerData({
                            ...playerData,
                            alert_preferences: {
                                ...playerData.alert_preferences,
                                daily_summary: e.currentTarget.checked,
                            },
                        })
                    }
                    error={errors['alert_preferences.daily_summary']?.[0]} // Error for daily summary
                />

                <Checkbox
                    label="Contest Rank Change"
                    checked={playerData.alert_preferences.contest_rank_change}
                    onChange={(e) =>
                        setPlayerData({
                            ...playerData,
                            alert_preferences: {
                                ...playerData.alert_preferences,
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
