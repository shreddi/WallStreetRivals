import { Center, Loader, Text } from "@mantine/core"
import { Contest } from "../types"
import { useEffect, useState } from "react"
import { getOpenContests } from "../api/contestService"

export default function CreateLeague() {
    const [contests, setContests] = useState<Contest[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getOpenContests()
            .then((data) => {
                setContests(data)
            })
            .catch((error: Error) => {
                console.error(error);
            })
            .finally(() => {
                setLoading(false)
            })
    }, [])

    console.log(contests)

    if (loading) {
        return (
            <Center>
                <Loader />
            </Center>
        )
    }

    return (
        <Text>hello</Text>
    )

}