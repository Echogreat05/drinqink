# Implementation Guide: Using the New Schema

This guide explains how to use each new table in your application code.

---

## 🎯 Feature 1: Group Orders

### When to use:
- Customers want to buy together (friends, team members, party planning)
- Split order costs automatically
- Close order at specific time, then process

### Database workflow:
```sql
-- 1. Organizer creates group order
INSERT INTO group_orders 
(organizer_id, vendor_id, title, description, closing_at, event_date)
VALUES (user_uuid, vendor_uuid, 'Birthday Party', 'For Sarah''s 30th', 
        now() + interval '24 hours', '2025-06-15');

-- 2. Members join
INSERT INTO group_order_members (group_order_id, member_id)
VALUES (group_order_uuid, member1_uuid);
-- (repeat for each member)

-- 3. Members add items
INSERT INTO group_order_items 
(group_order_id, member_id, product_id, quantity, unit_price, line_total)
VALUES (group_order_uuid, member1_uuid, product_uuid, 2, 2500, 5000);

-- 4. When closing_at reaches, create master order
-- (Your backend job should handle this)
```

### API Endpoints to build:
```
POST /api/group-orders              -- Create
GET  /api/group-orders/:id          -- Get details
POST /api/group-orders/:id/join     -- Join
POST /api/group-orders/:id/items    -- Add item
PUT  /api/group-orders/:id/status   -- Close/confirm/etc
```

---

## 🎨 Feature 2: AI Event Planner

### When to use:
- Customer says "I need drinks for 50 people, ₦100k budget"
- AI recommends vendors and products
- Customer accepts plan, vendors confirm

### Database workflow:
```sql
-- 1. Customer creates event plan (AI generates recommendations)
INSERT INTO event_plans 
(customer_id, event_type, guest_count, budget, dietary_preferences, status)
VALUES (customer_uuid, 'corporate', 50, 100000, 
        '["no alcohol for 5", "vegetarian options"]'::jsonb, 'recommended');

-- 2. For each AI recommendation, add item
INSERT INTO event_plan_items 
(event_plan_id, product_id, product_name, recommended_qty, unit_price, vendor_id)
VALUES (plan_uuid, product_uuid, 'Premium Beer Case', 10, 8000, vendor_uuid);

-- 3. Customer accepts plan
UPDATE event_plans SET status = 'accepted' WHERE id = plan_uuid;

-- 4. Vendors see bookings
INSERT INTO event_bookings (event_plan_id, vendor_id, status)
VALUES (plan_uuid, vendor_uuid, 'pending');

-- 5. Vendor accepts/rejects
UPDATE event_bookings SET status = 'accepted', accepted_at = now() WHERE id = booking_uuid;

-- 6. Convert to actual order (your backend)
```

### API Endpoints to build:
```
POST /api/event-plans                  -- Create event plan
GET  /api/event-plans/:id              -- Get plan details
POST /api/event-plans/:id/ai-recommend -- Trigger AI recommendations
PUT  /api/event-plans/:id/status       -- Accept/reject
GET  /api/vendors/:id/event-bookings   -- Vendor sees bookings
PUT  /api/event-bookings/:id/status    -- Vendor accept/reject
```

### AI Integration Points:
- After INSERT event_plan, call your AI service to generate recommendations
- Store results in event_plans.ai_recommendations JSONB
- Call POST /api/event-plans/:id/ai-recommend to fetch new recommendations

---

## ⭐ Feature 3: Loyalty Tiers

### When to use:
- Track customer spending/engagement
- Auto-tier customers based on points
- Give perks based on tier (discount multipliers, benefits)

