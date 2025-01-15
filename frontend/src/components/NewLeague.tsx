import { Box, Center, Loader, Stack, TextInput, Title } from "@mantine/core";
import { Contest, defaultContest, Player } from "../types";
import { useEffect, useState } from "react";
import AppShell from './AppShell'
import { getAllPlayers, searchPlayers } from '../api/authService';
import PlayerTable from "./PlayerTable";



export default function NewLeague() {
    const [players, setPlayers] = useState<Player[]>([])
    const [loading, setLoading] = useState(false)
    const [contest, setContest] = useState<Contest>(defaultContest)
    const [searchQuery, setSearchQuery] = useState('')

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

    return (
        <AppShell>
            <Title order={1}>
                Create new league
            </Title>
            <Stack>
                <TextInput
                    label='Invite Players'
                    value={searchQuery}
                    onChange={(event) => onQueryChange(event.currentTarget.value)}
                />
                {loading ? (<Center><Loader mt='30px' /></Center>)
                    : (searchQuery != '' ?
                        <Box h='100px'>
                            <PlayerTable players={players} />
                        </Box>
                        : <></>)}
            </Stack>
        </AppShell>
    )
}