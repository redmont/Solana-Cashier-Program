export interface PriceFeedEventPayload {
  symbol: {
    base: string;
    quote: string;
  };
  timestamp: number;
  price: number;
  excahnge: string;
  provider: string;
  version: number;
}
