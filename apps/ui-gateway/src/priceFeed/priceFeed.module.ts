import { Module } from '@nestjs/common';
import { PriceFeedController } from './priceFeed.controller';
import { PriceFeedService } from './priceFeed.service';
import { GatewayModule } from '@/gateway';

@Module({
  imports: [GatewayModule],
  providers: [PriceFeedService],
  controllers: [PriceFeedController],
})
export class PriceFeedModule {}
