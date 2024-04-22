import { Module } from '@nestjs/common';
import { DynamooseModule } from 'nestjs-dynamoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { NonceSchema } from './nonce.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthModule } from 'src/jwt-auth/jwt-auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DynamooseModule.forFeatureAsync([
      {
        name: 'nonce',
        useFactory: (_, configService: ConfigService) => {
          return {
            schema: NonceSchema,
            options: {
              tableName: configService.get<string>('tableName'),
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
    JwtAuthModule,
  ],
  providers: [AuthService, JwtService],
  controllers: [AuthController],
})
export class AuthModule {}
