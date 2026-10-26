# StepUp.in - Premium Shoe E-Commerce Platform

A full-stack Shoe E-Commerce website built with **React (Frontend)**, **Python + Django REST Framework (Backend)**, and **PostgreSQL (Database)**.

All page layouts and visual designs are reproduced with pixel-precision from the provided `Layout_Reference` folder, utilizing the original assets from `E_Commerce_Shoe_Website_Images`.

---

## 🚀 Key Features & Layout References Implemented

| Layout Reference Page | Implementation & Routes | Key Features |
| :--- | :--- | :--- |
| **Home Page** (`Home page.png`) | `/` | Header with circular StepUp logo, live search, 50% Off Kids Carousel Banner with CTA, Overview statement, 3 category cards (Mens, Womens, Kids), New & Trending 8-item grid with "View all", Free Gift promo banner, 5-column footer. |
| **Mega Menus** (`Mens.png`, `Womens.png`, `Kids.png`, `Brands.png`, `offers.png`) | Navbar dropdowns | Hoverable & clickable multi-column mega menus replicating the exact layout reference categories, subcategories, alphabetical brand directory, and special deals. |
| **Product Description Page** (`Product description page.png`) | `/product/:id` | 6 multi-angle photo gallery (2x3 grid), color dots, shoe size selection (41-45), quantity counter, "Add to Cart", "Buy Now", Secure Checkout badges, WhatsApp size advisor, COD / Dispatch / Return policy card, detailed specifications, full customer reviews breakdown. |
| **Cart Page** (`Cart page.png`) | `/cart` | Dynamic ticking countdown banner (*"Order within 23 hours, 53 minutes, 50 seconds"*), items list with pier shoe thumbnail, size & quantity dropdowns, instant item removal, summary totals, "Checkout Securely", Express Checkout (Google Pay, PayPal, Clearpay, Klarna). |
| **Checkout Page** (`Checkout page.png`) | `/checkout` | Split layout: Left dark-teal order summary card with thumbnail & totals; Right staged flow for sign-in/register, delivery address, delivery option, payment selection, and final order review. |
| **Order Completion Page** (`Order Completion page.png`) | `/order-success/:orderId` | Success checkmark graphic, confirmation message (*"We've received your order will ship in 5-7 business days"*), unique Order Number (e.g., `#Bh2300006`), "View Order" and "Track Order" navigation buttons. |
| **Tracking Page** (`Tracking page.png`) | `/tracking/:orderId` | Order details card with live step timeline tracker (Order Placed ➜ OrderDispatched ➜ Order in transit ➜ Delivered successfully), status timestamps, and location details. |
| **Log In & Register** (`Log in page.png`) | `/login` | Dual-tab card (Log in / Register), email input, password with show/hide toggle eye icon, "Forget Password?", "Continue with Google", direct tab toggling. |
| **About Us** (`About page.png`) | `/about` | Brand history, "Our Mission", right-edge decorative graphic, center circular metallic shoe graphic, 3 core pillars (*Simplicity In Design*, *Confidance in Comfort*, *Made from Nature*). |
| **Contact Us** (`Contact page.png`) | `/contact` | "For Online Orders" inquiry numbers and hours, customer care email, collection photo banner, interactive "Enquiry Form" (Name, Email, Phone, Message) saving directly to Django database. |
| **Filter Toolbar** (`Filters.png`) | `/products` | Collapsible/expandable filter toolbar with dropdown selectors for **Style**, **Size**, **Brands**, and **Color**. |

---

## 🧾 Checkout journey

Checkout now guides customers through these stages:

1. Add a product to the cart and proceed to checkout.
2. Sign in or register; after authentication, continue checkout.
3. Enter delivery contact and address details.
4. Choose standard or express delivery.
5. Select Cash on Delivery or Razorpay, then review the order.
6. Place the order. Online payments continue to Razorpay and require a successful verification response before confirmation; failed, cancelled, or unverified payments return to payment selection.
7. View order confirmation, track the shipment, and follow the delivery timeline through product delivery.

---

