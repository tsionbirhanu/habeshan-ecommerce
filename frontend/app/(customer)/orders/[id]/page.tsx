"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, MapPin, Calendar, CreditCard } from "lucide-react";

// Mock order data - in production this would come from the API
const MOCK_ORDERS: Record<string, any> = {
  "#HMM-2026-0042": {
    orderNumber: "#HMM-2026-0042",
    status: "shipped",
    orderDate: "2026-05-13",
    deliveryDate: "2026-05-16",
    items: [
      { name: "Ethiopian Coffee (250g)", quantity: 2, price: 12.99 },
      { name: "Berbere Spice Mix (100g)", quantity: 1, price: 8.99 },
    ],
    subtotal: 34.97,
    shipping: 0,
    tax: 6.64,
    total: 41.61,
    deliveryAddress: {
      name: "Max Mustermann",
      street: "Berliner Straße 123",
      city: "10115 Berlin",
      country: "Germany",
    },
    trackingNumber: "DHL-1234567890",
    carrier: "DHL",
  },
};

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.id as string;
  const order = MOCK_ORDERS[orderId];

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Bestellung nicht gefunden
            </h1>
            <p className="text-gray-600 mb-6">
              Leider konnten wir die gesuchte Bestellung nicht finden.
            </p>
            <Link href="/shop">
              <button className="px-6 py-3 bg-maroon text-white rounded-lg hover:bg-maroon/90 transition-colors">
                Zur Startseite
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig: Record<string, any> = {
    pending: { label: "In Bearbeitung", color: "yellow" },
    shipped: { label: "Versandt", color: "blue" },
    delivered: { label: "Zugestellt", color: "green" },
    cancelled: { label: "Storniert", color: "red" },
  };

  const currentStatus = statusConfig[order.status];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/shop">
            <button className="flex items-center gap-2 text-maroon hover:text-maroon/80 font-semibold mb-6">
              <ArrowLeft size={20} />
              Zurück
            </button>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bestellverfolgung
          </h1>
          <p className="text-gray-600">Bestellnummer: {order.orderNumber}</p>
        </div>

        {/* Status Card */}
        <div
          className={`bg-${currentStatus.color}-50 border border-${currentStatus.color}-200 rounded-lg p-6 mb-8`}>
          <div className="flex items-center gap-3 mb-3">
            <Package size={24} className={`text-${currentStatus.color}-600`} />
            <h2 className={`text-lg font-bold text-${currentStatus.color}-900`}>
              Status: {currentStatus.label}
            </h2>
          </div>
          <p className={`text-sm text-${currentStatus.color}-700`}>
            {order.status === "shipped"
              ? `Deine Bestellung ist auf dem Weg zu dir! Tracking-Nummer: ${order.trackingNumber}`
              : "Wir bearbeiten deine Bestellung..."}
          </p>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="font-bold text-gray-900 mb-6">Timeline</h3>
          <div className="space-y-6">
            {/* Order Date */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 bg-maroon rounded-full" />
                <div className="w-1 h-12 bg-maroon" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  Bestellung aufgegeben
                </p>
                <p className="text-sm text-gray-600">{order.orderDate}</p>
              </div>
            </div>

            {/* Shipped */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 bg-maroon rounded-full" />
                <div
                  className={`w-1 h-12 ${
                    order.status === "delivered" ? "bg-maroon" : "bg-gray-300"
                  }`}
                />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Versandt</p>
                <p className="text-sm text-gray-600">Mit {order.carrier}</p>
              </div>
            </div>

            {/* Delivery */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-4 h-4 rounded-full ${
                    order.status === "delivered" ? "bg-maroon" : "bg-gray-300"
                  }`}
                />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Zugestellt</p>
                <p className="text-sm text-gray-600">
                  Geplant für: {order.deliveryDate}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="font-bold text-gray-900 mb-6">Bestelldetails</h3>

          {/* Items */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Artikel</h4>
            <div className="space-y-3">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-semibold">€{item.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Zwischensumme</span>
                <span className="font-semibold">
                  €{order.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Versand</span>
                <span className="font-semibold text-green-600">
                  {order.shipping === 0
                    ? "KOSTENLOS"
                    : `€${order.shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">MwSt.</span>
                <span className="font-semibold">€{order.tax.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-end">
            <span className="font-bold text-gray-900">Gesamtbetrag</span>
            <span className="text-2xl font-bold text-maroon">
              €{order.total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <MapPin size={20} className="text-maroon" />
            <h3 className="font-bold text-gray-900">Lieferadresse</h3>
          </div>
          <p className="text-gray-700">{order.deliveryAddress.name}</p>
          <p className="text-gray-700">{order.deliveryAddress.street}</p>
          <p className="text-gray-700">
            {order.deliveryAddress.city}, {order.deliveryAddress.country}
          </p>
        </div>

        {/* Tracking */}
        {order.trackingNumber && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="font-bold text-gray-900 mb-4">Versandverfolgung</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Tracking-Nummer:</p>
              <p className="text-lg font-mono font-semibold text-maroon">
                {order.trackingNumber}
              </p>
              <a
                href={`https://tracking.example.com/${order.trackingNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-maroon hover:text-maroon/80 font-semibold">
                Im Browser verfolgen →
              </a>
            </div>
          </div>
        )}

        {/* Help */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Haben Sie Fragen zu Ihrer Bestellung?
          </p>
          <a
            href="https://wa.me/491234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold">
            💬 Support (WhatsApp)
          </a>
        </div>
      </div>
    </div>
  );
}
