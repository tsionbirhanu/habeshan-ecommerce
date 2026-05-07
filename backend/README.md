# Habeshan Mini Market - Backend API

Backend API for Habeshan Mini Market, an eCommerce platform for Ethiopian/Eritrean products in Germany.

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod
- **Authentication**: JWT with bcrypt
- **Testing**: Jest + Supertest
- **Logging**: Winston

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── middleware/     # Express middleware
│   ├── modules/        # Feature modules
│   ├── database/       # Prisma schema
│   ├── jobs/           # Background jobs
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript types
│   ├── app.ts          # Express app setup
│   └── server.ts       # Entry point
├── tests/              # Test files
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Update `.env` with your configuration (especially DATABASE_URL)

4. Setup PostgreSQL database:

```bash
# Create database in PostgreSQL
createdb habeshan_market

# Or see DATABASE_SETUP.md for detailed instructions
```

5. Run database migrations:

```bash
npm run db:generate
npm run db:migrate
```

6. Seed database with sample data:

```bash
npm run db:seed
```

### Development

Start the development server:

```bash
npm run dev
```

Server runs on: http://localhost:3001

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio
- `npm run db:push` - Push schema changes (dev only)

## Database

The project uses PostgreSQL with Prisma ORM. See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed setup instructions.

## API Documentation

Complete API documentation is available via Swagger UI:

**Access Swagger UI:**

```
http://localhost:3001/api-docs
```

**Features:**

- 📖 80+ endpoints documented with OpenAPI 3.0
- 🧪 Interactive "Try it out" testing
- 🔐 JWT authentication support
- 📊 Role-based access documentation
- 📝 Request/response examples

**To use Swagger:**

1. Start the development server: `npm run dev`
2. Login to get JWT token via `/api/auth/login`
3. Click "Authorize" and paste: `Bearer <your-jwt-token>`
4. Click any endpoint and use "Try it out" to test

For more details, see [API_DOCUMENTATION_SUMMARY.md](./API_DOCUMENTATION_SUMMARY.md)

## Testing

The project includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run specific test suite
npm run test:unit          # Service logic only
npm run test:integration   # API endpoints
npm run test:e2e          # Complete workflows

# View coverage report
npm run test:coverage
```

**Test Structure:**

- **Unit Tests**: Service business logic in isolation
- **Integration Tests**: API endpoints with real database
- **E2E Tests**: Complete user workflows (registration → checkout → review)

**Test Files:**

- `tests/setup.ts` - Database and JWT helpers
- `tests/factories.ts` - Test data generation
- `tests/unit/` - Service unit tests
- `tests/integration/` - API endpoint tests
- `tests/e2e/` - Complete workflow tests

**Test Coverage:**

- ✅ 60+ test cases
- ✅ 80%+ code coverage (target)
- ✅ Coupon validation & discount calculation
- ✅ Order creation with coupon integration
- ✅ Authentication flows
- ✅ Product management
- ✅ Admin dashboard functionality

For detailed testing guide, see [TESTING_GUIDE.md](./TESTING_GUIDE.md)

### Sample Users

After seeding:

- **Admin**: admin@habeshan.com / Admin@123
- **Customer**: customer@habeshan.com / Customer@123

## API Endpoints

- `GET /health` - Health check endpoint

## Environment Variables

See `.env.example` for required environment variables.
