import { creditDecimals } from './constants';

export const creditsToUsd = (credits: number) => {
  return credits / 10 ** creditDecimals;
};
