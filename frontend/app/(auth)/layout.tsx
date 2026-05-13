import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand Panel (Desktop Only) */}
      <div className="hidden md:flex md:w-[45%] bg-gradient-to-b from-maroon-dark to-maroon-dark/80 text-white flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Ethiopian Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <pattern
                id="ethiopian-pattern"
                x="0"
                y="0"
                width="100"
                height="100"
                patternUnits="userSpaceOnUse">
                <circle
                  cx="50"
                  cy="50"
                  r="30"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                />
                <line
                  x1="50"
                  y1="20"
                  x2="50"
                  y2="80"
                  stroke="white"
                  strokeWidth="1"
                />
                <line
                  x1="20"
                  y1="50"
                  x2="80"
                  y2="50"
                  stroke="white"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect fill="url(#ethiopian-pattern)" width="100%" height="100%" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-sm">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-5xl font-bold font-display mb-2">
              HABESHA BAZAAR
            </h1>
            <div className="h-1 w-24 bg-white mx-auto"></div>
          </div>

          {/* Tagline */}
          <p className="text-xl mb-12 font-light tracking-wide">
            Taste of Home,
            <br />
            Delivered to Germany
          </p>

          {/* Trust Points */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-sm font-bold">
                ✓
              </div>
              <span className="text-sm font-medium">Authentisch</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-sm font-bold">
                ✓
              </div>
              <span className="text-sm font-medium">Sicher</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-sm font-bold">
                ✓
              </div>
              <span className="text-sm font-medium">Schnell</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form Panel */}
      <div className="w-full md:w-[55%] bg-white flex flex-col justify-center items-center p-6 md:p-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
