export default function VendorDashboardPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-maroon-dark mb-8 font-display">
        Vendor Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-gray-600 text-sm font-semibold mb-2">
            Your Sales
          </h2>
          <p className="text-3xl font-bold text-maroon">€0.00</p>
        </div>
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-gray-600 text-sm font-semibold mb-2">
            Your Products
          </h2>
          <p className="text-3xl font-bold text-gold">0</p>
        </div>
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-gray-600 text-sm font-semibold mb-2">
            Pending Orders
          </h2>
          <p className="text-3xl font-bold text-maroon-dark">0</p>
        </div>
      </div>

      <div className="bg-white rounded shadow p-6">
        <h2 className="text-2xl font-bold text-maroon-dark mb-4 font-display">
          Your Inventory
        </h2>
        <p className="text-gray-600 text-center py-8">No products yet</p>
      </div>
    </div>
  );
}
