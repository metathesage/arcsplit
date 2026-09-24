import contractData from '../contracts/ArcSplitData.json';

export const ARC_MAINNET = {
  chainId: 5042,
  chainIdHex: '0x13b2',
  name: 'Arc Mainnet',
  rpcUrl: 'https://rpc.mainnet.arc.io',
  explorerUrl: 'https://explorer.arc.io',
  nativeCurrency: {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 18,
  },
  defaultContract: '0x8A14c33076e0c651F10705E3f757270275C68b81',
};

export const ARC_TESTNET = {
  chainId: 5042002,
  chainIdHex: '0x4cef72',
  name: 'Arc Testnet',
  rpcUrl: 'https://rpc.testnet.arc.io',
  explorerUrl: 'https://explorer.testnet.arc.io',
  nativeCurrency: {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 18,
  },
  defaultContract: '0x9E26388C83f73619eb14f32aB56B3A8810777Ce2',
};

export const CONTRACT_ABI = contractData.abi;
export const CONTRACT_BYTECODE = contractData.bytecode.startsWith('0x')
  ? contractData.bytecode
  : `0x${contractData.bytecode}`;

export const PRESET_SPLITS = [
  { label: 'Equal Split', value: 'equal' },
  { label: '50 / 50', value: '50-50', count: 2, shares: [50, 50] },
  { label: '70 / 30', value: '70-30', count: 2, shares: [70, 30] },
  { label: '60 / 20 / 20', value: '60-20-20', count: 3, shares: [60, 20, 20] },
  { label: 'Custom', value: 'custom' },
];

export const DEMO_RECIPIENTS = [
  { address: '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4', share: 60, label: 'Core Protocol' },
  { address: '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2', share: 40, label: 'Design & Infra' },
];
