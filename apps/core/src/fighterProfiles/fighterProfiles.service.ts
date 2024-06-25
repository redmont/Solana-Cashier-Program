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

  async create(item: FighterProfile) {
    return this.persistence.create(item);
  }

  async update(codeName: string, item: Omit<FighterProfile, 'codeName'>) {
    return this.persistence.update(codeName, item);
  }
}
