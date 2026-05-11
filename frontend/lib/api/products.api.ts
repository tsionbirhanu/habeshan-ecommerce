import api from "./index";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  isFeatured: boolean;
  isNew: boolean;
  inStock: boolean;
  quantity: number;
}

export const productsAPI = {
  getProducts: (params?: any) =>
    api.get<{ products: Product[]; total: number }>("/products", { params }),

  searchProducts: (params?: any) =>
    api.get<{ products: Product[]; total: number }>("/products/search", {
      params,
    }),

  getFeaturedProducts: () => api.get<Product[]>("/products/featured"),

  getNewArrivals: () => api.get<Product[]>("/products/new-arrivals"),

  getProduct: (id: string) => api.get<Product>(`/products/${id}`),

  getRelatedProducts: (id: string) =>
    api.get<Product[]>(`/products/${id}/related`),

  createProduct: (data: any) => api.post<Product>("/products", data),

  updateProduct: (id: string, data: any) =>
    api.put<Product>(`/products/${id}`, data),

  deleteProduct: (id: string) => api.delete(`/products/${id}`),

  uploadProductImages: (id: string, formData: FormData) =>
    api.post(`/products/${id}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};
