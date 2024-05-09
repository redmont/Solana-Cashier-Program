import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { Key } from '@/interfaces/key';
import { createRosterFSM } from './roster.fsm';
import { Roster } from './roster.interface';
import { SeriesService } from '@/series/series.service';
import { createActor } from 'xstate';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class RosterService {
  private readonly logger = new Logger(RosterService.name);

  private key = {
    pk: 'roster',
    sk: 'roster',
  };
  fsm: any;

  constructor(
    @InjectModel('roster') private readonly model: Model<Roster, Key>,
    private readonly seriesService: SeriesService,
  ) {}

  async initialise() {
    this.run();
  }

  run() {
    this.fsm = createActor(
      createRosterFSM({
        getSeriesFromSchedule: () => this.getSeriesFromSchedule(),
        runSeries: (codeName: string) => this.runSeries(codeName),
      }),
    );

    this.fsm.subscribe((state) => {
      this.logger.log('Roster FSM state:', state.value);
    });

    this.fsm.start();

    this.fsm.send({ type: 'run' });
  }

  async getRoster() {
    const roster = await this.model.get(this.key);

    if (!roster) {
      return null;
    }

    const { pk, sk, ...rest } = roster;

    return rest;
  }

  async updateRoster(scheduleType: string, series: string[]) {
    await this.model.update(this.key, {
      scheduleType,
      series: series.map((codeName) => ({ codeName })),
    });

    this.fsm.send({ type: 'run' });
  }

  async getSeriesFromSchedule() {
    const roster = await this.model.get(this.key);
    if (!roster) {
      await this.model.create({
        ...this.key,
        scheduleType: 'linear',
        series: [],
        nextSeriesIndex: 0,
      });

      return null;
    }

    if (roster.series.length === 0) {
      return null;
    }

    let nextSeriesCodename = null;

    if (roster.series.length > roster.nextSeriesIndex) {
      nextSeriesCodename = roster.series[roster.nextSeriesIndex].codeName;

      if (roster.scheduleType === 'linear') {
        if (roster.nextSeriesIndex === roster.series.length - 1) {
          roster.nextSeriesIndex = 0;
        } else {
          roster.nextSeriesIndex += 1;
        }
      } else if (roster.scheduleType === 'random') {
        const randomIndex = Math.floor(Math.random() * roster.series.length);
        roster.nextSeriesIndex = randomIndex;
      }
      await this.model.update(roster);
    }

    return nextSeriesCodename;
  }

  async runSeries(codeName: string) {
    this.seriesService.sendEvent(codeName, 'RUN');
  }

  async setSeriesAsNext(codeName: string) {
    const roster = await this.model.get(this.key);

    if (!roster) {
      return;
    }

    const series = roster.series.find((series) => series.codeName === codeName);
    if (!series) {
      return;
    }

    roster.nextSeriesIndex = roster.series.indexOf(series);
    await this.model.update(roster);
  }

  @OnEvent('series.matchCompleted')
  async handleSeriesMatchCompleted(codeName: string) {
    this.fsm.send({ type: 'seriesMatchCompleted', codeName });
  }
}
