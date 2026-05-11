import api from "./index";

export const shippingAPI = {
  getShippingRates: (data: any) => api.post("/shipping/rates", data),

  createShipment: (data: any) => api.post("/shipping", data),

  getTracking: (trackingNumber: string) =>
    api.get(`/shipping/track/${trackingNumber}`),

  downloadLabel: (shipmentId: string) =>
    api.get(`/shipping/${shipmentId}/label`, { responseType: "blob" }),

  getOrderShipment: (orderId: string) => api.get(`/shipping/${orderId}`),
};
