export default function CartPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-maroon-dark mb-8 font-display">
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="grid grid-cols-4 gap-4 text-sm font-semibold text-gray-600">
                <div>Product</div>
                <div>Price</div>
                <div>Qty</div>
                <div>Total</div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-600 text-center py-8">
                Your cart is empty
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded shadow p-6 sticky top-24">
            <h2 className="text-2xl font-bold text-maroon-dark mb-6 font-display">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6 border-b border-gray-200 pb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>€0.00</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>€0.00</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>€0.00</span>
              </div>
            </div>

            <div className="flex justify-between mb-6 text-lg font-bold">
              <span>Total</span>
              <span className="text-gold">€0.00</span>
            </div>

            <button className="w-full bg-maroon text-white py-3 rounded font-semibold hover:bg-maroon-dark transition">
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
