import React, { useState, useEffect } from 'react';

// Define TypeScript types for Phantom provider
type PhantomEvent = "connect" | "disconnect";

interface PhantomProvider {
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, callback: (args: any) => void) => void;
  isConnected: boolean;
  publicKey: { toString: () => string };
  isPhantom: boolean;
  removeAllListeners: () => void;
}

const PhantomWalletConnect: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');

  // Check if Phantom is installed and available
  const getProvider = (): PhantomProvider | null => {
    if ('phantom' in window) {
      const provider = (window as any).phantom?.solana;
      if (provider?.isPhantom) {
        return provider;
      }
    }
    
    return null;
  };

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setStatus('Connecting to Phantom wallet...');
      
      const provider = getProvider();
      
      if (provider) {
        try {
          // Request permission to connect
          await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to prevent race conditions
          const response = await provider.connect();
          setWalletAddress(response.publicKey.toString());
          setStatus('Connected successfully!');
        } catch (err: any) {
          console.error("Connection error:", err);
          setStatus(`Error: ${err.message || 'Could not connect to wallet'}`);
        }
      } else {
        // Handle case where Phantom is not installed
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
        
        if (isMobile) {
          // Use universal link for mobile
          const dappUrl = encodeURIComponent(window.location.href);
          window.location.href = `https://phantom.app/ul/browse/${dappUrl}`;
          setStatus('Redirecting to Phantom app...');
        } else {
          setStatus('Phantom wallet not installed. Please install it first.');
        }
      }
    } catch (error: any) {
      console.error("Unexpected error:", error);
      setStatus(`Unexpected error: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    const provider = getProvider();
    if (provider) {
      try {
        await provider.disconnect();
        setWalletAddress(null);
        setStatus('Disconnected from wallet');
      } catch (err: any) {
        console.error("Disconnect error:", err);
        setStatus(`Error disconnecting: ${err.message}`);
      }
    } else {
      setWalletAddress(null);
      setStatus('No wallet connected');
    }
  };

  // Check wallet connection status on component mount
  useEffect(() => {
    const provider = getProvider();
    
    if (provider) {
      // Set up event listeners
      provider.on('connect', (publicKey: any) => {
        setWalletAddress(publicKey.toString());
        setStatus('Connected');
      });
      
      provider.on('disconnect', () => {
        setWalletAddress(null);
        setStatus('Disconnected');
      });
      
      // Check if user is already connected
      if (provider.isConnected && provider.publicKey) {
        setWalletAddress(provider.publicKey.toString());
        setStatus('Connected');
      }
      
      // Clean up listeners when component unmounts
      return () => {
        provider.removeAllListeners();
      };
    }
  }, []);

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Phantom Wallet Connection</h2>
      
      {status && (
        <p className={`mb-4 p-2 rounded ${status.includes('Error') ? 'bg-red-100 text-red-800' : status.includes('Connected successfully') ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
          {status}
        </p>
      )}
      
      {!walletAddress ? (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {isConnecting ? 'Connecting...' : 'Connect Phantom Wallet'}
        </button>
      ) : (
        <div>
          <p className="mb-2">
            <span className="font-semibold">Connected Address:</span>{' '}
            <span className="break-all">{walletAddress}</span>
          </p>
          <button
            onClick={disconnectWallet}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Disconnect Wallet
          </button>
        </div>
      )}
      
      {!getProvider() && !isConnecting && (
        <div className="mt-4 text-center">
          <p className="mb-2">Don't have Phantom wallet?</p>
          <a
            href="https://phantom.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-800"
          >
            Get Phantom Wallet
          </a>
        </div>
      )}
    </div>
  );
};

export default PhantomWalletConnect;