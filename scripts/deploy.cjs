/**
 * Arc Network Deploy Script
 *
 * Usage:
 *   node scripts/deploy.cjs --network mainnet --private-key 0x...
 *   node scripts/deploy.cjs --network testnet --private-key 0x...
 */
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const contractData = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../src/contracts/ArcSplitData.json'), 'utf8')
);

const NETWORKS = {
  mainnet: {
    name: 'Arc Mainnet',
    rpc: 'https://rpc.mainnet.arc.io',
    chainId: 5042,
    explorer: 'https://explorer.arc.io',
  },
  testnet: {
    name: 'Arc Testnet',
    rpc: 'https://rpc.testnet.arc.io',
    chainId: 5042002,
    explorer: 'https://explorer.testnet.arc.io',
  },
};

async function main() {
  const args = process.argv.slice(2);
  const networkArgIndex = args.indexOf('--network');
  const pkArgIndex = args.indexOf('--private-key');

  const networkKey = (networkArgIndex !== -1 ? args[networkArgIndex + 1] : 'mainnet') || 'mainnet';
  const privateKey = (pkArgIndex !== -1 ? args[pkArgIndex + 1] : process.env.PRIVATE_KEY);

  const network = NETWORKS[networkKey];
  if (!network) {
    console.error(`Unknown network: ${networkKey}. Available: mainnet, testnet`);
    process.exit(1);
  }

  if (!privateKey) {
    console.error('Please provide a private key via --private-key <0x...> or PRIVATE_KEY env variable.');
    process.exit(1);
  }

  console.log(`Connecting to ${network.name} (${network.rpc}, Chain ID: ${network.chainId})...`);
  const provider = new ethers.JsonRpcProvider(network.rpc);
  const wallet = new ethers.Wallet(privateKey, provider);

  const balance = await provider.getBalance(wallet.address);
  console.log(`Deployer Address: ${wallet.address}`);
  console.log(`Deployer Balance: ${ethers.formatEther(balance)} USDC`);

  const bytecode = contractData.bytecode.startsWith('0x') ? contractData.bytecode : `0x${contractData.bytecode}`;

  console.log('Deploying ArcSplit contract...');
  const factory = new ethers.ContractFactory(contractData.abi, bytecode, wallet);
  
  let deployOptions = {};
  try {
    const estimated = await wallet.estimateGas({ data: bytecode });
    deployOptions.gasLimit = (estimated * 125n) / 100n;
  } catch (err) {
    console.warn('Gas estimation failed, using fallback gas limit: 1,500,000');
    deployOptions.gasLimit = 1500000n;
  }

  const contract = await factory.deploy(deployOptions);
  console.log(`Transaction sent: ${contract.deploymentTransaction().hash}`);
  console.log('Waiting for confirmation on Arc...');
  await contract.waitForDeployment();

  const deployedAddress = await contract.getAddress();
  console.log('\n======================================================');
  console.log(`⚡ ArcSplit successfully deployed to: ${deployedAddress}`);
  console.log(` Explorer: ${network.explorer}/address/${deployedAddress}`);
  console.log(' Built by @metathesage for Arc Network');
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
