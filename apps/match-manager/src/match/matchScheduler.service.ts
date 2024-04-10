import { Injectable, OnModuleInit } from "@nestjs/common";
import { Interval } from "@nestjs/schedule";
import { MatchFSMService } from "./matchFSM.service";

@Injectable()
export class MatchSchedulerService implements OnModuleInit {
  private matches: Map<string, any> = new Map();

  constructor(private matchFSMService: MatchFSMService) {}

  onModuleInit() {
    this.scheduleMatches();
  }

  @Interval(1 * 60 * 60 * 1000)
  scheduleMatches() {
    // const matchId = this.generateMatchId();
    // const matchFSM =
  }
}
