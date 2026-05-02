import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router";
import { apiUrl } from "~/utils/api";
import { getAuthHeaders } from "~/utils/auth";

export function meta() {
  return [
    { title: "Your Care Requests - CareLink" },
    {
      name: "description",
      content: "Track your active care request and review completed or paid bookings.",
    },
  ];
}

/** Matches labels in request-form.tsx */
const DAY_CATEGORY_LABEL: Record<string, string> = {
  A: "3 Hours",
  B: "6 Hours",
  C: "9 Hours",
  D: "12 Hours",
};

type BackendCurrentRequest = {
  request_id: number;
  care_category: string | null;
  service_type?: string | null;
  day_category: string | null;
  min_compensation: number;
  max_compensation: number;
  start_date: string;
  end_date: string;
  status: "Pending" | "Accepted" | "Declined" | "Completed";
  caregiver_id: number | null;
  caregiver_name: string | null;
  caregiver_phone?: string | null;
  caregiver_email?: string | null;
};

type BackendPastRequestRow = {
  request_id: number;
  care_category: string | null;
  start_date: string;
  end_date: string;
  status: "Completed" | "Paid";
  min_compensation: number;
  max_compensation: number;
  caregiver_id: number | null;
  caregiver_name: string | null;
};

type PastRequestUi = {
  requestId: number;
  caregiverName: string;
  serviceType: string;
  date: string;
  duration: string;
  status: "Completed" | "Paid";
  price: string;
  remainingBalance: number | null;
};

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const servicePeriodLabel = (start: string, end: string) => {
  if (!start || !end) return "—";
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return "—";
  const ms = e.getTime() - s.getTime();
  const days = Math.floor(ms / 86400000) + 1;
  return days <= 1 ? "1 day" : `${days} days`;
};

const reportIssueHref = (requestId: number) => {
  const subject = `CareLink — Request #${requestId} (report an issue)`;
  return `/dashboard/contact?requestId=${requestId}&topic=report&subject=${encodeURIComponent(subject)}`;
};

/** Compare calendar dates for YYYY-MM-DD (backend date strings). */
const isOnOrBeforeToday = (isoDate: string) => {
  const parts = isoDate.split(/[-T]/);
  if (parts.length < 3) return false;
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!y || !m || !d) return false;
  const end = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return end <= today;
};

