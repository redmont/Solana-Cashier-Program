import { AccountController } from './account.controller';

describe('AccountController', () => {
  describe('handleEnsureAccountExists', () => {
    const controller = new AccountController(null, null);

    it('should pass', () => {
      expect(true).toBe(true);
    });
  });
});
