import { Pools } from '@bltzr-gg/croupier';
import { MatchOutcomeService } from './matchOutcome.service';

export class MockMatchOutcomeService extends MatchOutcomeService {
  override determineOutcome(
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
    return super.determineOutcome(1713830316000, 1713830320000, pools);
  }
}
