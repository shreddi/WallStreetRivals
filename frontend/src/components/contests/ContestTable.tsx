import {
    MRT_ColumnDef,
    useMantineReactTable,
    MantineReactTable,
} from "mantine-react-table";
import {
    AspectRatio,
    Badge,
    Flex,
    Group,
    NumberFormatter,
    Text,
} from "@mantine/core";
import { useMemo } from "react";
import { Contest } from "../../types";
import moment from "moment";
import placeholderImage from "../../assets/placeholder.png";
import ContestDetailPanel from "./ContestDetailPanel";

interface ContestTableProps {
    contests: Contest[];
    detailed?: boolean;
}

export default function ContestTable({
    contests,
    detailed,
}: ContestTableProps) {
    const columns = useMemo<MRT_ColumnDef<Contest>[]>(
        () => [
            {
                accessorKey: "name",
                header: "Contest",
                size: 250,
                Cell: ({ row }) => (
                    <Group>
                        <AspectRatio ratio={1} w={50}>
                            <img
                                src={row.original.picture ?? placeholderImage}
                            />
                        </AspectRatio>
                        <Text size="sm">{row.original.name}</Text>
                    </Group>
                ),
            },
            {
                accessorKey: "state",
                header: "Status",
                size: 50,
                Cell: ({ cell }) => (
                    <Text size="sm" tt="capitalize">
                        {cell.getValue<string>()}
                    </Text>
                ),
            },
            {
                header: detailed ? "Rank" : "Players",
                size: 30,
                Cell: ({ row }) => {
                    if (detailed) {
                        const rank = row.original.rank;
                        const rankLabel = rank == -1 ? "-" : rank;
                        return (
                            <Text size="sm">
                                {rankLabel}/{row.original.num_active_players}
                            </Text>
                        );
                    }else{
                        return (
                            <Text size="sm">
                                {row.original.num_active_players}
                            </Text>
                        );
                    }
                },
            },
            {
                header: "Marketplaces",
                size: 180,
                Cell: ({ row }) => (
                    <Flex gap="5px" wrap="wrap">
                        {row.original.nyse && <Badge>NYSE</Badge>}
                        {row.original.nasdaq && <Badge>NASDAQ</Badge>}
                        {row.original.crypto && <Badge>Crypto</Badge>}
                    </Flex>
                ),
            },
            {
                accessorKey: "duration",
                header: "Duration",
                size: 70,
                Cell: ({ cell }) => {
                    let label = "";

                    switch (cell.getValue<string>()) {
                        case "week":
                            label = "1 Week";
                            break;
                        case "month":
                            label = "1 Month";
                            break;
                        case "day":
                            label = "1 Day";
                            break;
                    }

                    return label;
                },
            },
            {
                accessorKey: "time_left",
                header: "Time Left",
                Cell: ({ cell, row }) => {
                    const time_left = cell.getValue<number>();

                    const duration = moment.duration(time_left * 1000);

                    const weeks = Math.floor(duration.asWeeks());
                    const days = duration.days();
                    const hours = duration.hours();
                    const minutes = duration.minutes();

                    const parts = [];

                    const red = days == 0 && weeks == 0 && hours < 4;
                    // Only include relevant components
                    if (weeks > 0) parts.push(`${weeks}W`);
                    if (days > 0 || weeks > 0) parts.push(`${days}D`); // Show days if weeks are present
                    if (hours > 0 || days > 0 || weeks > 0)
                        parts.push(`${hours}H`); // Show hours if larger units are present
                    if (minutes > 0) parts.push(`${minutes}M`);

                    let label = parts.join(":");

                    if (row.original.state == "upcoming") label += " (Starts)";
                    else if (row.original.state == "completed")
                        return (
                            <Text size="sm" c="gray">
                                -
                            </Text>
                        );
                    if (red)
                        return (
                            <Text size="sm" c="red">
                                {label}
                            </Text>
                        );
                    return <Text size="sm">{label}</Text>;
                },
            },
            {
                accessorKey: "balance",
                header: "Balance",
                Cell: ({ cell }) => {
                    const balance = cell.getValue<number>();
                    if (balance == -1)
                        return (
                            <Text size="sm" c="gray">
                                -
                            </Text>
                        );
                    else
                        return (
                            <NumberFormatter
                                prefix="$"
                                thousandSeparator
                                value={balance}
                                decimalScale={2}
                            />
                        );
                },
            },
        ],
        []
    );

    const table = useMantineReactTable({
        columns,
        data: contests,
        // enableExpandAll: false,
        enableDensityToggle: false,
        enableFullScreenToggle: false,
        enableSorting: false,
        enableHiding: false,
        enableColumnActions: false,
        enableColumnFilters: false,
        initialState: {
            density: "xs",
            columnVisibility: { balance: detailed ?? false },
        },
        mantineExpandAllButtonProps: {
            style: { display: "none" },
        },
        renderDetailPanel: ({ row }) => {
            const activePortfolios = row.original.portfolios.filter(
                (portfolio) => portfolio.active
            );
            const players = activePortfolios.map(
                (portfolio) => portfolio.player
            );

            return (
                <ContestDetailPanel players={players} contest={row.original} detailed={detailed}/>
            );
        },
    });

    return <MantineReactTable table={table} />;
}
