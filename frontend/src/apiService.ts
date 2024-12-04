import axios from 'axios';
import { Stock, Portfolio, Holding } from './types.ts'

// Base backend URL from environment variable
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//Helper to create full URLs
const buildUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`;

//Reusable Axios configuration
const axiosConfig = { headers: { 'Content-Type': 'application/json' } };

//Portfolio API Service
export const portfolioApi = {
    async getPortfolio(portfolio_id: number): Promise<Portfolio> {
        try {
            const response = await axios.get(buildUrl(`/api/portfolios/${portfolio_id}/`), axiosConfig);
            return response.data;
        } catch (error) {
            console.error(`Failed to get portfolio ${portfolio_id}:`, error);
            throw error;
        }
    },

    async createPortfolio(portfolio: Partial<Portfolio>): Promise<Portfolio> {
        try {
            const response = await axios.post(buildUrl('/api/portfolios/'), portfolio, axiosConfig);
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
            const response = await axios.put(buildUrl(`/api/portfolios/${portfolio.id}/`), portfolio, axiosConfig);
            return response.data;
        } catch (error) {
            console.error(`Failed to update portfolio ${portfolio.id}:`, error);
            throw error;
        }
    },

    async deletePortfolio(portfolio_id: number): Promise<void> {
        try {
            await axios.delete(buildUrl(`/api/portfolios/${portfolio_id}/`), axiosConfig);
        } catch (error) {
            console.error(`Failed to delete portfolio ${portfolio_id}:`, error);
            throw error;
        }
    },
};

//Stock API Service
export const stockApi = {

    async getAllStocks(): Promise<Stock[]> {
        try {
            const response = await axios.get(buildUrl('/api/stocks'), axiosConfig);
            return response.data;
        } catch (error) {
            console.error('Failed to get all stocks:', error);
            throw error;
        }
    },

};


// Holding API Service
export const holdingApi = {

    async createHolding(holding: Holding): Promise<Holding> {
        try {
            const response = await axios.post(buildUrl('/api/holdings/'), holding, axiosConfig);
            console.log(response.data)
            return response.data
        } catch (error) {
            console.error('Failed to create holding:', error);
            throw error;
        }
    },

    async updateHolding(holding: Holding): Promise<Holding> {
        if (!holding.id) {
            throw new Error('Holding ID is required to update a holding.');
        }
        try {
            const response = await axios.put(buildUrl(`/api/holdings/${holding.id}/`), holding, axiosConfig);
            return response.data;
        } catch (error) {
            console.error(`Failed to update holding ${holding.id}:`, error);
            throw error;
        }
    },

    async deleteHolding(holding_id: number): Promise<void> {
        try {
            await axios.delete(buildUrl(`/api/holdings/${holding_id}/`), axiosConfig);
        } catch (error) {
            console.error(`Failed to delete holding ${holding_id}:`, error);
            throw error;
        }
    },
};