### Database workflow:
```sql
-- 1. Tiers are pre-seeded (4 tiers: Bronze/Silver/Gold/Platinum)
SELECT * FROM loyalty_tiers;

-- 2. When customer earns points, create transaction
INSERT INTO loyalty_transactions 
(customer_id, transaction_type, points_amount, source, order_id, balance_after)
VALUES (customer_uuid, 'earned', 100, 'order_purchase', order_uuid, 
        (SELECT balance FROM loyalty_points WHERE customer_id = customer_uuid) + 100);

-- 3. Update customer's point balance
UPDATE loyalty_points SET balance = balance + 100 WHERE customer_id = customer_uuid;

-- 4. Check if customer moved up tier
-- (Your backend job - run after each transaction)
-- Find new tier: SELECT * FROM loyalty_tiers 
-- WHERE min_points <= (SELECT balance FROM loyalty_points WHERE customer_id = ?) 
-- ORDER BY min_points DESC LIMIT 1

-- 5. Customer redeems points for reward
INSERT INTO loyalty_rewards (name, points_required, discount_percent)
VALUES ('10% Off', 500, 10);

-- Then when redeemed:
INSERT INTO loyalty_transactions 
(customer_id, transaction_type, points_amount, source, balance_after)
VALUES (customer_uuid, 'redeemed', -500, 'reward_redemption', 
        (SELECT balance FROM loyalty_points WHERE customer_id = customer_uuid) - 500);
```

### Key calculations:
```sql
-- Get customer's current tier
SELECT lt.* FROM loyalty_tiers lt
JOIN loyalty_points lp ON lp.tier_id = lt.id
WHERE lp.customer_id = customer_uuid;

-- Get customer's total points
SELECT balance FROM loyalty_points WHERE customer_id = customer_uuid;

-- Get tier benefits
SELECT benefits FROM loyalty_tiers WHERE id = (
  SELECT tier_id FROM loyalty_points WHERE customer_id = customer_uuid
);
```

### API Endpoints to build:
```
GET  /api/loyalty/profile              -- Current tier, points, benefits
POST /api/loyalty/transactions         -- Log transaction
GET  /api/loyalty/rewards              -- Available rewards
POST /api/loyalty/redeem               -- Redeem reward
GET  /api/loyalty/history              -- Transaction history
```

---

## 🎁 Feature 4: Referrals (Enhanced)

### When to use:
- Customer invites friend
- Friend completes first order over min amount
- Both get bonuses

### Database workflow:
```sql
-- 1. Bonus amounts are pre-configured
SELECT * FROM referral_bonuses; -- Has customer + vendor types

-- 2. When referred customer is created
INSERT INTO referrals (referrer_id, referred_id, type)
VALUES (friend1_uuid, friend2_uuid, 'customer');

-- 3. When referred customer completes order over min amount
UPDATE referrals SET reward_given = true WHERE id = referral_uuid;

-- 4. Give referrer bonus
INSERT INTO loyalty_transactions (customer_id, transaction_type, points_amount, source)
VALUES (friend1_uuid, 'bonus', 2500, 'referral_reward');

-- 5. Give referred customer bonus
INSERT INTO loyalty_transactions (customer_id, transaction_type, points_amount, source)
VALUES (friend2_uuid, 'bonus', 1000, 'referral_reward');

-- 6. When customer redeems referral bonus
INSERT INTO referral_redemptions (referral_id, bonus_amount, redeemed_at, method)
VALUES (referral_uuid, 2500, now(), 'wallet');
```

### API Endpoints to build:
```
GET  /api/referrals/my-code            -- Get referral code
GET  /api/referrals/referrals-made     -- View referrals I made
GET  /api/referrals/referrals-received -- View who referred me
POST /api/referrals/redeem             -- Redeem bonus
```

---

## 📅 Feature 5: Subscriptions

### When to use:
- "Subscribe to weekly beer delivery"
- "Monthly wine club membership"
- Auto-place orders on schedule

