export class NewsSentiment {
  constructor(
    public readonly symbol: string,
    public readonly sentiment: number, // 0 to 1
    public readonly sentimentLabel: string,
    public readonly articleCount: number,
    public readonly headlines: string[],
  ) {}
}
