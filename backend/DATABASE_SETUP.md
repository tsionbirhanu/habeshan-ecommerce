# Database Setup Guide

This guide will help you set up PostgreSQL and run the initial database migration for Habeshan Mini Market.

## Prerequisites

- PostgreSQL 14+ installed on your system
- Node.js 18+ and npm installed

## Step 1: Install PostgreSQL

### Windows
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. Default port is `5432`

### macOS
```bash
brew install postgresql@14
brew services start postgresql@14
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## Step 2: Create Database

Open PostgreSQL command line (psql) or use pgAdmin:

```sql
-- Connect as postgres user
psql -U postgres

-- Create database
CREATE DATABASE habeshan_market;

-- Create user (optional, or use postgres user)
CREATE USER habeshan_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE habeshan_market TO habeshan_user;

-- Exit
\q
```

## Step 3: Update Environment Variables

Update your `.env` file with the correct database credentials:

```env
DATABASE_URL=postgresql://habeshan_user:your_secure_password@localhost:5432/habeshan_market
```

Or if using the default postgres user:

```env
DATABASE_URL=postgresql://postgres:your_postgres_password@localhost:5432/habeshan_market
```

## Step 4: Run Migrations

Generate Prisma client and create database tables:

```bash
# Generate Prisma client
npm run db:generate

# Create initial migration
npm run db:migrate

# When prompted, enter migration name: init
```

This will:
- Create all database tables
- Set up relationships and indexes
- Apply all constraints

## Step 5: Seed Database

Populate the database with sample data:

```bash
npm run db:seed
```

This will create:
- 4 product categories
- 8 Ethiopian/Eritrean products
- Inventory records
- Admin user: `admin@habeshan.com` (password: `Admin@123`)
- Customer user: `customer@habeshan.com` (password: `Customer@123`)
- Sample address

## Step 6: Verify Setup

Open Prisma Studio to view your data:

```bash
npm run db:studio
```

This opens a web interface at `http://localhost:5555` where you can browse and edit data.

## Database Scripts

Available npm scripts for database management:

- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Create and apply migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio
- `npm run db:push` - Push schema changes without migration (dev only)

## Troubleshooting

### Connection refused
- Ensure PostgreSQL is running: `pg_isready`
- Check if PostgreSQL is listening on port 5432
- Verify firewall settings

### Authentication failed
- Double-check username and password in DATABASE_URL
- Ensure user has proper permissions

### Migration fails
- Ensure database exists
- Check DATABASE_URL format
- Verify PostgreSQL version compatibility

### Port already in use
- Change PostgreSQL port in postgresql.conf
- Update DATABASE_URL with new port

## Database Schema Overview

The schema includes:

**User Management:**
- Users (customers, admins, delivery personnel)
- Addresses

**Product Catalog:**
- Categories
- Products
- Product Images
- Inventory tracking

**Orders & Payments:**
- Orders with items
- Payments (Stripe, PayPal, Klarna, etc.)
- Invoices
- Shipments

**Reviews & Ratings:**
- Product reviews
- Rating system

**Marketing:**
- Coupons and discounts

**System:**
- Notifications
- Audit logs

## Next Steps

After successful setup:
1. Start the development server: `npm run dev`
2. Test the health endpoint: `http://localhost:3001/health`
3. Begin implementing API endpoints in `src/modules/`
