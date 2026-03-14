#!/bin/sh
set -e

echo "=== Persona Startup ==="

# Wait for database to be ready
echo "Waiting for database..."
for i in $(seq 1 30); do
  node -e "
    const pg = require('postgres');
    const sql = pg(process.env.DATABASE_URL);
    sql\`SELECT 1\`.then(() => { sql.end(); process.exit(0); }).catch(() => { sql.end(); process.exit(1); });
  " 2>/dev/null && break
  echo "  Attempt $i/30 - database not ready, waiting..."
  sleep 2
done

# Run database migration
echo "Running database migration..."
npx drizzle-kit push --config=drizzle.config.ts 2>&1 || echo "Warning: migration may have failed"

# Run seed if needed (skip in production unless FORCE_SEED=true)
if [ "$NODE_ENV" = "production" ] && [ "$FORCE_SEED" != "true" ]; then
  echo "Production mode: automatic seed disabled. Set FORCE_SEED=true to override."
else
  echo "Checking seed status..."
  node -e "
    require('tsx/cjs');
    const { db } = require('./src/lib/db/index.ts');
    const { users } = require('./src/lib/db/schema/index.ts');
    db.select().from(users).limit(1).then(rows => {
      if (rows.length === 0) {
        console.log('No users found, seeding...');
        import('./src/lib/db/seed.ts').then(() => {
          console.log('Seed complete.');
          process.exit(0);
        });
      } else {
        console.log('Database already seeded.');
        process.exit(0);
      }
    }).catch(err => {
      console.error('Seed check error:', err.message);
      process.exit(0);
    });
  " 2>&1 || echo "Warning: seed check failed"
fi

# Seed playbooks if needed
echo "Checking playbooks..."
npx tsx src/lib/db/seed-playbooks.ts 2>&1 || echo "Warning: playbook seed failed"

echo "Starting Next.js server..."
exec node server.js
