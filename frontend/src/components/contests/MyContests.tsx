import { Box, Center, Flex, Loader, Stack, Title } from "@mantine/core"
import { Contest } from "../../types"
import { useEffect, useState } from "react"
import { getMyContests } from "../../api/contestService"
import AppShell from '../appShell/AppShell'
import ContestTable from './ContestTable'


export default function MyContests() {
    const [contests, setContests] = useState<Contest[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getMyContests()
            .then((data) => {
                setContests(data)
                console.log(data)
            })
            .catch((error: Error) => {
                console.error(error);
            })
            .finally(() => {
                setLoading(false)
            })
    }, [])

    if (loading) {
        return (
            <Center>
                <Loader />
            </Center>
        )
    }

    return (
        <AppShell>
            <Stack gap='xl' p='md' w='100%'>
                <Title order={1}>My CONtests</Title>
                <ContestTable contests={contests} detailed/>
            </Stack>
        </AppShell>
    )

}