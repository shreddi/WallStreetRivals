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
} from '@mantine/core';
import { Player } from '../types'; // Adjust the path as needed
import { usePlayer } from './contexts/usePlayer';
import AppShell from './AppShell'
import { updatePlayer } from '../api/authService';

export default function ProfileSettings() {
    // const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [playerData, setPlayerData] = useState<Player | null>(null)
    const [picture, setPicture] = useState<File | undefined>()
    const { currentPlayer, setCurrentPlayer } = usePlayer()

    useEffect(() => {
        setPlayerData(currentPlayer)
        console.log(currentPlayer)
    }, [currentPlayer])

    // Handle form submission
    const handleSave = async () => {
        if (!playerData) return;

        setSaving(true);

        const formData = new FormData();
        formData.append('username', playerData.username);
        formData.append('first_name', playerData.first_name);
        formData.append('last_name', playerData.last_name);

        if (picture) {
            formData.append('profile_picture', picture);
        }

        // Include nested fields like alert_preferences
        Object.entries(playerData.alert_preferences).forEach(([key, value]) => {
            formData.append(`alert_preferences.${key}`, String(value));
        });


        updatePlayer(playerData.id, formData)
        .then((data) => {
            setPlayerData(data)
            setCurrentPlayer(data)
            alert('Profile updated successfully!')
        })
        .catch((error) => {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        }).finally(() => {
            setSaving(false)
        })
    };

    if (!currentPlayer) {
        return <Loader />;
    }

    if (!playerData) {
        return <p>Failed to load user data</p>;
    }

    return (
        <AppShell>
            <Box mx="auto" w={600}>
                <Title order={2} mb="lg">
                    Profile Settings
                </Title>

                <Stack spacing="md">
                    {/* Profile Picture */}
                    <Group>
                        <Avatar src={picture ? URL.createObjectURL(picture) : playerData.profile_picture} radius="xl" size="lg" />
                        {/* <Avatar src={playerData.profile_picture} radius="xl" size="lg" /> */}
                        <FileInput
                            label="Change Profile Picture"
                            placeholder="Choose file"
                            onChange={(file) => {
                                if (file) {
                                    setPicture(file);
                                }
                            }}
                            accept="image/*"
                        />
                    </Group>

                    {/* Username */}
                    <TextInput
                        label="Username"
                        value={playerData.username}
                        onChange={(e) =>
                            setPlayerData({
                                ...playerData,
                                username: e.currentTarget.value
                            })
                        }
                    />

                    {/* Email */}
                    <TextInput
                        label="Email"
                        value={playerData.email}
                        disabled
                    />

                    {/* Alert Preferences */}
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
                    />

                    {/* Save Button */}
                    <Button onClick={handleSave} loading={saving} fullWidth>
                        Save Changes
                    </Button>
                </Stack>
            </Box>
        </AppShell>
    );
};