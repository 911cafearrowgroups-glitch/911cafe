import express from 'express';
import cors from 'cors';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes - Menu & Stats
app.get('/api/menu', (req, res) => {
  try {
    const { category } = req.query;
    const items = db.getMenu(category);
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/stats', (req, res) => {
  try {
    const stats = db.getStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API Routes - Customer & Loyalty
app.get('/api/customers', (req, res) => {
  try {
    const { query } = req.query;
    const customers = db.getAllCustomers(query || '');
    res.json({ success: true, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/customers/:identifier', (req, res) => {
  try {
    const customer = db.getCustomerDetails(req.params.identifier);
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found with this ID or phone number' });
    }
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/customers/enroll', (req, res) => {
  try {
    const { name, phone, email, favoriteItem } = req.body;
    const customer = db.enrollCustomer({ name, phone, email, favoriteItem });
    res.status(201).json({
      success: true,
      message: 'Welcome to 911 Cafe Club! Your loyalty card has been activated.',
      data: customer
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/customers/:id/stamp', (req, res) => {
  try {
    const { note, staff } = req.body;
    const result = db.addStamp(req.params.id, { note, staff });
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/customers/:id/redeem', (req, res) => {
  try {
    const { rewardTitle, redeemedBy, itemChosen } = req.body;
    const result = db.redeemReward(req.params.id, { rewardTitle, redeemedBy, itemChosen });
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// API Routes - Orders & Delivery
app.post('/api/orders', (req, res) => {
  try {
    const { 
      customerName, 
      customerPhone, 
      orderType, 
      deliveryAddress, 
      landmark, 
      items, 
      instructions, 
      paymentMethod,
      applyLoyaltyReward 
    } = req.body;

    const result = db.createOrder({
      customerName,
      customerPhone,
      orderType,
      deliveryAddress,
      landmark,
      items,
      instructions,
      paymentMethod,
      applyLoyaltyReward
    });

    res.status(201).json({
      success: true,
      ...result
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Client-to-Server Persistent Rehydration Sync (For Vercel serverless persistence)
app.post('/api/sync', (req, res) => {
  try {
    const { orders = [], customers = [], stamps = [], redemptions = [] } = req.body;
    const result = db.syncFromClient({ orders, customers, stamps, redemptions });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/orders', (req, res) => {
  try {
    const { filter } = req.query; // 'waiting', 'preparing', 'out_for_delivery', 'delivered', 'active', 'all'
    const orders = db.getOrders(filter || 'all');
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/orders/:id', (req, res) => {
  try {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { pin } = req.body;
    const result = db.validateStaffPin(pin);
    if (!result.success) {
      return res.status(401).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/reports/daily', (req, res) => {
  try {
    const { date } = req.query;
    const balance = db.getDailyBalance(date);
    res.json({ success: true, data: balance });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/orders/:id/status', (req, res) => {
  try {
    const { status, note, paymentMethod } = req.body;
    const result = db.updateOrderStatus(req.params.id, status, note, paymentMethod);
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Serve frontend build in production
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('911 Cafe API is operational. Run frontend in Vite dev mode or run npm run build.');
    }
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    const nets = os.networkInterfaces();
    const ips = [];
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          ips.push({ name, address: net.address });
        }
      }
    }

    console.log(`\n======================================================`);
    console.log(`🚀 911 CAFE SERVER RUNNING ON LOCAL & NETWORK`);
    console.log(`======================================================`);
    console.log(`  📱 Localhost:   http://localhost:${PORT}`);
    ips.forEach(item => {
      console.log(`  🌐 Network (${item.name}): http://${item.address}:${PORT}`);
    });
    console.log(`======================================================`);
    console.log(`  💡 Open the Network URL on your phone or tablet to`);
    console.log(`     use 911 Cafe App across your Wi-Fi!\n`);
  });
}

export default app;
