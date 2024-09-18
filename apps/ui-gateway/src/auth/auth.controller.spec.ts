import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GetNonceDto, GetTokenDto } from './auth.controller';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            getNonceMessage: jest.fn(),
            getToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getNonce', () => {
    it('should return a nonce message when the request is from a private network', async () => {
      const getNonceDto: GetNonceDto = {
        walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      };
      const ip = '192.168.0.1';

      const expectedMessage =
        'Welcome to Brawlers!\nSign this message to continue.\n\nsome-nonce';
      (authService.getNonceMessage as jest.Mock).mockResolvedValue(
        expectedMessage,
      );

      const result = await controller.getNonce(ip, getNonceDto);

      expect(authService.getNonceMessage).toHaveBeenCalledWith(
        getNonceDto.walletAddress,
      );
      expect(result).toEqual({ message: expectedMessage });
    });

    it('should throw an exception when the request is not from a private network', async () => {
      const getNonceDto: GetNonceDto = {
        walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      };
      const ip = '8.8.8.8'; // Public IP

      await expect(controller.getNonce(ip, getNonceDto)).rejects.toThrow(
        new HttpException('Forbidden', HttpStatus.FORBIDDEN),
      );
    });
  });

  describe('getToken', () => {
    it('should return a token when the request is from a private network', async () => {
      const getTokenDto: GetTokenDto = {
        walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
        message:
          'Welcome to Brawlers!\nSign this message to continue.\n\nsome-nonce',
        signedMessage: '0xsignedmessage',
        username: 'testuser',
      };
      const ip = '192.168.0.1';

      const expectedToken = { access_token: 'some-jwt-token' };
      (authService.getToken as jest.Mock).mockResolvedValue(expectedToken);

      const result = await controller.getToken(ip, getTokenDto);

      expect(authService.getToken).toHaveBeenCalledWith(
        getTokenDto.walletAddress,
        getTokenDto.message,
        getTokenDto.signedMessage,
        getTokenDto.username,
        undefined,
      );
      expect(result).toEqual(expectedToken);
    });

    it('should throw an exception when the request is not from a private network', async () => {
      const getTokenDto: GetTokenDto = {
        walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
        message:
          'Welcome to Brawlers!\nSign this message to continue.\n\nsome-nonce',
        signedMessage: '0xsignedmessage',
        username: 'testuser',
      };
      const ip = '8.8.8.8'; // Public IP

      await expect(controller.getToken(ip, getTokenDto)).rejects.toThrow(
        new HttpException('Forbidden', HttpStatus.FORBIDDEN),
      );
    });
  });
});
