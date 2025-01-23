import {
    AspectRatio,
    Avatar,
    Badge,
    Box,
    Flex,
    Group,
    Stack,
    Tabs,
    Text,
    Title,
} from "@mantine/core";
import { Player, Contest } from "../../types";
import PlayerTable from "./PlayerTable";
import { useState } from "react";
import placeholderImage from "../../assets/placeholder.png";

interface ContestDetailPanelProps {
    contest: Contest;
    players: Player[];
    detailed?: boolean;
}

export default function ContestDetailPanel({
    contest,
    players,
    detailed,
}: ContestDetailPanelProps) {
    const [activeTab, setActiveTab] = useState<string | null>("players");

    return (
        <Tabs
            radius="0px"
            value={activeTab}
            onChange={setActiveTab}
            variant="outline"
        >
            <Tabs.List grow>
                {detailed && (
                    <Tabs.Tab
                        value="portfolio"
                        bg={"portfolio" === activeTab ? "white" : "transparent"}
                    >
                        PORTFOLIO
                    </Tabs.Tab>
                )}
                <Tabs.Tab
                    value="players"
                    bg={"players" === activeTab ? "white" : "transparent"}
                >
                    PLAYERS
                </Tabs.Tab>
                {detailed && (
                    <Tabs.Tab
                        value="transactions"
                        bg={
                            "transactions" === activeTab
                                ? "white"
                                : "transparent"
                        }
                    >
                        TRANSACTIONS
                    </Tabs.Tab>
                )}
                {detailed && (
                    <Tabs.Tab
                        value="messages"
                        bg={"messages" === activeTab ? "white" : "transparent"}
                    >
                        MESSAGES
                    </Tabs.Tab>
                )}
                <Tabs.Tab
                    value="contestDetails"
                    bg={
                        "contestDetails" === activeTab ? "white" : "transparent"
                    }
                >
                    CONTEST DETAILS
                </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="portfolio">
                <></>
            </Tabs.Panel>
            <Tabs.Panel value="players">
                <PlayerTable players={players} nested={true}/>
            </Tabs.Panel>
            <Tabs.Panel value="transactions">
                <></>
            </Tabs.Panel>
            <Tabs.Panel value="contestDetails">
            <Group bg="white" justify="space-between" bd='1px solid gray.3'>
            <Stack
                        p="md"
                        h="100%"
                        align="flex-start"
                        justify="space-between"
                    >
                        <Flex gap="xs" wrap="wrap" align="center">
                            <Title size="md">Marketplaces:</Title>
                            {contest.nyse && <Badge>NYSE</Badge>}
                            {contest.nasdaq && <Badge>NASDAQ</Badge>}
                            {contest.crypto && <Badge>Crypto</Badge>}
                        </Flex>
                        <Group>
                            <Title size="md">Cash Interest Rate:</Title>
                            <Text>{contest.cash_interest_rate}%</Text>
                        </Group>
                        <Group>
                            <Title size="md">Visibility:</Title>
                            <Text tt="capitalize">{contest.league_type}</Text>
                        </Group>
                        <Group>
                            <Title size="md">Starts:</Title>
                            <Text tt="capitalize">{contest.start_date}</Text>
                        </Group>
                        <Group>
                            <Title size="md">Ends:</Title>
                            <Text tt="capitalize">{contest.end_date}</Text>
                        </Group>
                    </Stack>
                        <AspectRatio ratio={1} w="30%" p='md'> 
                            <img src={contest.picture ?? placeholderImage} />
                        </AspectRatio>
                </Group>
            </Tabs.Panel>
            <Tabs.Panel value="messages">
                <></>
            </Tabs.Panel>
        </Tabs>
    );
}
