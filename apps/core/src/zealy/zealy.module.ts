import { Module } from '@nestjs/common';
import { ZealyService } from './zealy.service';
import { ZealyController } from './zealy.controller';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [UsersModule],
  providers: [ZealyService],
  controllers: [ZealyController],
})
export class ZealyModule {}
