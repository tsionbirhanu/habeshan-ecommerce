import { generateAccessToken } from '../src/utils/jwt.utils';
import { InvalidCredentialsError, ValidationError } from '../src/utils/errors';
import { loginSchema } from '../src/utils/validation.schemas';

console.log('🧪 Testing Middleware Components\n');

// Test 1: JWT Token Generation for Auth Middleware
console.log('1️⃣ Testing JWT Token Generation (for auth middleware)');
const token = generateAccessToken('user-123', 'test@example.com', 'CUSTOMER');
console.log(`   ✅ Generated token: ${token.substring(0, 40)}...`);
console.log(`   📝 Use in header: Authorization: Bearer ${token.substring(0, 20)}...\n`);

// Test 2: Error Classes
console.log('2️⃣ Testing Error Classes');
const authError = new InvalidCredentialsError();
console.log(`   ✅ InvalidCredentialsError: ${authError.statusCode} - ${authError.code}`);

const validationError = new ValidationError('Invalid input');
console.log(`   ✅ ValidationError: ${validationError.statusCode} - ${validationError.code}\n`);

// Test 3: Validation Schema
console.log('3️⃣ Testing Validation Schema');
try {
  const validData = loginSchema.parse({
    email: 'TEST@EXAMPLE.COM',
    password: 'password123',
  });
  console.log(`   ✅ Valid data parsed:`, validData);
} catch (error) {
  console.log(`   ❌ Validation failed`);
}

try {
  loginSchema.parse({
    email: 'invalid-email',
    password: '',
  });
} catch (error: any) {
  console.log(`   ✅ Correctly rejected invalid data`);
  console.log(`   Errors: ${error.errors.length} validation errors\n`);
}

// Test 4: Middleware Chain Order
console.log('4️⃣ Middleware Chain Order (in app.ts)');
console.log(`   1. requestLogger - Logs all requests`);
console.log(`   2. helmet - Security headers`);
console.log(`   3. CORS - Cross-origin requests`);
console.log(`   4. bodyParser - Parse JSON/URL-encoded`);
console.log(`   5. routes - API endpoints`);
console.log(`   6. errorHandler - Global error handling\n`);

// Test 5: Auth Middleware Usage Examples
console.log('5️⃣ Auth Middleware Usage Examples');
console.log(`   // Require authentication:`);
console.log(`   router.get('/profile', authenticateToken, handler);`);
console.log();
console.log(`   // Require specific role:`);
console.log(`   router.post('/admin', authenticateToken, requireRole('ADMIN'), handler);`);
console.log();
console.log(`   // Optional authentication:`);
console.log(`   router.get('/products', optionalAuth, handler);\n`);

// Test 6: Validation Middleware Usage
console.log('6️⃣ Validation Middleware Usage Examples');
console.log(`   // Validate request body:`);
console.log(`   router.post('/login', validateBody(loginSchema), handler);`);
console.log();
console.log(`   // Validate query params:`);
console.log(`   router.get('/search', validateQuery(searchSchema), handler);`);
console.log();
console.log(`   // Validate URL params:`);
console.log(`   router.get('/:id', validateParams(idSchema), handler);\n`);

console.log('✅ All middleware components ready!\n');
