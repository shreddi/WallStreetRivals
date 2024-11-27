import React, { useState, useEffect } from 'react';
import { Flex, Box, Text, Select, Stack, NumberInput, Button, Table, Loader } from '@mantine/core';
import { Portfolio, defaultPortfolio, Holding, Stock, defaultStock } from '../types';
import { portfolioApi, stockApi, holdingApi } from '../apiService';

const PortfolioDashboard: React.FC = () => {
    // **State**
    const portfolioNum = 3;
    const [quantity, setQuantity] = useState<number>(0);
    const [portfolio, setPortfolio] = useState<Portfolio>(defaultPortfolio);
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [selectedStock, setSelectedStock] = useState<Stock>(defaultStock);
    const [loading, setLoading] = useState(true);

    // **Derived Data**
    const stockOptions = stocks.map((stock) => ({
        value: stock.ticker, // Ticker is used as the identifier
        label: `${stock.ticker}`, // Display ticker and price in dropdown
    }));
    const rows = portfolio.holdings.map((holding) => (
        <Table.Tr key={holding.stock_data?.ticker || ""}>
            <Table.Td>{holding.stock_data?.ticker || ""}</Table.Td>
            <Table.Td>{holding.shares}</Table.Td>
            <Table.Td>${holding.stock_data!.trade_price}</Table.Td>
            <Table.Td>${parseFloat(holding.total_value || '0').toLocaleString()}</Table.Td>
            <Table.Td>{new Date(holding.time_updated || "").toLocaleString()}</Table.Td>
            <Table.Td><Button color="gray" onClick={()=>sellHolding(holding)}>SELL</Button></Table.Td>
        </Table.Tr>
    ));

    // **Functions**

    const selectStockByTicker = (ticker: string | null) => {
        setSelectedStock(
            stocks.find((stock) => stock.ticker === ticker) || defaultStock
        )
    };

    //Buys a new holding based on selected quantity and stock ID. 
    const buyHolding = async () => {
        if (!selectedStock.id) {
            console.error("failed to create holding: stock id not present")
        } else {
            const newHolding: Holding = {
                stock: selectedStock.id,
                shares: quantity || 0,
                portfolio: portfolioNum
            }
            await holdingApi.createHolding(newHolding);
            fetchData();
        }
        setSelectedStock(defaultStock)
    }

    const sellHolding = async (holdingToSell: Holding) => {
        await holdingApi.deleteHolding(holdingToSell.id!);
        fetchData();
    }

    //Fetch a portfolio and all stocks from the backend.
    const fetchData = async () => {
        setLoading(true);
        Promise.all([
            portfolioApi.getPortfolio(portfolioNum),
            stockApi.getAllStocks()])
            .then(([portfolioData, stockData]) => {
                setPortfolio(portfolioData);
                setStocks(stockData.sort((a, b) => { return a.ticker.localeCompare(b.ticker) })); //sort stocks alphabetically in local langauge
            })
            .catch((error: Error) => {
                console.error(error);
            })
            .finally(() => {
                setLoading(false);
            });
    }


    // **Effects**
    useEffect(() => {
        fetchData()
    }, []);

    // **Early Return for Loading State**
    if (loading) {
        return <Loader />;
    }

    // **JSX**
    return (
        <Flex justify='center' >
            <Stack gap="0px" w="700px" bd='1px solid #ccc'>
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
                            data={stockOptions} // options have value: stock ticker, label: "ticker: $price"
                            value={selectedStock.ticker}
                            onChange={(stockTicker) => {
                                selectStockByTicker(stockTicker);
                            }}
                            w="100%"
                            searchable
                            clearable
                        />
                        <Flex align="flex-end" justify="space-between">
                            <NumberInput
                                label={<Text size="md" c="gray">QUANTITY</Text>}
                                allowNegative={false}
                                onChange={(value) => setQuantity(Number(value))}
                            />
                            <Button color="gray" onClick={() => buyHolding()}>
                                BUY
                            </Button>
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
                            <Table.Th></Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody bg="black" c="gray">{rows}</Table.Tbody>
                </Table>
            </Stack>
        </Flex>
    );
};

export default PortfolioDashboard;
