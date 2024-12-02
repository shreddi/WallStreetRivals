import React, { useState, useEffect } from 'react';
import { Flex, Box, Text, Stack, NumberInput, Button, Table, Loader } from '@mantine/core';
import { Portfolio, defaultPortfolio, Holding, Stock } from '../types';
import { portfolioApi, holdingApi } from '../apiService';
import StockSelect from './StockSelect'

const PortfolioDashboard: React.FC = () => {
    // **State**
    const portfolioNum = 1;
    const [quantity, setQuantity] = useState<number>(0);
    const [portfolio, setPortfolio] = useState<Portfolio>(defaultPortfolio);
    const [selectedStock, setSelectedStock] = useState<Stock | undefined>(undefined);
    const [loading, setLoading] = useState(true);


    // **Functions**
    const formatPrice = (priceString: string): string => {
        return parseFloat(priceString).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }

    //Buys a new holding based on selected quantity and stock ID. 
    const buyHolding = async () => {
        if (!selectedStock?.id) {
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
        setSelectedStock(undefined)
        setQuantity(0)
    }

    const sellHolding = async (holdingToSell: Holding) => {
        await holdingApi.deleteHolding(holdingToSell.id!);
        fetchData();
    }

    //Fetch a portfolio and all stocks from the backend.
    const fetchData = async () => {
        setLoading(true);
        portfolioApi.getPortfolio(portfolioNum)
            .then((portfolioData) => {
                setPortfolio(portfolioData);
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

    //rows of table
    const rows = portfolio.holdings.reverse().map((holding) => (
        <Table.Tr key={holding.stock_data?.ticker || ""}>
            <Table.Td>{holding.stock_data?.ticker || ""}</Table.Td>
            <Table.Td>{holding.shares}</Table.Td>
            <Table.Td>${holding.stock_data!.trade_price}</Table.Td>
            <Table.Td>${formatPrice(holding.total_value || '0')}</Table.Td>
            <Table.Td>{new Date(holding.time_updated || "").toLocaleString()}</Table.Td>
            <Table.Td><Button size='xs' color="gray" onClick={() => sellHolding(holding)}>SELL</Button></Table.Td>
        </Table.Tr>
    ));


    // **Early Return for Loading State**
    if (loading) {
        return <Loader />;
    }

    // **JSX**
    return (
        <Flex justify='center'>
            <Stack gap="0px" bd='1px solid #ccc'>
                <Flex p="20px" bg="gray">
                    <Text size="lg" c="white">
                        PORTFOLIO
                    </Text>
                </Flex>
                <Flex w='700px' p="20px" bg="black" align="flex-end" justify="space-between">
                    <Text size="md" c="gray">
                        CASH
                    </Text>
                    <Text size="xl" c="white">
                        ${formatPrice(portfolio.cash).toLocaleString()}
                    </Text>
                </Flex>
                <Box p="20px" bg="white">
                    <Stack>
                        <StockSelect setSelectedStock={setSelectedStock} />
                        {selectedStock && <Flex align="flex-end" justify="space-between">

                            <NumberInput
                                label={<Text size="md" c="gray">QUANTITY</Text>}
                                allowNegative={false}
                                onChange={(value) => setQuantity(Number(value))}
                                allowDecimal={false}
                            />
                            {quantity > 0 && <>
                                <Text size='md' c='red'>
                                    TOTAL: ${
                                        formatPrice((quantity * (parseFloat(selectedStock.trade_price))).toString())
                                    }
                                </Text>
                                <Button color="gray" onClick={() => buyHolding()}>
                                    BUY
                                </Button>
                            </>
                            }
                        </Flex>}
                    </Stack>
                </Box>
                <Flex p="20px" bg="black" align="flex-end" justify="space-between">
                    <Text size="md" c="gray">
                        HOLDINGS
                    </Text>
                    <Text size="xl" c="white">
                        ${formatPrice(portfolio.holdings_total)}
                    </Text>
                </Flex>
                <Table>
                    <Table.Thead bg="gray" c="white">
                        <Table.Tr>
                            <Table.Th ta='center'>HOLDING</Table.Th>
                            <Table.Th ta='center'>SHARES</Table.Th>
                            <Table.Th ta='center'>PRICE</Table.Th>
                            <Table.Th ta='center'>TOTAL</Table.Th>
                            <Table.Th ta='center'>DATE</Table.Th>
                            <Table.Th ></Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody bg="black" c="gray">{rows}</Table.Tbody>
                </Table>
            </Stack>
        </Flex >
    );
};

export default PortfolioDashboard;
