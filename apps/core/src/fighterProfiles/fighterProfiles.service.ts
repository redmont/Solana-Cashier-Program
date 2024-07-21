import { Injectable } from '@nestjs/common';
import { FighterProfilesPersistenceService } from './fighterProfilesPersistence.service';
import { FighterProfile } from './fighterProfile.interface';

@Injectable()
export class FighterProfilesService {
  constructor(
    private readonly persistence: FighterProfilesPersistenceService,
  ) {}

  async list() {
    return this.persistence.list();
  }

  async get(codeName: string) {
    return this.persistence.get(codeName);
  }

  async create(item: Omit<FighterProfile, 'pk' | 'sk'>) {
    return this.persistence.create({
      ...item,
      pk: 'fighterProfile',
      sk: item.codeName,
    });
  }

  async update(
    codeName: string,
    item: Omit<FighterProfile, 'pk' | 'sk' | 'codeName'>,
  ) {
    return this.persistence.update(codeName, item);
  }
}
