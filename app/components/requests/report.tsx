import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router";
import axiosInstance from "~/utils/axiosinstance";
import { getRole } from "~/utils/auth";

export function meta() {
  return [
    { title: "Report an Issue - CareLink" },
    { name: "description", content: "Report an issue regarding your care request." },
  ];
}

export function loader() {
  return null;
}

const MAX_ISSUE_LENGTH = 5000;

const dashboardPath = () =>
  getRole() === "Caregiver" ? "/dashboard/caregiver" : "/dashboard/client";

export default function ReportIssue() {
  const { requestId: requestIdParam } = useParams<{ requestId: string }>();
  const navigate = useNavigate();

  const requestIdNum = useMemo(() => {
    const n = parseInt(requestIdParam ?? "", 10);
    return Number.isFinite(n) && n > 0 ? n : NaN;
  }, [requestIdParam]);
  const role = getRole();
  const isClient = role === "Client";

  const [issueText, setIssueText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invalidRequest = Number.isNaN(requestIdNum);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (invalidRequest) {
      setError("Invalid request ID.");
      return;
    }
    if (!issueText.trim()) {
      setError("Please describe the issue before submitting.");
      return;
    }
    if (issueText.length > MAX_ISSUE_LENGTH) {
      setError(`Please keep your description under ${MAX_ISSUE_LENGTH} characters.`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await axiosInstance.post("/reviews/report", {
        requestId: requestIdNum,
        issue_text: issueText.trim(),
      });

      setSubmitted(true);
    } catch (err: unknown) {
      const ax = err as {
        response?: { status?: number; data?: { message?: string; error?: string } };
        message?: string;
      };
      if (ax.response?.status === 401) {
        navigate("/login");
        return;
      }
      setError(
        ax.response?.data?.message ||
          ax.response?.data?.error ||
          ax.message ||
          "Failed to submit report. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (invalidRequest && !submitted) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-slate-200">
          <p className="font-semibold text-slate-700">This report link is invalid.</p>
          <Link
            to={dashboardPath()}
            className="mt-6 inline-block rounded-xl bg-slate-800 px-6 py-3 text-sm font-bold text-white hover:bg-slate-900"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!isClient && !submitted) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-slate-200">
          <p className="font-semibold text-slate-700">
            Reporting is currently available for client accounts only.
          </p>
          <Link
            to={dashboardPath()}
            className="mt-6 inline-block rounded-xl bg-slate-800 px-6 py-3 text-sm font-bold text-white hover:bg-slate-900"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 font-sans">
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-red-400/20 blur-3xl" />
          <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-rose-400/15 blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-md px-6">
          <div className="rounded-[2.5rem] bg-white/90 p-10 text-center shadow-2xl ring-1 ring-red-100 backdrop-blur-xl">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-red-100 to-rose-50 shadow-inner ring-1 ring-red-200">
              <svg
                className="h-10 w-10 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="mb-3 text-3xl font-extrabold text-slate-800">Report submitted</h2>
            <p className="mb-8 text-sm font-medium leading-relaxed text-slate-500">
              Thank you for bringing this to our attention. Our team will review your report
              and follow up as needed.
            </p>
            <button
              type="button"
              onClick={() => navigate(dashboardPath())}
              className="w-full rounded-2xl bg-linear-to-r from-slate-800 to-slate-700 py-4 font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
            >
              Return to dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 font-sans">
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-red-400/20 blur-3xl" />
        <div className="absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-orange-400/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-rose-400/20 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto flex max-w-2xl flex-col justify-center px-4 py-12 sm:px-6">
        <div className="mb-6">
          <Link
            to={dashboardPath()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800 hover:underline"
          >
            <span className="text-lg leading-none">←</span> Return to dashboard
          </Link>
        </div>

        <div className="rounded-[2.5rem] bg-white/95 p-8 shadow-2xl ring-1 ring-red-100 backdrop-blur-xl sm:p-12">
          <div className="mb-8 flex flex-col items-center text-center">
            <span className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30">
              <svg
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </span>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Report an issue
            </h2>
            <p className="mt-2 text-sm font-bold uppercase tracking-widest text-rose-500">
              Request #{requestIdParam}
            </p>
          </div>

          <div className="mb-8 rounded-3xl border-2 border-red-200 bg-red-50 p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3 border-b border-red-200/60 pb-3">
              <span className="text-3xl" aria-hidden="true">
                ⚠️
              </span>
              <p className="text-xl font-black text-red-800">Safety first</p>
            </div>
            <p className="mt-4 text-lg font-bold leading-relaxed text-red-800">
              If this is a medical emergency, open{" "}
              <Link
                to="/emergency"
                className="font-black underline decoration-red-400 decoration-2 underline-offset-4"
              >
                Emergency alert
              </Link>{" "}
              instead of this form.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label
                htmlFor="issueText"
                className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500"
              >
                Describe the issue <span className="text-red-500">*</span>
              </label>
              <textarea
                id="issueText"
                required
                value={issueText}
                onChange={(e) => setIssueText(e.target.value)}
                maxLength={MAX_ISSUE_LENGTH}
                placeholder="Please provide as much detail as possible about what happened..."
                rows={6}
                className="w-full resize-none rounded-2xl border-2 border-slate-200 bg-slate-50/50 px-5 py-4 text-sm text-slate-800 shadow-inner transition-all focus:border-red-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-500/10"
              />
              <p className="mt-2 text-right text-xs font-bold text-slate-400">
                {issueText.length} / {MAX_ISSUE_LENGTH} characters
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm font-semibold text-red-700 animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <div className="mt-4 flex flex-col gap-3 border-t-2 border-slate-100 pt-8 sm:flex-row-reverse">
              <button
                type="submit"
                disabled={submitting || !issueText.trim()}
                className="flex-1 rounded-2xl bg-linear-to-r from-red-600 to-rose-500 px-4 py-4 text-base font-bold text-white shadow-lg shadow-red-500/25 transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:scale-100 disabled:opacity-50 disabled:shadow-none"
              >
                {submitting ? "Submitting…" : "Submit report"}
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={submitting}
                className="flex-1 rounded-2xl border-2 border-slate-200 bg-white px-4 py-4 text-base font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-800 active:scale-[0.98] disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
