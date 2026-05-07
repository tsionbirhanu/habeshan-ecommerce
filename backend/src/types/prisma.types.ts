import { Prisma } from '@prisma/client';

// User types
export type User = Prisma.UserGetPayload<{}>;
export type UserWithRelations = Prisma.UserGetPayload<{
  include: { addresses: true; orders: true; reviews: true; vendor: true; wishlist: true };
}>;

// Vendor types
export type Vendor = Prisma.VendorGetPayload<{}>;
export type VendorWithRelations = Prisma.VendorGetPayload<{
  include: { user: true; products: true };
}>;

// Product types
export type Product = Prisma.ProductGetPayload<{}>;
export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: { category: true; vendor: true; inventory: true; reviews: true };
}>;

// Order types
export type Order = Prisma.OrderGetPayload<{}>;
export type OrderWithRelations = Prisma.OrderGetPayload<{
  include: { 
    customer: true; 
    items: { include: { product: true } }; 
    payment: true; 
    shipment: { include: { trackingEvents: true } };
    invoice: true;
  };
}>;

// Category types
export type Category = Prisma.CategoryGetPayload<{}>;
export type CategoryWithProducts = Prisma.CategoryGetPayload<{
  include: { products: true };
}>;

// Review types
export type Review = Prisma.ReviewGetPayload<{}>;
export type ReviewWithRelations = Prisma.ReviewGetPayload<{
  include: { customer: true; product: true };
}>;

// Wishlist types
export type Wishlist = Prisma.WishlistGetPayload<{}>;
export type WishlistWithItems = Prisma.WishlistGetPayload<{
  include: { items: { include: { product: true } } };
}>;

// Create input types
export type CreateUserInput = Prisma.UserCreateInput;
export type CreateVendorInput = Prisma.VendorCreateInput;
export type CreateProductInput = Prisma.ProductCreateInput;
export type CreateOrderInput = Prisma.OrderCreateInput;
export type CreateCategoryInput = Prisma.CategoryCreateInput;

// Update input types
export type UpdateUserInput = Prisma.UserUpdateInput;
export type UpdateVendorInput = Prisma.VendorUpdateInput;
export type UpdateProductInput = Prisma.ProductUpdateInput;
export type UpdateOrderInput = Prisma.OrderUpdateInput;

// Where input types
export type UserWhereInput = Prisma.UserWhereInput;
export type VendorWhereInput = Prisma.VendorWhereInput;
export type ProductWhereInput = Prisma.ProductWhereInput;
export type OrderWhereInput = Prisma.OrderWhereInput;
