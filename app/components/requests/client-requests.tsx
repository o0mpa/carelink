import { useEffect, useState } from "react";
import { Link } from "react-router";
import { apiUrl } from "~/utils/api";
import { getAuthHeaders } from "~/utils/auth";

export function meta() {
  return [
    { title: "Your Requests - CareLink" },
    {
      name: "description",
      content: "Track the status of your caregiver job offers.",
    },
  ];
}

type ClientRequest = {
  id: string | number;
  requestId?: number;
  caregiverId?: number;
  caregiverName: string;
  serviceType: string;
  date: string;
  duration: string;
  status: "Pending" | "Accepted" | "Declined";
  price: string;
};

type BackendCurrentRequest = {
  request_id: number;
  care_category: string;
  day_category: string;
  min_compensation: number;
  max_compensation: number;
  start_date: string;
  end_date: string;
  status: "Pending" | "Accepted" | "Declined" | "Completed" | "Paid";
  caregiver_id: number | null;
  caregiver_name: string | null;
};

const DAY_CATEGORY_LABEL: Record<string, string> = {
  A: "3 Hours",
  B: "6 Hours",
  C: "12 Hours",
  D: "24 Hours",
};

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export default function ClientRequests() {
  const [myRequests, setMyRequests] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCurrentRequest = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(apiUrl("/api/requests/clients/current-request"), {
          headers: getAuthHeaders(),
        });

        if (response.status === 404) {
          setMyRequests([]);
          return;
        }

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data?.message || "Failed to load your requests.");
        }

        const current: BackendCurrentRequest | null = data?.requests ?? null;
        if (!current) {
          setMyRequests([]);
          return;
        }

        const mapped: ClientRequest = {
          id: current.request_id,
          requestId: current.request_id,
          caregiverId: current.caregiver_id ?? undefined,
          caregiverName:
            current.caregiver_name ||
            "Caregiver (awaiting acceptance)",
          serviceType: current.care_category || "Care Service",
          date: `${formatDate(current.start_date)}${current.end_date && current.end_date !== current.start_date ? ` - ${formatDate(current.end_date)}` : ""}`,
          duration: DAY_CATEGORY_LABEL[current.day_category] ?? current.day_category ?? "Not specified",
          status: current.status === "Paid" || current.status === "Completed" ? "Accepted" : current.status,
          price: `E£ ${current.min_compensation} - E£ ${current.max_compensation}`,
        };

        setMyRequests([mapped]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load your requests.");
        setMyRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentRequest();
  }, []);

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
            Your Job Requests
          </h2>
          <p className="mt-3 text-lg text-gray-600">
            Track the status of the offers you have sent to caregivers.
          </p>
          <div className="mt-4 h-1.5 w-20 bg-blue-600" />
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}

        {loading && (
          <div className="mb-5 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow ring-1 ring-slate-100">
            Loading your latest request...
          </div>
        )}

        <div className="grid gap-6">
          {myRequests.length === 0 && (
            <div className="rounded-3xl bg-white p-8 text-center text-sm font-semibold text-slate-500 shadow-lg ring-1 ring-slate-100">
              No selected caregiver requests yet. Start by submitting a request and confirming a caregiver match.
            </div>
          )}

          {myRequests.map((req: ClientRequest) => (
            <div
              key={req.id}
              className={`group flex flex-col items-start gap-6 rounded-4xl bg-white p-6 shadow-lg ring-1 transition-all hover:-translate-y-1 sm:flex-row sm:items-center sm:p-8 ${
                req.status === "Accepted"
                  ? "ring-emerald-200 hover:shadow-emerald-100"
                  : req.status === "Pending"
                    ? "ring-blue-200 hover:shadow-blue-100"
                    : "opacity-75 ring-red-100 hover:shadow-red-50"
              }`}
            >
              {/* Profile Icon */}
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl text-xl font-bold text-white shadow-md ${
                  req.status === "Accepted"
                    ? "bg-emerald-500"
                    : req.status === "Pending"
                      ? "bg-blue-500"
                      : "bg-gray-400"
                }`}
              >
                {req.caregiverName.charAt(0)}
              </div>

              {/* Request Details */}
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold text-slate-800">
                    {req.caregiverName}
                  </h3>

                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                      req.status === "Accepted"
                        ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300"
                        : req.status === "Pending"
                          ? "bg-blue-100 text-blue-700 ring-1 ring-blue-300"
                          : "bg-red-50 text-red-600 ring-1 ring-red-200"
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
              </div>

              {/* Action Buttons */}
              <div className="flex w-full shrink-0 flex-col sm:w-auto">
                {req.status === "Accepted" && (
                  <Link
                    to={req.requestId ? `/payments?requestId=${req.requestId}` : "/dashboard/client"}
                    className="w-full rounded-xl bg-emerald-600 px-6 py-3 text-center text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-700"
                  >
                    Pay & Confirm
                  </Link>
                )}
                
                {req.status === "Pending" && (
                  <button
                    type="button"
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border-2 border-slate-200 px-6 py-3 text-sm font-bold text-slate-400"
                    title="Waiting for caregiver response"
                  >
                    Waiting For Caregiver
                  </button>
                )}

                {req.status === "Declined" && (
                  <Link
                    to={`/match-results${req.requestId ? `?requestId=${req.requestId}` : ""}`}
                    className="w-full rounded-xl bg-blue-50 px-6 py-3 text-center text-sm font-bold text-blue-600 transition-all hover:bg-blue-100"
                  >
                    Find Another
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}