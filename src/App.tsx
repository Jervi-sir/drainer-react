import React, { useEffect, useState } from 'react';
import { ConnectionProvider, WalletProvider, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

import '@solana/wallet-adapter-react-ui/styles.css';

const WalletWrapper = ({ children }) => {
  const network = 'devnet';
  const endpoint = clusterApiUrl(network);
  const wallets = [new PhantomWalletAdapter()];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

const WalletConnectButton = () => {
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();
  const [balance, setBalance] = useState(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionStatus, setTransactionStatus] = useState('');

  // Fetch balance
  useEffect(() => {
    if (publicKey) {
      const getBalance = async () => {
        try {
          const balanceInLamports = await connection.getBalance(publicKey);
          const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;
          setBalance(balanceInSOL);
        } catch (error) {
          console.error('Error fetching balance:', error);
        }
      };
      getBalance();
    }
  }, [publicKey, connection]);

  // Handle transaction
  const handleSendTransaction = async (e) => {
    e.preventDefault();
    if (!publicKey || !connected) {
      setTransactionStatus('Please connect your wallet first');
      return;
    }

    try {
      setTransactionStatus('Processing transaction...');
      
      // Create transaction
      const recipientPubKey = new PublicKey(recipient);
      const amountInLamports = parseFloat(amount) * LAMPORTS_PER_SOL;

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubKey,
          lamports: amountInLamports,
        })
      );

      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      
      // Confirm transaction
      const latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature
      });

      setTransactionStatus(`Transaction successful! Signature: ${signature}`);
      
      // Refresh balance
      const newBalance = await connection.getBalance(publicKey);
      setBalance(newBalance / LAMPORTS_PER_SOL);
      
      // Reset form
      setRecipient('');
      setAmount('');
    } catch (error) {
      console.error('Transaction error:', error);
      setTransactionStatus(`Transaction failed: ${error.message}`);
    }
  };

  return (
    <div>
      <WalletMultiButton />
      
      {connected && publicKey && (
        <div style={{ marginTop: '1rem' }}>
          <p>Wallet Address: {publicKey.toString()}</p>
          <p>Balance: {balance !== null ? `${balance.toFixed(4)} SOL` : 'Loading...'}</p>
          
          <form onSubmit={handleSendTransaction} style={{ marginTop: '1rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label>
                Recipient Address:
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  style={{ width: '100%', marginTop: '0.5rem' }}
                  placeholder="Enter recipient's public key"
                  required
                />
              </label>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label>
                Amount (SOL):
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ width: '100%', marginTop: '0.5rem' }}
                  placeholder="Enter amount in SOL"
                  required
                />
              </label>
            </div>
            
            <button 
              type="submit" 
              style={{ 
                backgroundColor: '#4CAF50', 
                color: 'white', 
                padding: '0.5rem 1rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Send SOL
            </button>
          </form>
          
          {transactionStatus && (
            <p style={{ marginTop: '1rem' }}>{transactionStatus}</p>
          )}
        </div>
      )}
    </div>
  );
};

const App = () => {
  return (
    <WalletWrapper>
      <div style={{ padding: '20px' }}>
        <h1>Solana Wallet Connector</h1>
        <WalletConnectButton />
      </div>
    </WalletWrapper>
  );
};

export default App;