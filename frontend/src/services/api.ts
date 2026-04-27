export interface PredictionResult {
    symbol: string;
    latest_date?: string;
    latest_close?: number;
    prediction?: number;
    change?: number;
    change_pct?: number;
    indicators?: {
        rsi: number;
        macd: number;
        bb_pos: number;
    };
    history?: {
        date: string;
        price: number;
    }[];
    top_features?: {
        feature: string;
        importance: number;
    }[];
    status?: 'completed' | 'processing' | 'failed';
    message?: string;
}

const getApiUrl = () => {
    // If we have an environment variable, use it
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;

    // If in browser, use the current host but point to /api
    if (typeof window !== 'undefined') {
        const host = window.location.origin;
        if (host.includes('localhost')) return 'http://localhost:3001';
        return `${host}/api`;
    }

    return 'http://localhost:3001';
};

const API_URL = getApiUrl();

export interface NewsData {
    sentiment: number;
    headlines: string[];
    symbol: string;
}

export interface MarketData {
    vn_index: { value: number; change: number; changePercent: number; volume: number };
    hnx_index: { value: number; change: number; changePercent: number; volume: number };
    upcom_index: { value: number; change: number; changePercent: number; volume: number };
    top_gainers: { symbol: string; price: number; change: number; changePercent: number; volume: number }[];
    top_losers: { symbol: string; price: number; change: number; changePercent: number; volume: number }[];
    updatedAt: string;
}

export interface SignalLog {
    id: number | string;
    symbol: string;
    type: 'BUY' | 'SELL' | 'HOLD';
    strategy: string;
    priceAtTime: number;
    targetPrice: number;
    confidence: number;
    status: 'ACTIVE' | 'SUCCESS' | 'FAIL' | 'EXPIRED';
    createdAt: string;
    actualPrice?: number;
    profitPct?: number;
    closedAt?: string;
}

export const api = {
    async getPrediction(symbol: string): Promise<PredictionResult> {
        try {
            const response = await fetch(`${API_URL}/prediction/${symbol}`);
            if (!response.ok) {
                throw new Error('Failed to fetch prediction data');
            }
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async getNews(symbol: string): Promise<NewsData> {
        try {
            const response = await fetch(`${API_URL}/news/${symbol}`);
            if (!response.ok) {
                throw new Error('Failed to fetch news data');
            }
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async getMarketOverview(): Promise<MarketData> {
        try {
            const response = await fetch(`${API_URL}/market/overview`);
            if (!response.ok) {
                throw new Error('Failed to fetch market data');
            }
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async getSignalStats(): Promise<{
        summary: {
            total: number;
            winRate: string | number;
        };
        strategyStats: Record<string, { total: number; success: number; profit: number }>;
        recentSignals: SignalLog[];
    }> {
        try {
            const response = await fetch(`${API_URL}/signals/stats`);
            if (!response.ok) {
                throw new Error('Failed to fetch signal stats');
            }
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
};
