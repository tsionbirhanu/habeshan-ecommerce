export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-off-white">
      <nav className="sticky top-0 z-50 bg-maroon-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <a href="/" className="text-2xl font-bold font-display">
            Habesha Admin
          </a>
          <div className="flex gap-6">
            <a href="/admin" className="hover:text-gold transition">
              Dashboard
            </a>
            <a href="/admin/products" className="hover:text-gold transition">
              Products
            </a>
            <a href="/admin/orders" className="hover:text-gold transition">
              Orders
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
