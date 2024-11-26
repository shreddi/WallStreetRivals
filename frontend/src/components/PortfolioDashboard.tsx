import React, { useState, useEffect } from 'react'
import { Flex, Box, Text, Select, Stack, NumberInput, Button, Table, Loader } from '@mantine/core';
import { Portfolio, defaultPortfolio } from '../types';
import { portfolioApi } from '../apiService';

const PortfolioDashboard: React.FC = () => {
    const portfolioNum = 1
    const [quantity, setQuantity] = useState<number>(0)
    const [portfolio, setPortfolio] = useState<Portfolio>(defaultPortfolio)
    const [loading, setLoading] = useState(true)
    // const [selectedStock, setSelectedStock] = useState("")

    useEffect(() => {
        portfolioApi.getPortfolio(portfolioNum).then((data: Portfolio) => {
            setPortfolio(data);
            console.log(data)
        }).catch((error: Error) => {
            console.error(error);
        }).finally(() => {
            setLoading(false)
        })
    }, []);



    const holdings = [
        { name: "APPL", shares: 12, price: 500.00, date: '11/23/24 - 8:00 AM' },
        // { name: "APPL", shares: 3, price: 500.00, date: '11/23/24 - 8:00 AM' },
        // { name: "APPL", shares: 50, price: 500.00, date: '11/23/24 - 8:00 AM' },
    ];

    const rows = holdings.map((holding) => (
        <Table.Tr key={holding.name}>
            <Table.Td>{holding.name}</Table.Td>
            <Table.Td>{holding.shares}</Table.Td>
            <Table.Td>${holding.price.toFixed(2)}</Table.Td>
            <Table.Td>${(holding.shares * holding.price).toFixed(2)}</Table.Td>
            <Table.Td>{holding.date}</Table.Td>
        </Table.Tr>
    ));

    if (loading) {
        return <Loader />;
    }

    return (
        <Stack gap="0px" w='700px'>
            <Flex p='20px' bg="gray">
                <Text size='lg' c="white">PORTFOLIO</Text>
            </Flex>
            <Flex p='20px' bg="black" align="flex-end" justify="space-between">
                <Text size='md' c="gray">CASH</Text>
                <Text size='xl' c="white">$97,500</Text>
            </Flex>
            <Box p='20px' bg="white" >
                <Stack>
                    <Select
                        label={<Text size='md' c="gray">SEARCH STOCKS</Text>}
                        data={['APPLE (APPL)', 'AMAZON (AMZN)', 'MICROSOFT (MSFT)']}
                        w='100%'
                    />
                    <Flex align="flex-end" justify="space-between">
                        <NumberInput
                            label={<Text size='md' c="gray">QUANTITY</Text>}
                            allowNegative={false}
                            value={undefined}
                            onChange={(value) => setQuantity(Number(value))}
                        />
                        <Button color='gray' >
                            BUY
                        </Button>
                    </Flex>
                </Stack>
            </Box>
            <Flex p='20px' bg="black" align="flex-end" justify="space-between">
                <Text size='md' c="gray">HOLDINGS</Text>
                <Text size='xl' c="white">$105,000</Text>
            </Flex>
            <Table>
                <Table.Thead bg='gray' c='white'>
                    <Table.Tr >
                        <Table.Th>HOLDING</Table.Th>
                        <Table.Th>SHARES</Table.Th>
                        <Table.Th>PRICE</Table.Th>
                        <Table.Th>TOTAL</Table.Th>
                        <Table.Th>DATE</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody bg='black' c='gray'>{rows}</Table.Tbody>
            </Table>
        </Stack>
    )
}

export default PortfolioDashboard