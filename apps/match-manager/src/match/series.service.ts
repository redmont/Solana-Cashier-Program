import { Injectable, OnModuleInit } from "@nestjs/common";
import { v4 as uuid } from "uuid";
import { MatchFSMService } from "./matchFSM.service";
import { MatchDataService } from "./matchData.service";
import { createActor } from "xstate";

@Injectable()
export class SeriesService implements OnModuleInit {
  private seriesMap: Map<string, Series> = new Map();

  constructor(
    private matchFSMService: MatchFSMService,
    private matchDataService: MatchDataService
  ) {}

  onModuleInit() {
    console.log("Creating series");
    this.createSeries("dogs-vs-frogs-1", {
      requiredCapabilities: {},
    });
  }

  createSeries(seriesId: string, config: MatchConfig) {
    if (this.seriesMap.has(seriesId)) {
      throw new Error(`Series ${seriesId} already exists.`);
    }

    const series = new Series(
      seriesId,
      config,
      this.matchFSMService,
      this.matchDataService
    );
    this.seriesMap.set(seriesId, series);
    series.scheduleNextMatch();
  }
}

class MatchConfigCapabilities {
  public models?: {
    head?: string[];
    torso?: string[];
    legs?: string[];
  };
  public map?: string;
  public finishingMoves?: string[];
}

export class MatchConfig {
  public requiredCapabilities: MatchConfigCapabilities;
}

class Series {
  private fsm: any;

  constructor(
    public seriesId: string,
    private config: MatchConfig,
    private matchFSMService: MatchFSMService,
    private matchDataService: MatchDataService
  ) {}

  scheduleNextMatch() {
    const matchId = this.generateMatchId();
    if (!this.fsm) {
      this.fsm = createActor(
        this.matchFSMService.createMatchFSM(matchId, this.config)
      );
      this.fsm.subscribe((state) => {
        console.log(
          `Series ${this.seriesId} transitioned to state:`,
          state.value
        );
      });
      this.fsm.start();
      this.fsm.send({ type: "FIND_SERVER" });
    }
  }

  private generateMatchId(): string {
    return uuid();
  }
}
