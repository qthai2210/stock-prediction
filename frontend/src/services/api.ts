export interface PredictionResult {
    symbol: string;
    latest_date: string;
    latest_close: number;
    prediction: number;
    change: number;
    change_pct: number;
    indicators: {
        rsi: number;
        macd: number;
        bb_pos: number;
    };
    history: {
        date: string;
        price: number;
    }[];
    top_features: {
        feature: string;
        importance: number;
    }[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

    async getNews(symbol: string): Promise<any> {
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

    async getMarketOverview(): Promise<any> {
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
    }
};
