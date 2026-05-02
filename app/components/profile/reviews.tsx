import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { apiUrl } from "~/utils/api";
import { getAuthHeaders } from "~/utils/auth";

export function meta() {
  return [{ title: "Leave a Review - CareLink" }];
}

export function loader() {
  return null;
}

// ════════════════════════════════════════════════════════════════════════════
const USE_MOCK = false;
// ════════════════════════════════════════════════════════════════════════════

export default function ReviewPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();

  const [rating, setRating]       = useState(0);
  const [hovered, setHovered]     = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a star rating before submitting.");
      return;
    }
    try {
      setSubmitting(true);
      setError(null);

      // ── MOCK ──────────────────────────────────────────────────────────
    //   if (USE_MOCK) {
    //     await new Promise((r) => setTimeout(r, 800));
    //     console.log("🧪 [MOCK] Review submitted:", { requestId, rating, review_text: reviewText });
    //     setSubmitted(true);
    //     return;
    //   }
    //   // ── REAL API ──────────────────────────────────────────────────────
    //   // POST /api/reviews/submit
    //   // Body: { requestId, rating, review_text }
    //   // Auth: Client token required
    //   const response = await fetch(apiUrl("/api/reviews/submit"), {
    //     method: "POST",
    //     headers: {
    //       ...getAuthHeaders(),
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       requestId:   parseInt(requestId ?? "0"),
    //       rating,
    //       review_text: reviewText.trim() || undefined,
    //     }),
    //   });

    //   const data = await response.json().catch(() => ({}));
    //   if (!response.ok) {
    //     throw new Error(data?.message || "Failed to submit review.");
    //   }
      // ─────────────────────────────────────────────────────────────────

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const starLabel = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
  const activeRating = hovered || rating;

  // ── SUCCESS SCREEN ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-200 via-amber-50 to-emerald-200 flex items-center justify-center px-6">
        {/* {USE_MOCK && (
          <div className="fixed top-0 left-0 right-0 bg-gray-400 text-gray-900 text-center text-sm font-semibold py-2">
            MOCK MODE — set <code className="font-mono">USE_MOCK = false</code> to use real API
          </div>
        )} */}
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Review Submitted!</h2>
          <p className="text-slate-500 mb-2">
            Thank you for your feedback. It helps other clients find the right caregiver.
          </p>

          {/* Show what was submitted */}
          <div className="flex justify-center gap-1 my-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <svg
                key={s}
                className={`w-7 h-7 ${s <= rating ? "text-amber-400" : "text-slate-200"}`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            ))}
          </div>
          {reviewText && (
            <p className="text-sm text-slate-500 italic mb-6">"{reviewText}"</p>
          )}
            
          <button
            onClick={() => navigate("/dashboard/client")}
            className="w-full bg-linear-to-r from-[#1976D2] to-[#26C6DA] text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── FORM ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-200 via-amber-50 to-emerald-200">

      {/* {USE_MOCK && (
        <div className="bg-gray-400 text-gray-900 text-center text-sm font-semibold py-2">
          MOCK MODE — set <code className="font-mono">USE_MOCK = false</code> to use real API
        </div>
      )} */}

      <main className="max-w-xl mx-auto px-2 py-4">

        {/* Back link */}
        <div className="mb-2">
          <Link
            to="/dashboard/client"
            className="text-sm font-semibold text-slate-500 hover:text-slate-800 hover:underline transition-colors"
          >
            ← Return to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">

          {/* Header */}
          <div className="flex flex-col items-center mb-2">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-amber-400 to-orange-500 shadow-md ring-1 ring-amber-200 mb-3">
              <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </span>
            <h2 className="text-3xl font-extrabold bg-linear-to-r from-amber-500 to-orange-500 text-transparent bg-clip-text">
              Leave a Review
            </h2>
            <p className="text-slate-400 text-sm font-semibold mt-1 text-center">
              How was your experience with this caregiver?
            </p>
          </div>

          {/* Star Rating */}
          <div className="mb-1">
            <label className="block text-slate-700 font-bold mb-3 text-sm uppercase tracking-widest">
              Your Rating <span className="text-red-400">*</span>
            </label>

            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-110 active:scale-95"
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                >
                  <svg
                    className={`w-10 h-10 transition-colors ${
                      star <= activeRating ? "text-amber-400" : "text-slate-200"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
              ))}
            </div>

            {/* Label under stars */}
            <div className="text-center h-5">
              {activeRating > 0 && (
                <span className={`text-sm font-bold ${
                  activeRating >= 4 ? "text-emerald-600" :
                  activeRating === 3 ? "text-blue-500" :
                  "text-amber-500"
                }`}>
                  {starLabel[activeRating]}
                </span>
              )}
            </div>
          </div>

          {/* Review Text */}
          <div className="mb-2">
            <label
              htmlFor="reviewText"
              className="block text-slate-700 font-bold mb-2 text-sm uppercase tracking-widest"
            >
              Your Review <span className="text-slate-400 font-normal normal-case tracking-normal">— optional</span>
            </label>
            <textarea
              id="reviewText"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience — what went well, what could be improved..."
              rows={4}
              maxLength={1000}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 text-slate-600 text-sm focus:border-amber-300 focus:ring-1 focus:ring-amber-200 focus:outline-none transition-all resize-none"
            />
            <p className="text-xs text-slate-400 mt-1 text-right">
              {reviewText.length} / 1000
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700 text-sm font-semibold">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`w-full py-4 rounded-xl font-bold text-white text-base transition-all ${
              submitting
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-linear-to-r from-amber-400 to-orange-500 hover:shadow-lg hover:scale-[1.01]"
            }`}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>

          {/* Skip */}
          <button
            onClick={() => navigate("/dashboard/client")}
            disabled={submitting}
            className="w-full mt-3 py-3 rounded-xl font-semibold text-slate-500 border-2 border-slate-200 hover:bg-slate-50 transition-all"
          >
            Skip for Now
          </button>

          <p className="text-center text-med text-slate-400 mt-3">
            Reviews can only be submitted once per request.
          </p>

        </div>
      </main>
    </div>
  );
}