import {
    AppShell,
    Flex,
    Title,
    Stack,
    Button,
    Container,
    Center,
    Group,
    Image,
    Box,
} from "@mantine/core";
import { useAccount } from "../../contexts/useAccount";
import UserDropdown from "./UserDropdown";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/WSR-logo-black-vert.jpg";

// This component provides the structure of the app including the header.

export default function BasicAppShell({
    children,
}: {
    children: React.ReactNode;
}) {
    const { currentAccount } = useAccount();
    const navigate = useNavigate();

    return (
        <AppShell header={{ height: 140 }}>
            <AppShell.Header bg="black" p="md">
                <Group justify="space-between" align="flex-start" h={140}>
                    <Box h={140} w={300}>
                        <Image src={Logo} h={100} fit="contain" />
                    </Box>
                    <Stack justify="center">
                        <Flex align="center" justify="Flex-end" gap="md">
                            <Title order={6} c="white" fw={700} tt="uppercase">
                                welcome, {currentAccount?.username}
                            </Title>
                            <UserDropdown />
                        </Flex>
                        <Flex align="center" justify="Flex-end" gap="md">
                            <Button
                                onClick={() => navigate("/my_contests")}
                                variant="transparent"
                            >
                                <Title
                                    order={6}
                                    c="white"
                                    fw={700}
                                    tt="uppercase"
                                >
                                    my contests
                                </Title>
                            </Button>
                            <Button
                                onClick={() => navigate("/open_contests")}
                                variant="transparent"
                            >
                                <Title
                                    order={6}
                                    c="white"
                                    fw={700}
                                    tt="uppercase"
                                >
                                    open contests
                                </Title>
                            </Button>
                            <Button
                                onClick={() => navigate("/dashboard")}
                                variant="transparent"
                            >
                                <Title
                                    order={6}
                                    c="white"
                                    fw={700}
                                    tt="uppercase"
                                >
                                    dashboard
                                </Title>
                            </Button>
                            <Button
                                onClick={() => navigate("/new_league")}
                                variant="transparent"
                            >
                                <Title
                                    order={6}
                                    c="white"
                                    fw={700}
                                    tt="uppercase"
                                >
                                    new league (+)
                                </Title>
                            </Button>
                        </Flex>
                    </Stack>
                </Group>
            </AppShell.Header>

            <AppShell.Main>
                <Container fluid>
                    <Center>{children}</Center>
                </Container>
            </AppShell.Main>
        </AppShell>
    );
}
