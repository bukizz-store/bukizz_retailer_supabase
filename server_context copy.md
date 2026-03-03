# Bukizz Node Server — Complete Context Document

## 1. Project Overview

**Bukizz** is a **school e-commerce platform** API backend. It enables parents/students to purchase school supplies (books, uniforms, stationery) online, organized by school and grade. The platform supports three user roles: **Customer**, **Retailer**, and **Admin**.

| Attribute | Value |
|---|---|
| **Runtime** | Node.js ≥ 18 (ES Modules) |
| **Framework** | Express 4.18 |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | JWT (custom) + Supabase Auth (Google OAuth) + OTP verification |
| **Payments** | Razorpay |
| **Validation** | Joi |
| **File Uploads** | Multer (memory storage → Supabase Storage) |
| **Logging** | Winston (file + console) |
| **Security** | Helmet, CORS, express-rate-limit, bcryptjs (12 rounds) |
| **Email** | Nodemailer + External OTP API (services.theerrors.in) |
| **Containerization** | Docker + docker-compose |

---

## 2. Folder Structure

```
server/
├── index.js                    # Main entry point — boots server, wires DI, legacy auth routes
├── package.json                # Dependencies & scripts
├── Dockerfile                  # Docker image config
├── docker-compose.yml          # Multi-service orchestration
├── healthcheck.js              # Container health check
├── nodemon.json                # Dev server config
├── postman.json                # Postman collection
├── postman_collection.json     # Postman collection (alternate)
├── add_is_deleted_to_products.sql          # Migration: is_deleted column to products
├── add_otp_columns_to_users.sql            # Migration: otp, otp_created_at, is_verified to users
├── add_product_attributes_to_categories.sql # Migration: product_attributes JSONB to categories
├── create_otp_verifications_table.sql      # Migration: otp_verifications table
├── scripts/
│   ├── testCategoryApi.js      # Category API integration tests
│   ├── testOrderApi.js         # Order API integration tests
│   └── testSchoolApi.js        # School API integration tests
└── src/
    ├── app.js                  # Alternative entry (CJS, not actively used)
    ├── config/
    │   ├── index.js            # Centralized config (env vars, CORS, JWT, DB, uploads)
    │   └── dependencies.js     # DI container factory (Repository→Service→Controller)
    ├── db/
    │   ├── index.js            # Supabase client init, query helpers, RPC helpers
    │   ├── schema.sql          # Complete DDL (all tables, enums, triggers, functions)
    │   ├── init.sql            # Sample seed data
    │   ├── functions/
    │   │   └── create_comprehensive_product.sql  # RPC for atomic product creation
    │   ├── emergency_order_tables_migration.sql
    │   ├── migration_add_delivery_charge.sql
    │   ├── migration_add_highlight_to_products.sql
    │   ├── migration_add_image_to_option_values.sql
    │   ├── migration_add_price_modifier.sql
    │   ├── migration_change_highlight_to_json.sql
    │   ├── migration_create_retailer_schools.sql
    │   ├── migration_fix_retailer_data_fkey.sql
    │   ├── migration_rename_retailer_to_warehouse_in_order_items.sql
    │   └── sample_variant_data.sql
    ├── middleware/
    │   ├── index.js            # setupMiddleware() — helmet, cors, compression, rate limit
    │   ├── authMiddleware.js   # authenticateToken, optionalAuth, requireRoles, requireOwnership, requireVerification, requireActiveUser
    │   ├── errorHandler.js     # AppError class, errorHandler, notFoundHandler, asyncHandler
    │   ├── rateLimiter.js      # createRateLimiter, createAuthRateLimiter
    │   ├── upload.js           # Multer config (10MB, images only, memory storage)
    │   └── validator.js        # Joi validate() middleware, preprocessBody (JSON from FormData), sanitizeMiddleware
    ├── models/
    │   └── schemas.js          # ALL Joi validation schemas (940 lines)
    ├── controllers/            # Request handling layer — 13 controllers
    │   ├── authController.js
    │   ├── brandController.js
    │   ├── categoryController.js
    │   ├── imageController.js
    │   ├── orderController.js
    │   ├── paymentController.js
    │   ├── pincodeController.js
    │   ├── productController.js
    │   ├── retailerController.js
    │   ├── retailerSchoolController.js
    │   ├── schoolController.js
    │   ├── userController.js
    │   └── warehouseController.js
    ├── services/               # Business logic layer — 11 services
    │   ├── authService.js
    │   ├── categoryService.js
    │   ├── emailService.js
    │   ├── imageService.js
    │   ├── orderService.js
    │   ├── productService.js
    │   ├── retailerSchoolService.js
    │   ├── retailerService.js
    │   ├── schoolService.js
    │   ├── userService.js
    │   └── warehouseService.js
    ├── repositories/           # Data access layer — 16 repositories
    │   ├── brandRepository.js
    │   ├── categoryRepository.js
    │   ├── orderEventRepository.js
    │   ├── orderQueryRepository.js
    │   ├── orderRepository.js
    │   ├── otpRepository.js
    │   ├── pincodeRepository.js
    │   ├── productImageRepository.js
    │   ├── productOptionRepository.js
    │   ├── productRepository.js
    │   ├── productVariantRepository.js
    │   ├── retailerRepository.js
    │   ├── retailerSchoolRepository.js
    │   ├── schoolRepository.js
    │   ├── userRepository.js
    │   └── warehouseRepository.js
    ├── routes/                 # Route definitions — 14 files
    │   ├── index.js            # Master router — mounts all modules under /api/v1
    │   ├── authRoutes.js
    │   ├── brandRoutes.js
    │   ├── categoryRoutes.js
    │   ├── imageRoutes.js
    │   ├── orderRoutes.js
    │   ├── paymentRoutes.js
    │   ├── pincodeRoutes.js
    │   ├── productRoutes.js
    │   ├── retailerRoutes.js
    │   ├── retailerSchoolRoutes.js
    │   ├── schoolRoutes.js
    │   ├── userRoutes.js
    │   └── warehouseRoutes.js
    └── utils/
        └── logger.js           # Winston logger, request logging middleware, logWithContext
```

---

## 3. Architecture Pattern

```
┌──────────────────────────────────────────────────────┐
│                     index.js                         │
│                  (Entry Point)                       │
│  ┌────────────────────────────────────────────────┐  │
│  │  1. dotenv → env vars                         │  │
│  │  2. connectDB() → Supabase client             │  │
│  │  3. Instantiate Repos → Services → Controllers│  │
│  │  4. Create DI container                       │  │
│  │  5. setupRoutes(app, dependencies)            │  │
│  │  6. app.listen(PORT)                          │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
   ┌──────────┐   ┌──────────┐   ┌──────────┐
   │  Routes  │   │Middleware│   │  Config   │
   │ (Router  │   │  Chain   │   │+ DB Init  │
   │ factories│   │          │   │           │
   │  w/ DI)  │   │          │   │           │
   └────┬─────┘   └──────────┘   └──────────┘
        │
        ▼
   ┌──────────────┐
   │ Controllers  │  ← Handles HTTP req/res
   │              │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │  Services    │  ← Business logic, validation, orchestration
   │              │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ Repositories │  ← Data access via Supabase client
   │              │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │  Supabase    │  ← PostgreSQL (hosted)
   │  Database    │
   └──────────────┘
```

### Dependency Injection Pattern

The DI container is created in `src/config/dependencies.js` via `createDependencies(overrides)` factory function. Routes are **factory functions** that receive a `dependencies` object. This enables testability and mock injection.

```javascript
// dependencies.js creates:
{
  supabase,
  // Repositories
  userRepository, brandRepository, categoryRepository, productRepository,
  productVariantRepository, productOptionRepository, productImageRepository,
  schoolRepository, orderRepository, orderEventRepository, orderQueryRepository,
  warehouseRepository, pincodeRepository, otpRepository, retailerRepository,
  retailerSchoolRepository,
  // Services
  authService, userService, productService, schoolService, orderService,
  categoryService, warehouseService, imageService, emailService,
  retailerService, retailerSchoolService,
  // Controllers
  authController, userController, productController, schoolController,
  orderController, categoryController, brandController, warehouseController,
  paymentController, pincodeController, imageController, retailerController,
  retailerSchoolController
}
```

