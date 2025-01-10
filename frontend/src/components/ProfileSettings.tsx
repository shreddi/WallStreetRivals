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
    const { player } = usePlayer()

    useEffect(() => {
        setPlayerData(player)
    }, [player])

    // Handle form submission
    const handleSave = async () => {
        if (!playerData) return;

        setSaving(true);
        const newPlayerData = {...playerData, id:1}
        console.log(newPlayerData)
        updatePlayer(newPlayerData)
        .then(() => {alert('Profile updated successfully!')})
        .catch((error) => {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        }).finally(() => {
            setSaving(false)
        })
    };

    if (!player) {
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
                        <Avatar src={playerData.profile_picture} radius="xl" size="lg" />
                        <FileInput
                            label="Change Profile Picture"
                            placeholder="Choose file"
                            onChange={(file) => {
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onload = () => setPlayerData({ ...playerData, profile_picture: reader.result as string });
                                    reader.readAsDataURL(file);
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