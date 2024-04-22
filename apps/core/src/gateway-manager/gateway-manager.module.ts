import { Module } from '@nestjs/common';
import { GatewayManagerController } from './gateway-manager.controller';
import { GatewayManagerService } from './gateway-manager.service';

@Module({
  providers: [GatewayManagerService],
  controllers: [GatewayManagerController],
  exports: [GatewayManagerService],
})
export class GatewayManagerModule {}
