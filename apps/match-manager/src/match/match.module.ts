import { Module } from "@nestjs/common";
import { MatchController } from "./match.controller";
import { MatchService } from "./match.service";
import { UsersModule } from "../users/users.module";
import { GlobalClientsModule } from "../global-clients-module";
import { SeriesService } from "./series.service";
import { MatchDataService } from "./matchData.service";
import { MatchFSMService } from "./matchFSM.service";

@Module({
  imports: [GlobalClientsModule, MatchModule, UsersModule],
  controllers: [MatchController],
  providers: [MatchDataService, MatchFSMService, SeriesService, MatchService],
  exports: [SeriesService],
})
export class MatchModule {}
