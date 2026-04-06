const APP_CONFIG = {
    // Replace with your actual deployed contract address on Ethereum/Polygon testnet
    contractAddress: "0xYourDeployedContractAddressHere",
    // Smart Contract ABI
    contractABI: [
        "function issueCertificate(string memory _certificateId, string memory _ipfsHash) public",
        "function verifyCertificate(string memory _certificateId) public view returns (bool, string memory, uint256, address)"
    ],
    // Backend API URL (for local this is usually empty or localhost depending on setup)
    apiUrl: window.location.hostname === 'localhost' ? 'http://localhost:3000' : ''
};

let provider;
let signer;
let contract;

// UI Elements
const connectWalletBtn = document.getElementById('connectWalletBtn');
const walletAddressDisplay = document.getElementById('walletAddress');
const walletStatusIndicator = document.getElementById('walletStatusIndicator');

// Connect to MetaMask
async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();

            const address = await signer.getAddress();

            // initialize contract
            contract = new ethers.Contract(
                APP_CONFIG.contractAddress,
                APP_CONFIG.contractABI,
                signer
            );

            // UI updates
            if (walletAddressDisplay) {
                walletAddressDisplay.innerText =
                    address.substring(0, 6) + '...' +
                    address.substring(address.length - 4);
            }

            if (walletStatusIndicator) {
                walletStatusIndicator.classList.add('connected');
                walletStatusIndicator.querySelector('span').innerText =
                    'Wallet Connected';
            }

            if (connectWalletBtn) {
                connectWalletBtn.innerText = 'Connected';
                connectWalletBtn.disabled = true;
            }

            console.log("Wallet connected:", address);

        } catch (error) {
            console.error(error);
            alert("Failed to connect wallet.");
        }
    } else {
        alert("Please install MetaMask!");
    }
}
// Check if already connected on load
async function checkConnection() {
    if (typeof window.ethereum !== 'undefined') {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
            signer = provider.getSigner();
            contract = new ethers.Contract(APP_CONFIG.contractAddress, APP_CONFIG.contractABI, signer);
            const address = await signer.getAddress();
            if (walletAddressDisplay) walletAddressDisplay.innerText = address.substring(0, 6) + '...' + address.substring(address.length - 4);
            if (walletStatusIndicator) {
                walletStatusIndicator.classList.add('connected');
                walletStatusIndicator.querySelector('span').innerText = 'Wallet Connected';
            }
            if (connectWalletBtn) {
                connectWalletBtn.innerText = 'Connected';
                connectWalletBtn.disabled = true;
            }
        } else {
            // Setup read-only contract if not connected
            contract = new ethers.Contract(APP_CONFIG.contractAddress, APP_CONFIG.contractABI, provider);
        }
    }
}

if (connectWalletBtn) {
    connectWalletBtn.addEventListener('click', connectWallet);
}

// Issue Certificate Logic
const issueForm = document.getElementById('issueForm');
if (issueForm) {
    issueForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!signer) {
            alert("Please connect your wallet first.");
            return;
        }

        const submitBtn = issueForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerText = "Processing...";

        const certData = {
            studentName: document.getElementById('studentName').value,
            courseName: document.getElementById('courseName').value,
            institutionName: document.getElementById('institutionName').value,
            issueDate: document.getElementById('issueDate').value,
            certificateId: document.getElementById('certificateId').value
        };

        try {
            // 1. Upload metadata to "IPFS" (our backend mock)
            console.log("Uploading to IPFS...");
            const uploadRes = await fetch(`${APP_CONFIG.apiUrl}/api/upload`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(certData)
            });
            const { ipfsHash } = await uploadRes.json();
            console.log("IPFS Hash received:", ipfsHash);

            // 2. Store hash on Blockchain
            console.log("Storing on smart contract context...");
            // Use dummy contract if user hasn't deployed one to prevent crashing in MVP demo
            if (APP_CONFIG.contractAddress === "0x71383D463a89a1b822389F661aC9D65305cb9F7E") {
                alert(`Mock Success!\n\nIPFS Hash: ${ipfsHash}\n\n(Smart contract not deployed. Update APP_CONFIG.contractAddress in app.js to interact with your actual Polygon contract)`);
            } else {
                const tx = await contract.issueCertificate(certData.certificateId, ipfsHash);
                await tx.wait(); // wait for mining
                alert(`Certificate Issued Successfully! \nTx: ${tx.hash}\nIPFS Hash: ${ipfsHash}`);
            }
            issueForm.reset();
        } catch (err) {
            console.error(err);
            alert("Error issuing certificate. See console.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = "Issue Certificate";
        }
    });
}

// Verify Certificate Logic
const verifyForm = document.getElementById('verifyForm');
if (verifyForm) {
    verifyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const certId = document.getElementById('verifyCertId').value;
        const resultBox = document.getElementById('resultBox');
        const submitBtn = verifyForm.querySelector('button[type="submit"]');
        
        submitBtn.disabled = true;
        submitBtn.innerText = "Verifying...";
        resultBox.className = "result-box"; // reset classes
        
        try {
            if (APP_CONFIG.contractAddress === "0x71383D463a89a1b822389F661aC9D65305cb9F7E") {
                // Mock Simulation for Demo
                resultBox.classList.add('show', 'error');
                resultBox.innerHTML = `<h3>Blockchain Error</h3><p>Smart contract not configured. Update app.js to use real network.</p>`;
                submitBtn.disabled = false;
                submitBtn.innerText = "Verify Authenticity";
                return;
            }

            // 1. Fetch from Blockchain
            const [isValid, ipfsHash, issueDateTs, issuer] = await contract.verifyCertificate(certId);
            
            if (!isValid) {
                resultBox.classList.add('show', 'error');
                resultBox.innerHTML = `<h3>Verification Failed</h3><p>Certificate ID not found or invalid.</p>`;
                return;
            }

            // 2. Fetch metadata from IPFS
            const ipfsRes = await fetch(`${APP_CONFIG.apiUrl}/ipfs/${ipfsHash}`);
            if (!ipfsRes.ok) throw new Error("Metadata not found on IPFS");
            const metadata = await ipfsRes.json();

            // 3. Display Result
            resultBox.classList.add('show', 'success');
            
            // Format Date from timestamp
            const dateStr = new Date(issueDateTs * 1000).toLocaleDateString();

            resultBox.innerHTML = `
                <h3 style="color: var(--success-color); margin-bottom: 1rem;">✅ Certificate Authenticated</h3>
                <div class="result-item"><span class="result-label">Student Name:</span> <span class="result-value">${metadata.studentName}</span></div>
                <div class="result-item"><span class="result-label">Course:</span> <span class="result-value">${metadata.courseName}</span></div>
                <div class="result-item"><span class="result-label">Institution:</span> <span class="result-value">${metadata.institutionName}</span></div>
                <div class="result-item"><span class="result-label">Issue Date (Blockchain):</span> <span class="result-value">${dateStr}</span></div>
                <div class="result-item"><span class="result-label">Issuer Address:</span> <span class="result-value">${issuer}</span></div>
                <div class="result-item"><span class="result-label">IPFS Hash:</span> <span class="result-value" style="font-size: 0.8rem;">${ipfsHash}</span></div>
            `;
            
        } catch (err) {
            console.error(err);
            resultBox.classList.add('show', 'error');
            resultBox.innerHTML = `<h3>Error</h3><p>${err.message || 'Could not verify certificate'}</p>`;
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = "Verify Authenticity";
        }
    });
}

// On load
window.addEventListener('DOMContentLoaded', checkConnection);
