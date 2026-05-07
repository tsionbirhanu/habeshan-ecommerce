# Migration Guide

## Quick Start (When PostgreSQL is Ready)

Once you have PostgreSQL installed and running, follow these steps:

### 1. Verify PostgreSQL is Running

```bash
# Windows
pg_isready

# Or check if service is running
Get-Service postgresql*
```

### 2. Create Database

```bash
# Using psql
psql -U postgres
CREATE DATABASE habeshan_market;
\q

# Or using createdb command
createdb -U postgres habeshan_market
```

### 3. Update .env

Ensure your `.env` file has the correct DATABASE_URL:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/habeshan_market
```

### 4. Run Initial Migration

```bash
# Generate Prisma client
npm run db:generate

# Create and apply migration
npm run db:migrate

# When prompted, enter migration name: init
```

### 5. Seed Database

```bash
npm run db:seed
```

### 6. Verify

```bash
# Open Prisma Studio
npm run db:studio

# Or test the connection
npm run dev
```

## What Gets Created

### Tables (17 total)
1. User - User accounts
2. Address - User addresses
3. Category - Product categories
4. Product - Products
5. ProductImage - Product images
6. Order - Customer orders
7. OrderItem - Order line items
8. Payment - Payment records
9. Invoice - Order invoices
10. Inventory - Stock levels
11. InventoryHistory - Stock changes
12. Review - Product reviews
13. Coupon - Discount codes
14. Notification - User notifications
15. Shipment - Order shipments
16. AuditLog - System audit trail
17. _prisma_migrations - Migration history

### Sample Data (from seed)
- 4 Categories
- 8 Products (Ethiopian/Eritrean items)
- 8 Inventory records
- 2 Users (admin + customer)
- 1 Address

## Common Issues

### Issue: Connection refused
**Solution**: Ensure PostgreSQL is running
```bash
# Windows
net start postgresql-x64-14

# Linux/Mac
sudo systemctl start postgresql
```

### Issue: Database does not exist
**Solution**: Create the database first
```bash
createdb -U postgres habeshan_market
```

### Issue: Authentication failed
**Solution**: Check your DATABASE_URL credentials
- Verify username and password
- Ensure user has database access

### Issue: Migration fails
**Solution**: 
1. Drop and recreate database if in development
2. Check Prisma schema for errors: `npx prisma validate`
3. Review migration logs

## Migration Commands

```bash
# Generate Prisma client (after schema changes)
npm run db:generate

# Create new migration
npm run db:migrate

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View migration status
npx prisma migrate status

# Push schema without migration (dev only)
npm run db:push
```

## Development Workflow

1. Make changes to `prisma/schema.prisma`
2. Run `npm run db:generate` to update Prisma client
3. Run `npm run db:migrate` to create and apply migration
4. Test changes with `npm run db:studio`

## Production Deployment

1. Set `DATABASE_URL` in production environment
2. Run `npx prisma migrate deploy` (not `migrate dev`)
3. Optionally run seed script if needed
4. Verify with health checks

## Rollback

To rollback a migration:

```bash
# View migration history
npx prisma migrate status

# Rollback is not directly supported
# Instead, create a new migration that reverses changes
# Or restore from database backup
```

## Backup & Restore

### Backup
```bash
pg_dump -U postgres habeshan_market > backup.sql
```

### Restore
```bash
psql -U postgres habeshan_market < backup.sql
```

## Next Steps

After successful migration:
1. ✅ Database schema is ready
2. ✅ Sample data is loaded
3. ✅ Prisma client is generated
4. 🚀 Start building API endpoints in `src/modules/`
