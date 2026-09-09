
# Inventory & Order Management API

A production-ready backend API built with **Node.js, Express.js, TypeScript, and MongoDB** for managing products and creating orders with secure authentication and atomic stock management.

---

## 📋 Features

- ✅ **User Authentication** — Register/Login with JWT and bcrypt password hashing
- ✅ **Product Management** — Full CRUD operations with search, filter, and pagination
- ✅ **Order Management** — Create orders with automatic stock validation and reduction
- ✅ **Concurrency Safety** — Atomic operations prevent overselling
- ✅ **Security** — JWT protection, CORS, environment variables, input validation
- ✅ **TypeScript** — Fully typed for production reliability
- ✅ **Error Handling** — Global error handler with proper HTTP status codes

---

## 🛠️ Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript |
| Database | MongoDB with Mongoose |
| Authentication | JWT (JSON Web Tokens) |
| Security | bcryptjs (password hashing), CORS |

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation Steps

**1. Clone the repository**
```bash
git clone <your-repo-url>
cd assignment
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure environment variables**

Create a `.env` file in the root directory:
```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/inventory_db
JWT_SECRET=your_super_secret_jwt_key_change_in_production
```
*(Note: No special replica set configuration is required for local development).*

**4. Start the server**

Development mode (with auto-reload):
```bash
npm run dev
```

**5. Verify the server is running**
```bash
curl http://localhost:3000/api/products
```

---

## 📡 API Endpoints

### 🔐 Authentication

#### Register a new user
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```
**Response:** `201 Created`

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```
**Response:** `200 OK`

---

### 📦 Products

#### Get all products (with search, filter, pagination)
```http
GET /api/products?category=electronics&inStock=true&search=laptop&page=1&limit=10
```
**Response:** `200 OK`

#### Get single product
```http
GET /api/products/:id
```
**Response:** `200 OK`

#### Create a product (Protected)
```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Laptop",
  "description": "High-performance laptop",
  "price": 999,
  "stockQuantity": 10,
  "category": "electronics"
}
```
**Response:** `201 Created`

#### Update a product (Protected)
```http
PATCH /api/products/:id
Authorization: Bearer <token>
```
**Response:** `200 OK`

#### Delete a product (Protected)
```http
DELETE /api/products/:id
Authorization: Bearer <token>
```
**Response:** `204 No Content`

---

### 🛒 Orders

#### Create an order (Protected)
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "products": [
    { "productId": "65f1a2b3c4d5e6f7g8h9i0j1", "quantity": 2 }
  ]
}
```
**Response:** `201 Created`

#### Get logged-in user's orders (Protected)
```http
GET /api/orders
Authorization: Bearer <token>
```
**Response:** `200 OK`

#### Get single order (Protected)
```http
GET /api/orders/:id
Authorization: Bearer <token>
```
**Response:** `200 OK`

---

## 🛡️ Security & Authorization

- **JWT Authentication** — All protected routes require a valid JWT token in the `Authorization: Bearer <token>` header
- **Password Security** — Passwords are hashed using bcrypt (12 rounds) before storage
- **CORS** — Enabled for cross-origin requests
- **Environment Variables** — All secrets stored in `.env` file (not committed to Git)
- **Input Validation** — All endpoints validate request data
- **Error Handling** — Proper HTTP status codes (400, 401, 404, 500) with clean error messages

---

## 🤔 Concurrency Solution

> **Question:** Imagine two users try to buy the last available item at the same time. How would you make sure the stock does not become negative or both orders get confirmed?

### Answer

I prevent race conditions by using **Atomic Database Operations**. 

Instead of the vulnerable "Read → Check → Write" pattern, I use `findOneAndUpdate` with a query condition in `src/controllers/orderController.ts`:

