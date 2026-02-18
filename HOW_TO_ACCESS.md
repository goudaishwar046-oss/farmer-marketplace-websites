# How to Access the Farmer Marketplace Website

## 🚀 Running Locally (Development)

### Prerequisites
Ensure you have installed:
- **Node.js** (v18+)
- **npm** or **pnpm** (pnpm is recommended)

### Steps to Run Locally

1. **Open a terminal** in the project directory:
   ```bash
   cd d:\Downloads\farmer-marketplace-website
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```
   or if using pnpm:
   ```bash
   pnpm dev
   ```

3. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

---

## 📝 User Types & Login Flow

The website supports 3 user types:

### 1. **Consumer** (Buyer)
- Browse and purchase products from farmers
- View product listings with expiry dates
- Track orders and leave reviews

**Flow:**
1. Go to `http://localhost:3000`
2. Click **"Sign Up"** → Select **"I'm a Consumer"**
3. Enter email, password, and full name
4. Click **"I'm a Delivery Rider"** or **"Farmer"** to explore other roles

**Consumer Routes:**
- `/consumer` - Home/dashboard
- `/consumer/map` - View farmers on map
- `/consumer/orders` - View your orders
- `/consumer/order/:id` - Order details
- `/consumer/profile` - Your profile

---

### 2. **Farmer** (Seller)
- List and manage agricultural products
- Set prices, quantities, and expiry dates
- Track orders from consumers
- View customer reviews and ratings

**Flow:**
1. Go to `http://localhost:3000`
2. Click **"Sign Up"** → Select **"I'm a Farmer"**
3. Enter:
   - Email & Password
   - Farm Business Name
   - Description (optional)
   - Phone, Address, City, State
   - Latitude & Longitude (farm location)
4. Submit

**Farmer Routes:**
- `/farmer/dashboard` - Dashboard
- `/farmer/product/new` - Add new product
- `/farmer/orders` - View customer orders
- `/farmer/profile` - Manage profile

**Example Test Data:**
```
Email: farmer@test.com
Password: Farmer123!
Farm Name: Green Valley Farms
Phone: +1-555-0100
Address: 123 Farm Road
City: Springfield
State: IL
```

---

### 3. **Delivery Rider** (New!)
- Accept and manage deliveries
- Track delivery status
- Earn from completed deliveries

**Flow:**
1. Go to `http://localhost:3000`
2. Click **"Sign Up"** → Select **"I'm a Delivery Rider"**
3. Enter:
   - Email & Password
   - Full Name
   - Phone Number
   - Vehicle Type (motorcycle, car, bicycle, etc.)
4. Submit

**Delivery Routes:**
- `/delivery` - Delivery dashboard (placeholder, ready for feature development)

**Example Test Data:**
```
Email: delivery@test.com
Password: Delivery123!
Full Name: John Rider
Phone: +1-555-0200
Vehicle Type: Motorcycle
```

---

## 🔐 Authentication

### Dashboard Redirect Behavior
After login, users are redirected to their role-specific dashboard:
- **Farmer** → `/farmer/dashboard`
- **Consumer** → `/consumer`
- **Delivery** → `/delivery`
- **Unknown user** → `/auth` (re-login required)

### Session Management
- Sessions are automatically managed by Supabase
- Logout is available in the **Navigation** menu
- Sessions persist across browser refreshes

---

## 🛠 Technology Stack

- **Frontend**: Next.js 16.1.6 (Turbopack), React 19, TypeScript
- **Authentication**: Supabase Auth
- **Database**: Supabase/PostgreSQL
- **Styling**: Tailwind CSS + shadcn/ui components
- **Maps**: Leaflet (for farmer location display)

---

## ✅ Pre-Launch Checklist

- [x] Dev server runs without errors
- [x] All 3 user types (farmer, consumer, delivery) supported
- [x] Authentication flow working (client + server fallback)
- [x] Consumer map page with error handling
- [x] TypeScript checks passing
- [x] Code pushed to GitHub
- [ ] **⚠️ DB Migration Applied** ← See `DB_MIGRATION_GUIDE.md`

---

## ⚠️ Important: Apply Database Migration First

Before testing sign-ups, you **must** apply the database migration to Supabase:

1. Visit: **https://app.supabase.com/sql/project**
2. Select your project in the dashboard
3. Paste the contents of `scripts/create-tables.sql`
4. Click **Run**

See `DB_MIGRATION_GUIDE.md` for detailed instructions.

---

## 🧪 Quick Test Scenario

1. **Start dev server**: `npm run dev`
2. **Open**: `http://localhost:3000/auth`
3. **Sign up as a farmer**:
   - Email: `farmer@example.com`
   - Password: `Test1234!`
   - Farm Name: `My Farm`
   - Location: (any coordinates, e.g., `40.7128, -74.0060` for NYC)
4. **Should redirect** to `/farmer/dashboard`
5. **Sign out** via menu
6. **Sign in as farmer**: email + password
7. **Should redirect** to `/farmer/dashboard`
8. **Sign up as consumer**:
   - Email: `consumer@example.com`
   - Password: `Test1234!`
9. **Should redirect** to `/consumer`
10. **Visit** `/consumer/map` to see farmer locations

---

## 🌐 Deployed Access (Optional)

If deployed to Vercel, Railway, or other host:

1. Check the deployment URL in your platform's dashboard
2. Log in with the same credentials as local
3. Database connection remains the same (Supabase)

---

## 📞 Support

For errors or issues:
1. Check browser console (`F12` → Console tab)
2. Check terminal output where `npm run dev` is running
3. Verify `.env.local` has correct Supabase keys
4. Ensure database migration is applied

