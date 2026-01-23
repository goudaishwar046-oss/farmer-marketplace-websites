# FarmBridge - Farmer-Consumer Marketplace Setup Guide

## 🌾 Project Overview

FarmBridge is a comprehensive farmer-consumer marketplace that connects local farmers with consumers in their area. The platform allows farmers to list products with automatic expiration tracking, enables consumers to browse and purchase locally, and uses location-based discovery for nearby farms.

## ✨ Features

### For Consumers
- 🛍️ **Browse & Search** - Search products by name and category
- 📍 **Location-Based Discovery** - Find nearby farmers on an interactive map
- 📦 **Easy Ordering** - Simple checkout with offline payment support
- 📝 **Order Tracking** - View order history and status
- ⭐ **Ratings & Reviews** - See farmer ratings and reviews

### For Farmers
- 📤 **Product Upload** - Add products with images, expiry dates, and quantity
- 🗺️ **Location Sharing** - Share farm location with location permissions
- 📊 **Inventory Management** - Track and manage product listings
- 📬 **Order Management** - Receive and manage customer orders
- 📈 **Business Profile** - Build reputation with ratings

### Platform Features
- 🌐 **Multi-Language Support** - English, Kannada, Hindi, Tamil, Telugu
- 🔐 **Secure Authentication** - Email/password with location verification
- 💳 **Offline Payments** - Cash on delivery support
- ⏰ **Auto-Expiration** - Products automatically expire based on set dates
- 📱 **Responsive Design** - Mobile-first, works on all devices

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier available)
- Modern web browser with location support

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd farmbridge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Go to Project Settings → API and copy your URL and Anon Key

4. **Configure environment variables**
   - Create a `.env.local` file in the project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

5. **Initialize the database**
   - In Supabase, go to the SQL Editor
   - Run the queries from `/scripts/create-tables.sql`
   - Run the queries from `/scripts/setup-storage.sql`

6. **Create storage bucket**
   - In Supabase Storage, create a bucket named `product_images`
   - Make it public by setting the policy

7. **Run the development server**
   ```bash
   npm run dev
   ```

8. **Open your browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### For Consumers

1. **Sign Up**
   - Click "Shop as Consumer" on the home page
   - Enter email and password
   - Account created instantly

2. **Browse Products**
   - Go to "Marketplace"
   - Search by product name or category
   - Filter by distance, price, or recent additions

3. **View Farmers**
   - Go to "Map" page
   - See nearby farmers with ratings
   - View farmer details and location

4. **Place Order**
   - Click "Add to Cart" or "View Details" on a product
   - Enter quantity and delivery address
   - Select offline payment
   - Confirm order

5. **Track Orders**
   - Go to "Orders"
   - View order status and details

### For Farmers

1. **Sign Up**
   - Click "Sell as Farmer" on the home page
   - Enter email, password, and farm details
   - **Allow location access** when prompted
   - Account created with location verified

2. **Upload Products**
   - Go to "My Products"
   - Click "Upload Product"
   - Fill in: name, price, category, quantity, expiry date
   - Upload product image
   - Submit

3. **Manage Inventory**
   - View all your products on "My Products"
   - Edit or delete products as needed
   - Products auto-expire based on set dates

4. **Process Orders**
   - Go to "Orders"
   - View pending orders from consumers
   - Confirm orders when ready to deliver
   - Mark as completed after delivery

5. **View Profile**
   - Go to "Profile"
   - Update farm business details
   - View your rating and reviews

## 🗄️ Database Schema

### Tables

1. **auth.users** (Supabase built-in)
   - Stores user authentication data

2. **farmers**
   - Farmer profile information
   - Location coordinates
   - Ratings and reviews count
   - Verification status

3. **products**
   - Product details
   - Price, quantity, category
   - Expiration date
   - Image URL
   - Farmer reference

4. **orders**
   - Order information
   - Consumer and farmer reference
   - Order status
   - Payment method
   - Delivery address

5. **reviews**
   - Product and farmer ratings
   - Review comments
   - Reviewer information

## 🔄 Automatic Data Management

### Product Expiration
- Products with past expiry dates are automatically cleaned up
- Associated orders are marked as cancelled
- Trigger: Run `/api/cleanup-expired` with CRON_SECRET

