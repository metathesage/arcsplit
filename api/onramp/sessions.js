import { createOnrampServerKit, KitError } from '@circle-fin/onramp-kit/server';

let serverKit = null;
function getServerKit() {
  if (!serverKit) {
    const apiKey = process.env.CIRCLE_API_KEY;
    if (!apiKey) {
      throw new Error('Missing CIRCLE_API_KEY environment variable');
    }
    serverKit = createOnrampServerKit({
      apiKey,
      referrerDomain: process.env.VERCEL_PROJECT_PRODUCTION_URL || 'arcsplit-two.vercel.app',
    });
  }
  return serverKit;
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { appUserId, destinationAddress, assets } = req.body || {};

    if (!destinationAddress) {
      return res.status(400).json({ message: 'Missing destinationAddress' });
    }

    const server = getServerKit();
    const session = await server.createSession({
      appUserId: appUserId || `user_${Date.now()}`,
      destinationAddress,
      assets: assets || {
        tokens: ['USDC'],
        chains: ['arc'],
      },
    });

    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(session);
  } catch (error) {
    console.error('Error minting Onramp session:', error);
    if (error instanceof KitError) {
      let status = 500;
      switch (error.type) {
        case 'INPUT': status = 400; break;
        case 'RATE_LIMIT': status = 429; break;
        case 'NETWORK': status = 504; break;
        case 'SERVICE':
        case 'RPC': status = 502; break;
        default: status = 500;
      }
      return res.status(status).json({ message: error.message, type: error.type });
    }
    return res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
}
