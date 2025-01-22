import { Avatar, Menu, rem } from "@mantine/core"
import { useAccount } from "../../contexts/useAccount"
import { useState } from 'react'
import { useNavigate } from "react-router-dom";
import {
    IconSettings,
    IconLogout,
    IconCurrencyDollar,
} from '@tabler/icons-react';

export default function UserDropdown() {
    const navigate = useNavigate()
    const [opened, setOpened] = useState(false);
    const { logout, currentAccount: currentPlayer } = useAccount()

    return (
        <Menu
            opened={opened}
            onChange={setOpened}
            transitionProps={{ transition: 'pop-top-right', duration: 150 }}
        >
            <Menu.Target>
                <Avatar
                    src={currentPlayer?.profile_picture || ""}
                />
            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Item 
                    leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}
                    onClick={() => navigate('/settings')}
                >
                    SETTINGS
                </Menu.Item>
                <Menu.Item
                    leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}
                    onClick={() => logout()}
                >
                    LOGOUT
                </Menu.Item>
                <Menu.Item
                    leftSection={<IconCurrencyDollar style={{ width: rem(14), height: rem(14) }} />}
                    onClick={() => navigate('/portfolio')}
                >
                    DASHBOARD
                </Menu.Item>
            </Menu.Dropdown>
        </Menu >
    )
}