### Set up auto-cleanup (Optional)
```bash
# Set CRON_SECRET in environment variables
CRON_SECRET=your_secret_key

# Call from external cron service (e.g., Vercel Cron)
curl https://yoursite.com/api/cleanup-expired \
  -H "Authorization: Bearer your_secret_key"
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Geolocation**: Browser Geolocation API
- **State Management**: React Context + Hooks

### Backend
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **API**: Next.js Route Handlers

### Languages & Localization
- **Supported**: English, Kannada, ಕನ್ನಡ, Hindi (हिंदी), Tamil (தமிழ்), Telugu (తెలుగు)
- **System**: Client-side with localStorage persistence

## 📁 Project Structure

```
farmbridge/
├── app/
│   ├── page.tsx                 # Home page
│   ├── auth/                    # Authentication pages
│   ├── consumer/                # Consumer pages
│   │   ├── page.tsx            # Marketplace
│   │   ├── map/                # Farmer map
│   │   ├── orders/             # Consumer orders
│   │   ├── order/              # Order placement
│   │   └── profile/            # Consumer profile
│   ├── farmer/                  # Farmer pages
│   │   ├── dashboard/          # Product dashboard
│   │   ├── orders/             # Farmer orders
│   │   ├── product/            # Product management
│   │   └── profile/            # Farmer profile
│   ├── api/                     # API routes
│   └── layout.tsx              # Root layout
├── components/
│   ├── AuthForm.tsx            # Authentication form
│   ├── Navigation.tsx          # Main navigation
│   ├── ProductCard.tsx         # Product display
│   └── ui/                     # shadcn components
├── context/
│   ├── AuthContext.tsx         # Authentication state
│   └── LanguageContext.tsx     # Language state
├── lib/
│   ├── supabase.ts             # Supabase client
│   └── translations.ts         # Multi-language strings
└── scripts/
    ├── create-tables.sql       # Database schema
    └── setup-storage.sql       # Storage setup
```

## 🔐 Security Considerations

1. **Authentication**
   - Secure password handling via Supabase
   - Email verification (optional, configure in Supabase)

2. **Location Data**
   - Location requested via browser API
   - Users must grant permission
   - Location data stored with farmer profiles

3. **Data Access**
   - Row Level Security (RLS) enabled on all tables
   - Users can only see their own orders
   - Farmers can only manage their own products

4. **Image Uploads**
   - Images stored in Supabase Storage
   - Public read access for marketplace
   - Authenticated upload required

5. **Environment Variables**
   - Sensitive keys stored securely
   - Never commit `.env.local` to version control

## 🧪 Testing

### Test Scenarios

1. **Consumer Flow**
   - Sign up as consumer
   - Browse marketplace
   - View farmer map
   - Place order
   - Track order status

2. **Farmer Flow**
   - Sign up as farmer with location
   - Upload product with image
   - Receive orders
   - Manage order status
   - Update profile

3. **Multi-Language**
   - Switch between all 5 languages
   - Verify all text translates correctly

## 📱 Mobile Compatibility

- ✅ Responsive design
- ✅ Mobile-friendly navigation
- ✅ Touch-optimized buttons
- ✅ Location access on mobile browsers
- ✅ Works on iOS Safari and Android Chrome

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repository

3. **Add Environment Variables**
   - Add `NEXT_PUBLIC_SUPABASE_URL`
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Add `CRON_SECRET` (for cleanup job)

4. **Deploy**
   - Click "Deploy"
   - Domain will be assigned automatically

### Deploy Elsewhere

The project can also be deployed to:
- AWS (EC2, Amplify)
- Heroku
- Railway
- Self-hosted servers

## 🐛 Troubleshooting

### "Supabase connection error"
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- Check Supabase project is active

### "Location permission denied"
- Farmers need to allow location access
- Works best in secure contexts (HTTPS)
- Check browser privacy settings

### "Image upload fails"
- Verify `product_images` bucket exists in Supabase Storage
- Check storage permissions are set to public
- Ensure image file is valid format (JPEG, PNG, WebP)

### "Orders not showing"
- Check database tables are created (run SQL scripts)
- Verify user authentication
- Check RLS policies are configured

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Supabase documentation: https://supabase.com/docs
3. Check Next.js documentation: https://nextjs.org/docs
4. Open an issue on GitHub (if applicable)

## 📄 License

This project is open source and available under the MIT License.

## 🎯 Future Enhancements

- [ ] Integrated payment gateway (Stripe, PayPal)
- [ ] Real-time chat between farmers and consumers
- [ ] Advanced analytics for farmers
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Subscription system
- [ ] Bulk ordering
- [ ] Integration with logistics partners
- [ ] Advanced map features (interactive map library)
- [ ] Farmer verification system
- [ ] Product quality ratings
- [ ] Seasonal product recommendations

---

**Happy farming! 🌾**
