import api from "./index";

export const paymentsAPI = {
  getPaymentMethods: () => api.get("/payments/methods"),

  createStripeIntent: (data: { amount: number; orderId: string }) =>
    api.post("/payments/stripe/create-intent", data),

  createPaypalOrder: (data: any) => api.post("/payments/paypal/create", data),

  capturePaypalOrder: (data: { orderId: string }) =>
    api.post("/payments/paypal/capture", data),

  createKlarnaSession: (data: any) =>
    api.post("/payments/klarna/session", data),

  confirmKlarnaOrder: (data: any) => api.post("/payments/klarna/confirm", data),

  getPaymentStatus: (orderId: string) => api.get(`/payments/${orderId}`),

  refundPayment: (orderId: string, data: any) =>
    api.post(`/payments/${orderId}/refund`, data),

  getInvoice: (orderId: string) => api.get(`/payments/${orderId}/invoice`),

  downloadInvoice: (orderId: string) =>
    api.get(`/payments/${orderId}/invoice/download`, {
      responseType: "blob",
    }),

  sendInvoice: (orderId: string) =>
    api.post(`/payments/${orderId}/invoice/send`, {}),

  getReceipt: (orderId: string) => api.get(`/payments/${orderId}/receipt`),
};
