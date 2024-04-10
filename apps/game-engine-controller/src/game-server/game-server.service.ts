import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { createActor } from "xstate";
import { createGameServerFSM } from "./game-server.fsm";

@Injectable()
export class GameServerService {
  private gameServerFSMs: Map<string, any> = new Map();

  constructor(private eventEmitter: EventEmitter2) {}

  handleGameServerMessage(serverId: string, data: any) {
    if (data.type === "ready" && !this.gameServerFSMs.has(serverId)) {
      const fsm = createActor(
        createGameServerFSM(serverId, (data) =>
          this.eventEmitter.emit("sendMessageToServer", data)
        )
      );

      console.log("Created actor");

      fsm.subscribe((state) => {
        console.log(`Server ${serverId} transitioned to state:`, state.value);
      });
      fsm.start();

      this.gameServerFSMs.set(serverId, fsm);
    } else {
      const fsm = this.gameServerFSMs.get(serverId);
      if (fsm) {
        fsm.send({ type: status.toUpperCase() });

        console.log("Game server FSMs", this.gameServerFSMs);
      }
    }
  }

  sendMatchDetails(serverId: string, matchDetails: any) {
    const fsm = this.gameServerFSMs.get(serverId);
    fsm.send("MATCH_DETAILS", { matchDetails });
  }

  allocateServerForMatch(matchId: string, matchConfig: any) {
    // Allocate any available server at this point...

    for (let [key, fsm] of this.gameServerFSMs.entries()) {
      if (fsm.getSnapshot().value === "ready") {
        console.log("Sending ready");
        fsm.send({ type: "SEND_MATCH_SETUP", matchId, matchConfig });
        return { serverId: key };
      }
    }

    return { serverId: null };
  }
}
