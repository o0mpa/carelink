import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router";

export default function ResetPassword() {
  const navigate = useNavigate();

  // ── Step ──────────────────────────────────────────────────────────────────
  const [step, setStep] = useState(1);

  // ── Step 1 state ──────────────────────────────────────────────────────────
  const [username, setUsername]           = useState("");
  const [question1, setQuestion1]         = useState<string | null>(null);
  const [question2, setQuestion2]         = useState<string | null>(null);
  const [answer1, setAnswer1]             = useState("");
  const [answer2, setAnswer2]             = useState("");
  const [fetchingQ, setFetchingQ]         = useState(false);
  const [usernameError, setUsernameError] = useState("");

  // ── Step 2 state ──────────────────────────────────────────────────────────
  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitLoading, setSubmitLoading]     = useState(false);

  // ── Shared error ──────────────────────────────────────────────────────────
  const [error, setError] = useState("");

  // ── Debounce ref so we don't fire on every keystroke ─────────────────────
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch questions whenever username changes (debounced 600ms) ───────────
  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setQuestion1(null);
    setQuestion2(null);
    setUsernameError("");
    setError("");

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) return;

    debounceRef.current = setTimeout(async () => {
      setFetchingQ(true);
      try {
        const res = await fetch(`http://localhost:5000/api/auth/security-questions/${encodeURIComponent(value.trim())}`
        );
        const data = await res.json();

        if (!res.ok) {
          setUsernameError(data.message || "Username not found.");
          setQuestion1(null);
          setQuestion2(null);
          return;
        }

        setQuestion1(data.question1);
        setQuestion2(data.question2);
        setUsernameError("");
      } catch {
        setUsernameError("Cannot connect to server. Please try again.");
      } finally {
        setFetchingQ(false);
      }
    }, 600);
  };

  // ── Step 1 submit 
  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!question1 || !question2) {
      setError("Please enter a valid username first.");
      return;
    }
    if (!answer1.trim() || !answer2.trim()) {
      setError("Please answer both security questions.");
      return;
    }
    setStep(2);
  };

  // ── Step 2 submit 
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-password-security",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username:        username.trim(),
            securityAnswer1: answer1.trim(),
            securityAnswer2: answer2.trim(),
            newPassword:     password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Incorrect answers. Please try again.");
        setStep(1);
        return;
      }

      navigate("/login?reset=true");
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
        <div className="mb-5 text-center">
          <div className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-r from-blue-100 to-emerald-100">
            <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-emerald-900">Forgot Password</h2>
          <p className="text-sm italic text-gray-600">
            {step === 1
              ? "Enter your username to load your security questions"
              : "Enter your new password"}
          </p>
          {/* Step indicators */}
          <div className="mt-3 flex items-center justify-center gap-2">
            <div className={`h-2 w-8 rounded-full transition-colors ${step === 1 ? "bg-emerald-500" : "bg-emerald-200"}`} />
            <div className={`h-2 w-8 rounded-full transition-colors ${step === 2 ? "bg-emerald-500" : "bg-emerald-200"}`} />
          </div>
        </div>

        {/* ── Shared error banner ── */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-100 bg-red-50 p-3 text-center text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* STEP 1 — Username + Security Questions (auto-loaded) */}
        {step === 1 && (
          <form onSubmit={handleVerify} className="space-y-5">

            {/* Username input */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  className={`w-full rounded-xl border-2 p-2 pr-8 text-sm text-slate-700 outline-none transition-colors focus:ring-2 focus:ring-emerald-200 ${
                    usernameError
                      ? "border-red-300 bg-red-50"
                      : question1
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-gray-200"
                  }`}
                />
                {/* Spinner while fetching */}
                {fetchingQ && (
                  <svg className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-emerald-500"
                    fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                )}
                {/* Checkmark when found */}
                {!fetchingQ && question1 && (
                  <svg className="absolute right-2.5 top-2.5 h-4 w-4 text-emerald-500"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              {usernameError && (
                <p className="text-xs font-semibold text-red-500">{usernameError}</p>
              )}
              {!question1 && !fetchingQ && !usernameError && username && (
                <p className="text-xs text-gray-400">Looking up your account...</p>
              )}
            </div>

            {/* Security Questions — appear automatically after username is found */}
            {question1 && question2 && (
              <div className="animate-in fade-in slide-in-from-top-2 space-y-5 duration-300">

                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Your Security Questions
                  </span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>

                {/* Question 1 */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">
                    Question 1
                  </label>
                  <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-900 ring-1 ring-blue-100">
                    {question1}
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Your answer"
                    value={answer1}
                    onChange={(e) => setAnswer1(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-200 p-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>

                {/* Question 2 */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">
                    Question 2
                  </label>
                  <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-900 ring-1 ring-blue-100">
                    {question2}
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Your answer"
                    value={answer2}
                    onChange={(e) => setAnswer2(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-200 p-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-linear-to-r from-blue-600 to-teal-500 py-3 font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Verify & Continue
                </button>
              </div>
            )}

            <div className="pt-1 text-center">
              <Link
                to="/login"
                className="text-xs font-semibold text-gray-500 hover:text-gray-800 hover:underline"
              >
                ← Back to Sign In
              </Link>
            </div>
          </form>
        )}

        {/*  STEP 2 — New Password*/}
        {step === 2 && (
          <form
            onSubmit={handleReset}
            className="animate-in fade-in slide-in-from-right-4 space-y-5 duration-300"
          >
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">New Password</label>
              <input
                type="password"
                required
                placeholder="*********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 p-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Confirm Password</label>
              <input
                type="password"
                required
                placeholder="*********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 p-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            {confirmPassword && password !== confirmPassword && (
              <p className="text-center text-xs font-semibold text-red-600">
                Passwords do not match
              </p>
            )}
                     <p className={`text-xs ${password.length >= 8 ? "text-emerald-600" : "text-gray-400"}`}>
                     Minimum 8 characters
                    </p>
                    <p className={`text-xs ${/[A-Z]/.test(password) ? "text-emerald-600" : "text-gray-400"}`}>
                     At least 1 capital letter
                    </p>
                    <p className={`text-xs ${/[0-9]/.test(password) ? "text-emerald-600" : "text-gray-400"}`}>
                     At least 1 number
                    </p> 
            <button
              type="submit"
              disabled={submitLoading || password !== confirmPassword || password.length < 8}
              className="w-full rounded-xl bg-linear-to-r from-blue-600 to-teal-500 py-3 font-bold text-white shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
            >
              {submitLoading ? "Updating..." : "Update Password"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setPassword("");
                  setConfirmPassword("");
                  setError("");
                }}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800 hover:underline"
              >
                ← Go back
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}