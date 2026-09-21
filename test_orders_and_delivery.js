import { db } from './server/db.js';

console.log('--- 🧪 STARTING 911 CAFE ORDER, DELIVERY & WAITING MONITOR TESTS ---');

try {
  // Test 1: Place a new home delivery order
  const orderData = {
    customerName: 'Kavita Singh',
    customerPhone: '9811223344',
    orderType: 'delivery',
    deliveryAddress: 'Flat 504, Windsor Court, Ring Road',
    landmark: 'Opposite Metro Pillar 128',
    items: [
      { id: 'waf-2', name: 'Nutella Lava Crunch Waffle', price: 240, quantity: 2, category: 'waffles' },
      { id: 'brw-1', name: 'Sizzling Fudgy Bownee & Ice Cream', price: 230, quantity: 1, category: 'brownies' }
    ],
    instructions: 'Extra hot fudge please!',
    paymentMethod: 'cash_on_delivery',
    applyLoyaltyReward: false
  };

  const createRes = db.createOrder(orderData);
  const order = createRes.order;
  console.log(`✅ Order created successfully: #${order.id}`);
  console.log(`   Status: ${order.status}, Total: ₹${order.total}, Type: ${order.orderType}`);
  console.log(`   Address: ${order.deliveryAddress}`);

  if (order.status !== 'waiting') {
    throw new Error(`Expected initial status 'waiting', got ${order.status}`);
  }

  // Test 2: Verify Waiting Orders Queue
  const waitingOrders = db.getOrders('waiting');
  const foundInWaiting = waitingOrders.find(o => o.id === order.id);
  if (!foundInWaiting) {
    throw new Error(`Order #${order.id} was not found in waiting orders queue!`);
  }
  console.log(`✅ Order #${order.id} is present in Waiting Orders Queue (Total waiting: ${waitingOrders.length})`);

  // Test 3: Kitchen marks order as 'preparing'
  const prepRes = db.updateOrderStatus(order.id, 'preparing', 'Chef started baking waffles on irons');
  console.log(`✅ Step 1: ${prepRes.message}`);
  if (prepRes.order.status !== 'preparing') {
    throw new Error('Status failed to transition to preparing');
  }

  // Test 4: Kitchen marks order as 'out_for_delivery'
  const dispatchRes = db.updateOrderStatus(order.id, 'out_for_delivery', 'Rider Amit dispatched with hot thermal bag');
  console.log(`✅ Step 2: ${dispatchRes.message}`);
  if (dispatchRes.order.status !== 'out_for_delivery') {
    throw new Error('Status failed to transition to out_for_delivery');
  }

  // Test 5: Mark order as 'delivered'
  const deliverRes = db.updateOrderStatus(order.id, 'delivered', 'Delivered to customer doorstep');
  console.log(`✅ Step 3: ${deliverRes.message}`);
  if (deliverRes.order.status !== 'delivered') {
    throw new Error('Status failed to transition to delivered');
  }

  // Test 6: Verify customer auto-earned a loyalty stamp upon delivery!
  const customer = db.getCustomerByPhone('9811223344');
  console.log(`✅ Customer Loyalty Post-Delivery: ${customer.name} has ${customer.stampsCount} stamp(s), total visits: ${customer.totalVisits}`);
  if (customer.stampsCount < 1) {
    throw new Error('Customer did not receive loyalty stamp upon delivery!');
  }

  // Test 7: Verify Overall Order & Waiting Stats
  const stats = db.getStats();
  console.log(`✅ System Stats: Waiting: ${stats.waitingOrders}, Preparing: ${stats.preparingOrders}, Out for Delivery: ${stats.outForDeliveryOrders}, Delivered: ${stats.deliveredOrders}, Total Orders: ${stats.totalOrders}`);

  console.log('🎉 ALL ORDER, DELIVERY & WAITING MONITOR TESTS PASSED SUCCESSFULLY!');
} catch (err) {
  console.error('❌ Test failed:', err);
  process.exit(1);
}