---

## 4. Middleware Pipeline

Every request flows through:

```
Request → Helmet → CORS → Rate Limiter → Body Parser → [Route-specific middleware] → Controller → Response
                                                             │
                                                    ┌────────┴────────┐
                                                    │ authenticateToken   │ ← JWT verification
                                                    │ optionalAuth        │ ← Non-blocking auth
                                                    │ requireRoles()      │ ← Role-based access
                                                    │ requireOwnership()  │ ← Resource ownership
                                                    │ requireVerification │ ← Email verified check
                                                    │ requireActiveUser   │ ← Active account check
                                                    │ validate()          │ ← Joi schema validation
                                                    │ upload.single()     │ ← File upload (Multer)
                                                    └─────────────────────┘
```

### Auth Middleware Details

| Middleware | Purpose |
|---|---|
| `authenticateToken` | Extracts Bearer token, verifies via `authService.verifyToken()`, adds `req.user` |
| `optionalAuth` | Same as above but doesn't block if no token |
| `requireRoles(...roles)` | Checks `req.user.roles` array against required roles |
| `requireOwnership(paramName)` | Ensures user can only access their own resources |
| `requireVerification` | Blocks users with unverified emails |
| `requireActiveUser` | Blocks deactivated accounts |

### Validation Middleware
- Uses **Joi** schemas from `src/models/schemas.js` (940 lines)
- `validate(schema, property)` — validates `req.body`, `req.query`, or `req.params`
- Auto-preprocesses JSON strings from FormData submissions
- `sanitizeMiddleware` — strips XSS/HTML from string inputs
- Strips unknown fields, converts types, reports all errors

---

## 5. Complete Route Map

All routes are mounted under **`/api/v1`**. Health check at `/health`, API docs at `/api`.

### 5.1 Auth Routes — `/api/v1/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | ❌ | Register new customer (email, password, fullName) |
| POST | `/login` | ❌ | Login with email/password (supports `loginAs: customer/retailer/admin`) |
| POST | `/login-retailer` | ❌ | Retailer-specific login |
| POST | `/register-retailer` | ❌ | Register new retailer (creates user with role=retailer, is_active=false, deactivation_reason=unauthorized) |
| POST | `/refresh-token` | ❌ | Refresh JWT token |
| POST | `/forgot-password` | ❌ | Request password reset email |
| POST | `/reset-password` | ❌ | Reset password with token |
| POST | `/google-login` | ❌ | Google OAuth login (idToken from client) |
| POST | `/verify-token` | ❌ | Verify if a JWT token is valid |
| POST | `/send-otp` | ❌ | Send customer OTP for verification |
| POST | `/verify-otp` | ❌ | Verify customer OTP |
| POST | `/send-retailer-otp` | ❌ | Send retailer OTP for registration |
| POST | `/verify-retailer-otp` | ❌ | Verify retailer OTP and complete registration |
| PUT | `/verify-retailer` | ✅ | Admin: authorize/deauthorize retailer |
| GET | `/me` | ✅ | Get current user's profile |
| POST | `/logout` | ✅ | Logout (invalidate session) |

> **Legacy routes** also exist at root level: `POST /login`, `POST /register` (direct Supabase auth)

---

### 5.2 User Routes — `/api/v1/users`

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/verify-email/confirm` | ❌ | — | Confirm email verification |
| GET | `/profile` | ✅ | Any | Get own profile |
| PUT | `/profile` | ✅ | Any | Update own profile |
| GET | `/addresses` | ✅ | Any | List saved addresses (max 5 per user) |
| POST | `/addresses` | ✅ | Any | Add new address (max 5, label validation) |
| PUT | `/addresses/:addressId` | ✅ | Any | Update address |
| DELETE | `/addresses/:addressId` | ✅ | Any | Delete address (soft delete) |
| GET | `/preferences` | ✅ | Any | Get user preferences |
| PUT | `/preferences` | ✅ | Any | Update preferences |
| GET | `/stats` | ✅ | Any | Get user statistics |
| DELETE | `/account` | ✅ | Any | Deactivate own account |
| POST | `/verify-email` | ✅ | Any | Send verification email |
| POST | `/verify-phone` | ✅ | Any | Verify phone number |
| **Admin Routes** | | | | |
| GET | `/admin/search` | ✅ | Admin | Search all users |
| GET | `/admin/export` | ✅ | Admin | Export user data |
| GET | `/admin/:userId` | ✅ | Admin | Get user by ID |
| PUT | `/admin/:userId` | ✅ | Admin | Update user (admin) |
| PUT | `/admin/:userId/role` | ✅ | Admin | Change user role |
| POST | `/admin/:userId/reactivate` | ✅ | Admin | Reactivate deactivated account |

---

### 5.3 Product Routes — `/api/v1/products`

**Public Routes (No Auth):**

| Method | Path | Description |
|---|---|---|
| GET | `/` | Search/list products (paginated, filtered by city, category, brand, price, productType) |
| GET | `/warehouse` | Get products by warehouse (requires auth + `x-warehouse-id` header) |
| GET | `/retailer-search` | Search products by retailer ID (finds via retailer→warehouse→product chain) |
| GET | `/featured` | Get featured products |
| GET | `/stats` | Get product statistics |
| GET | `/variants/search` | Search across all variants |
| GET | `/variants/:variantId` | Get variant by ID |
| GET | `/category/:categorySlug` | Get products by category slug |
| GET | `/brand/:brandId` | Get products by brand |
| GET | `/type/:productType` | Get products by type (bookset/uniform/stationary/general) |
| GET | `/school/:schoolId` | Get products for a school |
| GET | `/:id` | Get product by ID (with variants, images, brands, categories, warehouses) |
| GET | `/:id/complete` | Get product with all details (images by variant, warehouse details, brand details) |
| GET | `/:id/analytics` | Get product analytics |
| GET | `/:id/availability` | Check stock availability |
| GET | `/:id/options` | Get product option attributes with values |
| GET | `/:id/variants` | Get all variants for a product |
| GET | `/:id/images` | Get product images |
| GET | `/variants/:variantId/images` | Get variant-specific images |
| GET | `/:id/brands` | Get brands associated with product |

**Protected Routes (Auth Required):**

| Method | Path | Description |
|---|---|---|
| GET | `/admin/search` | Admin product search (includes deleted/inactive) |
| POST | `/` | Create product |
| POST | `/comprehensive` | Create product with all related data atomically (via RPC `create_comprehensive_product`) |
| PUT | `/:id` | Update product |
| PUT | `/:id/comprehensive` | Update product with all related data atomically |
| DELETE | `/:id` | Soft delete product (sets is_active=false, is_deleted=true) |
| PATCH | `/:id/activate` | Re-activate product (optionally set delivery_charge) |
| PUT | `/bulk-update` | Bulk update multiple products |
| **Options** | | |
| POST | `/:id/options` | Add option attribute (e.g., "Size", "Color") — max 3 per product |
| POST | `/options/:attributeId/values` | Add option value (e.g., "XL", "Red") with price_modifier and image_url |
| PUT | `/options/:attributeId` | Update option attribute |
| PUT | `/options/values/:valueId` | Update option value |
| DELETE | `/options/:attributeId` | Delete option attribute (cascades to values) |
| DELETE | `/options/values/:valueId` | Delete option value |
| **Variants** | | |
| POST | `/:id/variants` | Create variant (sku, price, stock, option_value_1/2/3) |
| PUT | `/variants/:variantId` | Update variant |
| DELETE | `/variants/:variantId` | Delete variant |
| PATCH | `/variants/:variantId/stock` | Update variant stock (set/increment/decrement via RPC) |
| PUT | `/variants/bulk-stock-update` | Bulk update stocks |
| **Images** | | |
| POST | `/:id/images` | Add image (file upload or URL) |
| POST | `/:id/images/bulk` | Add multiple images |
| PUT | `/images/:imageId` | Update image |
| DELETE | `/images/:imageId` | Delete image |
| PATCH | `/:id/images/:imageId/primary` | Set primary image |
| POST | `/:id/variants/images/bulk` | Bulk upload variant images |
| **Brands** | | |
| POST | `/:id/brands` | Associate brand (or create new brand inline) |
| DELETE | `/:id/brands/:brandId` | Remove brand association |
| **Retailer/Warehouse** | | |
| POST | `/:id/retailer` | Add warehouse details to product (creates warehouse if needed, links to retailer) |
| PUT | `/:id/retailer` | Update warehouse details for product |
| DELETE | `/:id/retailer` | Remove warehouse from product |

---

### 5.4 Category Routes — `/api/v1/categories`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | ❌ | Search/list categories (supports parentId, rootOnly, search) |
| GET | `/:id` | ❌ | Get category by ID (includes parent + children) |
| POST | `/` | ✅ | Create category (with image upload, slug generation) |
| PUT | `/:id` | ✅ | Update category (with image upload) |
| DELETE | `/:id` | ✅ | Delete category (prevented if children exist) |

Categories support **hierarchical structure** via `parentId` and `productAttributes` (JSONB array of attribute objects defining what attributes products in this category should have).

---

### 5.5 Brand Routes — `/api/v1/brands`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | ❌ | Search/list brands (with country filter) |
| GET | `/:id` | ❌ | Get brand by ID |
| POST | `/` | ✅ | Create brand |
| PUT | `/:id` | ✅ | Update brand |
| DELETE | `/:id` | ✅ | Delete brand (soft delete) |

---

### 5.6 School Routes — `/api/v1/schools`

**Public:**

| Method | Path | Description |
|---|---|---|
| GET | `/` | Search schools (city, state, type, board filters) |
| GET | `/stats` | School statistics |
| GET | `/popular` | Popular schools |
| GET | `/nearby` | Nearby schools (lat/lng/radius — currently returns all, PostGIS needed) |
| POST | `/validate` | Validate school data |
| GET | `/city/:city` | Schools by city |
| GET | `/:id` | Get school by ID |
| GET | `/:id/analytics` | School analytics |
| GET | `/:id/catalog` | School product catalog (full catalog with variants, options, images, brands, categories, pagination, filters: grade, mandatory, price range, search, sort) |

**Protected:**

| Method | Path | Description |
|---|---|---|
| POST | `/` | Create school (with image upload) |
| PUT | `/:id` | Update school (with image upload) |
| DELETE | `/:id` | Deactivate school (soft delete) |
| PATCH | `/:id/reactivate` | Reactivate school |
| POST | `/bulk-import` | Bulk import from CSV |
| POST | `/upload-image` | Upload school image |
| POST | `/:schoolId/products/:productId` | Associate product with school (grade + mandatory) |
| PUT | `/:schoolId/products/:productId/:grade` | Update association |
| DELETE | `/:schoolId/products/:productId` | Remove association |
| POST | `/:id/partnerships` | Create school partnership |

---

### 5.7 Order Routes — `/api/v1/orders`

All order routes require authentication (`authenticateToken` applied globally).

**Customer Endpoints:**

| Method | Path | Description |
|---|---|---|
| POST | `/` | Place a new order (rate limited: 20/15min) |
| POST | `/place` | Place order (alias, rate limited) |
| POST | `/calculate-summary` | Calculate order preview/summary for cart |
| GET | `/my-orders` | Get current user's orders |
| GET | `/` | Get user orders (legacy alias) |
| GET | `/:orderId` | Get order details (with items and events) |
| GET | `/:orderId/track` | Track order status/location |
| PUT | `/:orderId/cancel` | Cancel order |
| PUT | `/:orderId/items/:itemId/cancel` | Cancel specific item |
| POST | `/:orderId/queries` | Create support ticket |
| GET | `/:orderId/queries` | Get order support tickets |

**Admin/Retailer Endpoints:**

| Method | Path | Roles | Description |
|---|---|---|---|
| GET | `/admin/search` | admin, retailer | Search/filter all orders |
| GET | `/admin/status/:status` | admin, retailer | Orders by status |
| PUT | `/:orderId/status` | admin, retailer | Update order status |
| PUT | `/:orderId/items/:itemId/status` | admin, retailer | Update item status |
| PUT | `/:orderId/payment` | admin, system | Update payment status |
| PUT | `/admin/bulk-update` | admin | Bulk update orders |
| GET | `/admin/export` | admin | Export orders data |
| GET | `/admin/statistics` | admin, retailer | Order statistics/analytics |

**Order Status Flow:** `initialized → processed → shipped → out_for_delivery → delivered`
**Cancellation:** `cancelled`, `refunded`
**Payment Statuses:** `pending`, `paid`, `failed`, `refunded`
**Payment Methods:** `cod`, `upi`, `card`, `netbanking`, `wallet`

Rate limiting: 20 order creations per 15min, 60 queries per minute.

---

### 5.8 Payment Routes — `/api/v1/payments`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/webhook` | ❌ | Razorpay webhook (signature verified internally via `x-razorpay-signature` header) |
| POST | `/create-order` | ✅ | Create Razorpay payment order |
| POST | `/verify` | ✅ | Verify Razorpay payment signature (updates order payment status + records transaction) |
| POST | `/failure` | ✅ | Log payment failure |

