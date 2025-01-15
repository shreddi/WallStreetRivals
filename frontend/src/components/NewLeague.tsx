import { Title } from "@mantine/core";
import { Contest, defaultContest } from "../types";
import { useState } from "react";
import AppShell from './AppShell'



export default function NewLeague() {
    const [contest, setContest] = useState<Contest>(defaultContest)

    return (
        <AppShell>
            <Title order={1}>
                Create new league
            </Title>
        </AppShell>
    )
}