### Database workflow:
```sql
-- 1. Customer creates subscription
INSERT INTO subscriptions 
(customer_id, vendor_id, name, frequency, next_order_date, status)
VALUES (customer_uuid, vendor_uuid, 'Weekly Beer Box', 'weekly', 
        (now()::date + interval '7 days'), 'active');

-- 2. Add items to subscription
INSERT INTO subscription_items (subscription_id, product_id, quantity, unit_price)
VALUES (subscription_uuid, beer_product_uuid, 1, 8000);

-- 3. Your backend job (runs daily):
-- Find all subscriptions with next_order_date = today AND status = 'active'
-- For each, create an order using subscription items
-- Then INSERT into subscription_orders to track which order was created

INSERT INTO subscription_orders (subscription_id, order_id, scheduled_for)
VALUES (subscription_uuid, generated_order_uuid, now()::date);

-- 4. Update next order date
UPDATE subscriptions SET next_order_date = (now()::date + interval '7 days') 
WHERE id = subscription_uuid;

-- 5. Customer can pause temporarily
UPDATE subscriptions SET status = 'paused', pause_until = now() + interval '2 weeks'
WHERE id = subscription_uuid;

-- 6. Your backend job (runs daily): Auto-unpause expired subscriptions
UPDATE subscriptions SET status = 'active', pause_until = NULL
WHERE status = 'paused' AND pause_until < now() AND id = subscription_uuid;
```

### API Endpoints to build:
```
POST /api/subscriptions                -- Create
GET  /api/subscriptions                -- List my subscriptions
GET  /api/subscriptions/:id            -- Get details
PUT  /api/subscriptions/:id            -- Update items, frequency
PUT  /api/subscriptions/:id/pause      -- Pause
PUT  /api/subscriptions/:id/resume     -- Resume
DELETE /api/subscriptions/:id          -- Cancel
GET  /api/subscriptions/:id/orders     -- View generated orders
```

### Backend Job:
```
// Pseudo code - run daily at 2 AM
const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
const subscriptions = await db.query(
  'SELECT * FROM subscriptions WHERE next_order_date = ? AND status = ?',
  [tomorrow.toISOString().split('T')[0], 'active']
);
for (const sub of subscriptions) {
  const orderId = await createOrderFromSubscription(sub);
  await db.query(
    'INSERT INTO subscription_orders (...) VALUES (...)',
    [sub.id, orderId, tomorrow]
  );
  await db.query(
    'UPDATE subscriptions SET next_order_date = ? WHERE id = ?',
    [getNextDate(sub.frequency), sub.id]
  );
}
```

---

## 📊 Feature 6: Vendor Analytics

### When to use:
- Show vendors "You made ₦50k this week"
- "50 customers ordered from you"
- "Your top selling product is X"

### Database workflow:
```sql
-- 1. Your backend job (runs nightly):
-- Aggregate daily metrics from orders table
INSERT INTO vendor_analytics 
(vendor_id, analytics_date, orders_count, total_sales, total_items_sold, unique_customers, average_order_value)
SELECT 
  o.vendor_id,
  DATE(o.created_at),
  COUNT(DISTINCT o.id),
  SUM(o.total_amount),
  SUM(oi.quantity),
  COUNT(DISTINCT o.customer_id),
  AVG(o.total_amount)
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE DATE(o.created_at) = yesterday
GROUP BY o.vendor_id;

-- 2. Aggregate product sales
INSERT INTO product_analytics 
(product_id, vendor_id, analytics_date, units_sold, revenue)
SELECT 
  oi.product_id,
  o.vendor_id,
  DATE(o.created_at),
  SUM(oi.quantity),
  SUM(oi.line_total)
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
WHERE DATE(o.created_at) = yesterday
GROUP BY oi.product_id, o.vendor_id;

-- 3. Track traffic events
INSERT INTO traffic_logs (vendor_id, product_id, user_id, event_type, session_id)
VALUES (vendor_uuid, product_uuid, customer_uuid, 'view', session_id);
-- Trigger this when: customer views product, add to cart, share, etc.
```

