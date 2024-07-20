import { Pools } from '@bltzr-gg/croupier';

export abstract class AbstractMatchOutcomeService {
  async determineOutcome(
    tsFrom: number,
    tsTo: number,
    pools: Pools,
  ): Promise<{
    winner: string;
    priceDelta: Record<
      string,
      {
        relative: number;
        absolute: number;
      }
    >;
  }> {
    throw new Error('Not implemented');
  }
}
