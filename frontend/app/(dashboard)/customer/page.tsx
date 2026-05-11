export default function CustomerDashboardPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-maroon-dark mb-8 font-display">
        My Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-gray-600 text-sm font-semibold mb-2">
            Total Orders
          </h2>
          <p className="text-3xl font-bold text-maroon">0</p>
        </div>
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-gray-600 text-sm font-semibold mb-2">
            Total Spent
          </h2>
          <p className="text-3xl font-bold text-gold">€0.00</p>
        </div>
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-gray-600 text-sm font-semibold mb-2">
            Wishlist Items
          </h2>
          <p className="text-3xl font-bold text-maroon-dark">0</p>
        </div>
      </div>

      <div className="bg-white rounded shadow p-6">
        <h2 className="text-2xl font-bold text-maroon-dark mb-4 font-display">
          Recent Orders
        </h2>
        <p className="text-gray-600 text-center py-8">No orders yet</p>
      </div>
    </div>
  );
}
