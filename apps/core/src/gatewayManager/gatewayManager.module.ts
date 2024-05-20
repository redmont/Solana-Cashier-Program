import { Module } from '@nestjs/common';
import { GatewayManagerController } from './gatewayManager.controller';
import { GatewayManagerService } from './gatewayManager.service';

@Module({
  providers: [GatewayManagerService],
  controllers: [GatewayManagerController],
  exports: [GatewayManagerService],
})
export class GatewayManagerModule {}