## 🛒 Cart persistence and guest merge

- Guest cart items are stored in the browser's `stepup_cart` local storage.
- Login and registration authenticate against Django and return a DRF token.
- After authentication, the frontend fetches the account cart, merges guest items by product and shoe size, and adds quantities for matching variants.
- The merged account cart is saved in the database; local cart data is replaced with the merged result only after the merge succeeds. Later account-cart changes are persisted as well.
- Run `manage.py migrate` in `stepup/backend` to create the cart and token tables.

---

## 💳 Payment Gateway Implementations

### 1. Cash on Delivery (COD)
- Fully implemented on backend and frontend.
- Generates order with status `Placed`, creates full tracking timeline history, and immediately takes customer to Order Completion & Tracking.

### 2. Razorpay Payment Gateway
- Integrated using Razorpay Checkout SDK (`https://checkout.razorpay.com/v1/checkout.js`).
- Backend endpoint `/api/orders/create/` creates a Razorpay order in INR (paise).
- Frontend opens official Razorpay popup modal supporting UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, NetBanking, and Wallets.
- Backend endpoint `/api/orders/razorpay-verify/` verifies cryptographic payment signature (`razorpay_signature`) and marks order as `Paid`.

---

## 🛠️ Tech Stack & Directory Structure

- **Frontend**: React 18, Vite, React Router DOM, Lucide Icons, Context API, Axios.
- **Backend**: Python 3.9, Django 4.2, Django REST Framework, Django CORS Headers, Razorpay SDK, psycopg2-binary, python-dotenv.
- **Database**: PostgreSQL (with SQLite fallback configured for zero-friction local testing).

```
VTS_Django/
├── stepup/
│   ├── venv/                      # Dedicated Virtual Environment
│   ├── backend/                   # Django + DRF Backend
│   │   ├── api/                   # Models, Views, Serializers, URLs
│   │   ├── stepup_backend/        # Settings (PostgreSQL/SQLite, CORS, Razorpay)
│   │   ├── .env                   # Environment variables (DB credentials, Razorpay keys)
│   │   ├── seed_data.py           # Pre-populates all 31+ shoes, brands, reviews & reference order
│   │   └── setup_postgres.sql     # PostgreSQL database & user setup script
│   ├── frontend/                  # React Frontend (Vite)
│   │   ├── public/assets/         # Extracted & processed shoe assets, logos, and banners
│   │   ├── src/components/        # Navbar, Footer, ProductCard, FilterToolbar
│   │   ├── src/pages/             # Home, PDP, Cart, Checkout, Success, Tracking, Login, etc.
│   │   └── src/context/           # CartContext (cart items, live totals, orders)
│   ├── E Commerce shoe website/   # Original assets & reference designs
│   ├── run_backend.bat            # One-click backend launcher (uses stepup\venv)
│   ├── run_frontend.bat           # One-click frontend launcher
│   └── README.md
```

---

## ⚡ Quick Start Guide

### 1. Run Backend Server
In a terminal at `C:\Users\Subha\Desktop\VTS_Django\stepup`:
```bash
.\run_backend.bat
```
*(Or manually: `cd backend` then `..\venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000`)*

The API will be available at: **http://127.0.0.1:8000/api/**

### 2. Run Frontend Server
In a second terminal at `C:\Users\Subha\Desktop\VTS_Django\stepup`:
```bash
.\run_frontend.bat
```
*(Or manually: `cd frontend` then `npm run dev`)*

Open your browser at: **http://localhost:5173**

---

## 🐘 Configuring PostgreSQL

To connect to a live PostgreSQL database:
1. Open `stepup/backend/.env` (or configure your PostgreSQL instance).
2. Set:
```env
USE_POSTGRES=True
DB_NAME=stepup_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```
3. Run database migration and seeding:
```bash
cd stepup/backend
..\venv\Scripts\python.exe manage.py migrate
..\venv\Scripts\python.exe seed_data.py
```
*(If `USE_POSTGRES=False` or not specified, the system automatically uses SQLite, ensuring zero downtime).*