---

### 5.9 Warehouse Routes — `/api/v1/warehouses`

All routes require auth.

| Method | Path | Description |
|---|---|---|
| POST | `/` | Add warehouse (retailer — creates warehouse + links to retailer) |
| POST | `/admin` | Add warehouse (admin — can specify retailerId) |
| GET | `/` | Get my warehouses (via retailer→warehouse link) |
| GET | `/:id` | Get warehouse by ID (with retailer info and resolved address) |
| GET | `/retailer/:retailerId` | Get warehouses for retailer |
| PUT | `/:id` | Update warehouse (ownership check) |
| PUT | `/admin/:id` | Update warehouse (admin) |
| DELETE | `/:id` | Delete warehouse (ownership check) |
| DELETE | `/admin/:id` | Delete warehouse (admin) |

---

### 5.10 Retailer Routes — `/api/v1/retailer`

All routes require auth.

| Method | Path | Role | Description |
|---|---|---|---|
| POST | `/data` | retailer | Create retailer profile (displayName, ownerName, GSTIN, PAN, signature upload) |
| GET | `/verification-status` | retailer | Check retailer verification status (authorized/pending/deactivated) |
| GET | `/data/status` | retailer | Check retailer data completeness (required: displayName, ownerName, gstin, pan, signatureUrl) |
| GET | `/data` | retailer | Get retailer profile data |

---

### 5.11 Retailer-School Routes — `/api/v1/retailer-schools`

All routes require auth.

| Method | Path | Description |
|---|---|---|
| POST | `/link` | Link retailer to school (validates retailer role, school exists, composite key uniqueness) |
| GET | `/connected-schools` | Get schools connected to authenticated retailer |
| GET | `/connected-schools/:retailerId` | Get schools connected to specific retailer |
| GET | `/connected-retailers/:schoolId` | Get retailers connected to a school (with user info) |
| PATCH | `/status` | Update link status (delete old + insert new, since status is part of composite PK) |
| PATCH | `/product-type` | Update product types for a link |
| DELETE | `/` | Unlink retailer from school |

---

### 5.12 Pincode Routes — `/api/v1/pincodes`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/check/:pincode` | ❌ | Check delivery availability for a pincode (checks `allowed_pincodes` table) |

---

### 5.13 Image Routes — `/api/v1/images`

All routes require authentication.

| Method | Path | Description |
|---|---|---|
| POST | `/upload` | Upload image (to Supabase Storage, auto-bucket creation) |
| DELETE | `/delete` | Delete image (by URL or path) |
| PUT | `/replace` | Replace existing image |

---

## 6. Database Schema

### 6.1 Enums

```sql
CREATE TYPE order_status AS ENUM ('initialized','processed','shipped','out_for_delivery','delivered','cancelled','refunded');
CREATE TYPE payment_status AS ENUM ('pending','paid','failed','refunded');
CREATE TYPE product_type AS ENUM ('bookset','uniform','stationary','general');
CREATE TYPE auth_provider AS ENUM ('email','google');
CREATE TYPE query_status AS ENUM ('open','pending','resolved','closed');
```

### 6.2 Tables

#### Users & Authentication

