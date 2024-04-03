export interface ReadModelKey {
  pk: string;
  sk: string;
}

export interface Account extends ReadModelKey {
  balance: number;
}
