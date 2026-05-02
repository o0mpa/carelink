import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router";
import { apiUrl } from "~/utils/api";
import { getAuthHeaders } from "~/utils/auth";

export function meta() {
  return [
    { title: "Your Care Requests - CareLink" },
    {
      name: "description",
      content: "Track the status of your active care request.",
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Types (from teammate's version — more complete)
// ─────────────────────────────────────────────────────────────────────────────
type BackendCurrentRequest = {
  request_id: number;
  care_category: string | null;
  service_type?: string | null;
  day_category: string | null;
  gender_preference?: string | null;
  medical_specialties_needed?: string | null;
  min_compensation: number;
  max_compensation: number;
  start_date: string;
  end_date: string;
  skills_needed?: string | unknown[] | null;
  city?: string | null;
  area?: string | null;
  status: "Pending" | "Accepted" | "Declined" | "Completed";
  caregiver_id: number | null;
  caregiver_name: string | null;
  caregiver_phone?: string | null;
  caregiver_email?: string | null;
  caregiver_picture?: string | null;
};

type MappedRequest = {
  requestId: number;
  caregiverId: number | null;
  caregiverName: string;
  caregiverPhone: string | null;
  caregiverEmail: string | null;
  caregiverAvatar: string | null;
  careCategory: string;
  serviceModelLabel: string;
  dayCategory: string;
  startDate: string;
  endDate: string;
  locationLabel: string;
  genderPreference: string | null;
  medicalSpecialties: string | null;
  skillLabels: string[];
  rawStatus: "Pending" | "Accepted" | "Declined" | "Completed";
  priceRange: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers (from teammate's version)
// ─────────────────────────────────────────────────────────────────────────────
const DAY_CATEGORY_LABEL: Record<string, string> = {
  A: "3 Hours",
  B: "6 Hours",
  C: "9 Hours",
  D: "12 Hours",
};

/** Matches `service_type` values from request-form.tsx */
const SERVICE_TYPE_LABEL: Record<string, string> = {
  live_in: "Live-in (caregiver stays in your home)",
  live_out: "Live-out (caregiver visits daily)",
};

/** Matches skill `value` from request-form.tsx */
const SKILL_VALUE_LABEL: Record<string, string> = {
  physical_care: "Physical care",
  medication_management: "Medication management",
  meal_preparation: "Meal preparation",
  housekeeping: "Housekeeping and cleaning",
  emotional_support: "Emotional support",
  transportation: "Transportation",
  health_monitoring: "Health monitoring",
};

const parseSkillsNeeded = (raw: BackendCurrentRequest["skills_needed"]): string[] => {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw.filter((s): s is string => typeof s === "string");
  }
  if (typeof raw === "string") {
    try {
      const p = JSON.parse(raw) as unknown;
      return Array.isArray(p) ? p.filter((s): s is string => typeof s === "string") : [];
    } catch {
      return [];
    }
  }
  return [];
};

const skillLabelsFromStored = (values: string[]) =>
  values.map((v) => SKILL_VALUE_LABEL[v] ?? v.replace(/_/g, " "));

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateRange = (start: string, end: string) => {
  if (!end || end === start) return formatDate(start);
  return `${formatDate(start)} → ${formatDate(end)}`;
};

const reportIssueHref = (requestId: number) =>
  `/report/${requestId}`;

// ─────────────────────────────────────────────────────────────────────────────
// Status config — Sandy's UI design
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Pending: {
    label: "Pending",
    pill: "bg-blue-100 text-blue-700 ring-1 ring-blue-300",
    card: "ring-blue-200 hover:shadow-blue-100",
    dot: "bg-blue-400",
    avatar: "bg-blue-500",
    banner: "bg-blue-50 border-b border-blue-100",
    description: "Waiting for a caregiver to accept your request.",
  },
  Accepted: {
    label: "In Progress",
    pill: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300",
    card: "ring-emerald-200 hover:shadow-emerald-100",
    dot: "bg-emerald-400",
    avatar: "bg-emerald-500",
    banner: "bg-emerald-50 border-b border-emerald-100",
    description: "A caregiver has accepted your request.",
  },
  Completed: {
    label: "Completed",
    pill: "bg-amber-100 text-amber-700 ring-1 ring-amber-300",
    card: "ring-amber-200 hover:shadow-amber-100",
    dot: "bg-amber-400",
    avatar: "bg-amber-500",
    banner: "bg-amber-50 border-b border-amber-100",
    description: "Your service is complete. Please settle the payment.",
  },
  Declined: {
    label: "Declined",
    pill: "bg-red-50 text-red-600 ring-1 ring-red-200",
    card: "ring-red-100 hover:shadow-red-50 opacity-75",
    dot: "bg-red-400",
    avatar: "bg-gray-400",
    banner: "bg-red-50 border-b border-red-100",
    description: "This request was declined.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function ClientRequests() {
  const [request, setRequest] = useState<MappedRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // teammate's loadCurrent logic (useCallback, 404 handling, full error handling)
  const loadCurrent = useCallback(async () => {
    const res = await fetch(apiUrl("/api/requests/clients/current-request"), {
      headers: getAuthHeaders(),
    });

    if (res.status === 404) {
      setRequest(null);
      return;
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        typeof data?.message === "string"
          ? data.message
          : "Failed to load your current request.",
      );
    }

    const current: BackendCurrentRequest | null = data?.requests ?? null;
    if (!current) {
      setRequest(null);
      return;
    }

    const st = (current.service_type ?? "").trim().toLowerCase();
    const serviceModelLabel =
      SERVICE_TYPE_LABEL[st] ??
      (current.service_type
        ? String(current.service_type).replace(/_/g, " ")
        : "Not specified");

    const area = (current.area ?? "").trim();
    const city = (current.city ?? "").trim();
    const locationLabel =
      area && city ? `${area}, ${city}` : city || area || "—";

    const med = (current.medical_specialties_needed ?? "").trim();
    const gender = (current.gender_preference ?? "").trim();

    setRequest({
      requestId: current.request_id,
      caregiverId: current.caregiver_id ?? null,
      caregiverName: current.caregiver_name || "Caregiver",
      caregiverPhone: current.caregiver_phone ?? null,
      caregiverEmail: current.caregiver_email ?? null,
      caregiverAvatar: current.caregiver_picture ?? null,
      careCategory: current.care_category || "Care Service",
      serviceModelLabel,
      dayCategory:
        DAY_CATEGORY_LABEL[current.day_category ?? ""] ??
        current.day_category ??
        "Not specified",
      startDate: current.start_date,
      endDate: current.end_date,
      locationLabel,
      genderPreference: gender || null,
      medicalSpecialties: med || null,
      skillLabels: skillLabelsFromStored(parseSkillsNeeded(current.skills_needed)),
      rawStatus: current.status,
      priceRange: `E£ ${current.min_compensation} – E£ ${current.max_compensation}`,
    });
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        await loadCurrent();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load your current request.",
        );
        setRequest(null);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [loadCurrent]);

  const status = request?.rawStatus ?? null;
  const cfg = status ? STATUS_CONFIG[status] : null;
  const paymentUrl = request
    ? `/payment/${request.requestId}`
    : "/dashboard/client";

  return (
    <div className="relative min-h-screen bg-white font-sans">
      {/* Background gradient */}
      <div
        className="pointer-events-none fixed inset-0 opacity-20"
        style={{
          background:
            "linear-gradient(135deg, #0978ff 0%, #ffffff 50%, #008e5a 100%)",
        }}
      />

      <main className="relative z-10 mx-auto max-w-3xl px-6 py-12 md:px-10">
        {/* Back link */}
        <div className="mb-6">
          <Link
            to="/dashboard/client"
            className="text-sm font-semibold text-gray-500 transition-colors hover:text-gray-800 hover:underline"
          >
            ← Return to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10">
          <h2 className="bg-linear-to-r from-blue-700 to-emerald-500 bg-clip-text text-4xl font-extrabold text-transparent">
            Your Current Request
          </h2>
          <p className="mt-3 text-lg text-gray-600">
            Track the status of your active care request.
          </p>
          <div className="mt-4 h-1.5 w-20 bg-blue-600" />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mb-5 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow ring-1 ring-slate-100">
            Loading your request...
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && !request && (
          <div className="rounded-3xl bg-white p-10 text-center shadow-lg ring-1 ring-slate-100">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">
              📋
            </div>
            <p className="font-semibold text-slate-500">
              No active request found.
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Submit a request to find a caregiver.
            </p>
            <Link
              to="/dashboard/client"
              className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700"
            >
              Go to Dashboard
            </Link>
          </div>
        )}

        {/* Request card — Sandy's UI design */}
        {!loading && request && cfg && (
          <div
            className={`rounded-3xl bg-white shadow-xl ring-1 transition-all hover:-translate-y-0.5 ${cfg.card}`}
          >
            {/* Status banner */}
            <div
              className={`flex items-center gap-3 rounded-t-3xl px-8 py-6 ${cfg.banner}`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${cfg.dot} animate-pulse`}
              />
              <span
                className={`rounded-full px-3 py-1 text-[14px] font-black uppercase tracking-widest ${cfg.pill}`}
              >
                {cfg.label}
              </span>
              <span className="text-sm font-medium text-slate-500">
                {cfg.description}
              </span>
            </div>

            <div className="p-8">
              {/* Caregiver info — shown when Accepted / Completed */}
              {(status === "Accepted" || status === "Completed") &&
                request.caregiverName && (
                  <div className="mb-6 flex items-center gap-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                    {request.caregiverAvatar ? (
                      <img
                        src={request.caregiverAvatar}
                        alt={request.caregiverName}
                        className="h-14 w-14 rounded-2xl object-cover shadow"
                      />
                    ) : (
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-white shadow ${cfg.avatar}`}
                      >
                        {request.caregiverName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        Your Caregiver
                      </p>
                      <p className="mt-0.5 text-lg font-bold text-slate-800">
                        {request.caregiverName}
                      </p>
                      {request.caregiverPhone && (
                        <a
                          href={`tel:${request.caregiverPhone}`}
                          className="text-sm font-semibold text-emerald-700 hover:underline"
                        >
                          {request.caregiverPhone}
                        </a>
                      )}
                      {request.caregiverEmail && (
                        <a
                          href={`mailto:${request.caregiverEmail}`}
                          className="ml-3 text-sm font-semibold text-emerald-700 hover:underline"
                        >
                          Email
                        </a>
                      )}
                    </div>
                  </div>
                )}

              {/* Pending: no caregiver yet */}
              {status === "Pending" && (
                <div className="mb-4 flex items-center gap-4 rounded-2xl bg-blue-50 p-3 ring-1 ring-blue-100">
                  <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
                    ⏳
                  </div>
                  <div>
                    <p className="font-bold text-blue-800">
                      Waiting for a caregiver
                    </p>
                    <p className="text-sm text-blue-600">
                      Your request has been sent. You'll be notified once a
                      caregiver accepts.
                    </p>
                  </div>
                </div>
              )}

              {/* Request details (aligned with request form) */}
              <div className="mb-2">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Your request details
                </p>
              </div>
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Care category
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {request.careCategory}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Service model
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-snug text-slate-800">
                    {request.serviceModelLabel}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Day category (shift length)
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {request.dayCategory}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Dates
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {formatDateRange(request.startDate, request.endDate)}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Budget (per day)
                  </p>
                  <p className="mt-1 font-semibold text-emerald-700">
                    {request.priceRange}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Location
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {request.locationLabel}
                  </p>
                </div>
                {request.genderPreference && (
                  <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100 sm:col-span-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Caregiver gender preference
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {request.genderPreference}
                    </p>
                  </div>
                )}
                {request.medicalSpecialties && (
                  <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100 sm:col-span-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Medical / specialty needs
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {request.medicalSpecialties}
                    </p>
                  </div>
                )}
                {request.skillLabels.length > 0 && (
                  <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100 sm:col-span-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Skills needed
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {request.skillLabels.map((label) => (
                        <span
                          key={label}
                          className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons per status */}

              {/* PENDING */}
              {status === "Pending" && (
                <button
                  type="button"
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border-2 border-slate-200 px-6 py-3 text-sm font-bold text-slate-400"
                >
                  Waiting for Caregiver Response...
                </button>
              )}

              {/* ACCEPTED */}
              {status === "Accepted" && (
                <div className="flex flex-col gap-3">
                  <Link
                    to={paymentUrl}
                    className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#1976D2] to-[#26C6DA] px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:scale-[1.01] hover:shadow-lg"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <rect
                        x="2"
                        y="5"
                        width="20"
                        height="14"
                        rx="2"
                        ry="2"
                        strokeWidth="2"
                      />
                      <line x1="2" y1="10" x2="22" y2="10" strokeWidth="2" />
                    </svg>
                    Make Upfront Payment
                    <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide">
                      Optional
                    </span>
                  </Link>
                  <Link
                    to={`/chat/${request.requestId}`}
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-700"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    Start a Chat
                  </Link>
                  <Link
                    to={reportIssueHref(request.requestId)}
                    className="flex items-center justify-center gap-2 rounded-xl border-2 border-red-200 px-6 py-3 text-sm font-bold text-red-500 transition-all hover:bg-red-50"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    Report an Issue
                  </Link>
                </div>
              )}

              {/* COMPLETED */}
              {status === "Completed" && (
                <div className="flex flex-col gap-3">
                  <Link
                    to={paymentUrl}
                    className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#1976D2] to-[#26C6DA] px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:scale-[1.01] hover:shadow-lg"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <rect
                        x="2"
                        y="5"
                        width="20"
                        height="14"
                        rx="2"
                        ry="2"
                        strokeWidth="2"
                      />
                      <line x1="2" y1="10" x2="22" y2="10" strokeWidth="2" />
                    </svg>
                    Make Final Payment
                  </Link>
                  <button
                    type="button"
                    disabled
                    title="Reviews are not available in the app yet."
                    className="flex cursor-not-allowed items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 px-6 py-3 text-sm font-bold text-slate-400"
                  >
                    Leave a Review (soon)
                  </button>
                  <Link
                    to={reportIssueHref(request.requestId)}
                    className="flex items-center justify-center gap-2 rounded-xl border-2 border-red-200 px-6 py-3 text-sm font-bold text-red-500 transition-all hover:bg-red-50"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    Report an Issue
                  </Link>
                </div>
              )}

              {/* DECLINED */}
              {status === "Declined" && (
                <Link
                  to="/dashboard/client"
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-50 px-6 py-3 text-sm font-bold text-blue-600 transition-all hover:bg-blue-100"
                >
                  Find Another Caregiver
                </Link>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}