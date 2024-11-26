import axios, { AxiosRequestHeaders } from 'axios';
import { Stock, Portfolio, Holding } from './types.ts'

//Base backend URL
export const API_BASE_URL = 'http://localhost:8000'

//Helper to create full URLs
const buildUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`;

// //function to construct axios authorization headers based on locally stored token.
// export function getAuthHeaders(): AxiosRequestHeaders['headers'] {
//     const token = localStorage.get('token')
//     if (!token) {
//         throw new Error('No access token available');
//     }
//     return {
//         Authorization: `Bearer ${token}`,
//     };
// }

//Reusable Axios configuration
const axiosConfig = { headers: { 'Content-Type': 'application/json' } };

//Portfolio API Service
export const portfolioApi = {
    async getPortfolio(portfolio_id: number): Promise<Portfolio> {
        try {
            const response = await axios.get(buildUrl(`/api/portfolios/${portfolio_id}`), axiosConfig);
            return response.data;
        } catch (error) {
            console.error(`Failed to get portfolio ${portfolio_id}:`, error);
            throw error;
        }
    },

    async getAllPortfolios(): Promise<Portfolio[]> {
        try {
            const response = await axios.get(buildUrl('/api/portfolios'), axiosConfig);
            return response.data;
        } catch (error) {
            console.error('Failed to get all portfolios:', error);
            throw error;
        }
    },

    async createPortfolio(portfolio: Partial<Portfolio>): Promise<Portfolio> {
        try {
            const response = await axios.post(buildUrl('/api/portfolios'), portfolio, axiosConfig);
            return response.data;
        } catch (error) {
            console.error('Failed to create portfolio:', error);
            throw error;
        }
    },

    async updatePortfolio(portfolio: Portfolio): Promise<Portfolio> {
        if (!portfolio.id) {
            throw new Error('Portfolio ID is required to update a portfolio.');
        }
        try {
            const response = await axios.put(buildUrl(`/api/portfolios/${portfolio.id}`), portfolio, axiosConfig);
            return response.data;
        } catch (error) {
            console.error(`Failed to update portfolio ${portfolio.id}:`, error);
            throw error;
        }
    },

    async deletePortfolio(portfolio_id: number): Promise<void> {
        try {
            await axios.delete(buildUrl(`/api/portfolios/${portfolio_id}`), axiosConfig);
        } catch (error) {
            console.error(`Failed to delete portfolio ${portfolio_id}:`, error);
            throw error;
        }
    },
};

//Stock API Service
export const stockApi = {
    async getStock(stock_id: number): Promise<Stock> {
        try {
            const response = await axios.get(buildUrl(`/api/stocks/${stock_id}`), axiosConfig);
            return response.data;
        } catch (error) {
            console.error(`Failed to get stock ${stock_id}:`, error);
            throw error;
        }
    },

    async getAllStocks(): Promise<Stock[]> {
        try {
            const response = await axios.get(buildUrl('/api/stocks'), axiosConfig);
            return response.data;
        } catch (error) {
            console.error('Failed to get all stocks:', error);
            throw error;
        }
    },

    async createStock(stock: Partial<Stock>): Promise<Stock> {
        try {
            const response = await axios.post(buildUrl('/api/stocks'), stock, axiosConfig);
            return response.data;
        } catch (error) {
            console.error('Failed to create stock:', error);
            throw error;
        }
    },

    async updateStock(stock: Stock): Promise<Stock> {
        if (!stock.id) {
            throw new Error('Stock ID is required to update a stock.');
        }
        try {
            const response = await axios.put(buildUrl(`/api/stocks/${stock.id}`), stock, axiosConfig);
            return response.data;
        } catch (error) {
            console.error(`Failed to update stock ${stock.id}:`, error);
            throw error;
        }
    },

    async deleteStock(stock_id: number): Promise<void> {
        try {
            await axios.delete(buildUrl(`/api/stocks/${stock_id}`), axiosConfig);
        } catch (error) {
            console.error(`Failed to delete stock ${stock_id}:`, error);
            throw error;
        }
    },
};

