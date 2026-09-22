import { db } from './server/db.js';

async function runFullTestSuite() {
  console.log('====================================================');
  console.log('🔍 911 CAFE FULL APPLICATION TEST & BUG CHECK SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // TEST 1: PIN AUTHENTICATION
  console.log('--- TEST 1: PIN Authentication ---');
  const authCashier = db.validateStaffPin('7200');
  assert(authCashier.success && authCashier.role === 'Cashier', 'PIN 7200 authenticates Counter Cashier');

  const authManager = db.validateStaffPin('9110');
  assert(authManager.success && authManager.role === 'Manager', 'PIN 9110 authenticates Manager');

  const authInvalid = db.validateStaffPin('0000');
  assert(!authInvalid.success && authInvalid.error, 'Invalid PIN 0000 rejected');

  // TEST 2: MENU CATALOG (30 OFFICIAL ITEMS)
  console.log('\n--- TEST 2: Menu Catalog Integrity ---');
  const allMenu = db.getMenu('all');
  assert(allMenu.length === 30, `Full menu contains 30 official items (Found: ${allMenu.length})`);

  const pancakes = db.getMenu('pancake');
  assert(pancakes.length === 4, `Pancakes category contains 4 items (Found: ${pancakes.length})`);

  const brownies = db.getMenu('brownie');
  assert(brownies.length === 6, `Brownies category contains 6 items (Found: ${brownies.length})`);

  const waffles = db.getMenu('classic');
  assert(waffles.length === 4, `Classic waffles contains 4 items (Found: ${waffles.length})`);

  // Verify prices & required fields
  const allHaveFields = allMenu.every(item => item.id && item.name && item.price > 0 && item.category);
  assert(allHaveFields, 'All 30 menu items have valid IDs, names, prices > 0, and categories');

  // TEST 3: ORDER CREATION & BILLING RESILIENCE
  console.log('\n--- TEST 3: Order Creation & Billing Calculations ---');
  
  // Wipe test orders first
  db.clearAllOrders();

  // Dine-in order with NO customer name (should default to Counter Customer)
  const order1 = db.createOrder({
    orderType: 'dine-in',
    items: [
      { id: 'cw-1', name: 'Belgium Chocolate Waffle', price: 89, quantity: 2 }
    ],
    paymentMethod: 'cash'
  });
  assert(order1.order && order1.order.id, 'Dine-in order placed without customer name');
  assert(order1.order.customerName === 'Counter Customer', 'Customer name defaulted to "Counter Customer"');
  assert(order1.order.subtotal === 178, `Subtotal correct (Expected: 178, Got: ${order1.order.subtotal})`);
  assert(order1.order.parcelCharges === 0, 'Dine-in has ₹0 parcel charges');
  assert(order1.order.total === 178, 'Grand total matches subtotal for dine-in');

  // Parcel order with partial phone number
  const order2 = db.createOrder({
    customerName: 'Aravind',
    customerPhone: '98401', // Partial phone (< 7 digits)
    orderType: 'parcel',
    items: [
      { id: 'br-5', name: 'Brownie Loaded', price: 89, quantity: 1 },
      { id: 'pc-4', name: 'Triple Chocolate Pancake', price: 79, quantity: 1 }
    ],
    paymentMethod: 'upi'
  });
  assert(order2.order && order2.order.id, 'Order created successfully despite partial phone');
  assert(order2.order.parcelCharges === 20, `Parcel charges applied ₹10 per item (Expected: 20, Got: ${order2.order.parcelCharges})`);
  assert(order2.order.total === (89 + 79 + 20), `Parcel total correct (Expected: 188, Got: ${order2.order.total})`);

  // TEST 4: ORDER STATUS TRANSITION & MONOTONICITY
  console.log('\n--- TEST 4: Kitchen Monitor Status Transitions ---');
  const orderId = order1.order.id;
  assert(order1.order.status === 'waiting', 'New order starts in "waiting" status');

  const step1 = db.updateOrderStatus(orderId, 'preparing', 'Started baking');
  assert(step1.status === 'preparing', 'Order transitioned to "preparing"');

  const step2 = db.updateOrderStatus(orderId, 'out_for_delivery', 'Ready for pickup');
  assert(step2.status === 'out_for_delivery', 'Order transitioned to "out_for_delivery"');

  const step3 = db.updateOrderStatus(orderId, 'delivered', 'Order served', 'cash');
  assert(step3.status === 'delivered', 'Order transitioned to "delivered"');

  // TEST 5: DAILY BALANCE CALCULATION
  console.log('\n--- TEST 5: Daily Balance & Payment Methods ---');
  // Also deliver order2
  db.updateOrderStatus(order2.order.id, 'delivered', 'Handed over', 'upi');

  const balance = db.getDailyBalance();
  assert(balance.totalSales === (178 + 188), `Total sales matches delivered orders (Expected: 366, Got: ${balance.totalSales})`);
  assert(balance.cashTotal === 178, `Cash drawer matches cash order (Expected: 178, Got: ${balance.cashTotal})`);
  assert(balance.upiTotal === 188, `UPI total matches UPI order (Expected: 188, Got: ${balance.upiTotal})`);
  assert(balance.parcelTotal === 20, `Parcel total matches (Expected: 20, Got: ${balance.parcelTotal})`);
  assert(balance.completedOrdersCount === 2, `Completed orders count matches (Expected: 2, Got: ${balance.completedOrdersCount})`);

  // TEST 6: CUSTOMER LOYALTY (5+1 VISIT CYCLE & REDEMPTION)
  console.log('\n--- TEST 6: Customer Loyalty (5 Purchases -> 6th Free Treat) ---');
  const testPhone = `99999${Math.floor(10000 + Math.random() * 90000)}`;
  const enrolled = db.enrollCustomer({
    name: 'Priya Sharma',
    phone: testPhone,
    email: 'priya@test.com',
    favoriteItem: 'Nutella Lava Crunch Waffle'
  });
  assert(enrolled && enrolled.id, `Customer enrolled: ${enrolled.name}`);
  assert(enrolled.stampsCount === 0 && !enrolled.rewardAvailable, 'New customer starts with 0 stamps and no reward');

  // Add 4 purchases
  for (let i = 1; i <= 4; i++) {
    db.addStamp(enrolled.id, { note: `Purchase #${i}` });
  }
  const custAfter4 = db.getCustomerDetails(enrolled.id);
  assert(custAfter4.stampsCount === 4 && !custAfter4.rewardAvailable, 'After 4 purchases: 4 stamps, reward not yet unlocked');

  // Add 5th purchase -> Qualifies!
  const stamp5 = db.addStamp(enrolled.id, { note: 'Purchase #5' });
  const custAfter5 = db.getCustomerDetails(enrolled.id);
  assert(custAfter5.stampsCount === 5 && custAfter5.rewardAvailable === true, '5th Purchase UNLOCKS 6th Visit Reward!');
  assert(stamp5.rewardUnlocked === true, 'addStamp returned rewardUnlocked: true');

  // Redeem 6th visit offer on an order
  const sixthOrder = db.createOrder({
    customerName: custAfter5.name,
    customerPhone: custAfter5.phone,
    orderType: 'dine-in',
    items: [
      { id: 'cw-1', name: 'Belgium Chocolate Waffle', price: 89, quantity: 1 },
      { id: 'sp-4', name: 'Lotus Biscoff Waffle', price: 129, quantity: 1 } // Highest price item ₹129
    ],
    paymentMethod: 'cash',
    applyLoyaltyReward: true
  });
  assert(sixthOrder.order.rewardApplied === true, 'Loyalty reward applied to 6th order');
  assert(sixthOrder.order.discount === 129, `Highest price item (₹129) made FREE (Discount: ${sixthOrder.order.discount})`);
  assert(sixthOrder.order.total === 89, `Customer only pays for remaining item (Expected: 89, Got: ${sixthOrder.order.total})`);

  const custAfterRedeem = db.getCustomerDetails(enrolled.id);
  assert(custAfterRedeem.stampsCount === 0, 'Stamps reset to 0 for next cycle');
  assert(custAfterRedeem.cycleCount === 2, 'Customer moved to Cycle #2');
  assert(custAfterRedeem.rewardAvailable === false, 'Reward flag reset after redemption');

  // CLEANUP: Reset orders to clean production state
  console.log('\n--- CLEANUP: Production Database Reset ---');
  db.clearAllOrders();
  const finalOrders = db.getOrders();
  assert(finalOrders.length === 0, 'Database orders cleanly reset to 0 for production');

  console.log('\n====================================================');
  console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runFullTestSuite().catch(err => {
  console.error('Fatal error in test suite:', err);
  process.exit(1);
});
