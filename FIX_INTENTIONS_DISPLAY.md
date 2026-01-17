# Fix: Intentions Not Displaying as Bullet Points

## Issue
When adding today's intention, it shows as "saved" but doesn't display as bullet points.

## Root Cause
The database table `daily_intentions` has a UNIQUE constraint on `(user_id, entry_date)` which prevents multiple intentions per day. This constraint needs to be removed.

## Solution

### Step 1: Run the Migration
Run this SQL to remove the unique constraint:

```bash
psql -U postgres -d ofa_db -f server/db/migrate_multiple_intentions.sql
```

Or run it directly in your database:

```sql
-- Remove the unique constraint if it exists
ALTER TABLE daily_intentions 
DROP CONSTRAINT IF EXISTS daily_intentions_user_id_entry_date_key;
```

### Step 2: Verify the Fix
After running the migration:

1. Add a new intention - it should appear immediately as a bullet point
2. Add another intention - both should display as bullet points
3. Check the browser console - there should be no errors

## What Was Fixed

1. **Database Schema**: Removed UNIQUE constraint to allow multiple intentions per day
2. **Backend API**: Updated to return array of intentions instead of single intention
3. **Frontend Display**: 
   - Intentions now display as bullet points
   - Each intention has edit/delete buttons
   - Add button allows multiple entries
   - Immediate local state update for instant feedback

## Testing

1. Click "+ Add Intention"
2. Enter an intention and click "Save"
3. You should see:
   - ✓ Saved message
   - The intention appears as a bullet point immediately
   - Edit and Delete buttons are visible

4. Add another intention
5. Both should display as separate bullet points

## If Still Not Working

1. Check browser console for errors
2. Verify the database constraint was removed:
   ```sql
   SELECT conname FROM pg_constraint 
   WHERE conrelid = 'daily_intentions'::regclass 
   AND conname LIKE '%user_id%entry_date%';
   ```
   (Should return no rows)

3. Check the API response:
   - Open browser DevTools → Network tab
   - Add an intention
   - Check the `/api/today` response
   - Verify `intentions` is an array with your entries








