import api from "./index";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export const categoriesAPI = {
  getCategories: () => api.get<Category[]>("/categories"),

  getCategoryWithProducts: (slug: string, params?: any) =>
    api.get(`/categories/${slug}`, { params }),

  createCategory: (data: any) => api.post<Category>("/categories", data),

  updateCategory: (id: string, data: any) =>
    api.put<Category>(`/categories/${id}`, data),

  deleteCategory: (id: string) => api.delete(`/categories/${id}`),
};
