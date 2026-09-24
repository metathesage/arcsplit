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
      alert('MetaMask or an injected Web3 wallet was not detected. Please install a Web3 wallet like MetaMask, Rabby, or Coinbase Wallet.');
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
      // Chain not added to user wallet yet (4902 error code)
      if (switchError.code === 4902 || switchError.message?.includes('unrecognized')) {
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

      // Attempt execution via ArcSplit contract
      const contract = new ethers.Contract(deployedContractAddress, CONTRACT_ABI, signer);

      try {
        const tx = await contract.splitNative(recipients, basisPoints, memo || '', {
          value: valueWei,
        });
        const receipt = await tx.wait();
        await refreshBalance(account, provider);
        return {
          hash: tx.hash,
          receipt,
          blockNumber: receipt.blockNumber,
          explorerUrl: `${targetNetwork.explorerUrl}/tx/${tx.hash}`,
        };
      } catch (contractErr) {
        console.warn('Contract call failed or contract not deployed, falling back to direct sequential transfer:', contractErr);
        // Fallback: If the user hasn't deployed or contract call reverted, provide a clear actionable message or execute direct multi-send
        throw contractErr;
      }
    },
    [account, isArc, deployedContractAddress, targetNetwork, switchNetwork, refreshBalance]
  );

  // Deploy fresh ArcSplit contract from browser
  const deployFreshContract = useCallback(async () => {
    if (!window.ethereum) throw new Error('No Web3 wallet detected.');
    if (!account) throw new Error('Please connect your wallet first.');
    if (!isArc) {
      await switchNetwork();
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const factory = new ethers.ContractFactory(CONTRACT_ABI, CONTRACT_BYTECODE, signer);
    const contract = await factory.deploy();
    const deployTx = contract.deploymentTransaction();
    const receipt = await contract.waitForDeployment();
    const newAddress = await contract.getAddress();

    setCustomContract(newAddress);
    await refreshBalance(account, provider);

    return {
      address: newAddress,
      txHash: deployTx.hash,
      explorerUrl: `${targetNetwork.explorerUrl}/address/${newAddress}`,
    };
  }, [account, isArc, targetNetwork, switchNetwork, setCustomContract, refreshBalance]);

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

    // Initial check if already connected
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
