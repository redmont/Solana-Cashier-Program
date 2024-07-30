import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { Key } from '@/interfaces/key';
import { createRosterFSM } from './roster.fsm';
import { Roster } from './roster.interface';
import { SeriesService } from '@/series/series.service';
import { Actor, createActor } from 'xstate';
import { OnEvent } from '@nestjs/event-emitter';
import { QueryStoreService } from 'query-store';
import dayjs from '@/dayjs';
import { FighterProfilesService } from '@/fighterProfiles/fighterProfiles.service';

@Injectable()
export class RosterService {
  private readonly logger = new Logger(RosterService.name);

  private key = {
    pk: 'roster',
    sk: 'roster',
  };
  fsm: Actor<ReturnType<typeof createRosterFSM>>;

  constructor(
    @InjectModel('roster') private readonly model: Model<Roster, Key>,
    private readonly seriesService: SeriesService,
    private readonly queryStore: QueryStoreService,
    private readonly fighterProfilesService: FighterProfilesService,
  ) {}

  async initialise() {
    this.run();
  }

  run() {
    this.fsm = createActor(
      createRosterFSM({
        getSeriesFromSchedule: () => this.getSeriesFromSchedule(),
        runSeries: (series: {
          codeName: string;
          fighters: {
            codeName: string;
            displayName: string;
            imagePath: string;
          }[];
        }) => this.runSeries(series),
      }),
    );

    this.fsm.subscribe((state) => {
      this.logger.log('Roster FSM state:', state.value);
    });

    this.fsm.start();

    this.fsm.send({ type: 'run' });
  }

  async getRoster(): Promise<Omit<Roster, 'pk' | 'sk'> | null> {
    const roster = await this.model.get(this.key);

    if (!roster) {
      return null;
    }

    const { pk, sk, ...rest } = roster;

    return rest;
  }

  async updateRoster(
    scheduleType?: string,
    schedule?: string[],
    series?: string[],
    timedSeries?: { codeName: string; startTime: string }[],
  ) {
    const update = {};
    if (scheduleType) {
      update['scheduleType'] = scheduleType;
    }
    if (schedule) {
      update['schedule'] = schedule.map((codeName) => ({ codeName }));
    }
    if (series) {
      update['series'] = series.map((codeName) => ({ codeName }));
    }
    if (timedSeries) {
      update['timedSeries'] = timedSeries;
    }

    if (Object.keys(update).length > 0) {
      await this.model.update(this.key, update);
    }

    this.fsm.send({ type: 'run' });
  }

  async getSeriesFromSchedule() {
    const roster = await this.model.get(this.key);
    if (!roster) {
      await this.model.create({
        ...this.key,
        scheduleType: 'linear',
        series: [],
        schedule: [],
        timedSeries: [],
      });

      return null;
    }

    if (roster.series.length === 0) {
      return null;
    }

    const scheduleLength = 5;

    if (roster.timedSeries?.length > 0) {
      // Order timed series by startTime, using linguistic comparison as the dates are in ISO 8601 format
      roster.timedSeries.sort((a, b) => a.startTime.localeCompare(b.startTime));
      const nextTimedSeries = roster.timedSeries[0];

      if (dayjs(nextTimedSeries.startTime).diff(dayjs.utc(), 'seconds') <= 90) {
        // This should be the next series to run
        const next = roster.timedSeries.shift();

        // Remove it from the schedule
        const scheduleItem = roster.schedule.find(
          (item) => item.codeName === next.codeName,
        );
        roster.schedule.unshift(scheduleItem);
      }
    }

    if (roster.schedule.length < scheduleLength) {
      if (roster.scheduleType === 'linear') {
        if (roster.schedule.length === 0) {
          // Populate the schedule with scheduleLength series, repeated if needed
          for (let i = 0; i < scheduleLength; i++) {
            const seriesIndex = i % roster.series.length;
            const series = await this.getSeriesWithFighters(
              roster.series[seriesIndex].codeName,
            );
            roster.schedule.push(series);
          }
        } else {
          // Get last series in the schedule
          const lastSeries = roster.schedule[roster.schedule.length - 1];

          // Get the index of the last series in the roster
          const lastSeriesIndex = roster.series.findIndex(
            (series) => series.codeName === lastSeries.codeName,
          );

          // Populate up to scheduleLength series in the schedule,
          // starting from the next series in the roster
          const numberOfSeries = scheduleLength - roster.schedule.length;
          for (let i = 1; i <= numberOfSeries; i++) {
            const nextSeriesIndex =
              (lastSeriesIndex + i) % roster.series.length;
            const series = await this.getSeriesWithFighters(
              roster.series[nextSeriesIndex].codeName,
            );
            roster.schedule.push(series);
          }
        }
      }

      if (roster.scheduleType === 'random') {
        const numberOfSeries = scheduleLength - roster.schedule.length;
        for (let i = 1; i <= numberOfSeries; i++) {
          const randomIndex = Math.floor(Math.random() * roster.series.length);
          const series = await this.getSeriesWithFighters(
            roster.series[randomIndex].codeName,
          );
          roster.schedule.push(series);
        }
      }
    }

    const nextSeries = roster.schedule.shift();
    await this.model.update(roster);

    await this.queryStore.updateRoster(roster.schedule);

    return nextSeries;
  }

  async runSeries(series: {
    codeName: string;
    fighters: { codeName: string }[];
  }) {
    const { codeName, fighters } = series;
    this.seriesService.sendEvent(codeName, {
      type: 'RUN',
      fighterCodeNames: fighters.map((fighter) => fighter.codeName),
    });
  }

  @OnEvent('series.matchCompleted')
  async handleSeriesMatchCompleted(codeName: string) {
    this.fsm.send({ type: 'seriesMatchCompleted', codeName });
  }

  async getSeriesWithFighters(seriesCodeName: string) {
    const series = await this.seriesService.getSeries(seriesCodeName);
    const fighterProfiles = await this.fighterProfilesService.list();

    // Add non-random fighters and tickers first

    const fighters = [];
    const tickers = [];
    for (const fighterProfile of series.fighterProfiles.filter(
      (f) => f !== '#RANDOM#',
    )) {
      const { codeName, displayName, imagePath, ticker } = fighterProfiles.find(
        (x) => x.codeName === fighterProfile,
      );
      fighters.push({ codeName, displayName, imagePath });
      tickers.push(ticker.toLowerCase());
    }

    // Now add random fighters, making sure
    // the random choices don't conflict with the non-random ones

    let fightersToAdd = series.fighterProfiles.filter(
      (f) => f === '#RANDOM#',
    ).length;
    let count = 0;

    while (fightersToAdd > 0 && count < 50) {
      const randomIndex = Math.floor(Math.random() * fighterProfiles.length);
      const fighter = fighterProfiles[randomIndex];
      if (
        !fighters.find((f) => f.codeName === fighter.codeName) &&
        !tickers.includes(fighter.ticker.toLowerCase())
      ) {
        const { codeName, displayName, imagePath } = fighter;
        fighters.push({ codeName, displayName, imagePath });
        tickers.push(fighter.ticker.toLowerCase());
        fightersToAdd--;
      }
      count++;
    }

    return {
      codeName: series.codeName,
      fighters,
    };
  }
}
