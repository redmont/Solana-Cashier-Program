import { Pools } from '@bltzr-gg/croupier';

export abstract class AbstractMatchOutcomeService {
  async determineOutcome(
    tsFrom: number,
    tsTo: number,
    pools: Pools,
  ): Promise<string> {
    throw new Error('Not implemented');
  }
}
