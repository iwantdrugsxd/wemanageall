# Dashboard Setup & Fix Guide

## Issue: Dashboard entries not saving

If you're experiencing issues where clicking "Set Intent", "Save Reflection", or saving thinking space entries does nothing, follow these steps:

## Step 1: Run Database Migration

The dashboard requires new database tables. Run the migration:

```bash
npm run db:migrate
```

This will create:
- `daily_intentions` table
- `thinking_space_entries` table  
- Update `journal_entries` table with unique constraint

## Step 2: Verify Database Connection

Make sure your `.env` file has the correct database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=ofa_db
```

## Step 3: Check Server Logs

When you click "Set Intent" or save any entry, check your server console for errors. Common issues:

1. **Table doesn't exist error**: Run `npm run db:migrate`
2. **Connection error**: Check PostgreSQL is running and credentials are correct
3. **Authentication error**: Make sure you're logged in

## Step 4: Test the Endpoints

You can test the API endpoints directly:

```bash
# Test intention endpoint (replace with your session cookie)
curl -X POST http://localhost:3000/api/today/intention \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=YOUR_SESSION_ID" \
  -d '{"intention": "Test intention"}'
```

## Step 5: Check Browser Console

Open browser DevTools (F12) and check:
- **Console tab**: Look for JavaScript errors
- **Network tab**: Check if API calls are being made and what responses you're getting

## Common Error Messages & Solutions

### "Database table not found"
**Solution**: Run `npm run db:migrate`

### "Network error"
**Solution**: 
- Check if server is running (`npm run dev`)
- Check CORS settings in `server/index.js`
- Verify API endpoint URLs match

### "401 Unauthorized"
**Solution**: 
- Make sure you're logged in
- Check session is valid
- Clear cookies and login again

### "500 Internal Server Error"
**Solution**: 
- Check server console for detailed error
- Verify database connection
- Ensure all tables exist

## UI Features Added

✅ **Error Display**: Red error messages show when saves fail
✅ **Loading States**: Buttons show "Saving..." during operations
✅ **Success Feedback**: Green "✓ Saved" indicators
✅ **Auto-save**: Thinking space auto-saves every 30 seconds
✅ **Validation**: Empty fields show helpful error messages

## Testing Checklist

After running migration, test each section:

- [ ] **Today's Intention**: Type text, click "Set Intent" → Should show "✓ Saved"
- [ ] **Daily Objectives**: Add a task → Should appear in list
- [ ] **Thinking Space**: Type content, click "Save Thought" → Should show success message
- [ ] **Daily Reflection**: Select mood, type text, click "Save Reflection" → Should show "✓ Saved"

## If Still Not Working

1. **Restart the server**: `npm run dev`
2. **Clear browser cache**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. **Check database**: Verify tables exist with `psql -d ofa_db -c "\dt"`
4. **Check server logs**: Look for detailed error messages

## Need Help?

Check the server console output when you try to save. The error messages will tell you exactly what's wrong.








