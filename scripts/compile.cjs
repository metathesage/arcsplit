const fs = require('fs');
const path = require('path');
const solc = require('solc');

const contractPath = path.resolve(__dirname, '../contracts/ArcSplit.sol');
const source = fs.readFileSync(contractPath, 'utf8');

const input = {
  language: 'Solidity',
  sources: {
    'ArcSplit.sol': {
      content: source,
    },
  },
  settings: {
    viaIR: true,
    optimizer: {
      enabled: true,
      runs: 200,
    },
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode'],
      },
    },
  },
};

console.log('Compiling ArcSplit.sol with viaIR...');
const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  let hasError = false;
  output.errors.forEach((err) => {
    if (err.severity === 'error') {
      console.error(err.formattedMessage);
      hasError = true;
    } else {
      console.warn(err.formattedMessage);
    }
  });
  if (hasError) {
    process.exit(1);
  }
}

const contract = output.contracts['ArcSplit.sol']['ArcSplit'];
const abi = contract.abi;
const rawBytecode = contract.evm.bytecode.object;
const bytecode = rawBytecode.startsWith('0x') ? rawBytecode : `0x${rawBytecode}`;

const outDir = path.resolve(__dirname, '../src/contracts');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(
  path.join(outDir, 'ArcSplitData.json'),
  JSON.stringify({ abi, bytecode }, null, 2)
);

console.log('Successfully compiled ArcSplit! Bytecode with 0x prefix saved to src/contracts/ArcSplitData.json');
