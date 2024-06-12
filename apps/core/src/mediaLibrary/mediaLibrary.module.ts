import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MediaLibraryController } from './mediaLibrary.controller';
import { MediaLibraryService } from './mediaLibrary.service';
import { DynamooseModule } from 'nestjs-dynamoose';
import { ConfigService } from '@nestjs/config';
import { MediaSchema } from './media.schema';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../', 'media'),
      serveRoot: '/media',
      serveStaticOptions: {
        index: false,
      },
    }),
    DynamooseModule.forFeatureAsync([
      {
        name: 'media',
        useFactory: (_, configService: ConfigService) => {
          return {
            schema: MediaSchema,
            options: {
              tableName: configService.get<string>('tableName'),
              create: configService.get<boolean>('isDynamoDbLocal'),
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [MediaLibraryService],
  controllers: [MediaLibraryController],
})
export class MediaLibraryModule {}
