import { Center, Flex, Loader } from "@mantine/core"
import { Contest } from "../types"
import { useEffect, useState } from "react"
import { getOpenContests } from "../api/contestService"
import AppShell from './AppShell'
import ContestTable from './ContestTable'

export default function CreateLeague() {
    const [contests, setContests] = useState<Contest[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getOpenContests()
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
            <Center>
                <ContestTable contests={contests} />
            </Center>
        </AppShell>
    )

}