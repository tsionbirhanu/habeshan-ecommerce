import { apiClient } from "../client/axios-instance";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "../client/types";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
  images: string[];
  categoryId: string;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductPayload {
  name: string;
  nameEn?: string;
  nameDe?: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  sku: string;
  images?: string[];
}

class ProductsAPI {
  getAll(
    params?: PaginationParams & {
      category?: string;
      minPrice?: number;
      maxPrice?: number;
    },
  ) {
    return apiClient.get<PaginatedResponse<Product>>("/products", {
      params,
    });
  }

  getById(id: string) {
    return apiClient.get<ApiResponse<Product>>(`/products/${id}`);
  }

  search(
    params: {
      q?: string;
      category?: string;
      minPrice?: number;
      maxPrice?: number;
    } & PaginationParams,
  ) {
    return apiClient.get<PaginatedResponse<Product>>("/products/search", {
      params,
    });
  }

  getFeatured() {
    return apiClient.get<ApiResponse<Product[]>>("/products/featured");
  }

  getNewArrivals() {
    return apiClient.get<ApiResponse<Product[]>>("/products/new-arrivals");
  }

  getRelated(id: string) {
    return apiClient.get<ApiResponse<Product[]>>(`/products/${id}/related`);
  }

  create(data: CreateProductPayload) {
    return apiClient.post<ApiResponse<Product>>("/products", data);
  }

  update(id: string, data: Partial<CreateProductPayload>) {
    return apiClient.put<ApiResponse<Product>>(`/products/${id}`, data);
  }

  delete(id: string) {
    return apiClient.delete<ApiResponse>(`/products/${id}`);
  }

  uploadImages(id: string, files: File[]) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    return apiClient.post<ApiResponse<Product>>(
      `/products/${id}/images`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
  }
}

export const productsAPI = new ProductsAPI();
