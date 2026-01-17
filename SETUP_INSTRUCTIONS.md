# 🚀 Quick Setup Instructions

## ✅ What's Done
- Supabase credentials added to `.env`
- Storage bucket `unload-recordings` created
- Database schema updated

## ⚠️ What You Need to Do Now

### Step 1: Set Up Storage Policies (REQUIRED)

The bucket exists but needs policies to allow uploads. Choose one method:

#### Option A: Via SQL Editor (Recommended)
1. Go to: https://supabase.com/dashboard/project/nogqzpfnttilcamfpmps/sql/new
2. Copy and paste the SQL from `setup-storage-policies.sql`
3. Click **Run**

#### Option B: Via Dashboard
1. Go to: https://supabase.com/dashboard/project/nogqzpfnttilcamfpmps/storage/policies
2. Select the `unload-recordings` bucket
3. Click **New Policy**
4. Create three policies:
   - **Insert Policy**: Allow public uploads
   - **Select Policy**: Allow public reads  
   - **Delete Policy**: Allow public deletes

### Step 2: Initialize Database Table

```bash
npm run db:init
```

This creates the `unload_entries` table in your PostgreSQL database.

### Step 3: Test It!

```bash
npm run dev
```

Then navigate to `/emotions` and try recording a voice entry!

---

## 🔍 Troubleshooting

**Error: "Bucket not found"**
- ✅ Bucket is created (we just did this)
- ⚠️ You need to set up storage policies (Step 1 above)

**Error: "Permission denied"**
- Check that storage policies are set up correctly
- Verify the bucket name is exactly `unload-recordings`

**Error: "Table does not exist"**
- Run `npm run db:init` to create the table