**users**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| full_name | VARCHAR(255) | NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| email_verified | BOOLEAN | DEFAULT false |
| phone | VARCHAR(20) | |
| phone_verified | BOOLEAN | DEFAULT false |
| date_of_birth | DATE | |
| gender | VARCHAR(10) | |
| city | VARCHAR(100) | |
| state | VARCHAR(100) | |
| role | VARCHAR(20) | DEFAULT 'customer' |
| school_id | UUID | FK → schools(id) |
| is_active | BOOLEAN | DEFAULT true |
| last_login_at | TIMESTAMPTZ | |
| deactivated_at | TIMESTAMPTZ | |
| deactivation_reason | TEXT | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |
| metadata | JSONB | DEFAULT '{}' |
| otp | VARCHAR(6) | *(migration)* |
| otp_created_at | TIMESTAMPTZ | *(migration)* |
| is_verified | BOOLEAN | *(migration)* |

**user_auths**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users(id) ON DELETE CASCADE |
| provider | auth_provider | NOT NULL |
| provider_user_id | VARCHAR(255) | UNIQUE(provider, provider_user_id) |
| password_hash | VARCHAR(255) | |
| provider_data | JSONB | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

**refresh_tokens**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users(id) ON DELETE CASCADE |
| token_hash | VARCHAR(255) | NOT NULL |
| device_info | VARCHAR(500) | |
| expires_at | TIMESTAMPTZ | NOT NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| revoked_at | TIMESTAMPTZ | |

**password_resets**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users(id) ON DELETE CASCADE |
| token_hash | VARCHAR(255) | NOT NULL |
| expires_at | TIMESTAMPTZ | NOT NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| used_at | TIMESTAMPTZ | |

**otp_verifications** *(migration)*
| Column | Type | Constraints |
|---|---|---|
| email | TEXT | PK |
| otp | TEXT | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| metadata | JSONB | DEFAULT '{}' |

**addresses**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users(id) ON DELETE CASCADE |
| label | VARCHAR(50) | |
| recipient_name | VARCHAR(255) | |
| phone | VARCHAR(20) | |
| line1 | VARCHAR(255) | NOT NULL |
| line2 | VARCHAR(255) | |
| city | VARCHAR(100) | NOT NULL |
| state | VARCHAR(100) | NOT NULL |
| postal_code | VARCHAR(20) | NOT NULL |
| country | VARCHAR(100) | DEFAULT 'India' |
| is_default | BOOLEAN | DEFAULT false |
| lat | DECIMAL | |
| lng | DECIMAL | |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

#### Products & Catalog

**products**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| sku | VARCHAR(100) | UNIQUE, NOT NULL |
| title | VARCHAR(255) | NOT NULL |
| short_description | TEXT | |
| description | TEXT | |
| product_type | product_type | DEFAULT 'general' |
| base_price | DECIMAL(10,2) | NOT NULL |
| stock | INTEGER | DEFAULT 0 |
| min_order_quantity | INTEGER | DEFAULT 1 |
| max_order_quantity | INTEGER | DEFAULT 1000 |
| weight | DECIMAL(10,3) | |
| dimensions | JSONB | |
| image_url | TEXT | |
| currency | VARCHAR(10) | DEFAULT 'INR' |
| retailer_id | UUID | FK → retailers(id) |
| is_active | BOOLEAN | DEFAULT true |
| metadata | JSONB | DEFAULT '{}' |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |
| delivery_charge | DECIMAL(10,2) | DEFAULT 0 *(migration)* |
| highlight | JSONB | DEFAULT '[]' *(migration — changed from TEXT to JSONB)* |
| is_deleted | BOOLEAN | DEFAULT false *(migration)* |
| city | TEXT | *(used in queries, added via product creation)* |

**categories**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| name | VARCHAR(100) | NOT NULL |
| slug | VARCHAR(100) | UNIQUE, NOT NULL |
| description | TEXT | |
| parent_id | UUID | FK → categories(id) (self-referencing) |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| product_attributes | JSONB | DEFAULT '{}' *(migration)* |
| image | TEXT | |

**brands**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| name | VARCHAR(100) | NOT NULL |
| slug | VARCHAR(100) | UNIQUE, NOT NULL |
| description | TEXT | |
| country | VARCHAR(100) | |
| logo_url | TEXT | |
| metadata | JSONB | DEFAULT '{}' |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

**product_categories** — Junction table
| Column | Type | Constraints |
|---|---|---|
| product_id | UUID | FK → products(id) ON DELETE CASCADE |
| category_id | UUID | FK → categories(id) ON DELETE CASCADE |
| | | PK (product_id, category_id) |

**product_brands** — Junction table
| Column | Type | Constraints |
|---|---|---|
| product_id | UUID | FK → products(id) ON DELETE CASCADE |
| brand_id | UUID | FK → brands(id) ON DELETE CASCADE |
| | | PK (product_id, brand_id) |

**product_schools** — Junction table
| Column | Type | Constraints |
|---|---|---|
| product_id | UUID | FK → products(id) ON DELETE CASCADE |
| school_id | UUID | FK → schools(id) ON DELETE CASCADE |
| grade | VARCHAR(10) | NOT NULL |
| mandatory | BOOLEAN | DEFAULT false |
| | | PK (product_id, school_id, grade) |

**product_option_attributes**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| product_id | UUID | FK → products(id) ON DELETE CASCADE |
| name | VARCHAR(100) | NOT NULL |
| position | INTEGER | CHECK (1-3), UNIQUE(product_id, position) |
| is_required | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

**product_option_values**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| attribute_id | UUID | FK → product_option_attributes(id) ON DELETE CASCADE |
| value | VARCHAR(100) | NOT NULL |
| sort_order | INTEGER | DEFAULT 0 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| image_url | TEXT | *(migration)* |
| price_modifier | DECIMAL(10,2) | DEFAULT 0, CHECK ≥ 0 *(migration)* |

**product_variants**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| product_id | UUID | FK → products(id) ON DELETE CASCADE |
| sku | VARCHAR(100) | UNIQUE, NOT NULL |
| price | DECIMAL(10,2) | |
| compare_at_price | DECIMAL(10,2) | |
| stock | INTEGER | DEFAULT 0 |
| weight | DECIMAL(10,3) | |
| option_value_1 | UUID | FK → product_option_values(id) |
| option_value_2 | UUID | FK → product_option_values(id) |
| option_value_3 | UUID | FK → product_option_values(id) |
| metadata | JSONB | DEFAULT '{}' |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

**product_images**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| product_id | UUID | FK → products(id) ON DELETE CASCADE |
| variant_id | UUID | FK → product_variants(id) ON DELETE SET NULL |
| url | TEXT | NOT NULL |
| alt_text | VARCHAR(255) | |
| sort_order | INTEGER | DEFAULT 0 |
| is_primary | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

#### Schools

**schools**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| name | VARCHAR(255) | NOT NULL |
| board | VARCHAR(50) | |
| address | JSONB | |
| city | VARCHAR(100) | |
| state | VARCHAR(100) | |
| postal_code | VARCHAR(20) | |
| contact | JSONB | |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| type | VARCHAR(50) | (public/private/charter/international) |
| image | TEXT | |
| phone | VARCHAR(20) | |
| email | VARCHAR(255) | |

#### Retailers & Warehouses

**retailers** *(legacy — from schema.sql)*
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(255) | NOT NULL |
| contact_email | VARCHAR(255) | |
| contact_phone | VARCHAR(20) | |
| address | JSONB | |
| website | VARCHAR(255) | |
| is_verified | BOOLEAN | DEFAULT false |
| metadata | JSONB | DEFAULT '{}' |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

**retailer_data** *(operational table — retailers now use users table with role=retailer)*
| Column | Type | Constraints |
|---|---|---|
| retailer_id | UUID | FK → public.users(id), UNIQUE |
| display_name | TEXT | |
| owner_name | TEXT | |
| gstin | TEXT | |
| pan | TEXT | |
| signature_url | TEXT | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | |

**warehouse**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| name | VARCHAR(255) | NOT NULL |
| contact_email | VARCHAR(255) | |
| contact_phone | VARCHAR(20) | |
| address | UUID/JSONB | FK → addresses(id) or JSONB |
| website | VARCHAR(255) | |
| is_verified | BOOLEAN | DEFAULT false |
| metadata | JSONB | DEFAULT '{}' |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