### Vendor Query Examples:
```sql
-- Vendor dashboard: This week's sales
SELECT SUM(total_sales) FROM vendor_analytics
WHERE vendor_id = vendor_uuid AND analytics_date >= (now()::date - interval '7 days');

-- Top products this month
SELECT product_id, SUM(units_sold), SUM(revenue) 
FROM product_analytics
WHERE vendor_id = vendor_uuid AND analytics_date >= (now()::date - interval '30 days')
GROUP BY product_id ORDER BY SUM(revenue) DESC;

-- Traffic to store
SELECT COUNT(*) FROM traffic_logs
WHERE vendor_id = vendor_uuid AND created_at >= now() - interval '7 days';
```

### API Endpoints to build:
```
GET  /api/vendors/:id/analytics/overview     -- Key metrics
GET  /api/vendors/:id/analytics/daily        -- Daily trend
GET  /api/vendors/:id/analytics/products     -- Product performance
GET  /api/vendors/:id/analytics/customers    -- Customer segments
POST /api/tracking/log-event                 -- Log view/click
```

---

## 🔔 Feature 7: Multi-Channel Notifications

### When to use:
- "Notify customer via SMS + Email + Push"
- Track delivery success/failure
- Let customers opt-in/opt-out

### Database workflow:
```sql
-- 1. Register customer's notification channels
INSERT INTO notification_channels (user_id, channel_type, channel_identifier, is_verified, is_primary)
VALUES (customer_uuid, 'email', 'john@example.com', true, true);
INSERT INTO notification_channels (user_id, channel_type, channel_identifier, is_verified, is_primary)
VALUES (customer_uuid, 'sms', '+234XXXXXXXXX', true, false);
INSERT INTO notification_channels (user_id, channel_type, channel_identifier, is_verified, is_primary)
VALUES (customer_uuid, 'push', 'device_token_abc123', true, false);

-- 2. Set preferences
INSERT INTO notification_preferences (user_id, order_updates, promotional, flash_deals)
VALUES (customer_uuid, true, true, false);

-- 3. When order status changes, queue notifications
INSERT INTO notification_sent_log 
(user_id, channel_id, channel_type, recipient, subject, content, status)
SELECT customer_uuid, nc.id, nc.channel_type, nc.channel_identifier, 
       'Order Confirmed', 'Your order #SC-ABC123 is confirmed', 'pending'
FROM notification_channels nc
WHERE nc.user_id = customer_uuid 
  AND nc.is_verified = true
  AND (
    (nc.channel_type = 'email' AND (SELECT order_updates FROM notification_preferences WHERE user_id = customer_uuid))
    OR (nc.channel_type IN ('sms', 'push'))
  );

-- 4. Your backend job processes pending notifications and updates status
-- Call email service, SMS API, push service
-- Then UPDATE status to 'sent' or 'failed'
UPDATE notification_sent_log SET status = 'sent', sent_at = now() WHERE id = log_uuid;
```

### API Endpoints to build:
```
POST /api/notifications/channels               -- Register device
GET  /api/notifications/channels               -- List my channels
DELETE /api/notifications/channels/:id         -- Remove channel
POST /api/notifications/preferences            -- Update preferences
GET  /api/notifications/history                -- View sent notifications
```

### Backend Job:
```
// Pseudo code - run every minute
const pending = await db.query(
  'SELECT * FROM notification_sent_log WHERE status = ? LIMIT 100',
  ['pending']
);
for (const item of pending) {
  let result;
  if (item.channel_type === 'email') {
    result = await sendEmail(item.recipient, item.subject, item.content);
  } else if (item.channel_type === 'sms') {
    result = await sendSMS(item.recipient, item.content);
  } else if (item.channel_type === 'push') {
    result = await sendPush(item.recipient, item.subject, item.content);
  }
  
  if (result.success) {
    await db.query('UPDATE notification_sent_log SET status = ?, sent_at = now() WHERE id = ?', 
      ['sent', item.id]);
  } else {
    await db.query('UPDATE notification_sent_log SET status = ?, error_message = ? WHERE id = ?', 
      ['failed', result.error, item.id]);
  }
}
```

---

## ❤️ Feature 8: Favorites

### When to use:
- "Add to favorites" button on vendor/product
- Show customer's saved items
- Quick re-ordering from favorites

