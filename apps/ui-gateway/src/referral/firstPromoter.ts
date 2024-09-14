import axios from 'axios';

export async function registerLead(args: {
  apiKey: string;
  uid: string;
  ref_id: string;
  ip?: string;
}) {
  const res = await axios.post(
    'https://firstpromoter.com/api/v1/track/signup',
    new URLSearchParams({
      uid: args.uid,
      ref_id: args.ref_id,
      ip: args.ip,
    }),
    {
      headers: {
        'x-api-key': args.apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );
  return res;
}

export async function updateLead(args: {
  apiKey: string;
  uid: string;
  updates: Partial<{
    uid: string;
    ref_id: string;
    state: 'subscribed' | 'signup' | 'active' | 'denied' | 'cancelled';
  }>;
}) {
  const res = await axios.put(
    'https://firstpromoter.com/api/v1/leads/update',
    new URLSearchParams({
      uid: args.uid,
      //   new_uid: args.updates.uid,
      new_ref_id: args.updates.ref_id,
      //   state: args.updates.state,
    }),
    {
      headers: {
        'x-api-key': args.apiKey,
      },
    },
  );

  return res;
}

export async function getLead(args: { apiKey: string; uid: string }) {
  const res = await axios.get('https://firstpromoter.com/api/v1/leads/show', {
    params: {
      uid: args.uid,
    },
    headers: {
      'x-api-key': args.apiKey,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return res;
}

export async function trackSale(args: {
  apiKey: string;
  uid: string;
  event_id: string;
  /* In cents */
  amount: number;
  currency?: string;
  quantity?: number;
}) {
  const { apiKey, uid, event_id, amount, currency = 'USD' } = args;
  const res = await axios.post(
    'https://firstpromoter.com/api/v1/track/signup',
    new URLSearchParams({
      uid,
      event_id,
      amount: amount.toString(),
      currency,
    }),
    {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );
  return res;
}
