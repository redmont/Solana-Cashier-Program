import * as crypto from 'crypto';

export const validateBody = (
  body: string,
  signature: string,
  signingKeys: string[],
) => {
  if (signingKeys.length === 0) {
    return true;
  }

  for (const signingKey of signingKeys) {
    const hmac = crypto.createHmac('sha256', signingKey);
    hmac.update(body, 'utf8');
    const digest = hmac.digest('hex');
    if (signature === digest) {
      return true;
    }
  }

  return false;
};
