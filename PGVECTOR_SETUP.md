# pgvector Setup Guide

## What is pgvector?

pgvector is a PostgreSQL extension that enables vector similarity search. It's required for the Personal Knowledge Engine's semantic search features.

## Installation

### Step 1: Install pgvector on your PostgreSQL server

#### macOS (Homebrew)
```bash
brew install pgvector
```

#### Ubuntu/Debian
```bash
# For PostgreSQL 14
sudo apt-get install postgresql-14-pgvector

# For PostgreSQL 15
sudo apt-get install postgresql-15-pgvector

# For PostgreSQL 16
sudo apt-get install postgresql-16-pgvector

# Adjust version number to match your PostgreSQL version
```

#### From Source
```bash
git clone --branch v0.5.1 https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install
```

### Step 2: Enable the extension in your database

Run the migration script:

```bash
npm run db:install-pgvector
```

This will:
- Check if pgvector is installed
- Create the `vector` extension in your database
- Verify it's working

### Step 3: Verify Installation

After running the migration, you should see:
```
✅ pgvector extension created successfully!
✅ pgvector extension verified (version: 0.5.1)
✅ Vector type is working correctly
```

## Troubleshooting

### Error: "extension 'vector' does not exist"

**Solution**: pgvector is not installed on your PostgreSQL server. Install it first (see Step 1 above).

### Error: "permission denied to create extension"

**Solution**: You need superuser privileges. Either:
1. Run as PostgreSQL superuser: `sudo -u postgres psql -d ofa_db -c "CREATE EXTENSION vector;"`
2. Or grant your user superuser privileges temporarily

### Error: "could not open extension control file"

**Solution**: pgvector files are not in the PostgreSQL extension directory. Reinstall pgvector.

## Testing

After installation, test with:

```sql
-- Test vector type
SELECT '[1,2,3]'::vector(3);

-- Should return: [1,2,3]
```

## Next Steps

Once pgvector is installed:
1. Run `npm run knowledge:embed` to create embeddings for existing knowledge events
2. The system will automatically create embeddings for new events
3. Semantic search features will be enabled

## Notes

- The knowledge system will work **without** pgvector, but semantic search features will be limited
- If pgvector is not installed, the system will log warnings but continue functioning
- Embeddings are created in batches via the `knowledge:embed` job






