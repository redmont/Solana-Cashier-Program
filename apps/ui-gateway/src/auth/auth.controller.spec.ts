import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { UiGatewayTestImports } from '@/test/ui-gateway-test.imports';
import { AuthService } from './auth.service';
import { JWT_AUTH_SERVICE } from '@/jwtAuth/jwtAuth.constants';
import { IJwtAuthService } from '@/jwtAuth/jwtAuth.interface';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: UiGatewayTestImports,
      providers: [
        {
          provide: JWT_AUTH_SERVICE,
          useFactory: () => {
            return {} as IJwtAuthService;
          },
        },
        AuthService,
      ],
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
