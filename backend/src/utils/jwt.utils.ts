import * as jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { authConfig, TokenType } from '../config/auth';
import { AuthPayload } from '../types/auth.types';
import { InvalidTokenError, TokenExpiredError } from './errors';

export const generateAccessToken = (userId: string, email: string, role: UserRole): string => {
  const payload: AuthPayload = { userId, email, role };
  return jwt.sign(
    { ...payload, type: TokenType.ACCESS },
    authConfig.jwt.secret,
    { expiresIn: authConfig.jwt.accessExpiry }
  );
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { userId, type: TokenType.REFRESH },
    authConfig.jwt.secret,
    { expiresIn: authConfig.jwt.refreshExpiry }
  );
};

export const generateResetToken = (userId: string, email: string): string => {
  return jwt.sign(
    { userId, email, type: TokenType.RESET_PASSWORD },
    authConfig.jwt.secret,
    { expiresIn: authConfig.jwt.resetPasswordExpiry }
  );
};

export const verifyAccessToken = (token: string): AuthPayload => {
  try {
    const decoded = jwt.verify(token, authConfig.jwt.secret) as AuthPayload & { type: string };
    
    if (decoded.type !== TokenType.ACCESS) {
      throw new InvalidTokenError('Invalid token type');
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new TokenExpiredError();
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new InvalidTokenError();
    }
    throw error;
  }
};

export const verifyRefreshToken = (token: string): { userId: string } => {
  try {
    const decoded = jwt.verify(token, authConfig.jwt.secret) as { userId: string; type: string };
    
    if (decoded.type !== TokenType.REFRESH) {
      throw new InvalidTokenError('Invalid token type');
    }

    return { userId: decoded.userId };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new TokenExpiredError();
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new InvalidTokenError();
    }
    throw error;
  }
};

export const verifyResetToken = (token: string): { userId: string; email: string } => {
  try {
    const decoded = jwt.verify(token, authConfig.jwt.secret) as {
      userId: string;
      email: string;
      type: string;
    };
    
    if (decoded.type !== TokenType.RESET_PASSWORD) {
      throw new InvalidTokenError('Invalid token type');
    }

    return { userId: decoded.userId, email: decoded.email };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new TokenExpiredError();
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new InvalidTokenError();
    }
    throw error;
  }
};

export const generateEmailVerificationToken = (email: string): string => {
  return jwt.sign(
    { email, type: TokenType.EMAIL_VERIFICATION },
    authConfig.jwt.secret,
    { expiresIn: authConfig.jwt.emailVerificationExpiry }
  );
};

export const verifyEmailVerificationToken = (token: string): { email: string } => {
  try {
    const decoded = jwt.verify(token, authConfig.jwt.secret) as {
      email: string;
      type: string;
    };
    
    if (decoded.type !== TokenType.EMAIL_VERIFICATION) {
      throw new InvalidTokenError('Invalid token type');
    }

    return { email: decoded.email };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new TokenExpiredError();
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new InvalidTokenError();
    }
    throw error;
  }
};
