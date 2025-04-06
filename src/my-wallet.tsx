import React from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

export function MyWallet() {
  const { connection } = useConnection();
  const { connected, wallet } = useWallet();
  const [balance, setBalance] = React.useState<number | null>(null);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (connected && wallet && (wallet as any).publicKey) {
      (async () => {
        try {
          const balanceInLamports = await connection.getBalance((wallet as any).publicKey);
          const balanceInSol = balanceInLamports / 1e9;
          setBalance(balanceInSol);
          setFetchError(null);
        } catch (error) {
          console.error('Error fetching balance:', error);
          setFetchError('Failed to fetch balance');
          setBalance(null);
        }
      })();
    } else {
      setBalance(null);
      setFetchError(null);
    }
  }, [connected, wallet]);

  return (
    <div>
      {connected ? (
        <div>
          <p>Connected to {wallet?.adapter.name}</p>
          {balance !== null ? (
            <p>Balance: {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SOL</p>
          ) : fetchError ? (
            <p>{fetchError}</p>
          ) : (
            <p>Fetching balance...</p>
          )}
        </div>
      ) : (
        <button onClick={() => (wallet as any)?.connect()}>Connect Phantom Wallet</button>
      )}
    </div>
  );
}