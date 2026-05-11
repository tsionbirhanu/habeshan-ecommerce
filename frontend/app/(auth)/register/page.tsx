export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-off-white">
      <div className="bg-white p-8 rounded shadow w-full max-w-md">
        <h1 className="text-3xl font-bold text-maroon-dark mb-6 font-display text-center">
          Register
        </h1>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              First Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-200 rounded focus:outline-none focus:border-maroon"
              placeholder="John"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">
              Last Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-200 rounded focus:outline-none focus:border-maroon"
              placeholder="Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-200 rounded focus:outline-none focus:border-maroon"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-200 rounded focus:outline-none focus:border-maroon"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-maroon text-white py-2 rounded font-semibold hover:bg-maroon-dark transition">
            Register
          </button>
        </form>
        <p className="text-center mt-4 text-gray-600">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-maroon font-semibold hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
