# Database Schema: Existing vs. Missing

## EXISTING SCHEMA (20260520221633_*)

### Tables (23 total)

#### User Management (3)
- ✅ `profiles` - user display name, phone, avatar, referral code
- ✅ `user_roles` - role assignments (customer/vendor/admin)
- ✅ `addresses` - delivery addresses with geocoding

#### Business (2)
- ✅ `corporate_accounts` - company basics (owner, spending limit, approval flag)
- ⚠️ **MISSING: corporate_accounts extensions** (team members, approval workflows, budgets, audit log)

#### Vendor Management (3)
- ✅ `vendors` - business info, status, ratings, commission
- ✅ `vendor_slots` - event booking time slots
- ⚠️ **MISSING: vendor_analytics** (daily metrics, sales tracking, traffic logs)

#### Catalog (4)
- ✅ `categories` - drink categories with 10 seed values
- ✅ `products` - items with price, stock, ABV, volume
- ✅ `packages` - vendor event bundles
- ✅ `bundles` - customer-saved mixes

#### Orders (2)
- ✅ `orders` - order header with status, fees, amounts
- ✅ `order_items` - line items with qty, price
- ⚠️ **MISSING: group_orders** (pooled orders)
- ⚠️ **MISSING: order_item_customizations** (custom options)

#### Bookings & Slots (2)
- ✅ `bookings` - event booking entry
- ⚠️ **MISSING: event_plans** (AI-generated event plans)
- ⚠️ **MISSING: event_bookings** (plan acceptance workflow)
- ⚠️ **MISSING: event_plan_items** (items per plan)

#### Reviews (1)
- ✅ `reviews` - 5-point scoring (quality, packaging, communication, delivery, value)

#### Financial (2)
- ✅ `payouts` - vendor payment tracking with commission
- ✅ `loyalty_points` - simple point logging
- ⚠️ **MISSING: loyalty_tiers** (tiered benefits)
- ⚠️ **MISSING: loyalty_transactions** (detailed transaction log)
- ⚠️ **MISSING: loyalty_rewards** (redeemable catalog)

#### Marketing (2)
- ✅ `referrals` - referrer/referred relationship
- ✅ `flash_deals` - time-limited discounts
- ⚠️ **MISSING: referral_bonuses** (configurable bonuses)
- ⚠️ **MISSING: referral_redemptions** (redemption tracking)

#### Notifications & Engagement (2)
- ✅ `notifications` - simple in-app log
- ✅ `waitlists` - out-of-stock watches
- ⚠️ **MISSING: notification_channels** (email/SMS/push tokens)
- ⚠️ **MISSING: notification_preferences** (opt-in/opt-out)
- ⚠️ **MISSING: notification_sent_log** (delivery tracking)
- ⚠️ **MISSING: favorites** (saved vendors/products)

#### Issues & Support (1)
- ✅ `disputes` - order disputes with evidence JSONB
- ⚠️ **MISSING: dispute_comments** (threaded discussion)

---

## MISSING IMPLEMENTATIONS

### Feature 1: Group Orders / Event Pooling ⭐
**Requirement:** Allow multiple customers to pool orders together

**New Tables:**
```
group_orders
├── id, organizer_id, vendor_id, title, status
├── participants_count, closing_at, event_date
└── subtotal, service_fee, delivery_fee, total_amount

group_order_members
├── group_order_id, member_id, member_amount, status
└── joined_at

group_order_items
├── group_order_id, member_id, product_id
├── product_name, quantity, unit_price, line_total
└── created_at
```

**Enums:**
- `group_order_status` - open, closing_soon, closed, confirmed, preparing, ready, completed, cancelled

---

### Feature 2: AI Event Planner Bookings ⭐⭐⭐
**Requirement:** Generate event plans with AI recommendations, vendor acceptance workflow

**New Tables:**
```
event_plans
├── customer_id, event_type, guest_count, budget
├── dietary_preferences, special_requests (JSONB)
├── status, ai_recommendations (JSONB)
└── created_at, updated_at

event_plan_items
├── event_plan_id, product_id, product_name
├── recommended_qty, unit_price, vendor_id
└── notes, created_at

event_bookings
├── event_plan_id, vendor_id, order_id
├── status, accepted_at
└── created_at
```

