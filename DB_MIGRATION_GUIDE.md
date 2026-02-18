# DB Migration Instructions

## Option 1: Use Supabase Web Console (Recommended)

1. Visit: https://app.supabase.com/sql/project
2. Select your project: **farmer-marketplace-websites**
3. Click **SQL Editor** (left sidebar)
4. Click **+ New query**
5. Copy the entire contents of `scripts/create-tables.sql` (from this repo)
6. Paste into the SQL editor
7. Click **Run** (or press Ctrl+Shift+Enter)

---

## Option 2: Use CLI (requires psql)

If you have `psql` installed, run this command to apply the migration:

```bash
psql -h db.oeadhywwkcqrtcvksrsl.supabase.co \
     -U postgres \
     -d postgres \
     -f scripts/create-tables.sql
```

When prompted, enter your Supabase database password.

---

## Option 3: Use Docker (if psql not installed)

```bash
docker run -v %cd%\scripts:/scripts postgres:15 \
  psql -h host.docker.internal -U postgres -d postgres -f /scripts/create-tables.sql
```

---

## Verification

After running the migration, verify it succeeded by checking the Supabase console:

1. Go to **Tables** in the left sidebar
2. You should see: `users`, `farmers`, `delivery_boys`, `products`, `orders`, `reviews`
3. Check that `delivery` is in the `users.user_type` check constraint

---

## Expected Tables After Migration

- `users` - centralized user table with `user_type` (farmer/consumer/delivery)
- `farmers` - farmer profile linked to users
- `delivery_boys` - delivery rider profile linked to users
- `products` - products listed by farmers (with `expiry_date`)
- `orders` - orders placed by consumers
- `reviews` - reviews from consumers
- Row Level Security (RLS) policies enabled on all tables
- Performance indexes on key columns

