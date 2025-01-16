import { Center, Group, Loader, Stack, TextInput, Title, Text } from "@mantine/core";
import { Contest, defaultContest, Player } from "../types";
import { useState, useEffect } from "react";
import AppShell from './AppShell'
import { searchPlayers } from '../api/authService';
import { notifications } from '@mantine/notifications'
import PlayerTable from "./PlayerTable";
import { usePlayer } from './contexts/usePlayer';



export default function NewLeague() {
    const { currentPlayer } = usePlayer()
    const [players, setPlayers] = useState<Player[]>([])
    const [invitedPlayers, setInvitedPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(false)
    const [contest, setContest] = useState<Contest>(defaultContest)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        if(currentPlayer)
            setInvitedPlayers([{...currentPlayer, is_owner: true}])
    }, [currentPlayer])

    const onQueryChange = (query: string) => {
        if (query) {
            setLoading(true)
            setSearchQuery(query)
            searchPlayers(query)
                .then((data) => setPlayers(data))
                .catch((error) => console.error(error))
                .finally(() => setLoading(false))
        } else {
            setSearchQuery(query)
            setPlayers([])
        }
    }

    const invitePlayer = (invitedPlayer: Player) => {
        if (invitedPlayers.find((player) => player.id === invitedPlayer.id)) {
            notifications.show({
                color: 'red',
                message: 'This player has already been added.',
                position: 'top-center',
                autoClose: 1500
            })
        } else {
            setInvitedPlayers([...invitedPlayers, invitedPlayer])
            console.log(invitedPlayer)
        }
    }

    const uninvitePlayer = (uninvitedPlayer: Player) => {
        const newInvitedPlayersList = invitedPlayers.filter((player) => player.id !== uninvitedPlayer.id)
        setInvitedPlayers(newInvitedPlayersList)
        console.log(uninvitedPlayer)
    }

    return (
        <AppShell>
            <Title order={1}>
                Create new league
            </Title>
            <Stack w='1200' p='md' >
                <Title order={4}>Invite players</Title>
                <Group grow align='top'>
                    <Stack w='50%' h='600'>
                        <Text mb='6'>Invited Players</Text>
                        <PlayerTable players={invitedPlayers} onRemove={uninvitePlayer} emptyLabel={'No invited users.'} loading={!currentPlayer}/>
                    </Stack>
                    <Stack w='50%' h='600'>
                        <TextInput
                            placeholder="Search for Players"
                            w='100%'   
                            value={searchQuery}
                            onChange={(event) => onQueryChange(event.currentTarget.value)}
                        />
                        <PlayerTable players={players} onAdd={invitePlayer} emptyLabel={searchQuery.length > 0 ? "No players matched your search." : "Players will appear here"} loading={loading}/>       
                    </Stack>
                </Group>
            </Stack>
        </AppShell >
    )
}