import { useState } from "react";
import { Form } from "react-router";

export default function ResetPassword() {
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
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

        {step === 1 ? (
          /* STEP 1: SECURITY QUESTIONS */
          <form onSubmit={handleVerify} className="space-y-6">
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
              className="w-full rounded-xl bg-linear-to-r from-blue-600 to-teal-500 py-3 font-bold text-white shadow-md transition-all hover:scale-[1.02] hover:bg-emerald-700 hover:focus:ring-2 focus:ring-teal-500"
            >
              Update Password
            </button>
          </Form>
        )}
      </div>
    </div>
  );
}