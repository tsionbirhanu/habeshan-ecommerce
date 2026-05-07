import { env } from './environment';
import type { SignOptions } from 'jsonwebtoken';

export enum TokenType {
  ACCESS = 'ACCESS',
  REFRESH = 'REFRESH',
  RESET_PASSWORD = 'RESET_PASSWORD',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
}

export const authConfig = {
  jwt: {
    secret: env.JWT_SECRET,
    accessExpiry: '1d' as SignOptions['expiresIn'],
    refreshExpiry: '7d' as SignOptions['expiresIn'],
    resetPasswordExpiry: '1h' as SignOptions['expiresIn'],
    emailVerificationExpiry: '24h' as SignOptions['expiresIn'],
  },
  bcrypt: {
    saltRounds: 10,
  },
};
