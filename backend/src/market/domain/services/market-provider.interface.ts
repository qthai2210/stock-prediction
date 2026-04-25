export interface IMarketProvider {
  getMarketOverview(): Promise<any>;
}

export const IMarketProvider = Symbol('IMarketProvider');
