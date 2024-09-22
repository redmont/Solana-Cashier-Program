import { Bet, MatchStatus, Fighter } from '@/types';
import { TickerPrice } from '@bltzr-gg/brawlers-ui-gateway-messages';
import { atom } from 'jotai';
import { groupBy } from 'lodash';
import { accountAddressAtom } from './account';
import { calculateWinRate } from '@/utils';
import { orderBookAtom } from './view';

export const betsAtom = atom<Bet[]>([]);
export const matchIdAtom = atom<string | null>(null);
export const fightersAtom = atom<[Fighter | null, Fighter | null]>([
  null,
  null,
]);
export const matchSeriesAtom = atom<string | null>(null);
export const preMatchVideoUrlAtom = atom<string>('');
export const matchStatusAtom = atom<MatchStatus>('');
export const streamIdAtom = atom<string | null>(null);
export const poolOpenStartTimeAtom = atom<string | null>(null);
export const matchStartTimeAtom = atom<string | null>(null);
export const tickersAtom = atom<TickerPrice[]>();

export const fighterBettingInformationAtom = atom((get) => {
  const fighters = get(fightersAtom);
  const bets = groupBy(get(betsAtom), 'fighter');
  const accountAddress = get(accountAddressAtom);
  const orderBook = get(orderBookAtom);

  return fighters
    .filter((f): f is Fighter => f !== null)
    .map((fighter) => {
      const { total, stake } = bets[fighter.codeName]
        ?.filter((bet) => bet.orderBook === orderBook)
        .reduce(
          (acc, bet) => ({
            total: acc.total + +bet.amount,
            stake:
              acc.stake +
              (bet.walletAddress === accountAddress ? +bet.amount : 0),
          }),
          { total: 0, stake: 0 },
        ) ?? { total: 0, stake: 0 };

      return {
        fighter,
        list:
          bets[fighter.codeName]
            ?.filter((bet) => bet.orderBook === orderBook)
            .slice()
            .sort((a, b) => +b.amount - +a.amount) ?? [],
        total,
        stake,
      };
    })
    .map((info, index, infos) => {
      const opponentTotal = infos[(index + 1) % 2]?.total;

      return {
        ...info,
        winRate: calculateWinRate(info.total, opponentTotal),
      };
    });
});

const PRICE_MOVEMENT_AVERAGES_PERIOD = 10 * 1000;

export const priceMovementAverages = atom((get) => {
  const fighters = get(fightersAtom);
  const tickers = get(tickersAtom);
  const cutoff = Date.now() - PRICE_MOVEMENT_AVERAGES_PERIOD;

  return fighters.map((fighter) => {
    const ticker = fighter?.ticker;
    const filteredPrices = tickers?.filter((t) => t.ticker === ticker) ?? [];
    const cutoffIndex = filteredPrices?.findIndex(
      (p) => new Date(p.timestamp).getTime() > cutoff,
    );
    const prices = filteredPrices.slice(cutoffIndex - 1);
    const startPrice = prices.at(0)?.price;
    const endPrice = prices.at(prices.length - 1)?.price;

    const priceDelta =
      startPrice !== undefined && endPrice !== undefined
        ? startPrice - endPrice
        : 0;

    const priceMovementAverage = startPrice ? priceDelta / startPrice : 0;

    return {
      ticker,
      priceDelta,
      priceMovementAverage,
      price: endPrice ?? 0,
    };
  });
});

export const matchWinnerAtom = atom<string | null>(null);

export type MatchResult = {
  matchId: string;
  winner: string;
  betAmount: string;
  winAmount: string;
};

export const matchResultAtom = atom<MatchResult | null>(null);