**retailer_warehouse** — Junction table
| Column | Type | Constraints |
|---|---|---|
| retailer_id | UUID | FK → users(id) |
| warehouse_id | UUID | FK → warehouse(id) |

**products_warehouse** — Junction table
| Column | Type | Constraints |
|---|---|---|
| product_id | UUID | FK → products(id) |
| warehouse_id | UUID | FK → warehouse(id) |

**retailer_schools** *(migration)*
| Column | Type | Constraints |
|---|---|---|
| retailer_id | UUID | FK → users(id) |
| school_id | UUID | FK → schools(id) |
| status | VARCHAR(20) | CHECK ('approved'/'pending'/'rejected') |
| product_type | JSONB | DEFAULT '[]' |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | |
| | | PK (retailer_id, school_id, status) |

#### Orders

**orders**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| order_number | VARCHAR(50) | UNIQUE, NOT NULL |
| user_id | UUID | FK → users(id) |
| status | order_status | DEFAULT 'initialized' |
| total_amount | DECIMAL(10,2) | NOT NULL |
| currency | VARCHAR(10) | DEFAULT 'INR' |
| shipping_address | JSONB | NOT NULL |
| billing_address | JSONB | |
| contact_phone | VARCHAR(20) | |
| contact_email | VARCHAR(255) | |
| payment_method | VARCHAR(50) | |
| payment_status | payment_status | DEFAULT 'pending' |
| warehouse_id | UUID | FK → warehouse(id) *(renamed from retailer_id via migration)* |
| metadata | JSONB | DEFAULT '{}' |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

**order_items**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| order_id | UUID | FK → orders(id) ON DELETE CASCADE |
| product_id | UUID | |
| variant_id | UUID | |
| sku | VARCHAR(100) | |
| title | VARCHAR(255) | |
| quantity | INTEGER | NOT NULL |
| unit_price | DECIMAL(10,2) | NOT NULL |
| total_price | DECIMAL(10,2) | NOT NULL |
| product_snapshot | JSONB | |
| warehouse_id | UUID | FK → warehouse(id) *(renamed from retailer_id via migration)* |
| status | order_status | DEFAULT 'initialized' |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

**order_events**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| order_id | UUID | FK → orders(id) ON DELETE CASCADE |
| previous_status | order_status | |
| new_status | order_status | NOT NULL |
| changed_by | UUID | FK → users(id) |
| note | TEXT | |
| metadata | JSONB | DEFAULT '{}' |
| order_item_id | UUID | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

**order_queries**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| order_id | UUID | FK → orders(id) |
| user_id | UUID | FK → users(id) |
| subject | VARCHAR(255) | NOT NULL |
| message | TEXT | NOT NULL |
| priority | VARCHAR(20) | |
| status | query_status | DEFAULT 'open' |
| attachments | JSONB | |
| metadata | JSONB | DEFAULT '{}' |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

**transactions** *(referenced in payment controller)*
| Column | Type | Constraints |
|---|---|---|
| order_id | UUID | |
| gateway_order_id | TEXT | |
| payment_id | TEXT | |
| signature | TEXT | |
| amount | DECIMAL | |
| currency | VARCHAR(10) | |
| status | VARCHAR(20) | |
| method | VARCHAR(50) | |
| updated_at | TIMESTAMPTZ | |

**allowed_pincodes** *(referenced in pincode repository)*
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| pincode | VARCHAR(10) | |
| is_active | BOOLEAN | DEFAULT true |

### 6.3 Database Functions

| Function | Purpose |
|---|---|
| `update_updated_at_column()` | Trigger function to auto-update `updated_at` on row changes |
| `increment_variant_stock(variant_id, quantity)` | Atomically increment variant stock |
| `decrement_variant_stock(variant_id, quantity)` | Atomically decrement variant stock |
| `create_comprehensive_product(payload JSONB)` | Atomic RPC for creating a product with all related data (options, values, variants, images, brands, warehouse, school, categories) in a single transaction |

### 6.4 Migrations Applied

1. `migration_add_delivery_charge.sql` — Added `delivery_charge` DECIMAL(10,2) DEFAULT 0 to products
2. `migration_add_highlight_to_products.sql` — Added `highlight` TEXT column to products
3. `migration_change_highlight_to_json.sql` — Changed `highlight` from TEXT to JSONB DEFAULT '[]' with safe casting
4. `migration_add_image_to_option_values.sql` — Added `image_url` TEXT to product_option_values
5. `migration_add_price_modifier.sql` — Added `price_modifier` DECIMAL(10,2) DEFAULT 0 to product_option_values
6. `migration_create_retailer_schools.sql` — Created `retailer_schools` table with composite PK
7. `migration_fix_retailer_data_fkey.sql` — Fixed `retailer_data` FK from auth.users to public.users
8. `migration_rename_retailer_to_warehouse_in_order_items.sql` — Renamed retailer_id to warehouse_id in orders and order_items
9. `emergency_order_tables_migration.sql` — Emergency order table fixes
10. `add_is_deleted_to_products.sql` — Added `is_deleted` BOOLEAN DEFAULT FALSE to products
11. `add_otp_columns_to_users.sql` — Added otp, otp_created_at, is_verified to users
12. `add_product_attributes_to_categories.sql` — Added product_attributes JSONB to categories
13. `create_otp_verifications_table.sql` — Created otp_verifications table

---

## 7. Repository Layer (Data Access)

### 7.1 ProductRepository (1779 lines)
| Method | Description |
|---|---|
| `create(productData)` | Create product with categories and brands |
| `createComprehensiveProductViaRPC(payload)` | Atomic product creation via `create_comprehensive_product` RPC |
| `findById(productId)` | Get product with variants (including option value refs), images, categories, brands, warehouses — single optimized query |
| `getProductsByWarehouseId(warehouseId, filters)` | Products via products_warehouse junction |
| `search(filters)` | Full-text search with city, category slug, brand, price range, productType filters |
| `findByRetailerId(retailerId, filters)` | Find products via retailer→warehouse→product chain |
| `update(productId, updateData)` | Update product fields (camelCase→snake_case mapping) |
| `getBySchool(schoolId, filters)` | Products with grade and mandatory info |
| `getProductCategories(productId)` | Get categories for a product |
| `getProductBrands(productId)` | Get brands for a product |
| `delete(productId)` | Soft delete (is_active=false, is_deleted=true) |
| `activate(productId, deliveryCharge)` | Re-activate product, optionally set delivery_charge |
| `count(filters)` | Count products with filters |
| `formatProduct(row)` | Standardize response format (camelCase, extract primary image) |
| `addProductImage(productId, imageData)` | Add image (URL or file upload to Supabase Storage) |
| `addProductImages(productId, imagesData)` | Add multiple images |
| `updateProductImage(imageId, updateData)` | Update image (supports file replacement) |
| `deleteProductImage(imageId)` | Delete image and storage file |
| `setPrimaryImage(imageId, productId, variantId)` | Set primary image (unsets others) |
| `getProductImages(productId, options)` | Get images with variant/type/primary filters |
| `addProductBrand(productId, brandData)` | Associate brand (or create new inline) |
| `removeProductBrand(productId, brandId)` | Remove brand association |
| `removeAllProductBrands(productId)` | Remove all brand associations |
| `addWarehouseDetails(productId, warehouseData, retailerId)` | Create/link warehouse to product with ownership check |
| `removeWarehouseDetails(productId, warehouseId)` | Remove warehouse from product |
| `getVariantImages(variantId)` | Get images for a variant |
| `bulkUploadVariantImages(productId, variantImagesData)` | Bulk upload variant images |
| `getProductWithDetails(productId, options)` | Get product with images grouped by variant, brand details, warehouse details |

