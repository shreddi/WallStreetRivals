import {
    Group,
    Stack,
    TextInput,
    Title,
    Text,
    Checkbox,
    Flex,
    Avatar,
    Button,
    FileInput,
    Select,
    Slider,
    NumberInput,
} from "@mantine/core";
import { Contest, defaultContest, Player } from "../../types";
import { useState, useEffect, useRef } from "react";
import AppShell from "../appShell/AppShell";
import { searchPlayers } from "../../api/authService";
import { notifications } from "@mantine/notifications";
import PlayerTable from "./PlayerTable";
import { useAccount } from "../../contexts/useAccount";
import AvatarEditor from "react-avatar-editor";
import placeholderImage from "../../assets/placeholder.png";
import { DatePicker } from "@mantine/dates";
import { createContest } from "../../api/contestService";
import { useNavigate } from "react-router-dom";

export default function NewLeague() {
    const { currentAccount: currentPlayer } = useAccount();
    const [players, setPlayers] = useState<Player[]>([]);
    const [invitedPlayers, setInvitedPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(false);
    const [contest, setContest] = useState<Contest>(defaultContest);
    const [searchQuery, setSearchQuery] = useState("");
    const [picture, setPicture] = useState<File | null>(null);
    const avatarEditorRef = useRef<AvatarEditor | null>(null);
    const [validationErrors, setValidationErrors] = useState({
        start_date: "",
        players: "",
        marketplaces: "",
        name: "",
    });
    const navigate = useNavigate();

    const saveCroppedImage = () => {
        if (avatarEditorRef.current) {
            // Get the cropped image as a canvas
            const canvas = avatarEditorRef.current.getImageScaledToCanvas();

            // Convert canvas to Blob
            canvas.toBlob((blob) => {
                if (blob) {
                    // Create a File object
                    const file = new File([blob], "avatar.png", {
                        type: "image/png",
                    });
                    setPicture(file);

                    console.log("Cropped image saved as file:", file);
                }
            }, "image/png");
        }
    };

    const handleCreate = () => {
        saveCroppedImage();

        // Prepare player IDs
        const playerIds = invitedPlayers.map((player) => player.id);

        // Prepare contest object
        const contestToCreate: Contest = {
            ...contest,
            players: playerIds,
            start_date:
                contest.start_date instanceof Date
                    ? contest.start_date.toISOString().split("T")[0]
                    : contest.start_date, // Format date if it's a Date
        };

        const formData = new FormData();

        // Add the picture if available
        if (picture) {
            formData.append("picture", picture);
        }

        // Add all other contest fields
        Object.entries(contestToCreate).forEach(([key, value]) => {
            if (key === "players" && Array.isArray(value)) {
                // Append each player ID individually
                value.forEach((id) => formData.append("players", String(id)));
            } else {
                formData.append(key, String(value)); // Add other fields as strings
            }
        });

        console.log("FormData contents:");
        for (const [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }

        // Call the API and handle errors
        createContest(formData)
            .then(() => {
                notifications.show({
                    message: "Contest created successfully!",
                    color: "green",
                    position: "top-center",
                    autoClose: 2000,
                });
                navigate("/open_contests");
            })
            .catch((error) => {
                if (error.response && error.response.data) {
                    notifications.show({
                        color: "red",
                        message: "Please fix errors and try again.",
                        position: "top-center",
                        autoClose: 1500,
                    });

                    window.scrollTo({
                        top: 0,
                        behavior: "smooth", // Use "smooth" for a smoother scrolling effect
                    });

                    // Assuming the error response is a JSON object with field-specific errors
                    const apiErrors = error.response.data;

                    // Update validationErrors state
                    setValidationErrors((prevErrors) => ({
                        ...prevErrors,
                        ...Object.entries(apiErrors).reduce(
                            (acc, [key, value]) => ({
                                ...acc,
                                [key]: Array.isArray(value)
                                    ? value.join(", ")
                                    : value,
                            }),
                            {}
                        ),
                    }));

                    console.error("Validation errors:", apiErrors);
                } else {
                    console.error("Unexpected error:", error);
                }
            });
    };

    useEffect(() => {
        if (currentPlayer) {
            setContest({ ...contest, owner: currentPlayer.id });
            setInvitedPlayers([{ ...currentPlayer, is_owner: true }]);
        }
    }, [currentPlayer]);

    useEffect(() => {
        console.log(contest);
    }, [contest]);

    const onQueryChange = (query: string) => {
        if (query) {
            setLoading(true);
            setSearchQuery(query);
            searchPlayers(query)
                .then((data) => setPlayers(data))
                .catch((error) => console.error(error))
                .finally(() => setLoading(false));
        } else {
            setSearchQuery(query);
            setPlayers([]);
        }
    };

    const invitePlayer = (invitedPlayer: Player) => {
        if (invitedPlayers.find((player) => player.id === invitedPlayer.id)) {
            notifications.show({
                color: "red",
                message: "This player has already been added.",
                position: "top-center",
                autoClose: 1500,
            });
        } else {
            setInvitedPlayers([...invitedPlayers, invitedPlayer]);
            console.log(invitedPlayer);
        }
    };

    const uninvitePlayer = (uninvitedPlayer: Player) => {
        const newInvitedPlayersList = invitedPlayers.filter(
            (player) => player.id !== uninvitedPlayer.id
        );
        setInvitedPlayers(newInvitedPlayersList);
        console.log(uninvitedPlayer);
    };

    return (
        <AppShell>
            <Stack gap="xl" p="md" w='75%'>
                <Title order={1}>Create new league</Title>
                <Title order={4}>Invite players</Title>
                {validationErrors.players && (
                    <Text c="red">{validationErrors.players}</Text>
                )}
                <Group grow align="top">
                    <Stack w="50%">
                        <Text mb="6">Invited Players</Text>
                        <PlayerTable
                            players={invitedPlayers}
                            onRemove={uninvitePlayer}
                            emptyLabel={"No invited users."}
                            loading={!currentPlayer}
                        />
                    </Stack>
                    <Stack w="50%">
                        <TextInput
                            placeholder="Search for Players"
                            w="100%"
                            value={searchQuery}
                            onChange={(event) =>
                                onQueryChange(event.currentTarget.value)
                            }
                        />
                        <PlayerTable
                            players={players}
                            onAdd={invitePlayer}
                            emptyLabel={
                                searchQuery.length > 0
                                    ? "No players matched your search."
                                    : "Players will appear here"
                            }
                            loading={loading}
                        />
                    </Stack>
                </Group>
                <Title order={4}> Contest Options</Title>
                <Stack>
                    <Text>Name</Text>
                    <TextInput
                        value={contest.name}
                        onChange={(event) =>
                            setContest({
                                ...contest,
                                name: event.currentTarget.value,
                            })
                        }
                    />
                    {validationErrors.name && (
                        <Text c="red">{validationErrors.name}</Text>
                    )}
                </Stack>
                <Flex justify="space-between" gap="xl">
                    <Stack>
                        {picture ? (
                            <AvatarEditor
                                // borderRadius={125}
                                ref={avatarEditorRef}
                                image={picture}
                                width={250}
                                height={250}
                                border={0}
                                color={[255, 255, 255, 1]} // RGBA
                                scale={1.2}
                                rotate={0}
                                crossOrigin="anonymous"
                            />
                        ) : (
                            <Avatar
                                size={250}
                                radius={0}
                                src={placeholderImage}
                            />
                        )}
                        <FileInput
                            label="Change Contest Picture"
                            placeholder="Choose file"
                            onChange={(file) => setPicture(file)}
                            accept="image/*"
                            clearable
                        />
                    </Stack>
                    <Stack>
                        <Text>Marketplaces</Text>
                        <Checkbox
                            checked={contest.nyse}
                            label="NYSE"
                            onChange={(event) =>
                                setContest({
                                    ...contest,
                                    nyse: event.currentTarget.checked,
                                })
                            }
                        />
                        <Checkbox
                            checked={contest.nasdaq}
                            label="NASDAQ"
                            onChange={(event) =>
                                setContest({
                                    ...contest,
                                    nasdaq: event.currentTarget.checked,
                                })
                            }
                        />
                        <Checkbox
                            checked={contest.crypto}
                            label="Crypto"
                            onChange={(event) =>
                                setContest({
                                    ...contest,
                                    crypto: event.currentTarget.checked,
                                })
                            }
                        />
                        {validationErrors.marketplaces && (
                            <Text c="red">{validationErrors.marketplaces}</Text>
                        )}
                    </Stack>
                    <Stack>
                        <Text>Cash Interest Rate</Text>
                        <Slider
                            mt="20px"
                            value={contest.cash_interest_rate}
                            onChange={(val) =>
                                setContest({
                                    ...contest,
                                    cash_interest_rate: val,
                                })
                            }
                            min={0}
                            max={5}
                            step={0.1}
                            label={(value) => `${value}%`}
                            labelAlwaysOn
                        />
                    </Stack>
                    <Stack>
                        <Text>Start Date</Text>
                        <DatePicker
                            value={contest.start_date}
                            onChange={(date) =>
                                setContest({
                                    ...contest,
                                    start_date: date ?? contest.start_date,
                                })
                            }
                            minDate={
                                new Date(
                                    new Date().setDate(new Date().getDate() + 1)
                                )
                            } // 1 day after today
                            maxDate={
                                new Date(
                                    new Date().setFullYear(
                                        new Date().getFullYear() + 1
                                    )
                                )
                            } // 1 year from today
                        />
                        {validationErrors.start_date && (
                            <Text c="red">{validationErrors.start_date}</Text>
                        )}
                    </Stack>
                    <Stack>
                        <Text>Player Limit</Text>
                        <NumberInput
                            w="100%"
                            value={contest.player_limit ?? 10}
                            allowNegative={false}
                            allowDecimal={false}
                            min={1}
                            max={100}
                            onChange={(val) =>
                                setContest({
                                    ...contest,
                                    player_limit: val as number,
                                })
                            }
                            onBlur={() => {
                                if (!contest.player_limit) {
                                    setContest({
                                        ...contest,
                                        player_limit: 10,
                                    }); // Default to 10 if empty
                                }
                            }}
                        />
                        <Text>Duration</Text>
                        <Select
                            value={contest.duration}
                            data={[
                                { value: "day", label: "Day" },
                                { value: "week", label: "Week" },
                                { value: "month", label: "Month" },
                            ]}
                            onChange={(value) =>
                                setContest({
                                    ...contest,
                                    duration: value || "day",
                                })
                            }
                        />
                        <Text>Visibility</Text>
                        <Select
                            value={contest.league_type}
                            data={[
                                { value: "public", label: "Public" },
                                { value: "private", label: "Private" },
                                { value: "self", label: "Self" },
                            ]}
                            onChange={(value) =>
                                setContest({
                                    ...contest,
                                    league_type: value || "public",
                                })
                            }
                        />
                    </Stack>
                </Flex>
                <Button size="xl" onClick={handleCreate}>
                    Create Contest
                </Button>
            </Stack>
        </AppShell>
    );
}
