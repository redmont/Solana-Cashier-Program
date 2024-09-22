export type OrderBook = string;

export const StandardOrderBook: OrderBook = 'standard';
export const VIPOrderBook: OrderBook = 'vip';

export const orderBooks: OrderBook[] = [
  StandardOrderBook,
  VIPOrderBook,
] as const;
