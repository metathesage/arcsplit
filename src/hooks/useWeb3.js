import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { ARC_MAINNET, ARC_TESTNET, CONTRACT_ABI, CONTRACT_BYTECODE } from '../config/constants';

export function useWeb3() {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState('0.00');
  const [arcBalance, setArcBalance] = useState('0.00');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);
  const [targetNetwork, setTargetNetwork] = useState(ARC_MAINNET);
  const [deployedContractAddress, setDeployedContractAddress] = useState(
    () => localStorage.getItem('arcsplit_custom_contract') || ARC_MAINNET.defaultContract
  );

  const isArc = chainId === targetNetwork.chainId;

  const refreshBalance = useCallback(async (userAddress, provider) => {
    if (!userAddress) return;
    try {
      // 1. Fetch balance from user's active wallet provider
      if (provider) {
        const balWei = await provider.getBalance(userAddress);
        setBalance(Number(ethers.formatEther(balWei)).toFixed(4));
      }

      // 2. Fetch native USDC balance directly from Arc Network RPC
      try {
        const arcRpcProvider = new ethers.JsonRpcProvider(targetNetwork.rpcUrl);
        const arcBalWei = await arcRpcProvider.getBalance(userAddress);
        setArcBalance(Number(ethers.formatEther(arcBalWei)).toFixed(4));
      } catch (arcErr) {
        console.warn('Failed to query Arc RPC directly:', arcErr);
      }
    } catch (err) {
      console.error('Failed to fetch wallet balance:', err);
    }
  }, [targetNetwork]);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert('Web3 wallet was not detected. Please install MetaMask, Rabby, or Coinbase Wallet.');
      return;
    }

    setIsConnecting(true);
    try {
      localStorage.removeItem('arcsplit_manual_disconnect');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const network = await provider.getNetwork();
      const currentChainId = Number(network.chainId);

      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        setChainId(currentChainId);
        await refreshBalance(accounts[0], provider);
      }
    } catch (err) {
      console.error('Wallet connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  }, [refreshBalance]);

  const disconnectWallet = useCallback(() => {
    localStorage.setItem('arcsplit_manual_disconnect', 'true');
    setAccount(null);
    setChainId(null);
    setBalance('0.00');
    setArcBalance('0.00');
  }, []);

  const switchNetwork = useCallback(async (networkConfig = targetNetwork) => {
    if (!window.ethereum) {
      alert('No Web3 wallet detected.');
      return false;
    }

    setIsSwitchingNetwork(true);
    try {
      // Step 1: Attempt direct switch
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkConfig.chainIdHex }],
      });
    } catch (switchError) {
      // If user explicitly rejected the prompt, do not nag
      if (
        switchError.code === 4001 ||
        switchError.message?.toLowerCase().includes('user rejected') ||
        switchError.message?.toLowerCase().includes('user denied')
      ) {
        console.log('User cancelled network switch.');
        setIsSwitchingNetwork(false);
        return false;
      }

      // Step 2: Fallback to adding the network
      console.log('Attempting to add Arc network to wallet...', switchError);
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: networkConfig.chainIdHex,
              chainName: networkConfig.name,
              rpcUrls: [networkConfig.rpcUrl],
              nativeCurrency: {
                name: networkConfig.nativeCurrency.name,
                symbol: networkConfig.nativeCurrency.symbol,
                decimals: networkConfig.nativeCurrency.decimals,
              },
              blockExplorerUrls: [networkConfig.explorerUrl],
            },
          ],
        });
      } catch (addError) {
        if (
          addError.code === 4001 ||
          addError.message?.toLowerCase().includes('user rejected') ||
          addError.message?.toLowerCase().includes('user denied')
        ) {
          console.log('User cancelled adding Arc network.');
          setIsSwitchingNetwork(false);
          return false;
        }
        console.error('Failed to add Arc network to wallet:', addError);
        alert(`Failed to add ${networkConfig.name}: ${addError.message || addError}`);
        setIsSwitchingNetwork(false);
        return false;
      }
    }

    // Step 3: Proactively query and set current chainId immediately
    try {
      const chainHex = await window.ethereum.request({ method: 'eth_chainId' });
      const newChain = parseInt(chainHex, 16);
      setChainId(newChain);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_accounts', []);
      if (accounts && accounts[0]) {
        await refreshBalance(accounts[0], provider);
      }
    } catch (checkErr) {
      console.warn('Failed to verify chain after switch:', checkErr);
    } finally {
      setIsSwitchingNetwork(false);
    }

    return true;
  }, [targetNetwork, refreshBalance]);

  const toggleTargetNetwork = useCallback(async (useTestnet) => {
    const net = useTestnet ? ARC_TESTNET : ARC_MAINNET;
    setTargetNetwork(net);
    const saved = localStorage.getItem('arcsplit_custom_contract');
    if (!saved) {
      setDeployedContractAddress(net.defaultContract);
    }
    // If wallet is connected, automatically switch network
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_accounts', []);
        if (accounts.length > 0) {
          await switchNetwork(net);
        }
      } catch (err) {
        console.warn('Auto-switch on toggle error:', err);
      }
    }
  }, [switchNetwork]);

  const setCustomContract = useCallback((addr) => {
    setDeployedContractAddress(addr);
    localStorage.setItem('arcsplit_custom_contract', addr);
  }, []);

  const resetContract = useCallback(() => {
    localStorage.removeItem('arcsplit_custom_contract');
    setDeployedContractAddress(targetNetwork.defaultContract);
  }, [targetNetwork]);

  // Robust deploy with direct Arc RPC polling, zero-hang estimation, and raw bytecode transaction
  const deployFreshContract = useCallback(async (onProgress = () => {}) => {
    if (!window.ethereum) throw new Error('No Web3 wallet detected. Please install MetaMask, Rabby, or Coinbase Wallet.');
    
    onProgress('Connecting to wallet signer...');
    const provider = new ethers.BrowserProvider(window.ethereum);
    let currentAccount = account;
    if (!currentAccount) {
      const accounts = await provider.send('eth_requestAccounts', []);
      if (!accounts || accounts.length === 0) {
        throw new Error('Please connect your wallet to deploy.');
      }
      currentAccount = accounts[0];
      setAccount(currentAccount);
    }

    // Check chain directly from window.ethereum to avoid BrowserProvider caching issues
    const currentChainHex = await window.ethereum.request({ method: 'eth_chainId' });
    const currentChainIdNum = parseInt(currentChainHex, 16);
    if (currentChainIdNum !== targetNetwork.chainId) {
      onProgress(`Switching network to ${targetNetwork.name}...`);
      await switchNetwork();
      const verifiedChainHex = await window.ethereum.request({ method: 'eth_chainId' });
      if (parseInt(verifiedChainHex, 16) !== targetNetwork.chainId) {
        throw new Error(`Please approve switching your wallet to ${targetNetwork.name} (Chain ID: ${targetNetwork.chainId}).`);
      }
    }
    const freshProvider = new ethers.BrowserProvider(window.ethereum);

    onProgress('Verifying native USDC gas balance on Arc...');
    const arcRpc = new ethers.JsonRpcProvider(targetNetwork.rpcUrl);
    const balWei = await arcRpc.getBalance(currentAccount).catch(async () => {
      return await provider.getBalance(currentAccount);
    });

    if (balWei === 0n) {
      throw new Error(`Your wallet (${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}) has 0.0000 USDC balance on ${targetNetwork.name}. Arc requires a few cents of native USDC for gas. Please use the Relay Bridge to convert any token into Arc USDC.`);
    }

    onProgress('Preparing ArcSplit bytecode...');
    const signer = await freshProvider.getSigner();
    const cleanBytecode = CONTRACT_BYTECODE.startsWith('0x')
      ? CONTRACT_BYTECODE
      : `0x${CONTRACT_BYTECODE}`;

    let deployOptions = {};
    try {
      // Estimate gas against direct Arc RPC node so MetaMask never freezes
      const estimated = await arcRpc.estimateGas({
        from: currentAccount,
        data: cleanBytecode,
      });
      deployOptions.gasLimit = (estimated * 135n) / 100n; // 35% buffer (~940k)
    } catch (gasErr) {
      console.warn('Direct gas estimation fallback used (1,200,000):', gasErr);
      deployOptions.gasLimit = 1200000n;
    }

    onProgress('Please approve the deployment transaction in your wallet...');
    let txResponse;
    try {
      txResponse = await signer.sendTransaction({
        data: cleanBytecode,
        ...deployOptions,
      });
    } catch (deployErr) {
      if (
        deployErr.code === 'ACTION_REJECTED' ||
        deployErr.code === 4001 ||
        deployErr.message?.toLowerCase().includes('user rejected') ||
        deployErr.message?.toLowerCase().includes('user denied')
      ) {
        throw new Error('Deployment was rejected in your wallet.');
      }
      if (deployErr.message?.toLowerCase().includes('insufficient funds')) {
        throw new Error('Insufficient USDC funds for gas on Arc. Please bridge USDC using Relay.link.');
      }
      throw deployErr;
    }

    const txHash = txResponse.hash;
    onProgress(`Transaction broadcast! Hash: ${txHash.slice(0, 10)}... Polling Arc block confirmation...`, txHash);

    // Direct fast polling of Arc RPC instead of relying on browser wallet block events
    let receipt = null;
    const startTime = Date.now();
    const maxWaitMs = 60000; // 60s max timeout

    while (!receipt && Date.now() - startTime < maxWaitMs) {
      try {
        receipt = await arcRpc.getTransactionReceipt(txHash);
        if (receipt) break;
      } catch (pollErr) {
        // RPC might return null or error while in mempool
      }
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      onProgress(`Transaction broadcast (${txHash.slice(0, 10)}...) — waiting for Arc block confirmation (${elapsed}s)...`, txHash);
      await new Promise((r) => setTimeout(r, 1200));
    }

    // Fallback attempt via browser provider if direct RPC was delayed
    if (!receipt) {
      receipt = await provider.getTransactionReceipt(txHash).catch(() => null);
    }

    if (!receipt || !receipt.contractAddress) {
      throw new Error(`Deployment transaction sent (${txHash}), but receipt confirmation timed out. Check Arc Explorer: ${targetNetwork.explorerUrl}/tx/${txHash}`);
    }

    const newAddress = receipt.contractAddress;
    onProgress(`Deployment confirmed at ${newAddress}! Updating active instance...`, txHash);
    setCustomContract(newAddress);
    await refreshBalance(currentAccount, provider);

    return {
      address: newAddress,
      txHash: txHash,
      explorerUrl: `${targetNetwork.explorerUrl}/address/${newAddress}`,
    };
  }, [account, targetNetwork, switchNetwork, setCustomContract, refreshBalance]);

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
      
      let receipt = null;
      try {
        receipt = await Promise.race([
          tx.wait(),
          new Promise(async (resolve) => {
            const arcRpc = new ethers.JsonRpcProvider(targetNetwork.rpcUrl);
            const start = Date.now();
            while (Date.now() - start < 45000) {
              const r = await arcRpc.getTransactionReceipt(tx.hash).catch(() => null);
              if (r) return resolve(r);
              await new Promise((res) => setTimeout(res, 1200));
            }
            resolve(null);
          })
        ]);
      } catch (waitErr) {
        console.warn('tx.wait failed or timed out, trying direct RPC receipt:', waitErr);
        const arcRpc = new ethers.JsonRpcProvider(targetNetwork.rpcUrl);
        receipt = await arcRpc.getTransactionReceipt(tx.hash).catch(() => null);
      }

      await refreshBalance(account, provider);

      return {
        hash: tx.hash,
        receipt,
        blockNumber: receipt?.blockNumber || 0,
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
        localStorage.removeItem('arcsplit_manual_disconnect');
        setAccount(accounts[0]);
        const provider = new ethers.BrowserProvider(window.ethereum);
        refreshBalance(accounts[0], provider);
      } else {
        disconnectWallet();
      }
    };

    const handleChainChanged = (chainHex) => {
      setChainId(parseInt(chainHex, 16));
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        provider.send('eth_accounts', []).then((accounts) => {
          if (accounts && accounts[0]) {
            refreshBalance(accounts[0], provider);
          }
        }).catch(() => {});
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    const checkConnection = async () => {
      // Do not auto-reconnect if user explicitly clicked Disconnect
      if (localStorage.getItem('arcsplit_manual_disconnect') === 'true') {
        return;
      }
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
  }, [refreshBalance, disconnectWallet]);

  return {
    account,
    chainId,
    balance,
    arcBalance,
    isConnecting,
    isSwitchingNetwork,
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
    reloadBalance: () => {
      if (account && window.ethereum) {
        refreshBalance(account, new ethers.BrowserProvider(window.ethereum));
      }
    },
  };
}
