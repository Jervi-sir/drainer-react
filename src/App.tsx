import { useEffect, useState } from 'react';
import { ConnectionProvider, WalletProvider, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Import the wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

// First, create a wrapper component for the wallet providers
const WalletWrapper = ({ children }) => {
  const network = 'devnet'; // You can change this to 'mainnet-beta' or 'testnet'
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

// Main component with the connect button and balance display
const WalletConnectButton = () => {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState(null);

  // Fetch balance when wallet is connected
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

  return (
    <div>
      {/* WalletMultiButton handles connect/disconnect automatically */}
      <WalletMultiButton />
      
      {connected && publicKey && (
        <div style={{ marginTop: '1rem' }}>
          <p>Wallet Address: {publicKey.toString()}</p>
          <p>Balance: {balance !== null ? `${balance.toFixed(4)} SOL` : 'Loading...'}</p>
        </div>
      )}
    </div>
  );
};

// App component
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