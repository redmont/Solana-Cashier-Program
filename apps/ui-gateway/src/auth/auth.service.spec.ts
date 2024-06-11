import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UiGatewayTestImports } from '@/test/ui-gateway-test.imports';
import { JWT_AUTH_SERVICE } from '@/jwtAuth/jwtAuth.constants';
import { IJwtAuthService } from '@/jwtAuth/jwtAuth.interface';

describe('AuthService', () => {
  let service: AuthService;

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
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
