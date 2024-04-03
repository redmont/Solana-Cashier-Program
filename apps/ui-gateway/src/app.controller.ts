import { EventPattern, Payload } from "@nestjs/microservices";

import { Controller } from "@nestjs/common";
import { AppService } from "./app.service";
import { AppGateway } from "./app.gateway";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly appGateway: AppGateway
  ) {}

  @EventPattern("bets")
  bets(@Payload() data: any) {
    console.log("Got bets update");
    this.appService.setBets(data);
    this.appGateway.publish("bets", data);
  }

  @EventPattern("matchStatus")
  matchStarted(@Payload() data: any) {
    console.log("Got matchStatus update", data);
    this.appService.setMatchStatus(data);
    this.appGateway.publish("matchStatus", data);
  }
}
