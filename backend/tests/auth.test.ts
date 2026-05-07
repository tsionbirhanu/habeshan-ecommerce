import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from '../src/utils/jwt.utils';
import { hashPassword, comparePassword } from '../src/utils/hash.utils';
import { loginSchema, registerCustomerSchema } from '../src/utils/validation.schemas';

async function testAuth() {
  console.log('🧪 Testing Authentication Utilities\n');

  // Test 1: Password Hashing
  console.log('1️⃣ Testing Password Hashing...');
  const password = 'Test@123';
  const hashed = await hashPassword(password);
  const isValid = await comparePassword(password, hashed);
  const isInvalid = await comparePassword('WrongPassword', hashed);
  console.log(`   ✅ Hash: ${hashed.substring(0, 20)}...`);
  console.log(`   ✅ Valid password: ${isValid}`);
  console.log(`   ✅ Invalid password: ${isInvalid}\n`);

  // Test 2: JWT Generation
  console.log('2️⃣ Testing JWT Generation...');
  const accessToken = generateAccessToken('user-123', 'test@example.com', 'CUSTOMER');
  const refreshToken = generateRefreshToken('user-123');
  console.log(`   ✅ Access Token: ${accessToken.substring(0, 30)}...`);
  console.log(`   ✅ Refresh Token: ${refreshToken.substring(0, 30)}...\n`);

  // Test 3: JWT Verification
  console.log('3️⃣ Testing JWT Verification...');
  const accessPayload = verifyAccessToken(accessToken);
  const refreshPayload = verifyRefreshToken(refreshToken);
  console.log(`   ✅ Access Payload:`, accessPayload);
  console.log(`   ✅ Refresh Payload:`, refreshPayload);
  console.log();

  // Test 4: Validation Schemas
  console.log('4️⃣ Testing Validation Schemas...');
  try {
    const loginData = loginSchema.parse({
      email: 'TEST@EXAMPLE.COM',
      password: 'password123',
    });
    console.log(`   ✅ Login validation passed:`, loginData);
  } catch (error) {
    console.log(`   ❌ Login validation failed:`, error);
  }

  try {
    const registerData = registerCustomerSchema.parse({
      email: 'new@example.com',
      password: 'Test@123',
      firstName: 'John',
      lastName: 'Doe',
    });
    console.log(`   ✅ Register validation passed:`, registerData);
  } catch (error) {
    console.log(`   ❌ Register validation failed:`, error);
  }

  // Test 5: Invalid Password
  console.log('\n5️⃣ Testing Invalid Password Validation...');
  try {
    registerCustomerSchema.parse({
      email: 'test@example.com',
      password: 'weak',
      firstName: 'John',
      lastName: 'Doe',
    });
  } catch (error: any) {
    console.log(`   ✅ Correctly rejected weak password`);
    console.log(`   Error:`, error.errors[0].message);
  }

  console.log('\n✅ All tests completed!\n');
}

testAuth().catch(console.error);
