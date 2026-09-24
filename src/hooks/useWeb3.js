import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { ARC_MAINNET, ARC_TESTNET, CONTRACT_ABI, CONTRACT_BYTECODE } from '../config/constants';

export function useWeb3() {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState('0.00');
  const [isConnecting, setIsConnecting] = useState(false);
  const [targetNetwork, setTargetNetwork] = useState(ARC_MAINNET);
  const [deployedContractAddress, setDeployedContractAddress] = useState(
    () => localStorage.getItem('arcsplit_custom_contract') || ARC_MAINNET.defaultContract
  );

  const isArc = chainId === targetNetwork.chainId;

  const refreshBalance = useCallback(async (userAddress, provider) => {
    if (!userAddress || !provider) return;
    try {
      const balWei = await provider.getBalance(userAddress);
      setBalance(Number(ethers.formatEther(balWei)).toFixed(4));
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert('Web3 wallet was not detected. Please install MetaMask, Rabby, or Coinbase Wallet.');
      return;
    }

    setIsConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const network = await provider.getNetwork();
      const currentChainId = Number(network.chainId);

      setAccount(accounts[0]);
      setChainId(currentChainId);

      await refreshBalance(accounts[0], provider);
    } catch (err) {
      console.error('Wallet connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  }, [refreshBalance]);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setChainId(null);
    setBalance('0.00');
  }, []);

  const switchNetwork = useCallback(async (networkConfig = targetNetwork) => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkConfig.chainIdHex }],
      });
    } catch (switchError) {
      if (switchError.code === 4902 || switchError.message?.includes('unrecognized') || switchError.code === -32603) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: networkConfig.chainIdHex,
                chainName: networkConfig.name,
                rpcUrls: [networkConfig.rpcUrl],
                nativeCurrency: networkConfig.nativeCurrency,
                blockExplorerUrls: [networkConfig.explorerUrl],
              },
            ],
          });
        } catch (addError) {
          console.error('Failed to add Arc network to wallet:', addError);
          throw addError;
        }
      } else {
        console.error('Failed to switch network:', switchError);
        throw switchError;
      }
    }
  }, [targetNetwork]);

  const toggleTargetNetwork = useCallback((useTestnet) => {
    const net = useTestnet ? ARC_TESTNET : ARC_MAINNET;
    setTargetNetwork(net);
    const saved = localStorage.getItem('arcsplit_custom_contract');
    if (!saved) {
      setDeployedContractAddress(net.defaultContract);
    }
  }, []);

  const setCustomContract = useCallback((addr) => {
    setDeployedContractAddress(addr);
    localStorage.setItem('arcsplit_custom_contract', addr);
  }, []);

  const resetContract = useCallback(() => {
    localStorage.removeItem('arcsplit_custom_contract');
    setDeployedContractAddress(targetNetwork.defaultContract);
  }, [targetNetwork]);

  // Robust deploy with gas fallback and 0x bytecode safety
  const deployFreshContract = useCallback(async () => {
    if (!window.ethereum) throw new Error('No Web3 wallet detected.');
    if (!account) throw new Error('Please connect your wallet first.');
    if (!isArc) {
      await switchNetwork();
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // Verify user has balance for gas (native USDC on Arc)
    const balWei = await provider.getBalance(account);
    if (balWei === 0n) {
      throw new Error(`Your wallet (${account.slice(0, 6)}...${account.slice(-4)}) has 0 USDC balance on ${targetNetwork.name}. You need a few cents of native USDC for gas.`);
    }

    const cleanBytecode = CONTRACT_BYTECODE.startsWith('0x')
      ? CONTRACT_BYTECODE
      : `0x${CONTRACT_BYTECODE}`;

    const factory = new ethers.ContractFactory(CONTRACT_ABI, cleanBytecode, signer);

    let deployOptions = {};
    try {
      const estimated = await signer.estimateGas({ data: cleanBytecode });
      deployOptions.gasLimit = (estimated * 130n) / 100n; // 30% gas buffer
    } catch (gasErr) {
      console.warn('Gas estimation failed, using safe fallback gasLimit (1,200,000):', gasErr);
      deployOptions.gasLimit = 1200000n;
    }

    console.log('Sending deployment transaction to Arc...');
    const contract = await factory.deploy(deployOptions);
    const deployTx = contract.deploymentTransaction();

    let newAddress;
    try {
      console.log('Waiting for deployment confirmation on Arc...');
      await contract.waitForDeployment();
      newAddress = await contract.getAddress();
    } catch (waitErr) {
      console.warn('Direct waitForDeployment timed out or failed to parse receipt, querying tx receipt directly:', waitErr);
      if (deployTx?.hash) {
        const receipt = await provider.waitForTransaction(deployTx.hash, 1, 45000);
        if (receipt?.contractAddress) {
          newAddress = receipt.contractAddress;
        } else {
          throw waitErr;
        }
      } else {
        throw waitErr;
      }
    }

    setCustomContract(newAddress);
    await refreshBalance(account, provider);

    return {
      address: newAddress,
      txHash: deployTx.hash,
      explorerUrl: `${targetNetwork.explorerUrl}/address/${newAddress}`,
    };
  }, [account, isArc, targetNetwork, switchNetwork, setCustomContract, refreshBalance]);

  // Execute Split Native USDC
  const executeSplit = useCallback(
    async ({ recipients, basisPoints, totalAmountUsdc, memo }) => {
      if (!window.ethereum) throw new Error('No Web3 wallet detected.');
      if (!account) throw new Error('Please connect your wallet first.');
      if (!isArc) {
        await switchNetwork();
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const valueWei = ethers.parseEther(totalAmountUsdc.toString());

      // Check balance
      const balWei = await provider.getBalance(account);
      if (balWei < valueWei) {
        throw new Error(`Insufficient USDC balance. You have ${ethers.formatEther(balWei)} USDC, but transaction requires ${totalAmountUsdc} USDC + gas.`);
      }

      // Check if target contract exists
      const code = await provider.getCode(deployedContractAddress);
      const contractExists = code && code !== '0x' && code !== '0x0';

      if (!contractExists) {
        throw new Error(
          `Contract not found at ${deployedContractAddress} on ${targetNetwork.name}. Please go to the 'Contract Deployer' tab to deploy your dedicated instance with 1 click!`
        );
      }

      const contract = new ethers.Contract(deployedContractAddress, CONTRACT_ABI, signer);

      let txOptions = { value: valueWei };
      try {
        const estimated = await contract.splitNative.estimateGas(recipients, basisPoints, memo || '', {
          value: valueWei,
        });
        txOptions.gasLimit = (estimated * 130n) / 100n;
      } catch (err) {
        console.warn('Gas estimation failed for splitNative, using fallback gas limit:', err);
        txOptions.gasLimit = 400000n;
      }

      const tx = await contract.splitNative(recipients, basisPoints, memo || '', txOptions);
      const receipt = await tx.wait();
      await refreshBalance(account, provider);

      return {
        hash: tx.hash,
        receipt,
        blockNumber: receipt.blockNumber,
        explorerUrl: `${targetNetwork.explorerUrl}/tx/${tx.hash}`,
      };
    },
    [account, isArc, deployedContractAddress, targetNetwork, switchNetwork, refreshBalance]
  );

  // Listen to account and network changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        const provider = new ethers.BrowserProvider(window.ethereum);
        refreshBalance(accounts[0], provider);
      } else {
        disconnectWallet();
      }
    };

    const handleChainChanged = (chainHex) => {
      setChainId(parseInt(chainHex, 16));
      if (account) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        refreshBalance(account, provider);
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    const checkConnection = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_accounts', []);
        if (accounts.length > 0) {
          const network = await provider.getNetwork();
          setAccount(accounts[0]);
          setChainId(Number(network.chainId));
          refreshBalance(accounts[0], provider);
        }
      } catch (err) {
        console.error('Initial wallet check failed:', err);
      }
    };
    checkConnection();

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [account, refreshBalance, disconnectWallet]);

  return {
    account,
    chainId,
    balance,
    isConnecting,
    isArc,
    targetNetwork,
    deployedContractAddress,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    toggleTargetNetwork,
    setCustomContract,
    resetContract,
    executeSplit,
    deployFreshContract,
  };
}
