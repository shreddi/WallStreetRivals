import axios from "axios";
import { Stock, Portfolio, Holding } from "../types.ts";
import { API_BASE_URL, buildUrl, getAuthHeaders } from "./apiService.ts";

//Portfolio API Service
export const portfolioApi = {
    async getPortfolio(portfolio_id: number): Promise<Portfolio> {
        const headers = getAuthHeaders();

        console.log(API_BASE_URL);
        try {
            const response = await axios.get(
                buildUrl(`/api/portfolios/${portfolio_id}/`),
                { headers, withCredentials: true }
            );
            return response.data;
        } catch (error) {
            console.error(`Failed to get portfolio ${portfolio_id}:`, error);
            throw error;
        }
    },

    async createPortfolio(portfolio: Partial<Portfolio>): Promise<Portfolio> {
        const headers = getAuthHeaders();
        const response = await axios.post(
            buildUrl("/api/portfolios/"),
            portfolio,
            { headers, withCredentials: true }
        );
        return response.data;
    },

    async updatePortfolio(portfolio: Portfolio): Promise<Portfolio> {
        const headers = getAuthHeaders();

        if (!portfolio.id) {
            throw new Error("Portfolio ID is required to update a portfolio.");
        }
        try {
            const response = await axios.put(
                buildUrl(`/api/portfolios/${portfolio.id}/`),
                portfolio,
                { headers, withCredentials: true }
            );
            return response.data;
        } catch (error) {
            console.error(`Failed to update portfolio ${portfolio.id}:`, error);
            throw error;
        }
    },

    async deletePortfolio(portfolio_id: number): Promise<void> {
        const headers = getAuthHeaders();

        try {
            await axios.delete(buildUrl(`/api/portfolios/${portfolio_id}/`), {
                headers,
                withCredentials: true,
            });
        } catch (error) {
            console.error(`Failed to delete portfolio ${portfolio_id}:`, error);
            throw error;
        }
    },
};

//Stock API Service
export const stockApi = {
    async getAllStocks(): Promise<Stock[]> {
        const headers = getAuthHeaders();

        try {
            const response = await axios.get(buildUrl("/api/stocks"), {
                headers,
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            console.error("Failed to get all stocks:", error);
            throw error;
        }
    },
};

// Holding API Service
export const holdingApi = {
    async createHolding(holding: Holding): Promise<Holding> {
        const headers = getAuthHeaders();

        try {
            const response = await axios.post(
                buildUrl("/api/holdings/"),
                holding,
                { headers, withCredentials: true }
            );
            console.log(response.data);
            return response.data;
        } catch (error) {
            console.error("Failed to create holding:", error);
            throw error;
        }
    },

    async updateHolding(holding: Holding): Promise<Holding> {
        const headers = getAuthHeaders();

        if (!holding.id) {
            throw new Error("Holding ID is required to update a holding.");
        }
        try {
            const response = await axios.put(
                buildUrl(`/api/holdings/${holding.id}/`),
                holding,
                { headers, withCredentials: true }
            );
            return response.data;
        } catch (error) {
            console.error(`Failed to update holding ${holding.id}:`, error);
            throw error;
        }
    },

    async deleteHolding(holding_id: number): Promise<void> {
        const headers = getAuthHeaders();

        try {
            await axios.delete(buildUrl(`/api/holdings/${holding_id}/`), {
                headers,
                withCredentials: true,
            });
        } catch (error) {
            console.error(`Failed to delete holding ${holding_id}:`, error);
            throw error;
        }
    },
};

export * from "./authService";
