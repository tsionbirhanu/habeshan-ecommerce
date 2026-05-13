import { apiClient } from "../client/axios-instance";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "../client/types";

export interface ShippingRate {
  id: string;
  carrier: string;
  name: string;
  description?: string;
  price: number;
  estimatedDays: number;
  available: boolean;
}

export interface Shipment {
  id: string;
  orderId: string;
  carrier: string;
  trackingNumber: string;
  status: "PENDING" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED" | "FAILED";
  shippingAddress: any;
  estimatedDelivery: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetRatesPayload {
  weight: number;
  dimensions?: { length: number; width: number; height: number };
  destinationZip: string;
  destinationCountry: string;
}

export interface CreateShipmentPayload {
  orderId: string;
  carrier: string;
  address: {
    street: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
}

export interface TrackingPayload {
  carrier: string;
  trackingNumber: string;
}

export interface Carrier {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

class ShippingAPI {
  getRates(data: GetRatesPayload) {
    return apiClient.post<ApiResponse<ShippingRate[]>>("/shipping/rates", data);
  }

  createShipment(data: CreateShipmentPayload) {
    return apiClient.post<ApiResponse<Shipment>>("/shipping/shipments", data);
  }

  getShipments(params?: PaginationParams) {
    return apiClient.get<PaginatedResponse<Shipment>>("/shipping/shipments", {
      params,
    });
  }

  getShipmentById(id: string) {
    return apiClient.get<ApiResponse<Shipment>>(`/shipping/shipments/${id}`);
  }

  trackShipment(data: TrackingPayload) {
    return apiClient.post<ApiResponse<{ status: string; updates: any[] }>>(
      "/shipping/tracking",
      data,
    );
  }

  updateShipment(id: string, data: Partial<CreateShipmentPayload>) {
    return apiClient.put<ApiResponse<Shipment>>(
      `/shipping/shipments/${id}`,
      data,
    );
  }

  createCarrier(data: Partial<Carrier>) {
    return apiClient.post<ApiResponse<Carrier>>("/shipping/carriers", data);
  }

  getCarriers() {
    return apiClient.get<ApiResponse<Carrier[]>>("/shipping/carriers");
  }
}

export const shippingAPI = new ShippingAPI();
