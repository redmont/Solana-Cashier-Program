import { AuthModule } from '@/auth/auth.module';
import { NonceSchema } from '@/auth/nonce.schema';
import { GlobalClientsModule } from '@/globalClientsModule';
import { ConfigModule } from '@nestjs/config';
import { DynamooseModule } from 'nestjs-dynamoose';

export const UiGatewayTestImports = [
  ConfigModule.forRoot({
    load: [
      () => ({
        natsUri: '',
      }),
    ],
  }),
  AuthModule,
  DynamooseModule.forRoot({
    local: 'http://localhost:8001',
    aws: { region: 'local' },
  }),
  DynamooseModule.forFeature([
    {
      name: 'nonce',
      schema: NonceSchema,
    },
  ]),
  GlobalClientsModule,
];
