import { apiClient } from "../client/axios-instance";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "../client/types";

export interface InventoryItem {
  id: string;
  productId: string;
  quantity: number;
  reserved: number;
  available: number;
  warehouseId?: string;
  lastRestocked?: string;
  lowStockThreshold: number;
}

export interface InventoryAlert {
  id: string;
  productId: string;
  type: "LOW_STOCK" | "OUT_OF_STOCK" | "OVERSTOCK";
  quantity: number;
  createdAt: string;
  isResolved: boolean;
}

export interface CreateInventoryAlertPayload {
  productId: string;
  type: "LOW_STOCK" | "OUT_OF_STOCK" | "OVERSTOCK";
  threshold: number;
}

class InventoryAPI {
  getAll(params?: PaginationParams) {
    return apiClient.get<PaginatedResponse<InventoryItem>>("/inventory", {
      params,
    });
  }

  getById(id: string) {
    return apiClient.get<ApiResponse<InventoryItem>>(`/inventory/${id}`);
  }

  update(id: string, data: Partial<InventoryItem>) {
    return apiClient.put<ApiResponse<InventoryItem>>(`/inventory/${id}`, data);
  }

  getLowStock(params?: PaginationParams) {
    return apiClient.get<PaginatedResponse<InventoryItem>>(
      "/inventory/low-stock",
      { params },
    );
  }

  createAlert(data: CreateInventoryAlertPayload) {
    return apiClient.post<ApiResponse<InventoryAlert>>(
      "/inventory/alerts",
      data,
    );
  }
}

export const inventoryAPI = new InventoryAPI();
