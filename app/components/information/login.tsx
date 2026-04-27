import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
 
// FIX: import from the auth utility — these functions must exist at this path.
// If your utils folder is elsewhere, adjust the import path accordingly.
import { clearAuth, saveToken, saveRole, saveProfile } from "~/utils/auth";
 
export function meta() {
  return [
    { title: "Sign In - CareLink" },
    { name: "description", content: "Sign in to your CareLink account." },
  ];
}
 
export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
 
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
 
  const justRegistered = searchParams.get("registered") === "true";
  // FIX: added pending banner for caregivers redirected after signup
  const justPending    = searchParams.get("pending") === "true";
  const justReset      = searchParams.get("reset")   === "true";
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
 
    if (!username.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }
 
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/signin", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username: username.trim(), password }),
      });
 
      const result = await response.json();
 
      if (!response.ok) {
        // FIX: backend returns 403 for pending/rejected caregivers with a clear message.
        // We surface that message directly so they know why they can't log in.
        setError(result.message || "Invalid username or password.");
        return;
      }
 
      if (!result?.token || !result?.role) {
        setError("Unexpected server response. Please try again.");
        return;
      }
 
      // Store auth state
      clearAuth();
      saveToken(result.token);
      saveRole(result.role);
      if (result.profile && typeof result.profile === "object") {
        saveProfile(result.profile);
      }
 
      // FIX: added Admin route — without this, admins would land on /dashboard/client
      if (result.role === "Admin")     return navigate("/dashboard/admin");
      if (result.role === "Caregiver") return navigate("/dashboard/caregiver");
      return navigate("/dashboard/client");
 
    } catch {
      setError("Cannot connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-linear-to-br from-blue-200 via-white to-emerald-200">
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h2 className="text-center text-4xl font-extrabold tracking-tight">
            <span className="bg-linear-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
              Sign In
            </span>
          </h2>
 
          <div className="mt-8">
            <div className="rounded-3xl bg-white/90 p-8 shadow-xl backdrop-blur-md ring-2 ring-gray-300 sm:p-10">
 
              {/* Success banners */}
              {justRegistered && (
                <div className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-center text-sm font-semibold text-emerald-700">
                  Account created successfully! Please sign in.
                </div>
              )}
 
              {/* FIX: caregiver pending banner */}
              {justPending && (
                <div className="mb-4 rounded-lg border border-amber-100 bg-amber-50 p-3 text-center text-sm font-semibold text-amber-700">
                  Your application has been submitted and is pending admin approval.
                  You will be able to sign in once your account is activated.
                </div>
              )}
 
              {justReset && (
                <div className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-center text-sm font-semibold text-emerald-700">
                  Password reset successfully! Please sign in.
                </div>
              )}
 
              {error && (
                <div className="mb-4 rounded-lg border border-red-100 bg-red-50 p-3 text-center text-sm font-semibold text-red-600">
                  {error}
                </div>
              )}
 
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-blue-800">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-2 block w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
 
                <div>
                  <label className="block text-sm font-bold text-blue-800">Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 block w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
 
                <div className="flex items-center justify-between">
                  <Link
                    to="/forgot-password"
                    className="text-xs font-bold text-blue-500 transition-colors hover:text-emerald-600 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
 
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full cursor-pointer rounded-xl bg-linear-to-r from-blue-600 to-teal-500 py-4 text-base font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>
 
              <div className="mt-8 flex flex-col items-center gap-2 border-t border-gray-200 pt-6 text-sm text-gray-600">
                <div>
                  New to CareLink?{" "}
                  <Link
                    to="/get-started"
                    className="font-bold text-blue-600 transition-colors hover:text-teal-600 hover:underline"
                  >
                    Create account
                  </Link>
                </div>
                <Link
                  to="/"
                  className="mt-2 font-semibold text-gray-500 transition-colors hover:text-gray-800 hover:underline"
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
 