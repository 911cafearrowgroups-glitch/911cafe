import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL;
const DATA_DIR = isVercel ? '/tmp' : path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, '911cafe_database.json');

export const STATUS_RANK = {
  'waiting': 1,
  'preparing': 2,
  'out_for_delivery': 3,
  'delivered': 4
};

// OFFICIAL MENU ITEMS AS PER 911 CAFE MENU BOARD
const OFFICIAL_MENU = [
  // 1. CLASSIC WAFFLES (₹89)
  {
    id: 'cw-1',
    category: 'classic',
    categoryLabel: 'Classic Waffles',
    name: 'Belgium Chocolate Waffle',
    description: 'Crisp waffle smothered in warm, premium Belgian chocolate.',
    price: 89,
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=600&q=80',
    tags: ['Classic', 'Belgian Chocolate']
  },
  {
    id: 'cw-2',
    category: 'classic',
    categoryLabel: 'Classic Waffles',
    name: 'White Chocolate Waffle',
    description: 'Fresh hot waffle glazed with creamy, smooth white chocolate.',
    price: 89,
    badge: 'Sweet & Creamy',
    image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=600&q=80',
    tags: ['White Chocolate', 'Sweet']
  },
  {
    id: 'cw-3',
    category: 'classic',
    categoryLabel: 'Classic Waffles',
    name: 'Dark Chocolate Waffle',
    description: 'Intense, rich dark chocolate spread over golden crispy waffle.',
    price: 89,
    badge: 'Rich Cocoa',
    image: 'https://images.unsplash.com/photo-1568051243851-f9b136146e97?auto=format&fit=crop&w=600&q=80',
    tags: ['Dark Chocolate', 'Intense']
  },
  {
    id: 'cw-4',
    category: 'classic',
    categoryLabel: 'Classic Waffles',
    name: 'Coffee Chocolate Waffle',
    description: 'Aromatic roasted coffee blend infused with luscious chocolate drizzle.',
    price: 89,
    badge: 'Barista Special',
    image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=600&q=80',
    tags: ['Coffee', 'Mocha']
  },

  // 2. DOUBLE CHOCOLATE (₹99)
  {
    id: 'dc-1',
    category: 'double',
    categoryLabel: 'Double Chocolate',
    name: 'Chocolate Overload Waffle',
    description: 'Double shot of rich melted chocolate covering every crispy waffle square.',
    price: 99,
    badge: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1568051243851-f9b136146e97?auto=format&fit=crop&w=600&q=80',
    tags: ['Overload', 'Double Chocolate']
  },
  {
    id: 'dc-2',
    category: 'double',
    categoryLabel: 'Double Chocolate',
    name: 'White & Dark Waffle',
    description: 'The iconic yin-yang harmony of silky white and bold dark chocolate.',
    price: 99,
    badge: 'Top Pick',
    image: 'https://images.unsplash.com/photo-1554520735-0a6b8b6ce8b7?auto=format&fit=crop&w=600&q=80',
    tags: ['Dual Chocolate', 'Favorite']
  },
  {
    id: 'dc-3',
    category: 'double',
    categoryLabel: 'Double Chocolate',
    name: 'Triple Chocolate Waffle',
    description: 'Layers of milk, dark, and white chocolate cascading over hot waffle.',
    price: 99,
    badge: 'Decadent',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
    tags: ['Triple Cocoa', 'Indulgent']
  },
  {
    id: 'dc-4',
    category: 'double',
    categoryLabel: 'Double Chocolate',
    name: 'Choco White Waffle',
    description: 'Rich chocolate base loaded with heavy sweet white chocolate drizzle.',
    price: 99,
    badge: 'Fan Favorite',
    image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=600&q=80',
    tags: ['Choco White', 'Crispy']
  },

  // 3. MUST TRY! CRUNCH BITES (₹99)
  {
    id: 'cb-1',
    category: 'crunch',
    categoryLabel: 'Crunch Bites',
    name: 'Crunch Bites (Overloaded Chocolates)',
    description: "Crispy waffle bites loaded with rich chocolates – a bite you'll never forget!",
    price: 99,
    badge: '⭐ MUST TRY!',
    image: 'https://images.unsplash.com/photo-1515037893149-de7f840978e2?auto=format&fit=crop&w=600&q=80',
    tags: ['Must Try', 'Bite Size', 'Overloaded']
  },

  // 4. SPECIAL WAFFLES - TIER 1 (₹109)
  {
    id: 'sp-1',
    category: 'special',
    categoryLabel: 'Special Waffles',
    name: 'Naked Waffle',
    description: 'Pure golden caramelized waffle served fresh without chocolate toppings.',
    price: 109,
    badge: 'Simple & Pure',
    image: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=600&q=80',
    tags: ['Crispy', 'Original']
  },
  {
    id: 'sp-2',
    category: 'special',
    categoryLabel: 'Special Waffles',
    name: 'Cookie and Cream Waffle',
    description: 'Crushed chocolate sandwich cookies blended with velvety sweet cream.',
    price: 109,
    badge: 'Kids Love',
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=600&q=80',
    tags: ['Oreo', 'Cream']
  },
  {
    id: 'sp-3',
    category: 'special',
    categoryLabel: 'Special Waffles',
    name: 'Cotton Candy Waffle',
    description: 'Fluffy carnival sweet cotton candy glaze with pastel sprinkles.',
    price: 109,
    badge: 'Festive',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80',
    tags: ['Sweet', 'Colorful']
  },
  {
    id: 'sp-4',
    category: 'special',
    categoryLabel: 'Special Waffles',
    name: 'Bubble Gum Waffle',
    description: 'Nostalgic sweet bubblegum flavoured syrup with popping candy pearls.',
    price: 109,
    badge: 'Unique',
    image: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=600&q=80',
    tags: ['Bubble Gum', 'Novelty']
  },
  {
    id: 'sp-5',
    category: 'special',
    categoryLabel: 'Special Waffles',
    name: 'Rasmalai Pistachio Waffle',
    description: 'Royal saffron-infused cardamom milk cream topped with crushed pistachios.',
    price: 109,
    badge: 'Fusion Special',
    image: 'https://images.unsplash.com/photo-1589218436045-ee320057f443?auto=format&fit=crop&w=600&q=80',
    tags: ['Rasmalai', 'Desi Twist']
  },
  {
    id: 'sp-6',
    category: 'special',
    categoryLabel: 'Special Waffles',
    name: 'Butterscotch Waffle',
    description: 'Golden crunchy praline pieces with buttery caramelized brown sugar drizzle.',
    price: 109,
    badge: 'Crunchy',
    image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=600&q=80',
    tags: ['Caramel', 'Butterscotch']
  },

  // 5. SPECIAL WAFFLES - PREMIUM TIER (₹129)
  {
    id: 'sp-7',
    category: 'special',
    categoryLabel: 'Special Waffles',
    name: 'KitKat Waffle',
    description: 'Loaded with real KitKat wafer bars, rich chocolate fudge, and crunch.',
    price: 129,
    badge: 'Supreme',
    image: 'https://images.unsplash.com/photo-1568051243851-f9b136146e97?auto=format&fit=crop&w=600&q=80',
    tags: ['KitKat', 'Wafer Crunch']
  },
  {
    id: 'sp-8',
    category: 'special',
    categoryLabel: 'Special Waffles',
    name: 'Special Nuts Waffle',
    description: 'Roasted almonds, cashews, and walnuts drenched in Belgian chocolate.',
    price: 129,
    badge: 'Nutty Loaded',
    image: 'https://images.unsplash.com/photo-1515037893149-de7f840978e2?auto=format&fit=crop&w=600&q=80',
    tags: ['Almonds', 'Cashews', 'Walnuts']
  },
  {
    id: 'sp-9',
    category: 'special',
    categoryLabel: 'Special Waffles',
    name: 'Red Velvet Waffle',
    description: 'Deep scarlet red velvet waffle with sweetened cream cheese glaze.',
    price: 129,
    badge: 'Luxury',
    image: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=600&q=80',
    tags: ['Red Velvet', 'Cream Cheese']
  },
  {
    id: 'sp-10',
    category: 'special',
    categoryLabel: 'Special Waffles',
    name: 'Lotus Biscoff Waffle',
    description: 'Spiced Belgian caramelized Lotus Biscoff spread and biscuit crumble.',
    price: 129,
    badge: 'Trending Bestseller',
    image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=600&q=80',
    tags: ['Lotus Biscoff', 'Speculoos']
  },
  {
    id: 'sp-11',
    category: 'special',
    categoryLabel: 'Special Waffles',
    name: 'Kunafa Pistachio Waffle',
    description: 'Golden roasted kataifi pastry crunch, pistachio cream, and sweet drizzle.',
    price: 129,
    badge: 'Chef Signature',
    image: 'https://images.unsplash.com/photo-1589218436045-ee320057f443?auto=format&fit=crop&w=600&q=80',
    tags: ['Kunafa', 'Pistachio', 'Middle Eastern']
  },

  // 6. PAN CAKES (₹59 - ₹79)
  {
    id: 'pc-1',
    category: 'pancake',
    categoryLabel: 'Pan Cakes',
    name: 'Milk Chocolate Pancake',
    description: 'Fluffy warm pancake stack drizzled with creamy milk chocolate.',
    price: 59,
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=600&q=80',
    tags: ['Pancake', 'Milk Chocolate']
  },
  {
    id: 'pc-2',
    category: 'pancake',
    categoryLabel: 'Pan Cakes',
    name: 'White Chocolate Pancake',
    description: 'Golden pancake stack drenched in rich, velvety white chocolate glaze.',
    price: 59,
    badge: 'Sweet & Creamy',
    image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=600&q=80',
    tags: ['Pancake', 'White Chocolate']
  },
  {
    id: 'pc-3',
    category: 'pancake',
    categoryLabel: 'Pan Cakes',
    name: 'Dark Chocolate Pancake',
    description: 'Decadent pancake stack coated with bold, intense dark chocolate sauce.',
    price: 59,
    badge: 'Rich Cocoa',
    image: 'https://images.unsplash.com/photo-1575853121743-60c24f0a7502?auto=format&fit=crop&w=600&q=80',
    tags: ['Pancake', 'Dark Chocolate']
  },
  {
    id: 'pc-4',
    category: 'pancake',
    categoryLabel: 'Pan Cakes',
    name: 'Triple Chocolate Pancake',
    description: 'Ultimate stack layered with milk, dark, and white chocolates with chocolate curls.',
    price: 79,
    badge: 'Chocolate Bliss',
    image: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=600&q=80',
    tags: ['Pancake', 'Triple Chocolate']
  },

  // 7. BROWNIES (₹49 - ₹99)
  {
    id: 'br-1',
    category: 'brownie',
    categoryLabel: 'Brownies',
    name: 'Classic Brownie',
    description: 'Rich, fudgy & perfectly baked.',
    price: 49,
    badge: 'Classic',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
    tags: ['Brownie', 'Classic', 'Fudgy']
  },
  {
    id: 'br-2',
    category: 'brownie',
    categoryLabel: 'Brownies',
    name: 'Double Chocolate Brownie',
    description: 'Double the chocolate, double the happiness.',
    price: 59,
    badge: 'Double Choc',
    image: 'https://images.unsplash.com/photo-1589218436045-ee320057f443?auto=format&fit=crop&w=600&q=80',
    tags: ['Brownie', 'Double Chocolate']
  },
  {
    id: 'br-3',
    category: 'brownie',
    categoryLabel: 'Brownies',
    name: 'Triple Chocolate Brownie',
    description: 'Three layers of indulgent chocolate bliss.',
    price: 69,
    badge: 'Indulgent',
    image: 'https://images.unsplash.com/photo-1515037893149-de7f840978e2?auto=format&fit=crop&w=600&q=80',
    tags: ['Brownie', 'Triple Chocolate']
  },
  {
    id: 'br-4',
    category: 'brownie',
    categoryLabel: 'Brownies',
    name: 'Nuts Triple Chocolate Brownie',
    description: 'Loaded with nuts & triple chocolate goodness.',
    price: 79,
    badge: 'Nutty Loaded',
    image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=600&q=80',
    tags: ['Brownie', 'Nuts', 'Triple Chocolate']
  },
  {
    id: 'br-5',
    category: 'brownie',
    categoryLabel: 'Brownies',
    name: 'Brownie Loaded',
    description: 'Overloaded with chocolate, nuts & pure indulgence.',
    price: 89,
    badge: 'Must Try!',
    image: 'https://images.unsplash.com/photo-1568051243851-f9b136146e97?auto=format&fit=crop&w=600&q=80',
    tags: ['Brownie', 'Must Try', 'Loaded', 'Nuts']
  },
  {
    id: 'br-6',
    category: 'brownie',
    categoryLabel: 'Brownies',
    name: 'Brownie with Ice Cream',
    description: 'Warm brownie served with creamy ice cream & chocolate drizzle.',
    price: 99,
    badge: 'Chef Special',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
    tags: ['Brownie', 'Ice Cream', 'Warm & Cold']
  }
];

