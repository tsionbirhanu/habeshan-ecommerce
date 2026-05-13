import type { AxiosError } from "axios";
import type { ApiError } from "../client/types";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, any>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const parseApiError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  const axiosError = error as AxiosError<{ error?: ApiError }>;

  if (axiosError.response?.status === 401) {
    return new AppError(
      401,
      "UNAUTHORIZED",
      "Your session has expired. Please login again.",
    );
  }

  if (axiosError.response?.status === 403) {
    return new AppError(
      403,
      "FORBIDDEN",
      "You do not have permission to perform this action.",
    );
  }

  if (axiosError.response?.status === 404) {
    return new AppError(
      404,
      "NOT_FOUND",
      "The requested resource was not found.",
    );
  }

  if (axiosError.response?.status === 409) {
    return new AppError(
      409,
      "CONFLICT",
      axiosError.response?.data?.error?.message ||
        "A conflict occurred. Please try again.",
    );
  }

  if (axiosError.response?.status === 422) {
    return new AppError(
      422,
      "VALIDATION_ERROR",
      "Please check your input and try again.",
      axiosError.response?.data?.error?.details,
    );
  }

  if (axiosError.response?.status === 500) {
    return new AppError(
      500,
      "SERVER_ERROR",
      "An unexpected error occurred. Please try again later.",
    );
  }

  if (axiosError.code === "ECONNABORTED") {
    return new AppError(
      408,
      "REQUEST_TIMEOUT",
      "The request took too long. Please try again.",
    );
  }

  if (axiosError.code === "ECONNREFUSED") {
    return new AppError(
      503,
      "SERVICE_UNAVAILABLE",
      "The service is currently unavailable. Please try again later.",
    );
  }

  return new AppError(
    axiosError.response?.status || 500,
    "UNKNOWN_ERROR",
    "An unexpected error occurred. Please try again.",
  );
};

export const getErrorMessage = (error: unknown): string => {
  const appError = parseApiError(error);
  return appError.message;
};

export const getErrorDetails = (
  error: unknown,
): Record<string, any> | undefined => {
  const appError = parseApiError(error);
  return appError.details;
};
