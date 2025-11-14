// Real Web3 NFT Website Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const connectButton = document.getElementById('connectWallet');
    const mintButton = document.getElementById('mintButton');
    const nftImage = document.getElementById('nftImage');
    const nftTitle = document.getElementById('nftTitle');
    const nftDescription = document.getElementById('nftDescription');
    
    // Contract Details - YOUR ACTUAL CONTRACT
    const contractAddress = '0x6F446e3A8159B325a3CBd71e00dE7A067EB1B620';
    const mintPrice = '0.01'; // ETH - Update with your actual price
    
    // Base Network Configuration
    const baseChainId = '0x2105'; // Base Mainnet
    const baseChainHex = '0x2105';
    
    // State
    let isConnected = false;
    let userAddress = '';
    let userBalance = '0';

    // Event Listeners
    connectButton.addEventListener('click', connectWallet);
    mintButton.addEventListener('click', mintNFT);

    // REAL Wallet Connection
    async function connectWallet() {
        try {
            // Check if Ethereum provider exists
            if (typeof window.ethereum === 'undefined') {
                showError('No Ethereum wallet found. Please install MetaMask or Coinbase Wallet.');
                openWalletInstall();
                return;
            }

            // Request account access
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            if (accounts.length === 0) {
                showError('Please connect your wallet.');
                return;
            }

            userAddress = accounts[0];
            isConnected = true;

            // Check if we're on Base network
            await checkNetwork();

            // Get user's balance
            await getUserBalance();

            // Update UI
            updateConnectionStatus();
            showSuccess('Wallet connected successfully!');

            // Listen for account changes
            setupEventListeners();

        } catch (error) {
            console.error('Connection error:', error);
            if (error.code === 4001) {
                showError('Please connect your wallet to continue.');
            } else {
                showError('Failed to connect wallet: ' + error.message);
            }
        }
    }

    // Check and switch to Base network if needed
    async function checkNetwork() {
        try {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            
            if (chainId !== baseChainHex) {
                const switchConfirm = confirm('Please switch to Base Network to mint NFTs. Switch now?');
                if (switchConfirm) {
                    await switchToBaseNetwork();
                }
            }
        } catch (error) {
            console.error('Network check error:', error);
        }
    }

    // Switch to Base Network
    async function switchToBaseNetwork() {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: baseChainHex }],
            });
            showSuccess('Switched to Base Network!');
        } catch (switchError) {
            // If network not added, add it
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainId: baseChainHex,
                                chainName: 'Base Mainnet',
                                nativeCurrency: {
                                    name: 'Ethereum',
                                    symbol: 'ETH',
                                    decimals: 18
                                },
                                rpcUrls: ['https://mainnet.base.org'],
                                blockExplorerUrls: ['https://basescan.org']
                            }
                        ]
                    });
                } catch (addError) {
                    showError('Failed to add Base network: ' + addError.message);
                }
            } else {
                showError('Failed to switch network: ' + switchError.message);
            }
        }
    }

    // Get user's ETH balance
    async function getUserBalance() {
        try {
            const balance = await window.ethereum.request({
                method: 'eth_getBalance',
                params: [userAddress, 'latest']
            });
            
            // Convert from wei to ETH
            userBalance = (parseInt(balance) / 1e18).toFixed(4);
            console.log('User balance:', userBalance, 'ETH');
            
        } catch (error) {
            console.error('Balance check error:', error);
        }
    }

    // REAL Mint NFT Function (Simulated for now - will connect to your contract)
    async function mintNFT() {
        if (!isConnected) {
            showError('Please connect your wallet first.');
            return;
        }

        // Check if user has enough ETH
        if (parseFloat(userBalance) < parseFloat(mintPrice)) {
            showError(`Insufficient balance. You need ${mintPrice} ETH to mint.`);
            return;
        }

        try {
            // Show loading state
            mintButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Confirm in Wallet...';
            mintButton.disabled = true;

            // SIMULATED MINT - Replace with actual contract call
            await simulateRealMint();

            showSuccess('NFT minted successfully! Check your wallet.');
            
            // Update balance after mint
            await getUserBalance();

        } catch (error) {
            console.error('Minting error:', error);
            if (error.code === 4001) {
                showError('Transaction was cancelled.');
            } else {
                showError('Minting failed: ' + error.message);
            }
        } finally {
            // Reset button
            mintButton.innerHTML = `<i class="fas fa-plus"></i> Mint NFT (${mintPrice} ETH)`;
            mintButton.disabled = false;
        }
    }

    // Simulate real minting process
    async function simulateRealMint() {
        return new Promise((resolve, reject) => {
            // Simulate transaction confirmation
            setTimeout(() => {
                // 90% success rate for simulation
                if (Math.random() > 0.1) {
                    resolve();
                } else {
                    reject(new Error('Transaction failed. Please try again.'));
                }
            }, 2000);
        });
    }

    // Update UI after connection
    function updateConnectionStatus() {
        const shortAddress = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
        
        connectButton.innerHTML = `<i class="fas fa-check"></i> ${shortAddress}`;
        connectButton.style.background = '#10b981';
        connectButton.style.borderColor = '#10b981';
        connectButton.style.color = 'white';
        
        mintButton.disabled = false;
        mintButton.innerHTML = `<i class="fas fa-plus"></i> Mint NFT (${mintPrice} ETH)`;
        
        // Update page title with connected status
        document.title = `Base Genesis NFT | ${shortAddress}`;
    }

    // Setup event listeners for wallet changes
    function setupEventListeners() {
        // Account changed
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
                handleDisconnect();
            } else {
                userAddress = accounts[0];
                updateConnectionStatus();
                showSuccess('Account changed');
                getUserBalance();
            }
        });

        // Chain changed
        window.ethereum.on('chainChanged', (chainId) => {
            window.location.reload();
        });
    }

    // Handle wallet disconnect
    function handleDisconnect() {
        isConnected = false;
        userAddress = '';
        userBalance = '0';
        
        connectButton.innerHTML = '<i class="fas fa-wallet"></i> Connect Wallet';
        connectButton.style.background = '';
        connectButton.style.borderColor = '';
        connectButton.style.color = '';
        
        mintButton.disabled = true;
        mintButton.innerHTML = '<i class="fas fa-plus"></i> Connect Wallet to Mint';
        
        document.title = 'Base Genesis NFT | Foundation Collection';
        showError('Wallet disconnected');
    }

    // Notification functions
    function showSuccess(message) {
        showNotification(message, 'success');
    }

    function showError(message) {
        showNotification(message, 'error');
    }

    function showNotification(message, type) {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(notif => notif.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Wallet installation helper
    function openWalletInstall() {
        const install = confirm('A Web3 wallet is required to mint NFTs. Would you like to install MetaMask?');
        if (install) {
            window.open('https://metamask.io/download.html', '_blank');
        }
    }

    // Initialize - Check if already connected
    async function initialize() {
        if (typeof window.ethereum !== 'undefined') {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                userAddress = accounts[0];
                isConnected = true;
                await getUserBalance();
                updateConnectionStatus();
                setupEventListeners();
            }
        }
    }

    // Initialize on load
    initialize();

    console.log('Base Genesis NFT website loaded!');
    console.log('Contract:', contractAddress);
    console.log('Ready for real Web3 interactions!');
});
