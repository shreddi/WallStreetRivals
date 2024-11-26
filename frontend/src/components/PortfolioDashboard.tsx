import React, { useState, useEffect } from 'react';
import { Flex, Box, Text, Select, Stack, NumberInput, Button, Table, Loader } from '@mantine/core';
import { Portfolio, defaultPortfolio, Holding, Stock, defaultStock } from '../types';
import { portfolioApi, stockApi } from '../apiService';

const PortfolioDashboard: React.FC = () => {
    // **State**
    const portfolioNum = 1;
    const [quantity, setQuantity] = useState<number>(0);
    const [portfolio, setPortfolio] = useState<Portfolio>(defaultPortfolio);
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [selectedStock, setSelectedStock] = useState<Stock>(defaultStock);
    const [loading, setLoading] = useState(true);

    // **Derived Data**
    const holdings: Holding[] = portfolio.holdings;
    const stockOptions = stocks.map((stock) => ({ //data structure used by Select component for user to select stocks from.
        value: stock.ticker, 
        label: stock.ticker, 
    })); 
    const rows = holdings.map((holding) => (
        <Table.Tr key={holding.stock_data.ticker}>
            <Table.Td>{holding.stock_data.ticker}</Table.Td>
            <Table.Td>{holding.shares}</Table.Td>
            <Table.Td>${holding.stock_data.trade_price}</Table.Td>
            <Table.Td>${holding.total_value}</Table.Td>
            <Table.Td>{new Date(holding.time_updated || "").toLocaleString()}</Table.Td>
        </Table.Tr>
    ));


    // **functions**
    const selectStockByTicker = (ticker: string | null) => {
        setSelectedStock(
            stocks.find((stock) => stock.ticker === ticker) || defaultStock
        )
    };

    // **Effects**
    useEffect(() => {
        setLoading(true);

        //Fetch a portfolio and all stocks from the backend.
        Promise.all([
            portfolioApi.getPortfolio(portfolioNum),
            stockApi.getAllStocks()])
            .then(([portfolioData, stockData]) => {
                setPortfolio(portfolioData);
                setStocks(stockData)
            })
            .catch((error: Error) => {
                console.error(error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // **Early Return for Loading State**
    if (loading) {
        return <Loader />;
    }

    // **JSX**
    return (
        <Stack gap="0px" w="700px">
            <Flex p="20px" bg="gray">
                <Text size="lg" c="white">
                    PORTFOLIO
                </Text>
            </Flex>
            <Flex p="20px" bg="black" align="flex-end" justify="space-between">
                <Text size="md" c="gray">
                    CASH
                </Text>
                <Text size="xl" c="white">
                    ${parseFloat(portfolio.cash).toLocaleString()}
                </Text>
            </Flex>
            <Box p="20px" bg="white">
                <Stack>
                    <Select
                        label={<Text size="md" c="gray">SEARCH STOCKS</Text>}
                        data = {stockOptions}
                        onChange = {(selectedTicker) => selectStockByTicker(selectedTicker)}
                        w="100%"
                    />
                    <Flex align="flex-end" justify="space-between">
                        <NumberInput
                            label={<Text size="md" c="gray">QUANTITY</Text>}
                            allowNegative={false}
                            value={quantity}
                            onChange={(value) => setQuantity(Number(value))}
                        />
                        <Button color="gray">BUY</Button>
                    </Flex>
                </Stack>
            </Box>
            <Flex p="20px" bg="black" align="flex-end" justify="space-between">
                <Text size="md" c="gray">
                    HOLDINGS
                </Text>
                <Text size="xl" c="white">
                    ${parseFloat(portfolio.holdings_total).toLocaleString()}
                </Text>
            </Flex>
            <Table>
                <Table.Thead bg="gray" c="white">
                    <Table.Tr>
                        <Table.Th>HOLDING</Table.Th>
                        <Table.Th>SHARES</Table.Th>
                        <Table.Th>PRICE</Table.Th>
                        <Table.Th>TOTAL</Table.Th>
                        <Table.Th>DATE</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody bg="black" c="gray">{rows}</Table.Tbody>
            </Table>
        </Stack>
    );
};

export default PortfolioDashboard;
