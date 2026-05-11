export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-off-white">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <a href="/" className="text-2xl font-bold text-maroon font-display">
            Habesha Bazaar
          </a>
          <div className="flex gap-6">
            <a href="/customer" className="hover:text-maroon transition">
              Dashboard
            </a>
            <a href="/customer/orders" className="hover:text-maroon transition">
              Orders
            </a>
            <a
              href="/customer/profile"
              className="hover:text-maroon transition">
              Profile
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
