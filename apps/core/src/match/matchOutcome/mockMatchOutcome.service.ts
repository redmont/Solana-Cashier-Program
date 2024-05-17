import { Pools } from '@bltzr-gg/croupier';
import { MatchOutcomeService } from './matchOutcome.service';

export class MockMatchOutcomeService extends MatchOutcomeService {
  override determineOutcome(
    tsFrom: number,
    tsTo: number,
    pools: Pools,
  ): Promise<string> {
    return super.determineOutcome(1713830315000, 1713830325000, pools);
  }
}
