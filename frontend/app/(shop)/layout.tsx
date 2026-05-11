export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-off-white">
      {/* Shop Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <a href="/" className="text-2xl font-bold text-maroon font-display">
            Habesha Bazaar
          </a>
          <div className="flex gap-6">
            <a href="/products" className="hover:text-maroon transition">
              Products
            </a>
            <a href="/cart" className="hover:text-maroon transition">
              Cart
            </a>
            <a href="/customer" className="hover:text-maroon transition">
              Account
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
