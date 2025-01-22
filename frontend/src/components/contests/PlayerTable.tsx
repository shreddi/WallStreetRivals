import { MantineReactTable, MRT_ColumnDef, useMantineReactTable } from 'mantine-react-table';
import { Player } from "../../types";
import { Group, Text, Box, Avatar, ActionIcon, ThemeIcon, Tooltip, Center } from '@mantine/core';
import { useMemo } from 'react';
import { IconPlus, IconX, IconCrown } from '@tabler/icons-react'

interface PlayerProps {
    players: Player[];
    onAdd?: (player: Player) => void;
    onRemove?: (player: Player) => void;
    emptyLabel?: string
    loading?: boolean
}

export default function PlayerTable({ players, onAdd, onRemove, emptyLabel, loading }: PlayerProps) {


    const columns = useMemo<MRT_ColumnDef<Player>[]>(
        () => [
            {
                accessorKey: 'profile_picture',
                header: 'Username',
                size: 200,
                Cell: ({ cell, row }) =>
                (
                    <Group>
                        <Avatar
                            src={cell.getValue<string>()}
                            radius="25px"
                            size="50px"
                        />
                        <Text size='sm'>
                            {row.original.username}
                        </Text>
                        {row.original.is_owner &&
                            <Tooltip label='Contest Owner'>
                                <ThemeIcon variant='filled' color='gold'>
                                    <IconCrown />
                                </ThemeIcon>
                            </Tooltip>
                        }
                    </Group>
                )
            },
            {
                header: 'Name',
                Cell: ({ row }) =>
                (
                    <Group>
                        <Text size='sm'>
                            {row.original.first_name} {row.original.last_name}
                        </Text>
                    </Group>
                )
            },
            {
                header: 'Invite',
                id: 'invite',
                size: 50,
                Cell: ({ row }) =>
                (
                    <Center>
                        <ActionIcon color='green' onClick={() => onAdd!(row.original)}>
                            <IconPlus />
                        </ActionIcon>
                    </Center>
                )
            },
            {
                header: 'Remove',
                id: 'uninvite',
                size: 50,
                Cell: ({ row }) =>
                (
                    <Center>
                        <ActionIcon color='red' onClick={() => onRemove!(row.original)} disabled={row.original.is_owner}>
                            <IconX />
                        </ActionIcon>
                    </Center>
                )
            },
        ],
        [onAdd, onRemove],
    );

    const table = useMantineReactTable({
        columns,
        data: players,
        enableSorting: false,
        enableColumnActions: false,
        enableTableHead: false,
        initialState: {
            density: 'xs',
            pagination: { pageSize: 5, pageIndex: 0 },
            columnVisibility: {
                invite: (!!onAdd),
                uninvite: (!!onRemove)
            },
        },
        mantineTableContainerProps: {
            style: {
                minHeight: '354px', // Adjust the height as needed
                height: '354px',    // Ensures table always takes up this height
            },
        },
        renderEmptyRowsFallback: () => (
            <Box p="md" style={{ textAlign: 'center' }}>
                <Text>{emptyLabel ? emptyLabel : "No Users to Display."}</Text>
            </Box>
        ),
        mantinePaginationProps: {
            showRowsPerPage: false,
            withEdges: false, // Customizes pagination controls
        },
        enableTopToolbar: false,
        state: { isLoading: loading }
    })

    return (
        <Box w='100%' >
            <MantineReactTable table={table} />
        </Box>
    );
}