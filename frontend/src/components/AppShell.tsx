import { AppShell, Button, Flex } from '@mantine/core'
import { useNavigate } from 'react-router-dom';


export default function BasicAppShell({ children }: { children: React.ReactNode }){
    const navigate = useNavigate();

    const logout = () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      navigate('/login');
    }
        
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

