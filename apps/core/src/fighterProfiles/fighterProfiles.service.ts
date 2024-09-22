import { Injectable } from '@nestjs/common';
import { FighterProfilesPersistenceService } from './fighterProfilesPersistence.service';
import { FighterProfile } from './fighterProfile.interface';
import { MatchPersistenceService } from '@/match/matchPersistence.service';
import { StandardOrderBook, VIPOrderBook } from '@/config/orderBook';

@Injectable()
export class FighterProfilesService {
  constructor(
    private readonly persistence: FighterProfilesPersistenceService,
    private readonly matchPersistenceService: MatchPersistenceService,
  ) {}

  async list() {
    return this.persistence.list();
  }

  async get(codeName: string) {
    return this.persistence.get(codeName);
  }

  async create(
    item: Omit<
      FighterProfile,
      'pk' | 'sk' | 'fightCount' | 'winningFightCount' | 'wageredSum'
    >,
  ) {
    return this.persistence.create({
      ...item,
      pk: 'fighterProfile',
      sk: item.codeName,
      fightCount: 0,
      winningFightCount: 0,
      wageredSum: 0,
    });
  }

  async update(
    codeName: string,
    item: Omit<
      FighterProfile,
      | 'pk'
      | 'sk'
      | 'codeName'
      | 'fightCount'
      | 'winningFightCount'
      | 'wageredSum'
    >,
  ) {
    return this.persistence.update(codeName, item);
  }

  async trackMatch(
    matchId: string,
    fighterCodeNames: string[],
    winningFighterCodename: string,
  ) {
    const bets = (
      await Promise.all([
        this.matchPersistenceService.getBets(matchId, StandardOrderBook),
        this.matchPersistenceService.getBets(matchId, VIPOrderBook),
      ])
    ).flat();

    for (const fighterCodeName of fighterCodeNames) {
      const fighterBets = bets.filter((bet) => bet.fighter === fighterCodeName);
      const wageredSum = fighterBets.reduce((acc, bet) => acc + bet.amount, 0);

      const values: Record<string, number> = {
        fightCount: 1,
        wageredSum,
      };

      if (fighterCodeName == winningFighterCodename) {
        values.winningFightCount = 1;
      }

      await this.persistence.add(fighterCodeName, values);
    }
  }
}
