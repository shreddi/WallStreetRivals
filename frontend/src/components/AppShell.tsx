import { AppShell, Flex, Text } from '@mantine/core'
import { usePlayer } from './contexts/usePlayer';
import UserDropdown from './UserDropdown';

// This component provides the structure of the app including the header.

export default function BasicAppShell({ children }: { children: React.ReactNode }){
    const { player } = usePlayer()

    return (
        <AppShell
          header={{ height: 70 }}
          padding="md"
        >
          <AppShell.Header p="md">
            <Flex align="center" justify="Flex-end" gap='md'>
              <Text tt='uppercase'>welcome, {player?.first_name} {player?.last_name}</Text>
              <UserDropdown/>
            </Flex>
          </AppShell.Header>
    
    
          <AppShell.Main>{children}</AppShell.Main>
        </AppShell>
      );
}

