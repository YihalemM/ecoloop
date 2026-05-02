require('dotenv').config();
const express = require('express');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const { ethers } = require('ethers');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = 5005;

// --- DATABASE SETUP ---
let db;
(async () => {
  db = await open({
    filename: path.join(__dirname, 'ecoledger.db'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS bottles (
      barcode TEXT PRIMARY KEY,
      brand TEXT,
      co2 REAL,
      description TEXT,
      material TEXT,
      manufacturer TEXT,
      is_scanned INTEGER DEFAULT 0,
      scanned_by TEXT,
      timestamp INTEGER
    );
    CREATE TABLE IF NOT EXISTS wallets (
      address TEXT PRIMARY KEY,
      balance REAL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS events (
      hash TEXT PRIMARY KEY,
      type TEXT,
      amount TEXT,
      time TEXT,
      block TEXT
    );
    CREATE TABLE IF NOT EXISTS manufacturers (
      address TEXT PRIMARY KEY,
      name TEXT
    );
  `);

  // Migration: Add new columns if they don't exist
  try {
    await db.run('ALTER TABLE bottles ADD COLUMN description TEXT');
    await db.run('ALTER TABLE bottles ADD COLUMN material TEXT');
    await db.run('ALTER TABLE bottles ADD COLUMN manufacturer TEXT');
  } catch (e) {
    // Columns likely already exist
  }


  // Seed default manufacturer if empty
  const mCount = await db.get('SELECT COUNT(*) as count FROM manufacturers');
  if (mCount.count === 0) {
    const defaultAddr = (process.env.INITIAL_MANUFACTURER || '0x71C12345678904e2').toLowerCase();
    await db.run('INSERT INTO manufacturers (address, name) VALUES (?, ?)', 
      [defaultAddr, 'EcoCorp Global']);
    console.log(`[Database] Seeded initial manufacturer: ${defaultAddr}`);
  }
})();

// --- BLOCKCHAIN SETUP (RELAYER) ---
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'https://sepolia.base.org');
let wallet = null;

if (process.env.PRIVATE_KEY && !process.env.PRIVATE_KEY.includes('your_private_key')) {
  try {
    wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log(`[Relayer] Active for address: ${wallet.address}`);
  } catch (err) {
    console.warn('[Relayer] Invalid Private Key. Blockchain relaying will be simulated.');
  }
} else {
  console.log('[Relayer] Running in Simulation Mode (No Private Key provided).');
}

const ECO_TOKEN_ADDRESS = process.env.ECO_TOKEN_ADDRESS;
const ECO_REWARD_ADDRESS = process.env.ECO_REWARD_ADDRESS || process.env.CONTRACT_ADDRESS;

const ECO_REWARD_ABI = [
  "function rewardUser(address user, string memory wasteType, uint256 quantity) external",
  "function setBackend(address _backend) external",
  "function setRewardRate(string memory wasteType, uint256 rate) external",
  "function records(uint256) view returns (address user, string wasteType, uint256 amount, uint256 timestamp)",
  "function getTotalRecords() view returns (uint256)"
];

// --- AUTO-INITIALIZE ON-CHAIN SETTINGS ---
async function setupBlockchain() {
  if (wallet && ECO_REWARD_ADDRESS) {
    try {
      const contract = new ethers.Contract(ECO_REWARD_ADDRESS, ECO_REWARD_ABI, wallet);
      
      console.log("[Blockchain] Initializing contract settings...");
      
      // 1. Set backend to our wallet address (so we can call rewardUser)
      const setBackendTx = await contract.setBackend(wallet.address);
      await setBackendTx.wait();
      console.log(`[Blockchain] Backend set to ${wallet.address}`);

      // 2. Set default reward rate for BOTTLE (e.g., 50 ECO per bottle)
      // Note: We use parseEther assuming 18 decimals for ECO token
      const currentRate = await contract.rewardRate("BOTTLE");
      if (currentRate === 0n) {
        const setRateTx = await contract.setRewardRate("BOTTLE", ethers.parseEther("50"));
        await setRateTx.wait();
        console.log("[Blockchain] Reward rate for BOTTLE set to 50 ECO");
      } else {
        console.log(`[Blockchain] Reward rate for BOTTLE is already ${ethers.formatEther(currentRate)} ECO`);
      }

    } catch (err) {
      console.warn("[Blockchain] Setup failed (is the wallet the owner?):", err.message);
    }
  }
}
setupBlockchain();


// --- MIDDLEWARE ---
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
app.use(morgan('dev'));
app.use(express.json());

// --- ROUTES ---

// 🏭 Manufacturer: Register (for testing/admin)
app.post('/api/manufacturer/register', async (req, res) => {
  const { address, name } = req.body;
  if (!address || !name) return res.status(400).json({ error: 'Missing data' });
  
  try {
    await db.run('INSERT INTO manufacturers (address, name) VALUES (?, ?) ON CONFLICT(address) DO UPDATE SET name = ?', 
      [address.toLowerCase(), name, name]);
    res.json({ message: `Manufacturer ${name} registered successfully.` });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// 🏭 Manufacturer: Mint with Whitelist Check
app.post('/api/manufacturer/mint', async (req, res) => {
  const { brand, count, co2PerBottle, description, material, manufacturerAddress } = req.body;

  // Security Check: Is the caller an authorized manufacturer?
  const isAuthorized = await db.get('SELECT * FROM manufacturers WHERE address = ?', [manufacturerAddress?.toLowerCase()]);
  if (!isAuthorized) {
    return res.status(403).json({ error: 'Access Denied: Address is not a registered manufacturer.' });
  }

  const newBottles = [];
  try {
    await db.run('BEGIN TRANSACTION');
    for (let i = 0; i < count; i++) {
      const barcode = `ECO-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      await db.run(
        'INSERT INTO bottles (barcode, brand, co2, description, material, manufacturer, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [barcode, brand, co2PerBottle || 10.0, description || '', material || 'PET', isAuthorized.name, Date.now()]
      );
      newBottles.push({ barcode, brand, description });
    }
    await db.run('COMMIT');

    res.status(201).json({ message: `${count} bottles registered`, bottles: newBottles });
  } catch (err) {
    console.error(err);
    await db.run('ROLLBACK');
    res.status(500).json({ error: 'Database transaction failed.' });
  }
});

// ♻️ User: Scan and Relay On-Chain
app.post('/api/user/scan', async (req, res) => {
  const { barcode, userAddress } = req.body;
  if (!barcode || !userAddress) return res.status(400).json({ error: 'Missing data' });

  const bottle = await db.get('SELECT * FROM bottles WHERE barcode = ?', [barcode]);
  if (!bottle) return res.status(404).json({ error: 'Bottle not found in registry.' });
  if (bottle.is_scanned) return res.status(400).json({ error: 'Reward already claimed.' });

  try {
    let txHash = `0x_SIMULATED_${Math.random().toString(16).substring(2, 10)}`;
    
    // --- REAL ON-CHAIN RELAY LOGIC ---
    if (wallet && ECO_REWARD_ADDRESS) {
      console.log(`Relaying reward for ${userAddress} on-chain...`);
      try {
        const contract = new ethers.Contract(ECO_REWARD_ADDRESS, ECO_REWARD_ABI, wallet);
        // We use "BOTTLE" as default waste type for now
        const tx = await contract.rewardUser(userAddress.toLowerCase(), "BOTTLE", 1);
        console.log(`Transaction sent: ${tx.hash}`);
        await tx.wait();
        txHash = tx.hash;
        console.log(`Transaction confirmed: ${txHash}`);
      } catch (err) {
        console.error('[Blockchain] Relay error:', err.message);
        // We still continue to update the local DB so the user sees the reward in the UI
        // In a production app, you might want to handle this differently
      }
    }

    await db.run(
      'UPDATE bottles SET is_scanned = 1, scanned_by = ? WHERE barcode = ?',
      [userAddress, barcode]
    );

    const reward = 50.0;
    await db.run(
      'INSERT INTO wallets (address, balance) VALUES (?, ?) ON CONFLICT(address) DO UPDATE SET balance = balance + ?',
      [userAddress.toLowerCase(), reward, reward]
    );

    await db.run(
      'INSERT INTO events (hash, type, amount, time, block) VALUES (?, ?, ?, ?, ?)',
      [txHash, 'RewardMinted', '50 ECO', new Date().toISOString(), 'Pending']
    );

    res.json({ 
      message: 'Reward relayed successfully!', 
      txHash,
      bottle: {
        brand: bottle.brand,
        description: bottle.description,
        material: bottle.material,
        manufacturer: bottle.manufacturer,
        co2: bottle.co2
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Blockchain relay failed.' });
  }
});

app.get('/api/user/balance/:address', async (req, res) => {
  const userAddress = req.params.address;
  try {
    let onChainBalance = 0;
    
    // 1. Try fetching on-chain balance
    if (provider && ECO_TOKEN_ADDRESS) {
      try {
        const tokenContract = new ethers.Contract(ECO_TOKEN_ADDRESS, [
          "function balanceOf(address) view returns (uint256)",
          "function decimals() view returns (uint8)"
        ], provider);
        
        const [balance, decimals] = await Promise.all([
          tokenContract.balanceOf(userAddress),
          tokenContract.decimals()
        ]);
        onChainBalance = parseFloat(ethers.formatUnits(balance, decimals));
      } catch (err) {
        console.warn('[Blockchain] Balance fetch error:', err.message);
      }
    }

    // 2. Calculate local balance from database (50 ECO per scanned bottle)
    const row = await db.get('SELECT COUNT(*) as count FROM bottles WHERE scanned_by = ? AND is_scanned = 1', [userAddress.toLowerCase()]);
    const localBalance = (row?.count || 0) * 50;

    // Use the higher of the two (handles sync delay)
    const finalBalance = Math.max(onChainBalance, localBalance);
    
    res.json({ 
      balance: finalBalance,
      onChain: onChainBalance,
      local: localBalance
    });
  } catch (err) {
    console.error('[API] Balance error:', err);
    res.status(500).json({ balance: 0, error: "Failed to calculate balance" });
  }
});

app.get('/api/stats', async (req, res) => {
  const stats = await db.get(`
    SELECT 
      COUNT(*) as total,
      SUM(is_scanned) as recycled,
      SUM(CASE WHEN is_scanned = 1 THEN co2 ELSE 0 END) as totalCo2
    FROM bottles
  `);
  res.json({
    networkHealth: '100%',
    totalBottles: stats.total || 0,
    recycledCount: stats.recycled || 0,
    totalCo2: (stats.totalCo2 || 0).toFixed(2) + 'kg'
  });
});

app.get('/api/logs', async (req, res) => {
  const rows = await db.all('SELECT * FROM bottles WHERE is_scanned = 1 ORDER BY timestamp DESC LIMIT 20');
  res.json(rows.map(r => ({
    id: r.barcode,
    name: `${r.brand} Bottle`,
    upc: r.barcode,
    co2: `+${r.co2}kg`
  })));
});

app.get('/api/events', async (req, res) => {
  const rows = await db.all('SELECT * FROM events ORDER BY time DESC LIMIT 10');
  res.json(rows);
});

// 👤 User: Profile Data
app.get('/api/user/profile/:address', async (req, res) => {
  const address = req.params.address.toLowerCase();
  try {
    const stats = await db.get(`
      SELECT 
        COUNT(*) as totalScanned,
        SUM(co2) as totalCo2
      FROM bottles 
      WHERE scanned_by = ? AND is_scanned = 1
    `, [address]);

    const materialBreakdown = await db.all(`
      SELECT material, COUNT(*) as count 
      FROM bottles 
      WHERE scanned_by = ? AND is_scanned = 1
      GROUP BY material
    `, [address]);

    const recentActivity = await db.all(`
      SELECT * FROM bottles 
      WHERE scanned_by = ? AND is_scanned = 1
      ORDER BY timestamp DESC LIMIT 5
    `, [address]);

    res.json({
      totalScanned: stats.totalScanned || 0,
      totalCo2: (stats.totalCo2 || 0).toFixed(2),
      materialBreakdown,
      recentActivity
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile data' });
  }
});

// 💸 User: Withdraw Funds
app.post('/api/user/withdraw', async (req, res) => {
  const { address, amount, currency, method } = req.body;
  if (!address || !amount) return res.status(400).json({ error: 'Missing data' });

  try {
    const userWallet = await db.get('SELECT balance FROM wallets WHERE address = ?', [address.toLowerCase()]);
    if (!userWallet || userWallet.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    await db.run('UPDATE wallets SET balance = balance - ? WHERE address = ?', [amount, address.toLowerCase()]);
    
    // Log the event
    await db.run(
      'INSERT INTO events (hash, type, amount, time, block) VALUES (?, ?, ?, ?, ?)',
      [`0x_WITHDRAW_${Math.random().toString(16).substring(2, 10)}`, 'Withdrawal', `${amount} ECO`, new Date().toISOString(), 'Confirmed']
    );

    res.json({ message: 'Withdrawal initiated successfully', amount, currency, method });
  } catch (err) {
    res.status(500).json({ error: 'Withdrawal failed' });
  }
});

// 🏭 Manufacturer: Dashboard Stats
app.get('/api/manufacturer/stats/:address', async (req, res) => {
  const address = req.params.address.toLowerCase();
  try {
    const manufacturer = await db.get('SELECT name FROM manufacturers WHERE address = ?', [address]);
    
    // If not a registered manufacturer, show global network stats for demo purposes
    const filterName = manufacturer ? manufacturer.name : null;
    const nameLabel = manufacturer ? manufacturer.name : 'Global Network';

    const stats = await db.get(`
      SELECT 
        COUNT(*) as totalGenerated,
        SUM(is_scanned) as totalRecycled,
        SUM(CASE WHEN is_scanned = 1 THEN co2 ELSE 0 END) as totalCo2Saved
      FROM bottles 
      ${filterName ? 'WHERE manufacturer = ?' : ''}
    `, filterName ? [filterName] : []);

    const topDeposer = await db.get(`
      SELECT scanned_by as address, COUNT(*) as count 
      FROM bottles 
      WHERE is_scanned = 1 ${filterName ? 'AND manufacturer = ?' : ''}
      GROUP BY scanned_by 
      ORDER BY count DESC LIMIT 1
    `, filterName ? [filterName] : []);

    const materialStats = await db.all(`
      SELECT material, COUNT(*) as count 
      FROM bottles 
      WHERE is_scanned = 1 ${filterName ? 'AND manufacturer = ?' : ''}
      GROUP BY material
    `, filterName ? [filterName] : []);

    // Mock regional data for visual depth
    const regionalData = [
      { name: 'North Hub', value: Math.floor(Math.random() * 40) + 10 },
      { name: 'East Center', value: Math.floor(Math.random() * 40) + 10 },
      { name: 'West Station', value: Math.floor(Math.random() * 40) + 10 },
      { name: 'South Point', value: Math.floor(Math.random() * 40) + 10 },
    ];

    res.json({
      manufacturerName: nameLabel,
      totalGenerated: stats.totalGenerated || 0,
      totalRecycled: stats.totalRecycled || 0,
      totalCo2Saved: (stats.totalCo2Saved || 0).toFixed(2),
      topDeposer: topDeposer || { address: 'N/A', count: 0 },
      materialStats,
      regionalData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch manufacturer stats' });
  }
});

app.listen(PORT, () => {
  console.log(`[EcoLedger v3] ENTERPRISE Backend on http://localhost:${PORT}`);
});