### 7.2 OrderRepository (758 lines)
| Method | Description |
|---|---|
| `createWithConnection(connection, orderData)` | Create order + items atomically (with manual rollback) |
| `create(orderData)` | Legacy order creation (calculates total from products) |
| `updatePaymentStatus(orderId, paymentStatus, paymentData)` | Update payment + create payment event |
| `getStatistics(userId, filters)` | Order stats: total, revenue, average, by status, by payment method |
| `findById(orderId)` | Get order with items and events |
| `search(filters)` | Search orders with status/user/payment/date/amount filters, batched item fetch |
| `updateStatus(orderId, status, metadata)` | Update order status |
| `getByUser(userId, filters)` | Get user's orders with batch item fetching (avoids N+1) |
| `updateOrderItemStatus(itemId, status)` | Update individual order item status |
| `_getItemsForOrders(orderIds)` | Batch fetch items for multiple orders |
| `_getOrderItems(orderId)` | Get items for single order |
| `_getOrderEvents(orderId)` | Get events with user names |
| `_formatOrder(row)` | Format order (camelCase) |
| `_formatOrderItem(row)` | Format order item |
| `_formatOrderEvent(row)` | Format order event |

### 7.3 UserRepository (759 lines)
| Method | Description |
|---|---|
| `findById(userId)` | Find active user by ID |
| `findByEmail(email)` | Find active user by email |
| `findByPhone(phone)` | Find active user by phone |
| `findByVerificationToken(tokenHash)` | Find user by verification token |
| `storeOtp(userId, otp)` | Store OTP in users table |
| `verifyOtp(userId)` | Mark user as verified, clear OTP |
| `update(userId, updateData)` | Update profile (full camelCase→snake_case mapping) |
| `getAddresses(userId)` | Get active addresses, ordered by default first |
| `addAddress(userId, addressData)` | Add address (handles landmark→line2 merge, default address management) |
| `updateAddress(addressId, updateData)` | Update address with default management |
| `deleteAddress(addressId)` | Soft delete address (is_active=false) |
| `getPreferences(userId)` | Get user preferences (from user_preferences table, with defaults) |
| `updatePreferences(userId, preferences)` | Upsert user preferences |
| `getUserStatistics(userId)` | Get user order stats via RPC `get_user_order_stats` |
| `markEmailAsVerified(userId)` | Set email_verified=true |
| `markPhoneAsVerified(userId)` | Set phone_verified=true |
| `deactivate(userId, reason)` | Deactivate user with reason |
| `reactivate(userId)` | Reactivate user |
| `search(filters)` | Search users with role, email_verified, text search |
| `updateRole(userId, newRole)` | Update user role |
| `getAddressById(addressId)` | Get single address |
| `getPendingOrders(userId)` | Get pending orders for user |
| `formatUser(row)` | Format user (camelCase) |
| `formatAddress(row)` | Format address (camelCase) |

### 7.4 SchoolRepository (1165 lines)
| Method | Description |
|---|---|
| `create(schoolData)` | Create school (JSON.stringify address/contact) |
| `findById(schoolId, { includeInactive })` | Find school by ID |
| `findByNameAndCity(name, city)` | Find school by name+city (case-insensitive) |
| `search(filters)` | Search schools with city, state, type, board, search text, pagination |
| `update(schoolId, updateData)` | Update school fields |
| `getByCity(city)` | Get schools by city |
| `associateProduct(productId, schoolId, { grade, mandatory })` | Upsert product-school association |
| `getProductAssociation(productId, schoolId, grade)` | Get specific association |
| `updateProductAssociation(productId, schoolId, grade, updateData)` | Update association |
| `removeProductAssociation(productId, schoolId, grade)` | Remove association |
| `getSchoolProducts(schoolId)` | Get products with grade/mandatory info |
| `getSchoolAnalytics(schoolId)` | Get school analytics |
| `getSchoolPartnerships(schoolId)` | Get school partnerships |
| `findNearby(lat, lng, radiusKm, filters)` | Find nearby schools (placeholder — needs PostGIS) |
| `getPopularSchools(limit, city)` | Get popular schools |
| `getSchoolCatalog(schoolId, filters)` | **Comprehensive catalog**: fetches products with variants, option values, option attributes, categories, brands, images. Supports grade/mandatory/price/search/sort filters. Computes min_price per product. Pagination with exact count. |
| `deactivate(schoolId)` | Soft deactivate |
| `reactivate(schoolId)` | Reactivate |
| `_formatSchool(row)` | Format school (safe JSON parse for address/contact) |
| `uploadImage(file, token)` | Upload image to Supabase Storage (school-images bucket, uses service client) |

### 7.5 WarehouseRepository (364 lines)
| Method | Description |
|---|---|
| `create(warehouseData, token)` | Create warehouse (creates address in addresses table if object provided) |
| `linkToRetailer(retailerId, warehouseId, token)` | Link warehouse to retailer |
| `findByRetailerId(retailerId, token)` | Get warehouses via retailer_warehouse join, resolves address IDs to full data |
| `findById(id)` | Get warehouse by ID |
| `findByIdWithRetailer(id)` | Get warehouse with retailer user info and resolved address |
| `update(id, updates)` | Update warehouse |
| `delete(id)` | Hard delete warehouse |
| `isLinkedToRetailer(retailerId, warehouseId)` | Check ownership |
| `getWarehouseIdsByProductIds(productIds)` | Batch lookup: Map<productId, warehouseId> for order creation |

### 7.6 Other Repositories

**BrandRepository** — `create`, `findById`, `search` (with country filter), `update`, `delete` (soft), `formatBrand`

**CategoryRepository** — `create` (with image), `update` (with image), `delete` (soft), `findById` (with parent+children), `findBySlug`, `search` (supports rootOnly, parentId), `formatCategory`, `uploadImage` (Supabase Storage, categories bucket, service client)

**ProductVariantRepository** — `create`, `findById` (with option value refs and product info), `findByProductId`, `update`, `delete`, `updateStock` (set/increment/decrement via RPC), `search` (with price/stock filters), `formatVariant`

**ProductOptionRepository** — `createAttribute`, `createValue` (with priceModifier, imageUrl), `findAttributeById`, `findValueById`, `findAttributesByProductId`, `findValuesByAttributeId`, `findProductOptionsStructure` (full tree: attributes→values), `updateAttribute`, `updateValue`, `deleteAttribute` (cascades to values), `deleteValue`, `formatAttribute`, `formatValue`

**ProductImageRepository** — `getProductImages`, `findById`, `create`, `update`, `delete`, `getPrimaryImage`, `setPrimaryImage`, `formatImage` (static)

**OrderEventRepository** — `create`, `createWithConnection`, `findById`, `findByOrderId`, `findAll` (with filters), `getLatestStatus`, `formatEvent`, `formatEventWithOrder`

**OrderQueryRepository** — `create` (support ticket), `findById`, `findByOrderId`, `findByUserId`, `findAll`, `update`, `assign`, `formatQuery`, `formatQueryWithOrder`

**OtpRepository** — `upsertOtp` (email + otp + metadata), `findByEmail`, `deleteByEmail`

**PincodeRepository** — `checkAvailability(pincode)` (checks `allowed_pincodes` table)

**RetailerRepository** — `createOrUpdate` (upsert on retailer_id), `findById`, `formatRetailer`

**RetailerSchoolRepository** — `create`, `findByCompositeKey`, `findByRetailerAndSchool`, `findByRetailerId` (with school join), `findBySchoolId` (with user join), `updateStatus` (delete+insert since status is PK), `updateProductType`, `deleteByCompositeKey`, `deleteAllByRetailerAndSchool`

---

## 8. Service Layer (Business Logic)

### 8.1 AuthService (1102 lines)
| Method | Description |
|---|---|
| `register(userData)` | Register customer: create user + user_auth, generate tokens |
| `registerRetailer(userData)` | Register retailer: role=retailer, is_active=false, deactivation_reason=unauthorized |
| `verifyRetailer(retailerId, action)` | Admin: authorize (activate) or deauthorize (deactivate) retailer |
| `loginRetailer(credentials)` | Retailer login with role enforcement |
| `login(credentials)` | Login with loginAs role enforcement |
| `googleLogin(idToken)` | Google OAuth: Supabase Auth verify → create/sync custom user |
| `refreshToken(token)` | Refresh JWT using refresh token |
| `logout(userId)` | Invalidate session |
| `requestPasswordReset(email)` | Generate reset token, send email |
| `resetPassword(token, newPassword)` | Reset password with token |
| `verifyToken(token)` | Verify JWT and return user data |
| `generateTokens(user)` | Generate access + refresh JWT tokens |
| `sendOtp(email, fullName, password)` | Send customer OTP via email API (stores in otp_verifications with metadata) |
| `verifyOtp(email, otp)` | Verify customer OTP → register user |
| `sendRetailerOtp(email, fullName, password, phone)` | Send retailer OTP |
| `verifyRetailerOtp(email, otp)` | Verify retailer OTP → register retailer |

