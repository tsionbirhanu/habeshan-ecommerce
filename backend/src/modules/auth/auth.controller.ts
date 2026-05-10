import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';

// NOTE: Vendor registration is disabled. Vendors must be created by admin only.
// Keeping this function for internal/admin use if needed
export const registerVendor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.createVendor(req.body);

    res.status(201).json({
      success: true,
      message: 'Vendor registration submitted. Awaiting admin approval.',
    });
  } catch (error) {
    next(error);
  }
};

// Only endpoint for customer registration - no admin approval required
export const registerCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.createCustomer(req.body);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
      message: 'Account created successfully. Please verify your email to start shopping.',
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await authService.authenticateUser(email, password);

    res.json({
      success: true,
      data: result,
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);

    res.json({
      success: true,
      data: result,
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: Blacklist token in Redis
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    await authService.requestPasswordReset(email);

    res.json({
      success: true,
      message: 'If that email exists, a reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body;
    await authService.resetUserPassword(token, newPassword);

    res.json({
      success: true,
      message: 'Password reset successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const user = await authService.getUserById(req.user.userId);

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.query as { token: string };
    await authService.verifyEmail(token);

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const resendVerification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    await authService.resendVerificationEmail(email);

    res.json({
      success: true,
      message: 'Verification email sent',
    });
  } catch (error) {
    next(error);
  }
};

export const setVendorPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;
    await authService.setVendorPassword(token, password);

    res.json({
      success: true,
      message: 'Password set successfully. Your account is now active. You can now login.',
    });
  } catch (error) {
    next(error);
  }
};
