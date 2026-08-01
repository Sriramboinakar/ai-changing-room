# AI Changing Room - API Documentation

## API Version

v1

---

# Overview

All APIs should follow REST standards.

Base URL

/api

All responses should be in JSON.

Protected routes require authentication.

---

# Authentication

## POST /api/auth/signup

Create a new account.

Request

- full_name
- email
- password

Response

- user
- token

---

## POST /api/auth/login

Login user.

Request

- email
- password

Response

- access_token
- refresh_token

---

## POST /api/auth/logout

Logout current user.

---

# Store APIs

## GET /api/store

Get store information.

---

## PUT /api/store

Update store information.

---

# Product APIs

## GET /api/products

Fetch all products.

Supports

- Search
- Category Filter
- Pagination

---

## GET /api/products/:id

Get product details.

---

## POST /api/products

Create product.

Request

- name
- category
- price
- barcode
- stock
- images

---

## PUT /api/products/:id

Update product.

---

## DELETE /api/products/:id

Delete product.

---

# Image Upload

## POST /api/upload

Upload product images.

Response

Image URL

---

# QR Code

## POST /api/qr/create

Generate QR code.

Response

- QR Image
- Session Token

---

## GET /api/session/:token

Validate customer session.

---

# AI Try-On

## POST /api/tryon

Generate AI image.

Request

- customer_image
- product_id
- session_id

Response

- generated_image
- status

---

## GET /api/tryon/:id

Fetch generated result.

---

## DELETE /api/tryon/:id

Delete generated image.

---

# Gallery

## GET /api/gallery

Fetch customer gallery.

---

## POST /api/favorites

Add favorite.

---

## DELETE /api/favorites/:id

Remove favorite.

---

## POST /api/download

Track download.

---

# Analytics

## GET /api/analytics

Return

- Total Try-ons
- Popular Products
- Downloads
- Favorites
- Revenue

---

# Subscription

## GET /api/plans

Fetch subscription plans.

---

## POST /api/subscription

Purchase plan.

---

## POST /api/payment

Create Razorpay order.

---

## POST /api/payment/webhook

Payment webhook.

---

# Admin

## GET /api/admin/users

List users.

---

## GET /api/admin/stores

List stores.

---

## GET /api/admin/dashboard

Admin analytics.

---

# Error Format

Every API should return

{
  "success": false,
  "message": "Error message",
  "error": {}
}

---

# Success Format

{
  "success": true,
  "data": {}
}

---

# API Rules

- Use HTTP status codes correctly.
- Validate every request.
- Never expose secrets.
- Rate-limit AI endpoints.
- Secure all authenticated routes.
- Return consistent JSON responses.
- Log errors for debugging.