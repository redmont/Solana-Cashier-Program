import { Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { SocketModule } from "./socket/socket.module";

@Module({
  imports: [EventEmitterModule.forRoot(), SocketModule],
})
export class AppModule {}
