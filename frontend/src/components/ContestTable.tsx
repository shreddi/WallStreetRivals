import { useMemo } from 'react';
import { Contest } from '../types'
import { MRT_Table, MRT_ColumnDef, useMantineReactTable } from 'mantine-react-table';
import { AspectRatio, Badge, Box, Flex, Group, NumberFormatter, Text } from '@mantine/core';
import moment from 'moment'
import placeholderImage from '../assets/placeholder.png';


interface ContestTableProps {
    contests: Contest[]
}

export default function ContestTable({ contests }: ContestTableProps) {

    const columns = useMemo<MRT_ColumnDef<Contest>[]>(
        () => [
            {
                accessorKey: 'picture',
                header: 'Contest',
                size: 300,
                Cell: ({ cell, row }) =>
                (

                    <Group>
                        <AspectRatio ratio={1} w={50}>
                            <img src={cell.getValue<string>() ?? placeholderImage} />
                        </AspectRatio>
                        <Text size='sm'>
                            {row.original.name}
                        </Text>
                    </Group>
                )
            },
            {
                accessorKey: 'state',
                header: 'Status',
                Cell: ({ cell }) => 
                (
                    <Text size='sm' tt='capitalize'>{cell.getValue<string>()}</Text>
                )
            },
            {
                header: 'Rank/Players',
                Cell: ({ row }) => {
                    const rank = row.original.rank
                    const rankLabel = rank == -1 ? "-" : rank
                    return (<Text size='sm'>{rankLabel}/{row.original.num_active_players}</Text>)

                }
            },
            {
                header: 'Marketplaces',
                Cell: ({ row }) => (
                    <Flex gap='5px' wrap='wrap'>
                        {row.original.nyse && <Badge>NYSE</Badge>}
                        {row.original.nasdaq && <Badge>NASDAQ</Badge>}
                        {row.original.crypto && <Badge>Crypto</Badge>}
                    </Flex>
                )
            },
            {
                accessorKey: 'duration',
                header: 'Duration',
                Cell: ({ cell }) => {
                    let label = ""

                    switch (cell.getValue<string>()) {
                        case 'week':
                            label = '1 Week'
                            break;
                        case 'month':
                            label = '1 Month'
                            break;
                        case 'day':
                            label = '1 Day'
                            break;
                    }

                    return (label)
                }
            },
            {
                accessorKey: 'time_left',
                header: 'Time Left',
                Cell: ({ cell, row }) => {
                    const time_left = cell.getValue<number>()

                    const duration = moment.duration(time_left*1000);

                    const weeks = Math.floor(duration.asWeeks());
                    const days = duration.days();
                    const hours = duration.hours();
                    const minutes = duration.minutes();

                    const parts = [];

                    const red = (days == 0 && weeks == 0 && hours < 4)
                    // Only include relevant components
                    if (weeks > 0) parts.push(`${weeks}W`);
                    if (days > 0 || weeks > 0) parts.push(`${days}D`) // Show days if weeks are present
                    if (hours > 0 || days > 0 || weeks > 0) parts.push(`${hours}H`); // Show hours if larger units are present
                    if (minutes > 0) parts.push(`${minutes}M`);
                    
                    let label = parts.join(':');

                    if(row.original.state == 'upcoming')
                        label += ' (Starts)'
                    else if(row.original.state == 'completed')
                        return <Text size='sm' c='gray' >-</Text>
                    if(red)
                        return <Text size='sm' c='red'>{label}</Text>
                    return <Text size='sm' >{label}</Text>
                }
            },
            {
                accessorKey: 'balance',
                header: 'Balance',
                Cell: ({ cell }) => {
                    const balance = cell.getValue<number>()
                    if (balance == -1)
                        return <Text size='sm' c='gray'>-</Text>
                    else
                        return <NumberFormatter prefix="$" thousandSeparator value={balance} decimalScale={2} />;
                }
            },
        ],
        [],
    );

    const table = useMantineReactTable({
        columns,
        data: contests,
        enableSorting: false,
        enableColumnActions: false,
        initialState: { density: 'xs' },
    })

    return (
        <Box w='100%' >
            <MRT_Table table={table} />
        </Box>
    );
}