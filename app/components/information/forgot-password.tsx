import { useState } from "react";
import { Form, Link, redirect, useActionData, useNavigation } from "react-router";
import { apiUrl } from "../../utils/api";

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const username = formData.get("username")?.toString().trim() ?? "";
  const securityAnswer1 = formData.get("securityAnswer1")?.toString().trim() ?? "";
  const securityAnswer2 = formData.get("securityAnswer2")?.toString().trim() ?? "";
  const newPassword = formData.get("newPassword")?.toString() ?? "";
  const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";

  if (!username || !securityAnswer1 || !securityAnswer2 || !newPassword || !confirmPassword) {
    return { error: "Please fill in all fields." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  try {
    const response = await fetch(apiUrl("/api/auth/forgot-password-security"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        securityAnswer1,
        securityAnswer2,
        newPassword,
      }),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { error: result.message || "Password reset failed. Please try again." };
    }

    return redirect("/login?reset=true");
  } catch (_error) {
    return { error: "Cannot connect to the server. Is your backend running?" };
  }
}

export default function ResetPassword() {
  const actionData = useActionData() as { error?: string } | undefined;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [securityAnswer1, setSecurityAnswer1] = useState("");
  const [securityAnswer2, setSecurityAnswer2] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !securityAnswer1 || !securityAnswer2) {
      return;
    }
    setStep(2);
  };

  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-emerald-50 bg-linear-to-br from-blue-200 via-white to-emerald-200 p-4">
      <div className="w-full max-w-md rounded-3xl border border-emerald-100 bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="mb-5 text-center">
          <div className="mb-1 mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-r from-blue-100 to-emerald-100">
            <svg
              className="h-6 w-6 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-emerald-900">
            Forgot Password
          </h2>
          <p className="text-sm italic text-gray-600">
            {step === 1
              ? "Verify your identity with security questions"
              : "Enter your new password"}
          </p>
        </div>

        {actionData?.error && (
          <div className="mb-4 rounded-lg border border-red-100 bg-red-50 p-3 text-center text-sm font-semibold text-red-600">
            {actionData.error}
          </div>
        )}

        {step === 1 ? (
          /* STEP 1: SECURITY QUESTIONS */
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500">
                Username
              </label>
              <input
                type="text"
                name="username"
                required
                placeholder="Enter your username"
                className="w-full rounded-xl border-2 border-gray-200 p-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-200"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500">
                Security Question 1
              </label>
              <p className="text-sm font-semibold text-slate-900">
                What is your favorite pet?
              </p>
              <input
                type="text"
                name="securityAnswer1"
                required
                placeholder="Dog, Cat"
                className="w-full rounded-xl border-2 border-gray-200 p-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-200"
                value={securityAnswer1}
                onChange={(e) => setSecurityAnswer1(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500">
                Security Question 2
              </label>
              <p className="text-sm font-semibold text-slate-900">
                What is your city of birth?
              </p>
              <input
                type="text"
                name="securityAnswer2"
                placeholder="Cairo, Giza"
                required
                className="w-full rounded-xl border-2 border-gray-200 p-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-200"
                value={securityAnswer2}
                onChange={(e) => setSecurityAnswer2(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="mb-2 mt-3 w-full rounded-xl bg-linear-to-r from-blue-600 to-teal-500 py-3 font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Verify Identity
            </button>
          </form>
        ) : (
          /* STEP 2: NEW PASSWORD INPUTS */
          <Form method="post" className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-300">
            <input type="hidden" name="username" value={username} />
            <input type="hidden" name="securityAnswer1" value={securityAnswer1} />
            <input type="hidden" name="securityAnswer2" value={securityAnswer2} />
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">
                <div className="mb-2">New Password</div>
              </label>
              <input
                type="password"
                name="newPassword"
                placeholder="*********"
                required
                className="w-full rounded-xl border-2 border-gray-200 p-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">
                <div className="mb-2">Confirm Password</div>
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="*********"
                required
                className="w-full rounded-xl border-2 border-gray-200 p-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-200"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="mb-2 text-center text-xs text-red-600">
                Passwords do not match
              </p>
            )}
            {/* Password Requirement Text */}
            <div className="pt-0.5 text-left">
              <p
                className={`text-xs ${
                  password.length >= 8 ? "text-emerald-600" : "text-gray-400"
                }`}
              >
                Minimum 8 characters
                <br />
                At least one uppercase letter
                <br />
                At least one number
              </p>
            </div>
            <button
              type="submit"
                disabled={isSubmitting || password !== confirmPassword}
              className="w-full rounded-xl bg-linear-to-r from-blue-600 to-teal-500 py-3 font-bold text-white shadow-md transition-all hover:scale-[1.02] hover:bg-emerald-700 hover:focus:ring-2 focus:ring-teal-500"
            >
                {isSubmitting ? "Updating Password..." : "Update Password"}
            </button>
          </Form>
        )}
        <div className="mt-4 text-center text-sm text-gray-600">
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-800 hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}