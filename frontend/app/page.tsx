export default function Home() {
  return (
    <main className="min-h-screen bg-off-white">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-maroon font-display">
            Habesha Bazaar
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-2 bg-maroon text-white rounded hover:bg-maroon-dark transition">
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-5xl font-bold text-maroon-dark mb-4 font-display">
          Welcome to Habesha Bazaar
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Discover authentic Ethiopian & Eritrean products in Germany
        </p>
        <button className="px-8 py-3 bg-gold text-white font-semibold rounded hover:bg-gold-light transition">
          Start Shopping
        </button>
      </section>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-maroon-dark mb-8 font-display">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded shadow hover:shadow-card-hover transition p-4">
              <div className="w-full h-48 bg-gray-200 rounded mb-4"></div>
              <h3 className="font-semibold text-gray-800 mb-2">Product {i}</h3>
              <p className="text-gold font-bold mb-4">€99.99</p>
              <button className="w-full bg-maroon text-white py-2 rounded hover:bg-maroon-dark transition">
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-maroon-dark text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-bold text-gold mb-4 font-display">
                About
              </h4>
              <p className="text-gray-300">
                Habesha Bazaar brings authentic Ethiopian & Eritrean culture to
                Germany.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold text-gold mb-4 font-display">
                Shop
              </h4>
              <ul className="text-gray-300 space-y-2">
                <li>
                  <a href="#" className="hover:text-gold transition">
                    Products
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gold transition">
                    Categories
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold text-gold mb-4 font-display">
                Support
              </h4>
              <ul className="text-gray-300 space-y-2">
                <li>
                  <a href="#" className="hover:text-gold transition">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gold transition">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold text-gold mb-4 font-display">
                Follow Us
              </h4>
              <div className="flex gap-4">
                <a href="#" className="hover:text-gold transition">
                  WhatsApp
                </a>
                <a href="#" className="hover:text-gold transition">
                  Telegram
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-maroon-light pt-8 text-center text-gray-300">
            <p>&copy; 2026 Habesha Bazaar. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
