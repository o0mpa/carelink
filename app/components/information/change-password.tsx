import { useState } from "react";
import { useNavigate } from "react-router";
import { getRole, getToken } from "~/utils/auth";

export default function ChangePassword() {
  const navigate = useNavigate();

  const getProfileRouteByRole = (): string => {
    const role = (getRole() ?? "").trim().toLowerCase();

    if (role === "caregiver") return "/profile/caregiver";
    if (role === "administrator" || role === "admin") return "/profile/admin";
    return "/profile/client";
  };

  // ── State ──────────────────────────────────────────────────────────────────
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ── Password validation ────────────────────────────────────────────────────
  const isPasswordValid = newPassword.length >= 8 && 
                         /[A-Z]/.test(newPassword) && 
                         /[0-9]/.test(newPassword);

  const isFormValid = oldPassword.trim() && 
                     newPassword === confirmPassword && 
                     isPasswordValid;

  // ── Handle password change submission ──────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Validation
    if (!oldPassword.trim()) {
      setError("Please enter your old password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setError("New password must contain at least 1 capital letter.");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setError("New password must contain at least 1 number.");
      return;
    }

    setSubmitLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/client/change-password",
        {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            // Include auth token if available
            "Authorization": `Bearer ${getToken() ?? ""}`
          },
          body: JSON.stringify({
            oldPassword: oldPassword,
            newPassword: newPassword,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.log("Server Error Result:", result);
        setError(result.message || "Failed to update password. Please try again.");
        return;
      }

      setSuccessMessage("Password updated successfully! Redirecting...");
      setTimeout(() => {
        navigate(getProfileRouteByRole()); 
      }, 2000);
    } catch {
      setError("Cannot connect to server. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-blue-200 via-white to-emerald-200 p-4">
      <div className="w-full max-w-md rounded-3xl border border-emerald-100 bg-white p-8 shadow-lg">

        {/* ── Header ── */}
        <div className="mb-2 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-r from-blue-100 to-emerald-100">
            <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-emerald-900">Change Password</h2>
          <p className="text-sm italic text-gray-600">
            Update your account password securely
          </p>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="mb-4 animate-in fade-in rounded-lg border border-red-100 bg-red-50 p-3 text-center text-sm font-semibold text-red-600 duration-300">
            {error}
          </div>
        )}

        {/* ── Success Banner ── */}
        {successMessage && (
          <div className="mb-4 animate-in fade-in rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-center text-sm font-semibold text-emerald-600 duration-300">
            ✓ {successMessage}
          </div>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleChangePassword} className="space-y-5">

          {/* Old Password */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-slate-500">
              Old Password
            </label>
            <input
              type="password"
              required
              placeholder="Enter your current password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              disabled={submitLoading}
              className="w-full rounded-xl border-2 border-gray-200 p-2 text-sm text-slate-700 outline-none transition-colors focus:border-emerald-100 focus:ring-2 focus:ring-emerald-200 disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>
          {/* New Password */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-slate-500">
              New Password
            </label>
            <input
              type="password"
              required
              placeholder="*********"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={submitLoading}
              className="w-full rounded-xl border-2 border-gray-200 p-2 text-sm text-slate-700 outline-none transition-colors focus:border-emerald-100 focus:ring-2 focus:ring-emerald-200 disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          {/* Confirm New Password */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-slate-500">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              placeholder="*********"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={submitLoading}
              className="w-full rounded-xl border-2 border-gray-200 p-2 text-sm text-slate-700 outline-none transition-colors focus:border-emerald-100 focus:ring-2 focus:ring-emerald-200 disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          {/* Password Mismatch Warning */}
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-center text-xs font-semibold text-red-600">
              ⚠︎ Passwords do not match
            </p>
          )}

          {/* Password Strength Requirements */}
          <div className="space-y-1 rounded-lg bg-gray-50 p-1">
            <p className="text-xs font-semibold text-gray-600">Password Requirements:</p>
            <p className={`text-xs transition-colors ${newPassword.length >= 8 ? "text-emerald-600 " : "text-gray-400"}`}>
              ✓ Minimum 8 characters
            </p>
            <p className={`text-xs transition-colors ${/[A-Z]/.test(newPassword) ? "text-emerald-600 " : "text-gray-400"}`}>
              ✓ At least 1 capital letter
            </p>
            <p className={`text-xs transition-colors ${/[0-9]/.test(newPassword) ? "text-emerald-600 " : "text-gray-400"}`}>
              ✓ At least 1 number
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid || submitLoading}
            className="w-full rounded-xl bg-linear-to-r from-blue-600 to-teal-500 py-3 font-bold text-white shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
          >
            {submitLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Updating...
              </span>
            ) : (
              "Update Password"
            )}
          </button>

          {/* Back Button */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => navigate(getProfileRouteByRole())}
              className="text-xs font-semibold text-gray-500 hover:text-gray-800 hover:underline"
            >
              ← Back to Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}