export default function ClientRequests() {
  const [current, setCurrent] = useState<BackendCurrentRequest | null>(null);
  const [pastList, setPastList] = useState<PastRequestUi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pastError, setPastError] = useState("");
  const [markingComplete, setMarkingComplete] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [completeError, setCompleteError] = useState("");

  const loadPast = useCallback(async () => {
    try {
      const pastRes = await fetch(apiUrl("/api/requests/clients/requests"), {
        headers: getAuthHeaders(),
      });
      const pastData = await pastRes.json().catch(() => ({}));
      if (!pastRes.ok) {
        const msg =
          typeof pastData?.message === "string"
            ? pastData.message
            : "Failed to load past requests.";
        setPastError(msg);
        setPastList([]);
        return;
      }
      const rows: BackendPastRequestRow[] = Array.isArray(pastData?.requests)
        ? pastData.requests
        : [];

      const mappedBase: PastRequestUi[] = rows.map((r) => ({
        requestId: r.request_id,
        caregiverName: r.caregiver_name || "Caregiver",
        serviceType: r.care_category || "Care Service",
        date:
          r.start_date && r.end_date && r.end_date !== r.start_date
            ? `${formatDate(r.start_date)} – ${formatDate(r.end_date)}`
            : formatDate(r.start_date || r.end_date),
        duration: servicePeriodLabel(r.start_date, r.end_date),
        status: r.status,
        price: `E£ ${r.min_compensation} - E£ ${r.max_compensation}`,
        remainingBalance: null,
      }));

      const paymentSummaries = await Promise.all(
        mappedBase.map((row) =>
          fetch(apiUrl(`/api/payments/status/${row.requestId}`), {
            headers: getAuthHeaders(),
          })
            .then((res) => (res.ok ? res.json() : null))
            .catch(() => null),
        ),
      );

      setPastList(
        mappedBase.map((row, i) => {
          const pay = paymentSummaries[i] as { remaining?: number } | null;
          const remaining =
            pay != null && typeof pay.remaining === "number"
              ? pay.remaining
              : null;
          return { ...row, remainingBalance: remaining };
        }),
      );
      setPastError("");
    } catch {
      setPastError("Failed to load past requests.");
      setPastList([]);
    }
  }, []);

  const loadCurrent = useCallback(async () => {
    const currentRes = await fetch(
      apiUrl("/api/requests/clients/current-request"),
      { headers: getAuthHeaders() },
    );
    if (currentRes.status === 404) {
      setCurrent(null);
      return;
    }
    const currentData = await currentRes.json().catch(() => ({}));
    if (!currentRes.ok) {
      throw new Error(
        typeof currentData?.message === "string"
          ? currentData.message
          : "Failed to load your current request.",
      );
    }
    const row = currentData?.requests as BackendCurrentRequest | undefined;
    setCurrent(row ?? null);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      setPastError("");
      setActionMessage("");
      setCompleteError("");

      try {
        await loadCurrent();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load your current request.",
        );
        setCurrent(null);
      }

      await loadPast();
      setLoading(false);
    };

    void load();
  }, [loadCurrent, loadPast]);

  const handleMarkComplete = async (requestId: number) => {
    setActionMessage("");
    setCompleteError("");
    setMarkingComplete(true);
    try {
      const res = await fetch(apiUrl(`/api/requests/${requestId}/complete`), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCompleteError(
          typeof data?.message === "string"
            ? data.message
            : "Could not mark this request as completed.",
        );
        return;
      }
      setActionMessage(
        typeof data?.message === "string"
          ? data.message
          : "Service marked complete. You can pay the remaining balance.",
      );
      await loadCurrent();
      await loadPast();
    } catch {
      setCompleteError("Could not mark this request as completed.");
    } finally {
      setMarkingComplete(false);
    }
  };

  const dayLabel = (code: string | null | undefined) =>
    (code && DAY_CATEGORY_LABEL[code]) || code || "Not specified";

  return (
    <div className="relative min-h-screen origin-top bg-white font-sans">
      <div
        className="pointer-events-none fixed inset-0 opacity-20"
        style={{
          background:
            "linear-gradient(135deg, #0978ff 0%, #ffffff 50%, #008e5a 100%)",
        }}
      />

      <main className="relative z-10 mx-auto max-w-5xl px-6 py-12 md:px-10">
        <div className="mb-6">
          <Link
            to="/dashboard/client"
            className="text-med mt-2 font-semibold text-gray-500 transition-colors hover:text-gray-800 hover:underline"
          >
            <span className="text-med">←</span> Return to Dashboard
          </Link>
        </div>

        <div className="mb-10">
          <h2 className="bg-linear-to-r from-blue-700 to-emerald-500 bg-clip-text text-4xl font-extrabold text-transparent">
            Your care requests
          </h2>
          <p className="mt-3 text-lg text-gray-600">
            Active request status (pending through completed), plus your history
            of finished and paid bookings.
          </p>
          <div className="mt-4 h-1.5 w-20 bg-blue-600" />
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}

        {actionMessage && (
          <div className="mb-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 ring-1 ring-emerald-200">
            {actionMessage}
          </div>
        )}

        {completeError && (
          <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-200">
            {completeError}
          </div>
        )}

        {loading && (
          <div className="mb-5 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow ring-1 ring-slate-100">
            Loading…
          </div>
        )}

        {/* —— Current request —— */}
        <section className="mb-14">
          <h3 className="mb-4 text-xl font-bold text-slate-800">
            Current request
          </h3>
          {!loading && !current && !error && (
            <div className="rounded-3xl bg-white p-8 text-center text-sm font-semibold text-slate-500 shadow-lg ring-1 ring-slate-100">
              No active request to track. Create one from the dashboard, or
              check your history below.
            </div>
          )}
          {current && (
            <div className="rounded-4xl bg-white p-6 shadow-lg ring-1 ring-slate-200 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ring-1 ${
                        current.status === "Pending"
                          ? "bg-blue-100 text-blue-800 ring-blue-300"
                          : current.status === "Accepted"
                            ? "bg-emerald-100 text-emerald-800 ring-emerald-300"
                            : current.status === "Completed"
                              ? "bg-slate-100 text-slate-800 ring-slate-300"
                              : "bg-red-50 text-red-700 ring-red-200"
                      }`}
                    >
                      {current.status === "Accepted"
                        ? "In progress"
                        : current.status}
                    </span>
                    <span className="text-sm font-semibold text-slate-500">
                      Request #{current.request_id}
                    </span>
                  </div>
                  <h4 className="mt-3 text-2xl font-bold text-slate-900">
                    {current.care_category || "Care service"}
                  </h4>
                  <p className="mt-1 text-sm text-slate-600">
                    {formatDate(current.start_date)}
                    {current.end_date !== current.start_date
                      ? ` – ${formatDate(current.end_date)}`
                      : ""}{" "}
                    · Day category: {dayLabel(current.day_category)}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    Budget: E£ {current.min_compensation} – E£{" "}
                    {current.max_compensation} (per day)
                  </p>
                </div>
              </div>

              {(current.status === "Accepted" || current.status === "Completed") &&
                current.caregiver_name && (
                  <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">
                      Assigned caregiver
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {current.caregiver_name}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-600">
                      {current.caregiver_phone && (
                        <a
                          href={`tel:${current.caregiver_phone}`}
                          className="font-semibold text-emerald-700 hover:underline"
                        >
                          {current.caregiver_phone}
                        </a>
                      )}
                      {current.caregiver_email && (
                        <a
                          href={`mailto:${current.caregiver_email}`}
                          className="font-semibold text-emerald-700 hover:underline"
                        >
                          Email
                        </a>
                      )}
                    </div>
                  </div>
                )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {current.status === "Pending" && (
                  <p className="text-sm font-semibold text-slate-600">
                    Your request is with matched caregivers. You’ll see their
                    details here once someone accepts.
                  </p>
                )}

                {current.status === "Accepted" && (
                  <>
                    {isOnOrBeforeToday(current.end_date) && (
                      <button
                        type="button"
                        disabled={markingComplete}
                        onClick={() => void handleMarkComplete(current.request_id)}
                        className="inline-flex justify-center rounded-xl border-2 border-slate-300 bg-white px-5 py-3 text-center text-sm font-bold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
                      >
                        {markingComplete
                          ? "Updating…"
                          : "Mark service as complete"}
                      </button>
                    )}
                    <Link
                      to={`/payment/${current.request_id}`}
                      className="inline-flex justify-center rounded-xl bg-emerald-600 px-5 py-3 text-center text-sm font-bold text-white shadow hover:bg-emerald-700"
                    >
                      Make upfront payment
                    </Link>
                    <Link
                      to={`/chat/${current.request_id}`}
                      className="inline-flex justify-center rounded-xl border-2 border-emerald-200 bg-white px-5 py-3 text-center text-sm font-bold text-emerald-800 hover:bg-emerald-50"
                    >
                      Open chat
                    </Link>
                    <Link
                      to={reportIssueHref(current.request_id)}
                      className="inline-flex justify-center rounded-xl border-2 border-slate-200 px-5 py-3 text-center text-sm font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Report an issue
                    </Link>
                  </>
                )}

                {current.status === "Completed" && (
                  <>
                    <Link
                      to={`/payment/${current.request_id}`}
                      className="inline-flex justify-center rounded-xl bg-[#1976D2] px-5 py-3 text-center text-sm font-bold text-white shadow hover:bg-[#1565C0]"
                    >
                      Make final payment
                    </Link>
                    <Link
                      to={reportIssueHref(current.request_id)}
                      className="inline-flex justify-center rounded-xl border-2 border-slate-200 px-5 py-3 text-center text-sm font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Report an issue
                    </Link>
                    <button
                      type="button"
                      disabled
                      title="Reviews are not available in the app yet."
                      className="inline-flex cursor-not-allowed justify-center rounded-xl border-2 border-dashed border-slate-200 px-5 py-3 text-center text-sm font-bold text-slate-400"
                    >
                      Leave a review (soon)
                    </button>
                  </>
                )}

                {current.status === "Declined" && (
                  <Link
                    to={`/match-results?requestId=${current.request_id}`}
                    className="inline-flex justify-center rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-bold text-white hover:bg-blue-700"
                  >
                    Find another caregiver
                  </Link>
                )}
              </div>
            </div>
          )}
        </section>

        {/* —— Past requests —— */}
        <section>
          <h3 className="mb-4 text-xl font-bold text-slate-800">
            Past requests (completed &amp; paid)
          </h3>
          {pastError && (
            <div className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 ring-1 ring-amber-200">
              {pastError}
            </div>
          )}
          {!loading && pastList.length === 0 && !pastError && (
            <div className="rounded-3xl bg-white p-8 text-center text-sm font-semibold text-slate-500 shadow-lg ring-1 ring-slate-100">
              No completed or paid requests yet.
            </div>
          )}
          <div className="grid gap-6">
            {pastList.map((req) => (
              <div
                key={req.requestId}
                className="group flex flex-col gap-6 rounded-4xl bg-white p-6 shadow-lg ring-1 ring-slate-200 transition-all hover:-translate-y-1 hover:shadow-xl sm:flex-row sm:items-center sm:p-8"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-emerald-500 text-xl font-bold text-white shadow-md">
                  {req.caregiverName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-bold text-slate-800">
                      {req.caregiverName}
                    </h3>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ring-1 ${
                        req.status === "Paid"
                          ? "bg-emerald-100 text-emerald-800 ring-emerald-300"
                          : "bg-slate-100 text-slate-700 ring-slate-300"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                  <p className="mt-1 font-semibold text-gray-500">
                    {req.serviceType}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm font-bold text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span className="text-blue-500">📅</span> {req.date}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-blue-500">⏱️</span> {req.duration}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-600">💰</span> {req.price}
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    {req.status === "Completed" &&
                      req.remainingBalance !== null &&
                      req.remainingBalance > 0 && (
                        <p className="text-sm font-bold text-amber-800">
                          Balance due: {req.remainingBalance.toFixed(2)} EGP
                        </p>
                      )}
                    <Link
                      to={`/payment/${req.requestId}`}
                      className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                        req.status === "Completed" &&
                        req.remainingBalance !== null &&
                        req.remainingBalance > 0
                          ? "bg-[#1976D2] text-white shadow hover:bg-[#1565C0]"
                          : "border-2 border-slate-200 text-slate-700 hover:border-[#1976D2] hover:text-[#1976D2]"
                      }`}
                    >
                      {req.status === "Completed" &&
                      req.remainingBalance !== null &&
                      req.remainingBalance > 0
                        ? "Pay balance"
                        : "Payment & receipts"}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
