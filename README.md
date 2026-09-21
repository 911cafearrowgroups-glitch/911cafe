# 🥞 911 Cafe Website & Customer Loyalty Software

A modern web application for **911 Cafe** specializing in handcrafted **Gourmet Waffles**, **Fluffy Soufflé Pancakes**, and **Fudgy Brownies ("Bownee")**, with an integrated **Customer Loyalty Enrollment & 5-Stamp Reward Software**.

---

## 🌟 Key Features

### 1. 911 Cafe Brand & Menu Showcase
- **Mouth-Watering Menu**: Categorized into Belgian Waffles, Cloud Fluffy Pancakes, and Sizzling Fudgy Brownies.
- **Dedicated Logo Placeholder**: A placeholder in the navbar, footer, and branding components.
  - **To add your logo**: Simply save your logo image file as `public/logo.png`. The website will automatically detect and display it!

### 2. Customer Loyalty Program ("Buy 5, Get 6th Offer Free")
- **Customer Self-Enrollment**: Customers enter their Name, Mobile Number, and Email to immediately get their personal **Digital Loyalty Punch Card**.
- **Interactive 6-Slot Punch Card**:
  - Slots 1 through 5: Stamped upon each purchase with date and order note.
  - Slot 6: **6TH VISIT FREE OFFER UNLOCKED!** (Golden glow & confetti celebration).
- **Instant Card Lookup**: Customers can enter their phone number anytime to see how many stamps they have and when their next reward unlocks.

### 3. Cashier & Staff POS Portal
- **Counter Customer Search**: Instant search by phone number or customer name.
- **"+1 Add Purchase Stamp"**: One-click visit recording that increments stamps and auto-checks the 5-stamp milestone.
- **"🎁 Redeem 6th Visit Offer"**: When a customer visits the 6th time, cashier can select their free reward item (Free Waffle, Pancake, Brownie, or 50% discount) and reset the card for the next loyalty cycle while preserving lifetime stats.
- **New Customer Quick-Enrollment**: Register customers directly at the cashier desk.
- **Analytics & History**: Track total club members, stamps given, rewards ready, and total redeemed.

---

## 🚀 How to Run the Application

### Option 1: Start Both Frontend & Backend Together (Recommended)
```bash
npm run dev
```
- **Customer Website & Staff Portal**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

### Option 2: Run Production Server
```bash
npm run build
npm start
```
- Serves the entire fullstack app at `http://localhost:5000`.

---

## 🖼️ How to Add Your Official Logo
1. Save your logo file as `logo.png` (or `.svg` / `.jpg`).
2. Place it in the `public/` folder:
   ```
   911/
   └── public/
       └── logo.png  <-- Place your logo here
   ```
3. Refresh the browser! The site will automatically use your logo. If no file is provided, an elegant 911 Cafe badge is shown automatically.

---

## 🧪 Testing the Loyalty Flow
You can run the built-in automated test script anytime:
```bash
node test_loyalty.js
```
This tests enrollment, stamps 1 through 5, reward triggering on the 6th visit, redemption, card reset for round #2, and database persistence.
