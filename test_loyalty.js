import http from 'http';
import { db } from './server/db.js';

console.log('--- 🧪 STARTING 911 CAFE VERIFICATION TESTS ---');

try {
  // Test 1: Check Menu
  const waffles = db.getMenu('waffles');
  const pancakes = db.getMenu('pancakes');
  const brownies = db.getMenu('brownies');
  console.log(`✅ Menu loaded: ${waffles.length} Waffles, ${pancakes.length} Pancakes, ${brownies.length} Brownies`);

  // Test 2: Enroll new customer
  const testPhone = '9999911911';
  // remove if exists
  db.data.customers = db.data.customers.filter(c => c.phone !== testPhone);
  
  const enrolled = db.enrollCustomer({
    name: 'Rohan Sharma',
    phone: testPhone,
    email: 'rohan@911cafe.test',
    favoriteItem: 'Nutella Lava Crunch Waffle'
  });
  console.log(`✅ Customer enrolled: ${enrolled.name} (Phone: ${enrolled.phone}, Stamps: ${enrolled.stampsCount})`);

  // Test 3: Add stamps 1 through 4
  for (let i = 1; i <= 4; i++) {
    const res = db.addStamp(enrolled.id, { note: `Order #${i} Waffle combo`, staff: 'Tester' });
    console.log(`✅ Stamp #${i} added -> Total visits: ${res.customer.totalVisits}, Stamps: ${res.customer.stampsCount}, Reward ready: ${res.customer.rewardAvailable}`);
  }

  // Test 4: Add 5th stamp -> 6th visit offer MUST unlock!
  const fifthRes = db.addStamp(enrolled.id, { note: `Order #5 Brownie skillet`, staff: 'Tester' });
  console.log(`✅ Stamp #5 added -> Status: ${fifthRes.status}, Reward Unlocked: ${fifthRes.rewardUnlocked}, Reward Ready: ${fifthRes.customer.rewardAvailable}`);
  if (!fifthRes.customer.rewardAvailable) {
    throw new Error('FAILED: Reward was not available after 5 visits!');
  }

  // Test 5: Staff redeems 6th visit offer!
  const redeemRes = db.redeemReward(enrolled.id, {
    rewardTitle: '6th Visit Special Offer: Free Gourmet Treat',
    redeemedBy: 'Cashier 1',
    itemChosen: 'Free Belgian Golden Waffle'
  });
  console.log(`✅ 6th Visit Offer Redeemed! Message: ${redeemRes.message}`);
  console.log(`✅ Post-redemption: Stamps: ${redeemRes.customer.stampsCount}, Round: #${redeemRes.customer.cycleCount}, Total Visits: ${redeemRes.customer.totalVisits}, Total Redeemed: ${redeemRes.customer.totalRewardsRedeemed}`);

  if (redeemRes.customer.stampsCount !== 0) {
    throw new Error('FAILED: Stamps did not reset to 0 for next round!');
  }
  if (redeemRes.customer.totalVisits !== 6) {
    throw new Error(`FAILED: Expected 6 total visits, got ${redeemRes.customer.totalVisits}`);
  }
  if (redeemRes.customer.cycleCount !== 2) {
    throw new Error('FAILED: Cycle count did not increment to round 2!');
  }

  // Test 6: Stats test
  const stats = db.getStats();
  console.log('✅ Final System Stats:', JSON.stringify(stats));

  console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! 911 CAFE LOYALTY SYSTEM IS 100% OPERATIONAL.');
} catch (err) {
  console.error('❌ Test failed:', err);
  process.exit(1);
}
