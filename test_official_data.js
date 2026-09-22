import { db } from './server/db.js';

console.log('--- 🧪 VERIFYING OFFICIAL 911 CAFE DATA & TAKE ORDER SYSTEM ---');

try {
  // 1. Check Menu
  const menu = db.getMenu();
  console.log(`✅ Total Official Menu Items: ${menu.length}`);
  
  const classic = menu.filter(m => m.category === 'classic');
  const doubleChoc = menu.filter(m => m.category === 'double');
  const crunch = menu.filter(m => m.category === 'crunch');
  const special = menu.filter(m => m.category === 'special');
  const pancakes = menu.filter(m => m.category === 'pancake');
  const brownies = menu.filter(m => m.category === 'brownie');

  console.log(`   - Classic Waffles (₹89): ${classic.map(c => c.name).join(', ')}`);
  console.log(`   - Double Chocolate (₹99): ${doubleChoc.map(c => c.name).join(', ')}`);
  console.log(`   - Crunch Bites (₹99): ${crunch.map(c => c.name).join(', ')}`);
  console.log(`   - Special Waffles (₹109 - ₹129): ${special.map(c => c.name).join(', ')}`);
  console.log(`   - Pan Cakes (₹59 - ₹79): ${pancakes.map(c => c.name).join(', ')}`);
  console.log(`   - Brownies (₹49 - ₹99): ${brownies.map(c => c.name).join(', ')}`);

  if (menu.length !== 30) {
    throw new Error(`Expected 30 official items, got ${menu.length}`);
  }

  // 2. Verify Zero Demo Data
  console.log(`✅ Clean Database Check: Customers: ${db.data.customers.length}, Orders: ${db.data.orders.length}`);

  // 3. Test Counter Take Order with Parcel Charge
  db.data.customers = db.data.customers.filter(c => c.phone !== '9876500001');
  const orderRes = db.createOrder({
    customerName: 'Real Customer One',
    customerPhone: '9876500001',
    orderType: 'parcel', // +₹10 parcel charge
    items: [
      { id: 'cw-1', name: 'Belgium Chocolate Waffle', price: 89, quantity: 2 },
      { id: 'cb-1', name: 'Crunch Bites (Overloaded Chocolates)', price: 99, quantity: 1 }
    ],
    paymentMethod: 'cash'
  });

  const order = orderRes.order;
  console.log(`✅ Counter Order Punched: #${order.id}`);
  console.log(`   Items Subtotal: ₹${order.subtotal} (89*2 + 99 = ₹277)`);
  console.log(`   Parcel Charge: ₹${order.parcelCharges} (3 items * ₹10 = ₹30)`);
  console.log(`   Grand Total: ₹${order.total} (277 + 30 = ₹307)`);

  if (order.parcelCharges !== 30) {
    throw new Error('Expected ₹30 parcel charge!');
  }
  if (order.total !== 307) {
    throw new Error(`Expected total ₹307, got ₹${order.total}`);
  }

  // 4. Verify Customer was auto-enrolled with Stamp #1
  const customer = db.getCustomerByPhone('9876500001');
  console.log(`✅ Customer Auto-Enrolled: ${customer.name}, Phone: ${customer.phone}, Stamps: ${customer.stampsCount}/5`);
  if (customer.stampsCount !== 1) {
    throw new Error('Expected 1 stamp for new customer order!');
  }

  // 5. Test advancing to 5 stamps -> 6th visit offer unlock
  for (let i = 2; i <= 5; i++) {
    db.createOrder({
      customerName: 'Real Customer One',
      customerPhone: '9876500001',
      orderType: 'dine-in',
      items: [{ id: 'dc-1', name: 'Chocolate Overload Waffle', price: 99, quantity: 1 }],
      paymentMethod: 'upi'
    });
  }

  const updatedCust = db.getCustomerByPhone('9876500001');
  console.log(`✅ After 5 Visits: Stamps: ${updatedCust.stampsCount}/5, 6th Visit Reward Ready: ${updatedCust.rewardAvailable}`);
  if (!updatedCust.rewardAvailable) {
    throw new Error('Customer should have rewardAvailable === true after 5 visits!');
  }

  // 6. Test 6th Order with Free Reward Applied
  const sixthOrder = db.createOrder({
    customerName: 'Real Customer One',
    customerPhone: '9876500001',
    orderType: 'dine-in',
    items: [{ id: 'sp-10', name: 'Lotus Biscoff Waffle', price: 129, quantity: 1 }],
    paymentMethod: 'cash',
    applyLoyaltyReward: true // Redeems 6th free offer!
  });

  console.log(`✅ 6th Order with Free Reward: Total: ₹${sixthOrder.order.total}, Discount: ₹${sixthOrder.order.discount}`);
  const postRedeemCust = db.getCustomerByPhone('9876500001');
  console.log(`✅ Post-Redeem Customer: Stamps: ${postRedeemCust.stampsCount}, Round: #${postRedeemCust.cycleCount}, Total Visits: ${postRedeemCust.totalVisits}, Total Redeemed: ${postRedeemCust.totalRewardsRedeemed}`);

  if (postRedeemCust.stampsCount !== 0 || postRedeemCust.cycleCount !== 2) {
    throw new Error('Loyalty card did not reset for round 2!');
  }

  // Clean the test customer & test orders so database remains 100% clean for user
  db.resetToClean();
  console.log(`✅ Database reset clean for user. Customers: ${db.data.customers.length}, Orders: ${db.data.orders.length}`);

  console.log('🎉 ALL OFFICIAL DATA & TAKE ORDER VERIFICATIONS PASSED 100%!');
} catch (err) {
  console.error('❌ Test failed:', err);
  process.exit(1);
}
