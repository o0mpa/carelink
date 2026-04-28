import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { apiUrl } from "~/utils/api";
import { getAuthHeaders } from "~/utils/auth";

export function meta() {
  return [
    { title: "Matching Caregivers - CareLink" },
    {
      name: "description",
      content: "View caregivers that match your specific care requirements.",
    },
  ];
}

type Caregiver = {
  caregiver_id: number;
  full_name?: string;
  age?: number;
  gender?: string;
  city?: string;
  area?: string;
  years_experience?: number | string;
  skills?: string[] | string;
  day_rate_a?: number;
  day_rate_b?: number;
  day_rate_c?: number;
  day_rate_d?: number;
};

type RequestShape = {
  request_id: number;
  care_category?: string;
  day_category?: string;
  start_date?: string;
  end_date?: string;
};

const DAY_CATEGORY_LABEL: Record<string, string> = {
  A: "3 Hours",
  B: "6 Hours",
  C: "12 Hours",
  D: "24 Hours",
};

const dayRateByCategory = (caregiver: Caregiver, dayCategory?: string) => {
  if (dayCategory === "A") return caregiver.day_rate_a;
  if (dayCategory === "B") return caregiver.day_rate_b;
  if (dayCategory === "C") return caregiver.day_rate_c;
  if (dayCategory === "D") return caregiver.day_rate_d;
  return caregiver.day_rate_b ?? caregiver.day_rate_a ?? caregiver.day_rate_c ?? caregiver.day_rate_d;
};

const parseSkills = (skills: Caregiver["skills"]): string[] => {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills;
  try {
    const parsed = JSON.parse(skills);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function MatchingResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get("requestId");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submittingCaregiverId, setSubmittingCaregiverId] = useState<number | null>(null);
  const [requestData, setRequestData] = useState<RequestShape | null>(null);
  const [matchedCaregivers, setMatchedCaregivers] = useState<Caregiver[]>([]);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      setError("");
      try {
        let resolvedRequestId = requestId;
        if (!resolvedRequestId) {
          const currentReqRes = await fetch(apiUrl("/api/requests/clients/current-request"), {
            headers: getAuthHeaders(),
          });
          const currentReqData = await currentReqRes.json().catch(() => ({}));
          if (currentReqRes.ok && currentReqData?.requests?.request_id) {
            resolvedRequestId = String(currentReqData.requests.request_id);
          }
        }

        if (!resolvedRequestId) {
          throw new Error("No request selected. Please submit a request first.");
        }

        const response = await fetch(apiUrl(`/api/requests/${resolvedRequestId}/match`), {
          headers: getAuthHeaders(),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data?.message || "Failed to load matching caregivers.");
        }
        setRequestData(data?.request ?? null);
        setMatchedCaregivers(Array.isArray(data?.caregivers) ? data.caregivers : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load matching caregivers.");
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [requestId]);

  const durationLabel = useMemo(() => {
    const dayCategory = requestData?.day_category ?? "";
    return DAY_CATEGORY_LABEL[dayCategory] ?? "Not specified";
  }, [requestData]);

  const handleConfirm = async (caregiver: Caregiver) => {
    if (!requestData?.request_id) return;
    setSubmittingCaregiverId(caregiver.caregiver_id);
    // Backend currently supports creating/matching requests and caregiver accept/decline flow,
    // but does not expose a "select matched caregiver" endpoint.
    navigate(`/requests/client?requestId=${requestData.request_id}`);
    setSubmittingCaregiverId(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-100 via-white to-emerald-100 py-12">
      <main className="container mx-auto px-4 sm:px-6 md:px-10">
        <div className="mx-auto max-w-5xl">
          {/* Header Section */}
          <div className="mb-8 flex flex-col items-center justify-between gap-4 rounded-3xl bg-white/90 p-6 shadow-md ring-2 ring-blue-100 backdrop-blur-md sm:flex-row sm:p-8">
            <div>
              <h1 className="text-2xl font-extrabold text-blue-900 sm:text-3xl">
                Your Top Matches
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                We found <span className="font-bold text-blue-600">{matchedCaregivers.length}</span> caregivers available in your area who match your medical requirements.
              </p>
            </div>
            <Link
              to="/request-care"
              className="rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-100"
            >
              Modify Search
            </Link>
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          )}

          {loading && (
            <div className="rounded-2xl bg-white p-8 text-center text-sm font-semibold text-gray-600 shadow-md ring-1 ring-gray-200">
              Loading matching caregivers...
            </div>
          )}

          {/* Caregiver Cards List */}
          {!loading && !error && (
            <div className="flex flex-col gap-6">
              {matchedCaregivers.map((caregiver) => {
                const skills = parseSkills(caregiver.skills);
                const rate = dayRateByCategory(caregiver, requestData?.day_category);
                return (
              <div
                key={caregiver.caregiver_id}
                className="flex flex-col gap-6 rounded-3xl border-2 border-gray-100 bg-white p-6 shadow-lg transition-all hover:border-emerald-200 hover:shadow-xl sm:flex-row sm:items-center sm:p-8"
              >
                {/* Profile Pic Placeholder */}
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-2xl font-bold text-white shadow-md">
                  {(caregiver.full_name || "C").charAt(0)}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900">
                      {caregiver.full_name || `Caregiver #${caregiver.caregiver_id}`}
                    </h2>
                  </div>
                  <p className="font-semibold text-emerald-700">
                    {caregiver.city && caregiver.area ? `${caregiver.area}, ${caregiver.city}` : "Caregiver available in your area"}
                  </p>
                  
                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1 font-medium">
                      <span className="text-gray-400">👤</span> {caregiver.gender || "Not specified"}
                    </div>
                    <div className="flex items-center gap-1 font-medium">
                      <span className="text-gray-400">💼</span> {caregiver.years_experience ?? "N/A"} Years Exp.
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="mb-1 text-xs font-bold uppercase text-gray-500">
                      Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(skills.length > 0 ? skills : ["General Care"]).map((specialty: string, index: number) => (
                        <span
                          key={index}
                          className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Column */}
                <div className="flex shrink-0 flex-col items-start justify-center border-t-2 border-gray-100 pt-4 sm:items-end sm:border-l-2 sm:border-t-0 sm:pl-6 sm:pt-0">
                  <p className="mb-4 text-lg font-black text-emerald-700">
                    {rate ? `E£ ${rate} / ${durationLabel}` : "Rate unavailable"}
                  </p>
                  
                  <button
                    type="button"
                    onClick={() => void handleConfirm(caregiver)}
                    disabled={submittingCaregiverId === caregiver.caregiver_id}
                    className="w-full rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-md transition-all hover:scale-[1.02] hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-70 sm:w-auto"
                  >
                    {submittingCaregiverId === caregiver.caregiver_id ? "Confirming..." : "Confirm Caregiver"}
                  </button>
                  
                  <span className="mt-3 w-full text-center text-sm font-semibold text-gray-500 sm:text-right">
                    Your request remains pending until a caregiver accepts.
                  </span>
                </div>
              </div>
                );
              })}
              {matchedCaregivers.length === 0 && (
                <div className="rounded-2xl bg-white p-8 text-center text-sm font-semibold text-gray-600 shadow-md ring-1 ring-gray-200">
                  No caregivers matched this request yet. Try modifying your criteria.
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}