**Enums:**
- `event_plan_status` - draft, recommended, accepted, rejected, completed

---

### Feature 3: Tiered Loyalty Program ⭐⭐
**Requirement:** Multi-tier loyalty with multipliers and benefits

**New Tables:**
```
loyalty_tiers
├── name (Bronze/Silver/Gold/Platinum)
├── level, min_points, max_points
├── multiplier (1.0x to 2.0x)
├── benefits (JSONB array)
└── created_at

loyalty_transactions (detailed log)
├── customer_id, transaction_type
├── points_amount, source, order_id
├── balance_before, balance_after
├── description, created_at
└── indexes on (customer_id, type)

loyalty_rewards (redeemable catalog)
├── name, description, points_required
├── discount_percent OR discount_amount
├── max_uses, uses, active
└── expires_at

loyalty_points (altered)
├── + balance INT
├── + tier_id UUID (FK to loyalty_tiers)
└── (keeps: id, customer_id, points, source, order_id, created_at)
```

**Enums:**
- `loyalty_transaction_type` - earned, redeemed, adjusted, expired, bonus

---

### Feature 4: Enhanced Referrals ⭐
**Requirement:** Track referral bonuses and redemptions

**New Tables:**
```
referral_bonuses
├── referral_type (customer, vendor)
├── referrer_bonus, referred_bonus
├── min_order_amount, active
└── created_at

referral_redemptions
├── referral_id, bonus_amount
├── redeemed_at, method (wallet, etc.)
└── created_at
```

---

### Feature 5: Subscriptions / Recurring Orders ⭐⭐⭐
**Requirement:** Automatic recurring orders (weekly, biweekly, monthly)

**New Tables:**
```
subscriptions
├── customer_id, vendor_id, name, description
├── status (active/paused/cancelled/pending_first_order)
├── frequency (weekly/biweekly/monthly)
├── next_order_date, last_order_date
├── pause_until, total_spent
├── subtotal, service_fee, delivery_fee
├── created_at, updated_at
└── indexes on (customer_id, vendor_id, status)

subscription_items
├── subscription_id, product_id
├── quantity, unit_price
└── created_at

subscription_orders
├── subscription_id, order_id
├── scheduled_for (DATE)
└── created_at
```

**Enums:**
- `subscription_status` - active, paused, cancelled, pending_first_order
- `subscription_frequency` - weekly, biweekly, monthly

---

### Feature 6: Vendor Analytics ⭐⭐⭐
**Requirement:** Dashboard metrics for vendors (sales, customers, traffic)

**New Tables:**
```
vendor_analytics (daily aggregates)
├── vendor_id, analytics_date
├── orders_count, total_sales, total_items_sold
├── unique_customers, average_order_value
├── cancellation_rate, page_views
├── created_at
└── unique (vendor_id, analytics_date)

product_analytics (per-product daily)
├── product_id, vendor_id, analytics_date
├── units_sold, revenue, views
├── created_at
└── unique (product_id, analytics_date)

traffic_logs (granular visitor tracking)
├── vendor_id, product_id, user_id
├── event_type (view, click, add_to_cart, etc.)
├── session_id, created_at
└── indexes on (vendor_id, product_id, created_at)
```

---

### Feature 7: Disputes - Enhanced ⭐
**Requirement:** Threaded discussion on disputes (ALREADY HAS EVIDENCE JSONB)

**New Table:**
```
dispute_comments
├── dispute_id, user_id, comment TEXT
├── attachments (JSONB array)
├── created_at
└── indexes on (dispute_id, user_id)
```

---

### Feature 8: Order Items - Customizations ⭐
**Requirement:** Track custom options on order items (ice level, garnish, etc.)

**New Table:**
```
order_item_customizations
├── order_item_id, customization_name, customization_value
├── price_adjustment
├── created_at
└── indexes on (order_item_id)
```

---

### Feature 9: Notifications - Multi-Channel ⭐⭐⭐
**Requirement:** Email, SMS, push, in-app with delivery tracking

