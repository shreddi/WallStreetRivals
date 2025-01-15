import { useMemo } from 'react';
import { Contest } from '../types'
import { MRT_Table, MRT_ColumnDef, useMantineReactTable } from 'mantine-react-table';

interface ContestTableProps {
    contests: Contest[]
}

export default function ContestTable({ contests }: ContestTableProps) {

    const columns = useMemo<MRT_ColumnDef<Contest>[]>(
        () => [
            {
                accessorKey: 'name',
                header: 'Name',
            },
            {
                accessorKey: 'cash_interest_rate', 
                header: 'Cash Interest Rate',
            },
            {
                accessorKey: 'player_limit', 
                header: 'Player Limit',
            },
        ],
        [],
    );

    const table = useMantineReactTable({
        columns,
        data: contests,
        enableRowSelection: true, //enable some features
        enableColumnOrdering: true, //enable a feature for all columns
        enableGlobalFilter: false, //turn off a feature
    })

    return <MRT_Table table={table} />;
}