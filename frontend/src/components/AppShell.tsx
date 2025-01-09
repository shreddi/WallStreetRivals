import { AppShell, Button, Flex } from '@mantine/core'
import { usePlayer } from './contexts/usePlayer';

// This component provides the structure of the app including the header.

export default function BasicAppShell({ children }: { children: React.ReactNode }){
    const { logout } = usePlayer()
        
    return (
        <AppShell
          header={{ height: 70 }}
          padding="md"
        >
          <AppShell.Header p="md">
            <Flex align="center" justify="Flex-end">
              <Button
                onClick={() => logout()}
              >
                  Log out
              </Button>
            </Flex>
          </AppShell.Header>
    
    
          <AppShell.Main>{children}</AppShell.Main>
        </AppShell>
      );
}

