import { IS_TESTNET } from '../constant';

export function getPriceEmoji(price = 0) {
  if (price >= 100) return '🍾';
  if (price >= 50) return '🥩';
  if (price >= 10) return '🍰';
  if (price > 0) return '☕️';
  return '';
}

export function getSponsorLink(likerID) {
  return `${
    IS_TESTNET ? 'https://rinkeby.liker.land' : 'https://liker.land'
  }/${likerID}/civic`;
}