```typescript
const product = await Product.findOneAndUpdate(
  {
    _id: item.productId,
    stockQuantity: { $gte: item.quantity }  // Condition: Stock must be sufficient
  },
  { $inc: { stockQuantity: -item.quantity } },  // Atomic decrement
  { returnDocument: 'after' }  // Return the updated document
);

if (!product) {
  throw new Error(`Insufficient stock for product ID: ${item.productId}`);
}
```

**How it works:**
1. The query condition `stockQuantity: { $gte: item.quantity }` is evaluated **atomically** by MongoDB.
2. When two requests hit simultaneously, MongoDB's document-level locking serializes access.
3. Only the **first request** satisfies the condition and successfully decrements the stock.
4. The **second request** fails the condition, returns `null`, and the API gracefully rejects the order with an "Insufficient stock" error.

This simple, robust approach guarantees that stock never becomes negative without requiring complex transaction management or replica set configurations, perfectly aligning with the requirement for a clean, non-overly-complex solution.

---

## 🤖 AI Usage Disclosure

As permitted by the task guidelines, I utilized AI tools to accelerate development while ensuring I fully understand and own the final codebase.

### Tools Used
- **ChatGPT / Claude** — For scaffolding Express/TypeScript boilerplate, optimizing Mongoose type definitions, and generating the Postman collection structure
- **Cursor / GitHub Copilot** — For code completion and refactoring suggestions

### What I Used AI For
- Initial project structure and TypeScript configuration (`tsconfig.json`)
- Mongoose TypeScript patterns (e.g., `HydratedDocument`, `import type` for strict mode)
- Postman collection JSON generation
- Drafting this README and concurrency explanation

### My Contribution
I personally wrote, reviewed, and tested all core business logic:
- Atomic stock reduction logic in `orderController.ts`
- JWT authentication middleware and password hashing
- Search, filter, and pagination logic in `productController.ts`
- Error handling and input validation

I can confidently explain, debug, or modify any part of this codebase.

---

## 📂 Project Structure

```text
assignment/
├── src/
│   ├── config/
│   │   └── db.ts                 # MongoDB connection
│   ├── controllers/              # Business logic
│   │   ├── authController.ts     # Register & Login logic
│   │   ├── productController.ts  # Product CRUD + search/filter
│   │   └── orderController.ts    # Order creation with atomic stock
│   ├── middlewares/              # Cross-cutting concerns
│   │   ├── auth.ts               # JWT protection middleware
│   │   └── errorHandler.ts       # Global error handler
│   ├── models/
│   │   ├── User.ts               # User schema
│   │   ├── Product.ts            # Product schema
│   │   └── Order.ts              # Order schema
│   ├── routes/
│   │   ├── authRoutes.ts         # Auth endpoints
│   │   ├── productRoutes.ts      # Product endpoints
│   │   └── orderRoutes.ts        # Order endpoints
│   ├── types/
│   │   └── index.ts              # Custom TypeScript interfaces
│   ├── app.ts                    # Express app setup
│   └── server.ts                 # Entry point
├── .env.example                  # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
├── postman_collection.json       # Postman collection for testing
└── README.md
```

---

## 📬 Submission Checklist

- ✅ **GitHub Repository** — Clean code, no `.env` or `node_modules` committed
- ✅ **Postman Collection** — `postman_collection.json` included in the repository
- ✅ **README** — Setup instructions, API documentation, and concurrency answer
- ✅ **.env.example** — Template for environment variables provided
- ✅ **TypeScript** — Fully typed for production reliability
- ✅ **Security** — JWT authentication, bcrypt password hashing, CORS enabled
- ✅ **All Features Implemented** — Authentication, Products, Orders, Search/Filter/Pagination, Concurrency handling

---

## 🧪 Testing with Postman

1. Import `postman_collection.json` into Postman
2. Set the `base_url` variable to `http://localhost:3000/api`
3. Test the authentication flow:
   - Register a new user
   - Login and copy the JWT token
   - Set the `token` variable in Postman
4. Test protected routes by adding the token to the `Authorization` header

---