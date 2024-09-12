import dayjs from '@/dayjs';
import { PriceFeedService } from './priceFeed.service';

describe('PriceFeedService', () => {
  describe('handlePriceFeedEvent', () => {
    it('should only keep 30 timestamps in cache', async () => {
      const gateway = {
        publish: jest.fn(),
      };
      const priceFeedService = new PriceFeedService(gateway as any);

      await priceFeedService.handleCurrentTickers([
        { fighter: 'fighter1', ticker: 'symbol' },
      ]);

      const now = dayjs.utc();

      // Send 60 timestamps
      for (let i = 0; i < 60; i++) {
        await priceFeedService.handlePriceFeedEvent(
          'symbol',
          10 + i,
          now.add(i * 10 + 5, 'second').unix() * 1000,
        );
      }

      // Expect only the last 35 to be kept
      const cache = priceFeedService['cache'].get('symbol');
      expect(cache.size).toBe(35);
    });
  });
});
