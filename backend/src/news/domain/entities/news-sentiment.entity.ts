export class NewsSentiment {
  constructor(
    public readonly symbol: string,
    public readonly sentimentScore: number,
    public readonly sentimentLabel: string,
    public readonly articleCount: number,
    public readonly latestArticles: any[],
  ) {}
}
