export default function ProductsPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-maroon-dark mb-8 font-display">
        Our Products
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded shadow hover:shadow-card-hover transition overflow-hidden cursor-pointer">
            <div className="w-full h-48 bg-gray-200"></div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                Product Name {i + 1}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                High-quality Ethiopian product
              </p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gold font-bold text-lg">
                  €{(50 + i * 10).toFixed(2)}
                </span>
                <span className="bg-maroon text-white text-xs px-2 py-1 rounded">
                  New
                </span>
              </div>
              <button className="w-full bg-maroon text-white py-2 rounded hover:bg-maroon-dark transition">
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