### Database workflow:
```sql
-- Save a vendor
INSERT INTO favorites (user_id, vendor_id) VALUES (customer_uuid, vendor_uuid);

-- Save a product
INSERT INTO favorites (user_id, product_id) VALUES (customer_uuid, product_uuid);

-- Get customer's favorite vendors
SELECT v.* FROM favorites f
JOIN vendors v ON f.vendor_id = v.id
WHERE f.user_id = customer_uuid AND f.vendor_id IS NOT NULL;

-- Get customer's favorite products
SELECT p.* FROM favorites f
JOIN products p ON f.product_id = p.id
WHERE f.user_id = customer_uuid AND f.product_id IS NOT NULL;

-- Remove from favorites
DELETE FROM favorites WHERE user_id = customer_uuid AND product_id = product_uuid;
```

### API Endpoints to build:
```
POST /api/favorites                     -- Add to favorites
DELETE /api/favorites/:type/:id         -- Remove
GET /api/favorites/vendors              -- Get favorite vendors
GET /api/favorites/products             -- Get favorite products
GET /api/favorites/check                -- Check if item is favorited
```

---

## 🏢 Feature 9: Corporate Accounts

### When to use:
- Company buys drinks in bulk
- Manager approves employee orders
- Track spending per department
- Audit trail of all actions

### Database workflow:
```sql
-- 1. Owner creates corporate account (already exists)
-- Added tables extend it with team + approval workflows

-- 2. Add team members
INSERT INTO corporate_team_members 
(corporate_account_id, user_id, role, spending_limit, is_approver)
VALUES (corporate_uuid, manager_uuid, 'manager', 500000, true);

-- 3. Set department budgets
INSERT INTO corporate_budgets 
(corporate_account_id, department_name, budget_amount, period_start, period_end)
VALUES (corporate_uuid, 'Marketing', 1000000, '2025-01-01', '2025-01-31');

-- 4. Employee places order (marked as corporate)
-- When order created, if customer has corporate account:
INSERT INTO corporate_approvals 
(corporate_account_id, order_id, requested_by, assigned_to, status, approval_amount)
VALUES (corporate_uuid, order_uuid, employee_uuid, manager_uuid, 'pending', order_total);

-- 5. Manager approves or rejects
UPDATE corporate_approvals SET status = 'approved', approved_at = now() 
WHERE id = approval_uuid;

-- 6. Log activity for audit
INSERT INTO corporate_activity_log 
(corporate_account_id, actor_id, action, resource_type, resource_id, details)
VALUES (corporate_uuid, manager_uuid, 'approved_order', 'order', order_uuid, 
        '{"amount": 50000, "department": "Marketing"}'::jsonb);

-- 7. Track spending
UPDATE corporate_budgets SET spent_amount = spent_amount + 50000
WHERE corporate_account_id = corporate_uuid AND department_name = 'Marketing';
```

### API Endpoints to build:
```
POST /api/corporate/:id/team-members          -- Add member
GET  /api/corporate/:id/team-members          -- List members
DELETE /api/corporate/:id/team-members/:id    -- Remove member
POST /api/corporate/:id/approvals             -- View pending approvals
PUT  /api/corporate/approvals/:id             -- Approve/reject
GET  /api/corporate/:id/budgets               -- View budgets
POST /api/corporate/:id/budgets               -- Create budget
GET  /api/corporate/:id/activity              -- Audit log
GET  /api/corporate/:id/spending              -- Spending report
```

---

## ✅ Implementation Checklist

- [ ] Apply migration to development database
- [ ] Test all table structures and relationships
- [ ] Create corresponding API routes
- [ ] Implement RLS policy tests
- [ ] Build backend jobs (subscriptions, analytics aggregation, notifications)
- [ ] Create frontend components (favorites, corporate approval workflows, etc.)
- [ ] Write integration tests for new features
- [ ] Deploy to staging
- [ ] Performance test with analytics queries
- [ ] Deploy to production
- [ ] Monitor for any constraint violations

