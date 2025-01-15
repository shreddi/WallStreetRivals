import { MantineReactTable, MRT_ColumnDef, MRT_Table, useMantineReactTable } from 'mantine-react-table';
import { Player } from "../types";
import { Group, Text, Box, Avatar } from '@mantine/core';
import { useMemo } from 'react';

interface PlayerProps {
    players: Player[];
}

export default function PlayerTable({ players }: PlayerProps) {


    const columns = useMemo<MRT_ColumnDef<Player>[]>(
        () => [
            {
                accessorKey: 'profile_picture',
                header: 'Username',
                size: 300,
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
            }
        ],
        [],
    );

    const table = useMantineReactTable({
        columns,
        data: players,
        enableSorting: false,
        enableColumnActions: false,
        initialState: { density: 'xs', pagination: { pageSize: 5, pageIndex: 0 } },
        renderEmptyRowsFallback: () => (
            <Box p="md" style={{ textAlign: 'center' }}>
                <Text>No Players Found</Text>
            </Box>
        ),
        mantinePaginationProps: {
            showRowsPerPage: false,
            withEdges: false, // Customizes pagination controls
        },
        enableTopToolbar: false,
        enableBottomToolbar: true,
        // paginationDisplayMode: 'pages',
    })

    return (
        <Box w='100%' >
            <MantineReactTable table={table} />
        </Box>
    );
}