**New Tables:**
```
notification_channels (device registry)
├── user_id, channel_type (email/sms/push/in_app)
├── channel_identifier (phone/email/device_token)
├── is_verified, is_primary
├── created_at
└── unique (user_id, channel_type, channel_identifier)

notification_preferences (opt-in/opt-out)
├── user_id (unique)
├── order_updates, promotional, flash_deals
├── new_products, loyalty_rewards, system_alerts
├── created_at, updated_at
└── booleans default true

notification_sent_log (delivery tracking)
├── notification_id, user_id, channel_id
├── channel_type, recipient, subject, content
├── status (pending/sent/failed/bounced)
├── error_message, sent_at
├── created_at
└── indexes on (user_id, status, created_at)
```

**Enums:**
- `notification_channel_type` - email, sms, push, in_app
- `notification_status` - pending, sent, failed, bounced

---

### Feature 10: Favorites ⭐
**Requirement:** Customers save vendors or products

**New Table:**
```
favorites
├── user_id, vendor_id (nullable), product_id (nullable)
├── created_at
├── CHECK: exactly one of (vendor_id, product_id) is NOT NULL
├── unique (user_id, vendor_id, product_id)
└── indexes on (user_id, vendor_id, product_id)
```

---

### Feature 11: Corporate Accounts - Enhanced ⭐⭐⭐
**Requirement:** Team members, approval workflows, budgets, audit

**New Tables:**
```
corporate_team_members
├── corporate_account_id, user_id (unique per account)
├── role (member/manager/approver)
├── spending_limit, is_approver
├── added_at
└── indexes on (corporate_account_id, user_id)

corporate_approvals (order approval workflow)
├── corporate_account_id, order_id (unique)
├── requested_by, assigned_to (approver)
├── status (pending/approved/rejected)
├── approval_amount, notes
├── approved_at, rejected_at
├── created_at
└── indexes on (corporate_account_id, status)

corporate_budgets (per-department or per-member)
├── corporate_account_id, department_name
├── member_id (nullable), budget_amount
├── spent_amount, period_start, period_end
├── created_at, updated_at
└── indexes on (corporate_account_id)

corporate_activity_log (audit trail)
├── corporate_account_id, actor_id
├── action (added_member, approved_order, etc.)
├── resource_type, resource_id, details (JSONB)
├── created_at
└── indexes on (corporate_account_id, created_at)
```

**Enums:**
- `approval_status` - pending, approved, rejected

---

## SUMMARY TABLE

| Feature | Existing Tables | New Tables | Status |
|---------|-----------------|-----------|--------|
| User Management | 3 | 0 | ✅ Complete |
| Vendor Management | 2 | 3 | ⚠️ Partial (need analytics) |
| Catalog | 4 | 0 | ✅ Complete |
| Orders | 2 | 3 | ⚠️ Partial (need group orders & customizations) |
| Bookings | 1 | 3 | ⚠️ Partial (need event planning) |
| Reviews | 1 | 0 | ✅ Complete |
| Financial | 2 | 3 | ⚠️ Partial (need loyalty tiers & referral tracking) |
| Marketing | 2 | 2 | ⚠️ Partial (need referral bonuses) |
| Notifications | 2 | 3 | ⚠️ Partial (need multi-channel & tracking) |
| Issues | 1 | 1 | ⚠️ Partial (need threaded comments) |
| **Corporate** | 1 | 4 | ⚠️ Partial (need team & workflows) |
| **Analytics** | 0 | 3 | ❌ Missing completely |
| **Subscriptions** | 0 | 3 | ❌ Missing completely |
| **Favorites** | 0 | 1 | ❌ Missing completely |

**Total:** 23 existing tables + **26 new tables** = **49 tables total**

---

## Data Integrity & Relationships

All new tables include:
- ✅ Primary keys (UUID)
- ✅ Foreign keys with proper ON DELETE rules
- ✅ Timestamps (created_at, updated_at)
- ✅ Update triggers for updated_at
- ✅ Unique constraints where needed
- ✅ Check constraints (e.g., favorites must have vendor OR product)
- ✅ Composite indexes for query efficiency
- ✅ Row Level Security (RLS) policies
- ✅ Proper enum usage

