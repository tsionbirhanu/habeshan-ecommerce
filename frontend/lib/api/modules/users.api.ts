import { apiClient } from "../client/axios-instance";
import type { ApiResponse } from "../client/types";

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatar?: string;
  role: "ADMIN" | "VENDOR" | "CUSTOMER" | "DELIVERY";
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  type: "HOME" | "WORK" | "OTHER";
  street: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface CreateAddressPayload {
  type: "HOME" | "WORK" | "OTHER";
  street: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

class UsersAPI {
  getProfile() {
    return apiClient.get<ApiResponse<UserProfile>>("/users/profile");
  }

  updateProfile(data: UpdateProfilePayload) {
    return apiClient.put<ApiResponse<UserProfile>>("/users/profile", data);
  }

  changePassword(data: ChangePasswordPayload) {
    return apiClient.post<ApiResponse>("/users/change-password", data);
  }

  deleteAccount() {
    return apiClient.delete<ApiResponse>("/users/account");
  }

  getPersonalData() {
    return apiClient.get<ApiResponse>("/users/data");
  }

  createAddress(data: CreateAddressPayload) {
    return apiClient.post<ApiResponse<Address>>("/users/addresses", data);
  }

  getAddresses() {
    return apiClient.get<ApiResponse<Address[]>>("/users/addresses");
  }

  updateAddress(id: string, data: Partial<CreateAddressPayload>) {
    return apiClient.put<ApiResponse<Address>>(`/users/addresses/${id}`, data);
  }

  deleteAddress(id: string) {
    return apiClient.delete<ApiResponse>(`/users/addresses/${id}`);
  }
}

export const usersAPI = new UsersAPI();
