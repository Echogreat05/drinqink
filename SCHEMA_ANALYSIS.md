# Supabase Database Schema Analysis

## EXISTING TABLES (in 20260520221633_*)

### Core User Management
- **profiles**: user info, display_name, phone, avatar_url, referral_code
- **user_roles**: separate table for role assignments (customer, vendor, admin)
- **addresses**: delivery addresses with coordinates

### Vendor Management
- **vendors**: business info, status, rating, commission, coverage areas
- **vendor_slots**: event booking slots with availability

### Products & Bundles
- **categories**: drink categories (beer, wine, spirits, etc.)
- **products**: items with pricing, stock, ABV, volume
- **packages**: vendor event bundles (for events/parties)
- **bundles**: customer-saved custom mixes

### Orders & Items
- **orders**: main order tracking with status, fees, paystack reference
- **order_items**: line items per order (basic: qty, price)
- **bookings**: event booking linkage to orders and slots

### Reviews & Ratings
- **reviews**: quality, packaging, communication, delivery, value scores

### Financial
- **payouts**: vendor payout tracking with commission deduction
- **loyalty_points**: simple points tracking with source

### Other Features
- **referrals**: referrer/referred relationships
- **flash_deals**: time-limited discounts on products
- **notifications**: simple notification log (in-app only)
- **waitlists**: out-of-stock product waitlists
- **disputes**: order disputes with evidence (JSONB)
- **corporate_accounts**: company account basics

### Enums Already Defined
- app_role (customer, vendor, admin)
- vendor_status (pending, approved, suspended, rejected)
- order_status (pending, confirmed, packing, dispatched, delivered, cancelled, disputed)
- stock_status (in_stock, low_stock, out_of_stock)
- payout_status (pending, processing, paid, on_hold)
- dispute_status (open, under_review, resolved_customer, resolved_vendor, closed)
- flash_deal_status (pending, active, expired, rejected)

---

## MISSING FEATURES & REQUIRED TABLES

### 1. Group Orders / Event Pooling
**Missing:**
- `group_orders` - main group order container
- `group_order_members` - members joining a group order
- `group_order_items` - shared items aggregated from members
**Why:** Current orders are individual; no pooling/aggregation for group purchasing

### 2. DrinkBoard AI Event Planner Bookings
**Missing:**
- `event_plans` - AI-generated event plans with details
- `event_bookings` - customer acceptance/confirmation of events
- `event_plan_items` - drinks recommended per event plan
**Why:** bookings table lacks event plan context and AI recommendation tracking

### 3. Loyalty Points System (Enhanced)
**Missing:**
- `loyalty_tiers` - different loyalty levels with benefits
- `loyalty_transactions` - detailed point transactions (earn, redeem, adjust)
- `loyalty_rewards` - redeemable rewards catalog
**Why:** Current loyalty_points only logs point additions; no tier system or redemption

### 4. Referrals (Enhanced)
**Missing:**
- `referral_bonuses` - bonus configuration per referral type
- `referral_redemptions` - track when bonuses are redeemed
**Why:** Current referrals lack detailed bonus tracking and redemption history

### 5. Subscriptions / Recurring Orders
**Missing:**
- `subscriptions` - recurring order setup
- `subscription_items` - products in recurring order
- `subscription_orders` - auto-generated orders from subscriptions
**Why:** No recurring order capability exists

### 6. Flash Deals (Enhanced)
**Current table exists but lacks:**
- Better inventory reserved tracking
- Deal performance metrics
**Status:** Partially complete; add metrics table

### 7. Vendor Analytics
**Missing:**
- `vendor_analytics` - daily/weekly metrics
- `product_analytics` - sales per product
- `traffic_logs` - visitor tracking
**Why:** No analytics/metrics storage for vendor dashboards

### 8. Disputes (Evidence Already in JSONB)
**Status:** Exists with `evidence JSONB`
**Enhancement:** Could add separate `dispute_evidence` table for better querying
**Recommendation:** Keep as JSONB for simplicity; add `dispute_comments` for threaded discussions

### 9. Order Items (Enhanced)
**Current:** basic quantity and pricing
**Missing:**
- `order_item_customizations` - customization options (ice level, garnish, etc.)
- Product specifications more granular
**Why:** Current order_items lack detail for custom drink orders

### 10. Notifications (Enhanced)
**Current:** simple in-app log
**Missing:**
- `notification_preferences` - user opt-in/opt-out
- `notification_sent_log` - email, SMS, push tracking
- `notification_channels` - device tokens, emails, phone numbers
**Why:** No channel management or delivery tracking

### 11. Favorites (Saved Items)
**Missing:**
- `favorites` - customers save vendors/drinks for quick access
**Why:** No saved items feature

### 12. Wishlist / Stock Watches
**Current:** `waitlists` exists for out-of-stock notifications
**Status:** Mostly complete; could enhance with notification delivery tracking

### 13. Corporate Accounts (with Team & Approval Workflows)
**Current:** `corporate_accounts` exists with owner + spending limit + approval flag
**Missing:**
- `corporate_team_members` - team member access
- `corporate_approvals` - approval workflow for orders
- `corporate_budgets` - budget allocation per department/member
- `corporate_activity_log` - audit trail
**Why:** Current table lacks team member and approval workflow structure

### 14. Subscription Customization / Scheduling
**Not yet addressed in any table**

---

## SUMMARY OF MISSING TABLES (16 tables to add)

| Feature | New Tables | Priority |
|---------|-----------|----------|
| Group Orders | group_orders, group_order_members, group_order_items | High |
| Event Planner | event_plans, event_bookings, event_plan_items | High |
| Loyalty Enhanced | loyalty_tiers, loyalty_transactions, loyalty_rewards | High |
| Referral Enhanced | referral_bonuses, referral_redemptions | Medium |
| Subscriptions | subscriptions, subscription_items, subscription_orders | High |
| Vendor Analytics | vendor_analytics, product_analytics, traffic_logs | Medium |
| Disputes Enhanced | dispute_comments | Medium |
| Order Items Custom | order_item_customizations | Medium |
| Notifications | notification_preferences, notification_sent_log, notification_channels | High |
| Favorites | favorites | High |
| Corporate Enhanced | corporate_team_members, corporate_approvals, corporate_budgets, corporate_activity_log | High |
| Wishlist Enhanced | (waitlist_notifications) | Low |

