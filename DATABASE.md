# AI Changing Room - Database Design

## Overview

The application uses Supabase (PostgreSQL) as the primary database.

The database should be normalized, scalable, and secure.

Use UUIDs as primary keys for all tables.

Enable Row Level Security (RLS) wherever applicable.

---

# Users

Stores authentication and user information.

Fields

- id (UUID, Primary Key)
- full_name
- email
- phone
- role (owner, staff)
- created_at
- updated_at

---

# Stores

Stores business information.

Fields

- id
- owner_id
- store_name
- logo
- address
- city
- state
- country
- phone
- email
- subscription_plan
- created_at

---

# Staff

Employees working in a store.

Fields

- id
- store_id
- user_id
- designation
- status
- created_at

---

# Products

Inventory of clothing items.

Fields

- id
- store_id
- product_name
- sku
- barcode
- category
- brand
- fabric
- color
- size
- price
- stock
- description
- thumbnail
- created_at

---

# Product Images

Multiple images for each product.

Fields

- id
- product_id
- image_url
- image_type

Examples

- Front
- Back
- Side
- Border
- Pallu
- Detail

---

# Customer Sessions

Created when a QR code is generated.

Fields

- id
- store_id
- product_id
- session_token
- expires_at
- created_at

---

# Customers

Guest customers using the AI try-on.

Fields

- id
- session_id
- name (optional)
- phone (optional)
- created_at

---

# Try-On Results

Stores AI-generated images.

Fields

- id
- customer_id
- product_id
- original_image
- generated_image
- ai_provider
- generation_status
- created_at

---

# Favorites

Stores customer's favorite try-ons.

Fields

- id
- customer_id
- tryon_id
- created_at

---

# Downloads

Tracks downloaded images.

Fields

- id
- customer_id
- tryon_id
- downloaded_at

---

# Payments

Subscription payment records.

Fields

- id
- store_id
- amount
- payment_method
- payment_status
- transaction_id
- created_at

---

# Subscriptions

Store subscription details.

Fields

- id
- store_id
- plan_name
- ai_generation_limit
- ai_generation_used
- start_date
- end_date
- status

---

# Analytics

Stores usage metrics.

Fields

- id
- store_id
- total_customers
- total_tryons
- total_downloads
- total_favorites
- total_revenue
- updated_at

---

# Relationships

Users → Stores

Stores → Staff

Stores → Products

Products → Product Images

Products → Customer Sessions

Customer Sessions → Customers

Customers → Try-On Results

Try-On Results → Favorites

Try-On Results → Downloads

Stores → Payments

Stores → Subscriptions

Stores → Analytics

---

# Database Rules

- Use UUIDs for all primary keys.
- Add indexes on frequently queried fields.
- Enable Row Level Security (RLS).
- Use foreign key constraints.
- Store images in Supabase Storage.
- Never store AI images directly in the database—only store their URLs.
- Track timestamps for all major records.