class Database {
  constructor() {
    this.data = {
      customers: [],
      stamps: [],
      redemptions: [],
      menu: OFFICIAL_MENU,
      orders: []
    };
    this.init();
  }

  init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Force-sync official menu and provide fresh clean slate (zero demo data)
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const loaded = JSON.parse(raw);
        // Overwrite menu with official menu
        this.data.menu = OFFICIAL_MENU;
        // Keep existing customer data if already entered by user, otherwise start empty []
        this.data.customers = Array.isArray(loaded.customers) ? loaded.customers : [];
        this.data.stamps = Array.isArray(loaded.stamps) ? loaded.stamps : [];
        this.data.redemptions = Array.isArray(loaded.redemptions) ? loaded.redemptions : [];
        this.data.orders = Array.isArray(loaded.orders) ? loaded.orders : [];
      } catch (err) {
        console.error('Error reading db file, resetting clean:', err);
        this.resetToClean();
      }
    } else {
      this.resetToClean();
    }
    this.save();
  }

  resetToClean() {
    this.data = {
      customers: [],
      stamps: [],
      redemptions: [],
      menu: OFFICIAL_MENU,
      orders: [],
      clearedAt: Date.now()
    };
    this.save();
  }

  syncFromClient({ orders = [], customers = [], stamps = [], redemptions = [], clientClearedAt = 0 }) {
    const clearedAt = this.data.clearedAt || 0;
    if (clientClearedAt && clientClearedAt > clearedAt) {
      this.data.clearedAt = clientClearedAt;
      this.data.orders = [];
      this.save();
    }

    const effectiveClearedAt = this.data.clearedAt || 0;

    if (Array.isArray(orders) && orders.length > 0) {
      orders.forEach(o => {
        if (!o || !o.id) return;
        const orderTime = o.createdAt ? new Date(o.createdAt).getTime() : 0;
        if (effectiveClearedAt && orderTime > 0 && orderTime < effectiveClearedAt) {
          return;
        }
        const existing = this.data.orders.find(item => item.id === o.id);
        if (!existing) {
          this.data.orders.push(o);
        } else {
          const currentRank = STATUS_RANK[existing.status] || 0;
          const incomingRank = STATUS_RANK[o.status] || 0;
          if (incomingRank > currentRank) {
            existing.status = o.status;
            existing.updatedAt = o.updatedAt || new Date().toISOString();
          }
          if (o.paymentMethod) {
            existing.paymentMethod = o.paymentMethod;
          }
          if (Array.isArray(o.statusHistory) && o.statusHistory.length > (existing.statusHistory?.length || 0)) {
            existing.statusHistory = o.statusHistory;
          }
        }
      });
    }

    if (Array.isArray(customers) && customers.length > 0) {
      customers.forEach(c => {
        if (!c || !c.id) return;
        const existing = this.data.customers.find(item => item.id === c.id || (item.phone && c.phone && item.phone === c.phone));
        if (!existing) {
          this.data.customers.push(c);
        } else {
          existing.stampsCount = Math.max(existing.stampsCount || 0, c.stampsCount || 0);
          existing.rewardAvailable = existing.rewardAvailable || c.rewardAvailable;
        }
      });
    }

    if (Array.isArray(stamps) && stamps.length > 0) {
      stamps.forEach(s => {
        if (s && s.id && !this.data.stamps.find(item => item.id === s.id)) {
          this.data.stamps.push(s);
        }
      });
    }

    if (Array.isArray(redemptions) && redemptions.length > 0) {
      redemptions.forEach(r => {
        if (r && r.id && !this.data.redemptions.find(item => item.id === r.id)) {
          this.data.redemptions.push(r);
        }
      });
    }

    this.save();
    return {
      success: true,
      clearedAt: this.data.clearedAt,
      ordersCount: this.data.orders.length,
      customersCount: this.data.customers.length
    };
  }

  save() {
    try {
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Failed to save database to disk:', err);
    }
  }

  // --- CUSTOMERS & LOYALTY ---
  getAllCustomers(search = '') {
    const q = search.trim().toLowerCase();
    if (!q) return [...this.data.customers].reverse();
    return this.data.customers.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.phone.includes(q) || 
      (c.email && c.email.toLowerCase().includes(q))
    ).reverse();
  }

  getCustomerByPhone(phone) {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    return this.data.customers.find(c => c.phone.replace(/\D/g, '') === cleanPhone);
  }

  getCustomerById(id) {
    return this.data.customers.find(c => c.id === id);
  }

  getCustomerDetails(idOrPhone) {
    const customer = this.getCustomerById(idOrPhone) || this.getCustomerByPhone(idOrPhone);
    if (!customer) return null;

    const stamps = this.data.stamps.filter(s => s.customerId === customer.id);
    const redemptions = this.data.redemptions.filter(r => r.customerId === customer.id);

    return {
      ...customer,
      currentCycleStamps: stamps.slice(-customer.stampsCount),
      historyStamps: stamps,
      redemptions
    };
  }

  enrollCustomer({ name, phone, email, favoriteItem }) {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 7) {
      throw new Error('Please enter a valid phone number (at least 7 digits)');
    }
    if (!name || name.trim().length < 2) {
      throw new Error('Please enter a customer name');
    }

    const existing = this.getCustomerByPhone(cleanPhone);
    if (existing) {
      throw new Error(`Phone number ${cleanPhone} is already enrolled under ${existing.name}.`);
    }

    const newCustomer = {
      id: `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: name.trim(),
      phone: cleanPhone,
      email: (email || '').trim().toLowerCase(),
      favoriteItem: favoriteItem || 'Belgium Chocolate Waffle',
      stampsCount: 0,
      cycleCount: 1,
      rewardAvailable: false,
      totalVisits: 0,
      totalRewardsEarned: 0,
      totalRewardsRedeemed: 0,
      enrolledAt: new Date().toISOString()
    };

    this.data.customers.push(newCustomer);
    this.save();
    return this.getCustomerDetails(newCustomer.id);
  }

  addStamp(customerId, { note = '911 Cafe Order', staff = 'Counter Staff' } = {}) {
    const customer = this.getCustomerById(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    if (customer.rewardAvailable) {
      return {
        customer: this.getCustomerDetails(customerId),
        status: 'ALREADY_QUALIFIED',
        message: 'Customer has completed 5 visits! 6th visit offer is already unlocked and ready to redeem!'
      };
    }

    const nextStampNumber = customer.stampsCount + 1;
    customer.stampsCount = nextStampNumber;
    customer.totalVisits += 1;

    const stampRecord = {
      id: `st-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      customerId: customer.id,
      stampNumber: nextStampNumber,
      note: note || '911 Cafe Purchase',
      date: new Date().toISOString(),
      staff: staff || 'Counter'
    };

    this.data.stamps.push(stampRecord);

    let rewardUnlocked = false;
    if (customer.stampsCount >= 5) {
      customer.rewardAvailable = true;
      customer.totalRewardsEarned += 1;
      rewardUnlocked = true;
    }

    this.save();

    return {
      customer: this.getCustomerDetails(customerId),
      stamp: stampRecord,
      rewardUnlocked,
      status: rewardUnlocked ? 'REWARD_UNLOCKED' : 'STAMP_ADDED',
      message: rewardUnlocked 
        ? '🎉 5 Purchases complete! 6th Visit Reward is officially unlocked!'
        : `Stamp #${nextStampNumber} added successfully! ${5 - nextStampNumber} more visit(s) to 6th free offer!`
    };
  }

  redeemReward(customerId, { rewardTitle = '6th Visit Offer: Free Treat', redeemedBy = 'Staff', itemChosen = 'Free Waffle of Choice' } = {}) {
    const customer = this.getCustomerById(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    if (!customer.rewardAvailable) {
      throw new Error('Customer has not unlocked the 6th visit offer yet (needs 5 stamps).');
    }

    customer.totalVisits += 1;
    customer.totalRewardsRedeemed += 1;
    customer.stampsCount = 0;
    customer.cycleCount += 1;
    customer.rewardAvailable = false;

    const redemptionRecord = {
      id: `rd-${Date.now()}`,
      customerId: customer.id,
      rewardTitle,
      itemChosen,
      date: new Date().toISOString(),
      redeemedBy: redeemedBy || 'Cashier'
    };

    this.data.redemptions.push(redemptionRecord);
    this.save();

    return {
      customer: this.getCustomerDetails(customerId),
      redemption: redemptionRecord,
      message: `🎉 Offer redeemed successfully! Customer enjoyed free ${itemChosen}. Loyalty card reset for Round #${customer.cycleCount}!`
    };
  }

  // --- ORDERS & COUNTER POS BILLING ---
  createOrder({
    customerName,
    customerPhone = '',
    orderType = 'dine-in', // 'dine-in' | 'parcel' | 'delivery'
    deliveryAddress = '',
    landmark = '',
    items = [],
    instructions = '',
    paymentMethod = 'cash',
    applyLoyaltyReward = false
  }) {
    if (!customerName || !customerName.trim()) {
      throw new Error('Customer Name is required.');
    }

    if (!items || items.length === 0) {
      throw new Error('Order must have at least 1 item.');
    }

    const cleanPhone = (customerPhone || '').replace(/\D/g, '');
    let customer = null;
    if (cleanPhone) {
      customer = this.getCustomerByPhone(cleanPhone);
      // Auto-enroll customer if new
      if (!customer) {
        customer = this.enrollCustomer({
          name: customerName.trim(),
          phone: cleanPhone,
          email: '',
          favoriteItem: items[0]?.name || 'Belgium Chocolate Waffle'
        });
      }
    }

    const subtotal = items.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity)), 0);

    let discount = 0;
    let rewardApplied = false;

    // Check if customer can redeem 6th free offer
    if (applyLoyaltyReward && customer && customer.rewardAvailable) {
      const highestPriceItem = [...items].sort((a, b) => b.price - a.price)[0];
      discount = highestPriceItem ? highestPriceItem.price : 99;
      rewardApplied = true;

      this.redeemReward(customer.id, {
        rewardTitle: '6th Visit Free Treat Applied on Order',
        redeemedBy: 'Counter POS',
        itemChosen: highestPriceItem?.name || 'Free Waffle'
      });
    }

    // Parcel charges: ₹10 for EACH item on parcel and delivery orders
    const totalItemCount = items.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);
    const isParcelOrDelivery = orderType === 'parcel' || orderType === 'delivery' || orderType === 'takeaway';
    const parcelCharges = isParcelOrDelivery ? (totalItemCount * 10) : 0;
    const deliveryFee = orderType === 'delivery' ? (subtotal >= 300 ? 0 : 20) : 0;
    const total = Math.max(0, subtotal - discount + parcelCharges + deliveryFee);

    const orderId = `911-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();

    const newOrder = {
      id: orderId,
      customerName: (customerName || (customer ? customer.name : 'Counter Customer')).trim(),
      customerPhone: cleanPhone,
      customerId: customer?.id || null,
      orderType, // 'dine-in' | 'parcel' | 'delivery'
      deliveryAddress: (deliveryAddress || '').trim(),
      landmark: (landmark || '').trim(),
      items,
      instructions: (instructions || '').trim(),
      subtotal,
      parcelCharges,
      deliveryFee,
      discount,
      total,
      paymentMethod,
      status: 'waiting', // Enters waiting orders monitor
      rewardApplied,
      createdAt: nowIso,
      statusHistory: [
        { status: 'waiting', timestamp: nowIso, note: `Order placed (${orderType.toUpperCase()})` }
      ]
    };

    this.data.orders.push(newOrder);

    // If loyalty customer did NOT redeem reward, auto-credit purchase stamp upon placing order
    let stampResult = null;
    if (customer && !rewardApplied) {
      try {
        stampResult = this.addStamp(customer.id, {
          note: `Order #${orderId} (${items.map(i => i.name).slice(0, 2).join(', ')})`,
          staff: 'Counter POS'
        });
      } catch (e) {
        console.warn('Auto-stamp notice:', e.message);
      }
    }

    this.save();

    return {
      order: newOrder,
      customer: customer ? this.getCustomerDetails(customer.id) : null,
      stampResult,
      message: `🎉 Order #${orderId} punched! Sent to Kitchen Monitor.`
    };
  }

  getOrders(filter = 'all') {
    let list = [...this.data.orders];

    if (filter === 'waiting') list = list.filter(o => o.status === 'waiting');
    else if (filter === 'preparing') list = list.filter(o => o.status === 'preparing');
    else if (filter === 'out_for_delivery') list = list.filter(o => o.status === 'out_for_delivery');
    else if (filter === 'delivered') list = list.filter(o => o.status === 'delivered');
    else if (filter === 'active') list = list.filter(o => ['waiting', 'preparing', 'out_for_delivery'].includes(o.status));

    return list.sort((a, b) => {
      if (a.status === 'waiting' && b.status !== 'waiting') return -1;
      if (b.status === 'waiting' && a.status !== 'waiting') return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  clearAllOrders() {
    this.data.orders = [];
    this.data.clearedAt = Date.now();
    this.save();
    return { success: true, clearedAt: this.data.clearedAt, message: 'All order data deleted successfully.' };
  }

  getOrderById(id) {
    const order = this.data.orders.find(o => o.id === id);
    if (!order) return null;
    const elapsedSeconds = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 1000);
    return {
      ...order,
      elapsedSeconds,
      elapsedMinutes: Math.floor(elapsedSeconds / 60)
    };
  }

  validateStaffPin(pin) {
    const validPins = ['7200', '9110'];
    const cleanPin = (pin || '').trim();
    if (validPins.includes(cleanPin)) {
      return {
        success: true,
        user: '911 Counter Cashier',
        role: 'Counter Staff',
        token: `staff-${Date.now()}`
      };
    }
    return {
      success: false,
      error: 'Invalid PIN. Please enter your 4-digit staff PIN.'
    };
  }

  updateOrderStatus(id, newStatus, staffNote = '', paymentMethod = null) {
    const order = this.data.orders.find(o => o.id === id);
    if (!order) throw new Error(`Order ${id} not found.`);

    const nowIso = new Date().toISOString();
    order.status = newStatus;
    order.updatedAt = nowIso;
    if (paymentMethod && ['cash', 'upi'].includes(paymentMethod.toLowerCase())) {
      order.paymentMethod = paymentMethod.toLowerCase();
    }

    let note = staffNote;
    if (!note) {
      if (newStatus === 'preparing') note = 'Baking on waffle iron';
      else if (newStatus === 'out_for_delivery') note = 'Dispatched / ready for pickup';
      else if (newStatus === 'delivered') note = `Completed & Delivered (Paid via ${order.paymentMethod ? order.paymentMethod.toUpperCase() : 'CASH'})`;
    }

    if (!Array.isArray(order.statusHistory)) {
      order.statusHistory = [];
    }
    order.statusHistory.push({ status: newStatus, timestamp: nowIso, note });
    this.save();

    return {
      order,
      newStatus,
      paymentMethod: order.paymentMethod,
      message: `Order #${order.id} status updated to ${newStatus.replace(/_/g, ' ').toUpperCase()}`
    };
  }

  getDailyBalance(targetDate = null) {
    // Default to today's date YYYY-MM-DD
    const dateStr = targetDate || new Date().toISOString().slice(0, 10);

    // Filter delivered / completed orders for this day
    const deliveredOrders = this.data.orders.filter(o => {
      if (o.status !== 'delivered') return false;
      const orderDate = (o.createdAt || '').slice(0, 10);
      return orderDate === dateStr;
    });

    let totalSales = 0;
    let cashTotal = 0;
    let upiTotal = 0;
    let parcelTotal = 0;
    let discountTotal = 0;
    const itemsMap = {};

    deliveredOrders.forEach(o => {
      const orderTotal = Number(o.total) || 0;
      totalSales += orderTotal;

      if (o.paymentMethod === 'upi') {
        upiTotal += orderTotal;
      } else {
        // Default is cash
        cashTotal += orderTotal;
      }

      parcelTotal += (Number(o.parcelCharges) || 0);
      discountTotal += (Number(o.discount) || 0);

      // Aggregate item counts
      if (Array.isArray(o.items)) {
        o.items.forEach(it => {
          if (!itemsMap[it.name]) {
            itemsMap[it.name] = { name: it.name, quantity: 0, revenue: 0, price: it.price };
          }
          itemsMap[it.name].quantity += Number(it.quantity) || 1;
          itemsMap[it.name].revenue += (Number(it.price) || 0) * (Number(it.quantity) || 1);
        });
      }
    });

    return {
      date: dateStr,
      totalSales,
      cashTotal, // 💵 Cash in Hand / Drawer
      upiTotal,  // 📱 Online UPI Collections
      parcelTotal,
      discountTotal,
      completedOrdersCount: deliveredOrders.length,
      itemsSold: Object.values(itemsMap).sort((a, b) => b.quantity - a.quantity),
      orders: deliveredOrders.map(o => ({
        id: o.id,
        time: o.createdAt,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        orderType: o.orderType,
        total: o.total,
        paymentMethod: o.paymentMethod || 'cash',
        itemsCount: o.items ? o.items.length : 0
      }))
    };
  }

  getMenu(category) {
    if (!category || category === 'all') return this.data.menu;
    return this.data.menu.filter(item => item.category === category);
  }

  getStats() {
    const totalCustomers = this.data.customers.length;
    const totalStampsGiven = this.data.stamps.length;
    const rewardsReady = this.data.customers.filter(c => c.rewardAvailable).length;
    const totalRedeemed = this.data.redemptions.length;
    const waitingOrders = this.data.orders.filter(o => o.status === 'waiting').length;
    const preparingOrders = this.data.orders.filter(o => o.status === 'preparing').length;
    const outForDeliveryOrders = this.data.orders.filter(o => o.status === 'out_for_delivery').length;
    const deliveredOrders = this.data.orders.filter(o => o.status === 'delivered').length;
    const totalOrders = this.data.orders.length;

    return {
      totalCustomers,
      totalStampsGiven,
      rewardsReady,
      totalRedeemed,
      waitingOrders,
      preparingOrders,
      outForDeliveryOrders,
      deliveredOrders,
      totalOrders
    };
  }
}

export const db = new Database();

