import api from "./index";

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profileImage?: string;
  addresses: Address[];
}

export const usersAPI = {
  getProfile: () => api.get<UserProfile>("/users/profile"),

  updateProfile: (data: any) => api.put<UserProfile>("/users/profile", data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post("/users/change-password", data),

  deleteAccount: () => api.delete("/users/account"),

  downloadPersonalData: () =>
    api.get("/users/personal-data", { responseType: "blob" }),

  getAddresses: () => api.get<Address[]>("/users/addresses"),

  createAddress: (data: any) => api.post<Address>("/users/addresses", data),

  updateAddress: (id: string, data: any) =>
    api.put<Address>(`/users/addresses/${id}`, data),

  deleteAddress: (id: string) => api.delete(`/users/addresses/${id}`),

  setDefaultAddress: (id: string) =>
    api.post(`/users/addresses/${id}/default`, {}),
};
