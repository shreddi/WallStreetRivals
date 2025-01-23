import {
    Center,
    Loader,
    Stack,
    Title,
    Text,
    Button,
} from "@mantine/core";
import { Contest, defaultContest } from "../../types";
import { useEffect, useState } from "react";
import { getSingleContest } from "../../api/contestService";
import AppShell from "../appShell/AppShell";
import ContestTable from "./ContestTable";
import { useNavigate, useParams } from "react-router-dom";
import { useAccount } from "../../contexts/useAccount";
import { portfolioApi } from "../../api/portfolioService";
import { notifications } from "@mantine/notifications";

export default function SingleContest() {
    const navigate = useNavigate();
    const { contestID } = useParams<{ contestID: string }>();
    const { currentAccount } = useAccount();
    const [contest, setContest] = useState<Contest>(defaultContest);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");

    const numericContestID = parseInt(contestID || "0");

    useEffect(() => {
        setLoading(true);
        getSingleContest(numericContestID)
            .then((data: Contest) => {
                setContest(data);
                if (data.state === "Completed") {
                    setStatus("completed");
                } else {
                    setStatus("found");
                }
            })
            .catch((error: Error) => {
                console.error(error);
                setStatus("error");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading || !currentAccount) {
        return (
            <Center>
                <Loader />
            </Center>
        );
    }

    const myPortfolio = contest.portfolios.find(
        (portfolio) => portfolio.player.id === currentAccount.id
    );

    const joinContest = () => {
        if (myPortfolio) {
            const activePortfolio = { ...myPortfolio, active: true };
            portfolioApi
                .updatePortfolio(activePortfolio)
                .then(() => {
                    notifications.show({
                        color: "green",
                        message: "Successfully joined contest!",
                        position: "top-center",
                        autoClose: 1500,
                    });
                    navigate("/my_contests");
                })
                .catch(() => {
                    notifications.show({
                        color: "red",
                        message: "Error joining contest.",
                        position: "top-center",
                        autoClose: 1500,
                    });
                    navigate("/my_contests");
                });
        }
    };

    const canJoin = myPortfolio ? !myPortfolio.active : false;

    return (
        <AppShell>
            <Stack gap="xl" p="md" w="100%">
                {status === "error" && (
                    <Text>Could not find that contest.</Text>
                )}
                {status === "complete" && (
                    <Text>This contest is complete.</Text>
                )}
                {status === "found" && (
                    <>
                        <Title order={1}>Contest Info</Title>
                        {canJoin && (
                            <Stack align="center">
                                <Button
                                    w="50%"
                                    size="lg"
                                    bg="lime"
                                    onClick={() => joinContest()}
                                >
                                    JOIN CONTEST
                                </Button>
                            </Stack>
                        )}
                        <ContestTable contests={[contest]} single />
                    </>
                )}
            </Stack>
        </AppShell>
    );
}
