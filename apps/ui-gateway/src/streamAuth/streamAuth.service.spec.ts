import { ConfigService } from '@nestjs/config';
import { StreamAuthService } from './streamAuth.service';

describe('StreamAuthService', () => {
  let streamAuthService: StreamAuthService;

  const configService = new ConfigService();
  configService.get = jest.fn().mockImplementation((key: string) => {
    switch (key) {
      case 'streamAuthParentTokenId':
        return 'parentTokenId';
      case 'streamAuthParentTokenSecret':
        return 'parentTokenSecret';
    }
  });

  beforeEach(() => {
    streamAuthService = new StreamAuthService(configService);
  });

  describe('generateToken', () => {
    it('should generate a valid verifiable token', () => {
      const token = streamAuthService.generateToken('username');
      const decoded = streamAuthService.validateToken('username', token);
      expect(decoded).toBe(true);
    });
  });
});
