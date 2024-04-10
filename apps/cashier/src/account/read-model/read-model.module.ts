import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DynamooseModule } from "nestjs-dynamoose";
import { ReadModelService } from "./read-model.service";
import { AccountSchema } from "./account.schema";

@Module({
  imports: [
    DynamooseModule.forFeatureAsync([
      {
        name: "accountModel",
        useFactory: (_, configService: ConfigService) => {
          return {
            schema: AccountSchema,
            options: {
              tableName: configService.get<string>("READ_MODEL_TABLE_NAME"),
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [ReadModelService],
  exports: [ReadModelService],
})
export class ReadModelModule {}
