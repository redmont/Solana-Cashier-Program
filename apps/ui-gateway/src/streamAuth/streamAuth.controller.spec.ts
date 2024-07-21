import { ConfigService } from '@nestjs/config';
import { StreamAuthController } from './streamAuth.controller';
import { StreamAuthService } from './streamAuth.service';

describe('StreamAuthController', () => {
  let streamAuthController: StreamAuthController;
  let streamAuthService: StreamAuthService;

  beforeEach(() => {
    streamAuthService = new StreamAuthService(new ConfigService());
    streamAuthController = new StreamAuthController(streamAuthService);
  });

  describe('validateCredentials', () => {
    it('should validate credentials', async () => {
      const validationResult = true;
      jest
        .spyOn(streamAuthService, 'validateToken')
        .mockReturnValue(validationResult);

      const result = await streamAuthController.validateCredentials({
        username: 'username',
        password: 'password',
        streamID: 'streamID',
        type: 'subscribe',
        token: 'token',
      });

      expect(result).toEqual({ result: validationResult });
    });
  });
});