### 8.2 ProductService (1801 lines)
| Method | Description |
|---|---|
| `createProduct(productData)` | Create product with categories/brands |
| `createComprehensiveProduct(productData)` | Atomic product creation via RPC with validation + rollback |
| `validateComprehensiveProductData(data)` | Validate comprehensive product payload structure |
| `rollbackProductCreation(productId)` | Delete product on failure |
| `getProduct(productId)` | Get product enriched with images and brands |
| `searchProducts(filters)` | Search with comprehensive filters |
| `getProductsByRetailerId(retailerId, filters)` | Products via retailer→warehouse chain |
| `getWarehouseProducts(warehouseId, filters)` | Products by warehouse |
| `updateProduct(productId, updateData)` | Update product |
| `updateComprehensiveProduct(productId, data)` | Atomic update of product + options + variants + images + brands + warehouse + school |
| `deleteProduct(productId)` | Soft delete |
| `activateProduct(productId, deliveryCharge)` | Re-activate |
| `getSchoolProducts(schoolId, filters)` | School products |
| `getFeaturedProducts()` | Featured products |
| `getProductsByCategory(categorySlug)` | Products by category |
| `getProductsByBrand(brandId)` | Products by brand |
| `getProductsByType(productType)` | Products by type |
| `checkAvailability(productId)` | Stock check |
| + All option/variant/image/brand management methods | Delegates to respective repositories |

### 8.3 OrderService (1512 lines)
| Method | Description |
|---|---|
| `createOrder(orderData, userId)` | **Atomic order creation**: validate prerequisites → reserve stock → create order + items + event → update stock levels. Includes product_images in snapshot. |
| `_validateOrderPrerequisites(items)` | Validate products exist, are active, have sufficient stock |
| `_executeAtomicOrderCreation(orderData, userId)` | Execute atomic order creation |
| `_validateAndReserveStock(items)` | Lock and validate stock for all items |
| `_calculateAtomicOrderSummary(items)` | Calculate total with variant prices + delivery charges |
| `_updateStockLevels(items, operation)` | Batch stock update (decrement on create, increment on cancel) |
| `calculateOrderSummary(items)` | Preview order summary without placing |
| `updateOrderStatus(orderId, status, userId, note)` | Update status with event logging |
| + warehouse-based order item tracking | Items track warehouse_id |

### 8.4 SchoolService (718 lines)
Full CRUD + image upload, association management, bulk import, analytics, nearby/popular queries, catalog generation.

### 8.5 UserService (683 lines)
Profile management, addresses (max 5, label validation), preferences, stats, account deactivation/reactivation, email/phone verification, admin user management.

### 8.6 CategoryService
CRUD with slug generation, image upload to Supabase Storage, prevents deletion if children exist.

### 8.7 WarehouseService
Create warehouse + link to retailer atomically. Ownership checks on update/delete. Admin bypasses ownership.

### 8.8 RetailerService
Onboard retailer (upload signature to Supabase Storage, save profile to retailer_data). Check verification status (authorized/pending/deactivated). Check data completeness (required: displayName, ownerName, gstin, pan, signatureUrl).

### 8.9 RetailerSchoolService (262 lines)
Link/unlink retailers to schools. Validates retailer role and school existence. Status update via delete+insert (composite PK). Product type management per link.

### 8.10 ImageService
Upload/delete/replace images in Supabase Storage. Auto-creates buckets if they don't exist. Buckets used: "products", "retailers", "school-images", "categories".

### 8.11 EmailService
`sendVerificationEmail(email, token)` — via Nodemailer.
`sendOtpEmail(email, otp, name)` — via external API: `https://services.theerrors.in/api/send-email`.

---

## 9. Controller Layer

### 9.1 AuthController
`register`, `registerRetailer`, `sendRetailerOtp`, `verifyRetailerOtp`, `verifyRetailer`, `loginRetailer`, `login`, `googleLogin`, `refreshToken`, `logout`, `requestPasswordReset`, `resetPassword`, `getProfile`, `verifyToken`, `sendOtp`, `verifyOtp`

### 9.2 ProductController (1146 lines)
`createProduct`, `createComprehensiveProduct`, `getProduct`, `searchProducts`, `getProductsByRetailer`, `getProductsByWarehouse`, `adminSearchProducts`, `updateProduct`, `updateComprehensiveProduct`, `deleteProduct`, `activateProduct` (accepts deliveryCharge), `getSchoolProducts`, `getFeaturedProducts`, `getProductsByCategory`, `getProductsByBrand`, `getProductsByType`, `checkAvailability`, `getProductOptions`, `addProductOption`, `addProductOptionValue`, `updateProductOption`, `updateProductOptionValue`, `deleteProductOption`, `deleteProductOptionValue`, `getProductVariants`, `createVariant`, `updateVariant`, `deleteVariant`, `updateVariantStock`, `bulkUpdateVariantStocks`, `getProductImages`, `addProductImage`, `addProductImages`, `updateProductImage`, `deleteProductImage`, `setPrimaryImage`, `bulkUploadVariantImages`, `getVariantImages`, `getProductBrands`, `addProductBrand`, `removeProductBrand`, `addRetailerDetails`, `updateRetailerDetails`, `removeRetailerDetails`, `bulkUpdateProducts`, `getProductWithDetails`, `getProductAnalytics`, `searchVariants`, `getVariant`

### 9.3 OrderController (1057 lines)
Uses lazy-init pattern for dependency injection. Static methods: `placeOrder`, `calculateOrderSummary`, `getUserOrders`, `getOrderById`, `cancelOrder`, `trackOrder`. Instance methods: `cancelOrderItem`, `createOrderQuery`, `getOrderQueries`, `searchOrders`, `getOrdersByStatus`, `updateOrderStatus`, `updateOrderItemStatus`, `updatePaymentStatus`, `bulkUpdateOrders`, `exportOrders`, `getOrderStats`

### 9.4 PaymentController (403 lines)
`createPaymentOrder` (Razorpay order creation), `verifyPayment` (HMAC SHA256 signature verification, records transaction), `handleWebhook` (Razorpay webhook with signature verification), `handlePaymentFailure`

### 9.5 Other Controllers
- **SchoolController** — Full CRUD + image upload + association management + analytics + catalog + bulk import
- **UserController** — Profile + addresses + preferences + stats + admin management
- **CategoryController** — CRUD with image upload
- **BrandController** — CRUD
- **ImageController** — Upload/delete/replace
- **PincodeController** — `checkAvailability` (static)
- **WarehouseController** — Add/get/update/delete warehouses (retailer + admin variants)
- **RetailerController** — Profile creation with signature upload, verification status
- **RetailerSchoolController** — Link/unlink/status/product-type management

---

## 10. Validation Schemas (Joi)

Located in `src/models/schemas.js` (940 lines). Every entity has create, update, and query schemas:

