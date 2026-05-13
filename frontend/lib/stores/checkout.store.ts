import { create } from "zustand";

export interface Address {
  id?: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface ShippingRate {
  id: string;
  carrier: "DHL" | "HERMES" | "DPD";
  method: string;
  estimatedDays: number;
  price: number;
  logo?: string;
}

export interface CheckoutState {
  currentStep: number;
  guestEmail: string;
  deliveryAddress: Address | null;
  billingAddress: Address | null;
  useSameAddress: boolean;
  shippingMethod: ShippingRate | null;
  paymentMethod: "stripe" | "paypal" | "klarna" | null;
  couponCode: string | null;
  orderId: string | null;
  isProcessing: boolean;
  error: string | null;

  // Actions
  setCurrentStep: (step: number) => void;
  setGuestEmail: (email: string) => void;
  setDeliveryAddress: (address: Address) => void;
  setBillingAddress: (address: Address | null) => void;
  setUseSameAddress: (value: boolean) => void;
  setShippingMethod: (method: ShippingRate) => void;
  setPaymentMethod: (method: "stripe" | "paypal" | "klarna") => void;
  setCouponCode: (code: string | null) => void;
  setOrderId: (id: string) => void;
  setIsProcessing: (value: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  currentStep: 1,
  guestEmail: "",
  deliveryAddress: null,
  billingAddress: null,
  useSameAddress: true,
  shippingMethod: null,
  paymentMethod: null,
  couponCode: null,
  orderId: null,
  isProcessing: false,
  error: null,
};

export const useCheckoutStore = create<CheckoutState>((set) => ({
  ...initialState,

  setCurrentStep: (step) => set({ currentStep: step }),
  setGuestEmail: (email) => set({ guestEmail: email }),
  setDeliveryAddress: (address) => set({ deliveryAddress: address }),
  setBillingAddress: (address) => set({ billingAddress: address }),
  setUseSameAddress: (value) => set({ useSameAddress: value }),
  setShippingMethod: (method) => set({ shippingMethod: method }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setCouponCode: (code) => set({ couponCode: code }),
  setOrderId: (id) => set({ orderId: id }),
  setIsProcessing: (value) => set({ isProcessing: value }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
