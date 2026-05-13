"use client";

import React, { useState } from "react";
import {
  Button,
  Input,
  Badge,
  BrandedCard,
  ProductCard,
  StarRating,
  PriceDisplay,
  Skeleton,
  Toast,
  Modal,
  Drawer,
  Pagination,
  EmptyState,
  Breadcrumb,
  QuantitySelector,
  ImageGallery,
  ThemeToggle,
  SearchBar,
  MultiStepForm,
  Select,
} from "@/components/ui";
import { ShoppingCart, Heart } from "lucide-react";

export default function ComponentShowcase() {
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedValue, setSelectedValue] = useState<string | number>("");

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Ethiopian Coffee" },
  ];

  const mockProduct = {
    id: "1",
    image:
      "https://images.unsplash.com/photo-1447933601403-0c6688bcf566?w=400&h=500&fit=crop",
    name: "Premium Ethiopian Yirgacheffe Coffee",
    price: 24.99,
    originalPrice: 34.99,
    rating: 4.8,
    reviewCount: 47,
    badge: "sale" as const,
  };

  const mockImages = [
    "https://images.unsplash.com/photo-1447933601403-0c6688bcf566?w=500&h=600&fit=crop",
    "https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?w=500&h=600&fit=crop",
    "https://images.unsplash.com/photo-1505228395891-9a51e7e86e81?w=500&h=600&fit=crop",
  ];

  return (
    <div className="min-h-screen bg-off-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-5xl font-bold text-maroon-dark font-display">
            UI Components Showcase
          </h1>
          <ThemeToggle />
        </div>

        {/* Buttons */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-maroon-dark mb-6 font-display">
            Buttons
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="gold">Gold CTA</Button>
            <Button isLoading>Loading...</Button>
            <Button fullWidth variant="primary">
              Full Width
            </Button>
          </div>
        </section>

        {/* Input & Select */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-maroon-dark mb-6 font-display">
            Inputs & Selects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Email" placeholder="your@email.com" />
            <Input label="Password" type="password" />
            <Input label="With Error" error="This field is required" />
            <Input label="Success" success />
            <Select
              label="Category"
              placeholder="Select category"
              options={[
                { value: "coffee", label: "Coffee" },
                { value: "spices", label: "Spices" },
                { value: "grains", label: "Grains" },
              ]}
              value={selectedValue}
              onChange={setSelectedValue}
            />
          </div>
        </section>

        {/* Badges */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-maroon-dark mb-6 font-display">
            Badges
          </h2>
          <div className="flex flex-wrap gap-3">
            <Badge variant="new">New</Badge>
            <Badge variant="sale">Sale</Badge>
            <Badge variant="hot">Hot</Badge>
            <Badge variant="outOfStock">Out of Stock</Badge>
            <Badge variant="verified">Verified</Badge>
            <Badge variant="pending">Pending</Badge>
          </div>
        </section>

        {/* Product Card */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-maroon-dark mb-6 font-display">
            Product Card
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <ProductCard
              {...mockProduct}
              onAddToCart={() => alert("Added to cart")}
              onWishlistToggle={() => alert("Toggled wishlist")}
              onQuickView={() => setModalOpen(true)}
            />
            <ProductCard
              {...mockProduct}
              id="2"
              name="Regular Product"
              price={19.99}
              badge={undefined}
            />
          </div>
        </section>

        {/* Star Rating & Price */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-maroon-dark mb-6 font-display">
            Ratings & Prices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BrandedCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Ratings</h3>
                <StarRating rating={4.5} showCount count={47} />
                <StarRating
                  rating={3}
                  interactive
                  onChange={(r) => console.log(r)}
                  size="lg"
                />
              </div>
            </BrandedCard>
            <BrandedCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Prices</h3>
                <PriceDisplay price={24.99} originalPrice={34.99} />
                <PriceDisplay price={24.99} showVAT />
              </div>
            </BrandedCard>
          </div>
        </section>

        {/* Skeleton Loading */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-maroon-dark mb-6 font-display">
            Skeleton Loaders
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton variant="productCard" />
            <Skeleton variant="text" count={3} />
          </div>
        </section>

        {/* Quantity Selector */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-maroon-dark mb-6 font-display">
            Quantity Selector
          </h2>
          <QuantitySelector
            quantity={quantity}
            onQuantityChange={setQuantity}
            maxQuantity={10}
          />
          <p className="text-gray-600 mt-4">Current quantity: {quantity}</p>
        </section>

        {/* Image Gallery */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-maroon-dark mb-6 font-display">
            Image Gallery
          </h2>
          <div className="max-w-md">
            <ImageGallery images={mockImages} alt="Product" />
          </div>
        </section>

        {/* Search Bar */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-maroon-dark mb-6 font-display">
            Search Bar
          </h2>
          <SearchBar
            onSearch={(q) => console.log("Searching:", q)}
            suggestions={[
              "Ethiopian Coffee",
              "Ethiopian Spices",
              "Ethiopian Grains",
            ]}
          />
        </section>

        {/* Pagination & Breadcrumb */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-maroon-dark mb-6 font-display">
            Navigation
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Breadcrumb</h3>
              <Breadcrumb items={breadcrumbItems} />
            </div>
            <div>
              <h3 className="font-semibold mb-3">Pagination</h3>
              <Pagination
                currentPage={currentPage}
                totalPages={10}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </section>

        {/* Empty State */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-maroon-dark mb-6 font-display">
            Empty State
          </h2>
          <EmptyState
            icon={<ShoppingCart size={48} />}
            title="Your cart is empty"
            description="Add some products to get started shopping"
            action={{ label: "Continue Shopping", onClick: () => {} }}
          />
        </section>

        {/* Modals & Drawers */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-maroon-dark mb-6 font-display">
            Modals & Drawers
          </h2>
          <div className="flex gap-4">
            <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
            <Button onClick={() => setDrawerOpen(true)}>Open Drawer</Button>
          </div>
        </section>

        {/* Multi Step Form */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-maroon-dark mb-6 font-display">
            Multi-Step Form
          </h2>
          <BrandedCard>
            <div className="p-6">
              <MultiStepForm
                steps={[
                  {
                    label: "Personal Info",
                    content: <Input label="Name" placeholder="John Doe" />,
                  },
                  {
                    label: "Contact",
                    content: (
                      <Input label="Email" placeholder="john@example.com" />
                    ),
                  },
                  {
                    label: "Confirm",
                    content: <p>Please review your information</p>,
                  },
                ]}
                onComplete={() => alert("Form completed!")}
              />
            </div>
          </BrandedCard>
        </section>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Product Details"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary">Add to Cart</Button>
          </>
        }>
        <p className="text-gray-600">
          This is a modal with the quick view product details.
        </p>
      </Modal>

      {/* Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Shopping Cart">
        <p className="text-gray-600 mb-6">Your cart items will appear here.</p>
        <Button fullWidth variant="primary">
          Checkout
        </Button>
      </Drawer>

      {/* Toast Example */}
      <Toast
        id="example"
        message="This is a success message"
        type="success"
        duration={4000}
      />
    </div>
  );
}