| Schema Group | Key Entities/Fields |
|---|---|
| `userSchemas` | register, login (with `loginAs`), retailerLogin, retailerRegister, sendRetailerOtp, verifyRetailerOtp, verifyRetailer, googleAuth, updateProfile, forgotPassword, resetPassword, refreshToken |
| `brandSchemas` | name, slug, description, country, logoUrl, metadata |
| `categorySchemas` | name, slug, description, parentId, productAttributes (JSONB array) |
| `productSchemas` | sku, title, description, productType (bookset/uniform/stationary/general), basePrice, deliveryCharge, currency (INR), city, highlight (array), categoryIds, brandIds, warehouseIds, metadata. AdminQuery adds isDeleted. warehouseProductQuery for warehouse-specific searches |
| `productOptionSchemas` | Attribute: name, position (1-3), isRequired. Value: value, priceModifier, sortOrder, imageUrl |
| `productVariantSchemas` | sku, price, compareAtPrice, stock, weight, optionValue1/2/3, metadata |
| `productImageSchemas` | url, altText, sortOrder, isPrimary, variantId |
| `warehouseSchemas` | name, contactEmail/Phone, address (line1/2, city, state, postalCode), website |
| `schoolSchemas` | name, type (public/private/charter/international), board, address, city/state/country/postalCode, contact, image, productAssociation (grade + mandatory), updateProductAssociation, partnership |
| `orderSchemas` | createOrder (items with productId/variantId/quantity, shippingAddress, billingAddress, contactPhone/Email, paymentMethod), calculateSummary, updateOrderStatus, cancelOrder (reason + refundRequested), updatePaymentStatus, query (with search by order number), bulkUpdateOrders |
| `orderEventSchemas` | orderId, previousStatus, newStatus, changedBy, note, location (lat/lng/address), metadata |
| `orderQuerySchemas` | Support tickets: subject (5-255), message (10-2000), priority (low/normal/high/urgent), category (delivery/product/payment/refund/general), attachments (max 5) |
| `reviewSchemas` | productId, rating (1-5), title, body, images |
| `addressSchemas` | label, recipientName, phone, alternatePhone, line1/2, city, state, postalCode, country, isDefault, lat/lng, landmark, neighborhood, district |
| `paramSchemas` | UUID validators for id, userId, productId, warehouseId, orderId, schoolId, categorySlug, categoryId, brandId, variantId, attributeId, valueId, imageId, productType, city, grade (Pre-KG to 12th), combined: idAndBrandId, idAndImageId |
| `headerSchemas` | warehouseHeaders (x-warehouse-id UUID) |

---

## 11. Authentication & Authorization Flow

### Standard Login Flow
```
Client → POST /api/v1/auth/login { email, password, loginAs }
       ↓
AuthService.login() → Find user by email → bcrypt.compare(password) → Role validation
       ↓
Returns { accessToken (JWT 7d), refreshToken (JWT 30d), user (with role) }
       ↓
Client → Subsequent requests with Header: Authorization: Bearer <accessToken>
       ↓
authenticateToken middleware → authService.verifyToken(token) → jwt.verify()
       ↓
req.user populated → { id, email, roles, fullName, ... }
       ↓
requireRoles('admin', 'retailer') → Checks req.user.roles array
```

### OTP Registration Flow
```
Client → POST /api/v1/auth/send-otp { email, fullName, password }
       ↓
AuthService.sendOtp() → Generate 6-digit OTP → Store in otp_verifications table
with metadata (fullName, password_hash) → Send via emailService.sendOtpEmail()
       ↓
Client → POST /api/v1/auth/verify-otp { email, otp }
       ↓
AuthService.verifyOtp() → Verify OTP (5-minute expiry) → Create user from
stored metadata → Delete OTP → Generate tokens
```

### Retailer Registration Flow
```
1. POST /auth/send-retailer-otp → Send OTP to retailer email
2. POST /auth/verify-retailer-otp → Verify OTP → Register with role=retailer,
   is_active=false, deactivation_reason=unauthorized
3. POST /retailer/data → Upload business info (displayName, ownerName, GSTIN, PAN, signature)
4. Admin: PUT /auth/verify-retailer → Authorize retailer (set is_active=true,
   clear deactivation_reason)
5. POST /auth/login-retailer → Login once authorized
```

### Role System
- **Roles available:** `customer`, `retailer`, `admin`, `system`
- Login schema accepts `loginAs` parameter to specify role context
- `requireRoles(...roles)` middleware enforces role-based access
- `req.user.roles` populated from user data

### Google OAuth Flow
1. Client gets `idToken` from Google Sign-In
2. `POST /api/v1/auth/google-login` with idToken
3. Server verifies via Supabase Auth and creates/links user in custom users table

---

## 12. Configuration

### Environment Variables

```
PORT=3001 (default 5000 in config)
NODE_ENV=development
SUPABASE_URL=<supabase project url>
SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
JWT_SECRET=<secret> (required)
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
RAZORPAY_KEY_ID=<key>
RAZORPAY_KEY_SECRET=<secret>
```

### CORS Policy
- Allowed origins: `localhost:3000`, `localhost:5173`, `localhost:5174`, `bukizz.in`, `seller.bukizz.in`
- Auto-allows local network IPs (`192.168.x.x`, `10.x.x.x`, `172.16-31.x.x`) for mobile testing

### Supabase Storage Buckets
- `products` — Product images
- `retailers` — Retailer assets (signatures)
- `school-images` — School images
- `categories` — Category images

---

## 13. Error Handling

Centralized via `errorHandler` middleware (must be last):

```javascript
// Custom error class
throw new AppError("Product not found", 404);

// Global handler catches:
// - AppError (custom, isOperational flag)
// - CastError (bad IDs)
// - Duplicate key (11000 / ER_DUP_ENTRY)
// - ValidationError
// - JWT errors (JsonWebTokenError, TokenExpiredError)
// - MySQL/Supabase errors

// Response format:
{
  "success": false,
  "error": "Error message",
  "correlationId": "req-xxx-yyy",  // for tracing
  "stack": "..."                    // dev only
}
```

`asyncHandler(fn)` wraps async route handlers to catch unhandled rejections.
`notFoundHandler` catches unmatched routes and returns 404.

---

## 14. Key Product Types & Business Entities

| Entity | Key Concept |
|---|---|
| **Product** | Types: `bookset`, `uniform`, `stationary`, `general`. Has base price + delivery_charge, supports options (up to 3 attributes like Size/Color with price_modifier and image_url per value), variants (SKU + price + stock), images (with primary flag), brands, warehouse links. Soft-deletable via is_deleted flag. Highlight field (JSONB array). City field for location filtering. |
| **School** | Types: `public`, `private`, `charter`, `international`. Boards: `CBSE`, `ICSE`, `State Board`, `IB`, `IGCSE`. Products are associated per grade (`Pre-KG`, `LKG`, `UKG`, `1st` to `12th`) with mandatory flag. Has comprehensive catalog endpoint. |
| **Order** | Multi-item with per-item warehouse_id and per-item status tracking. Supports shipping + billing addresses. Payment methods: cod, upi, card, netbanking, wallet. Full status lifecycle with event tracking via order_events. Support tickets via order_queries. Product snapshots stored in order_items. |
| **Warehouse** | Retailer's warehouses with address (references addresses table) and verification status. Products linked via products_warehouse junction. Retailers linked via retailer_warehouse junction. |
| **Retailer** | Users with role=retailer. Separate retailer_data table for business info (GSTIN, PAN, signature). Authorization workflow: register → submit data → admin approve. Can link to schools via retailer_schools. |
| **Category** | Hierarchical (parent-child via parent_id), has `productAttributes` JSONB for defining what attributes products in this category should have. Supports image upload. |
| **Brand** | Simple entity with name, slug, country, logo_url. Soft-deletable. |

---

## 15. Logging

- **Winston** logger with file and console transports
- Error logs: `logs/error.log` (5MB, 5 files rotation)
- Combined logs: `logs/combined.log` (5MB, 5 files rotation)
- Request correlation IDs via `x-correlation-id` header or auto-generated (`req-${timestamp}-${random}`)
- Structured JSON logging in production, colorized simple format in development
- `createRequestLogger()` middleware logs: method, url, statusCode, duration, userAgent, IP
- `logWithContext(level, message, meta, req)` — logs with correlation ID if available
- Default meta: `{ service: 'bukizz-server', environment: config.env }`

---

## 16. Docker Configuration

```yaml
# docker-compose.yml
services:
  server:
    build: .
    ports: "3001:3001"
    healthcheck: node healthcheck.js (every 30s)
```

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json → npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["node", "index.js"]
```

---

## 17. Database Layer Utilities

### Supabase Client (`src/db/index.js`)

| Function | Purpose |
|---|---|
| `connectDB()` | Initialize Supabase client, test connection |
| `getSupabase()` | Get singleton Supabase client (auto-init) |
| `createAuthenticatedClient(token)` | Create user-scoped client with JWT |
| `createServiceClient()` | Create service-role client (bypasses RLS) |
| `executeSupabaseQuery(table, op, options)` | Generic query helper (select/insert/update/delete) |
| `executeSupabaseRPC(fn, params)` | Call Supabase RPC (stored procedures) |

Uses **service role key** (bypasses RLS) for server-side operations. Repositories call the Supabase client directly using the `supabase-js` SDK.
