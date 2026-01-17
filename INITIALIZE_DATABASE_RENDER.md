# Initialize Database on Render

## ❌ Current Error

**Error:** `relation "users" does not exist`

This means the database tables haven't been created yet.

## 🎯 Solution: Run Database Initialization

### Option 1: Using Render Shell (Recommended)

1. **Go to your Web Service**: https://dashboard.render.com/web/srv-d5lqo4vgi27c73943l8g
2. **Click on "Shell"** tab (in the left sidebar)
3. **Make sure `DATABASE_URL` is set** in your environment variables (it should be already set)
4. **Run the database initialization**:

```bash
node server/db/init-render.js
```

This script will:
- Connect to your database using `DATABASE_URL`
- Create all necessary tables (users, projects, tasks, etc.)
- Set up indexes and triggers
- Show you a list of all created tables

### Option 2: Using psql Directly

1. **Go to your PostgreSQL database** in Render Dashboard
2. **Click on "Connect"** tab
3. **Copy the "psql Command"** (it will look like: `psql postgresql://...`)
4. **Open your terminal** and run that command
5. **Once connected, paste and run the schema**:

```sql
-- Copy the entire contents of server/db/schema.sql
-- And paste it into the psql prompt
```

Or you can run:

```bash
# From your local machine (if you have psql installed)
psql "postgresql://user:pass@host:5432/dbname" -f server/db/schema.sql
```

### Option 3: Manual SQL Execution

If the script doesn't work, you can manually execute the SQL:

1. **Go to your PostgreSQL database** in Render Dashboard
2. **Click on "Connect"** tab
3. **Copy the "psql Command"** or use the "psql" button
4. **Copy the entire contents** of `server/db/schema.sql`
5. **Paste and execute** in the psql prompt

## ✅ After Initialization

Once the schema is initialized:
1. **Refresh your website**: https://wemanageall.in/signup
2. **Try signing up again** - it should work now!

## 🔍 Verify Tables Were Created

After running the initialization, you can verify by running:

```sql
-- In psql or Render Shell
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
```

You should see tables like:
- users
- user_values
- user_roles
- organizations
- projects
- tasks
- etc.

## 📝 Note

The `schema.sql` file has been created with all necessary tables. The database initialization script (`server/db/init.js`) will automatically run this schema when executed.

