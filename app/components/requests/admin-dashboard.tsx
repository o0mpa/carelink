import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import axiosInstance from "~/utils/axiosinstance";
import { clearAuth } from "~/utils/auth";

export function meta() {
  return [
    { title: "Admin Dashboard - CareLink" },
    { name: "description", content: "CareLink platform administration." },
  ];
}

type Caregiver = {
  caregiver_id: number;
  full_name: string;
  city: string;
  phone_number?: string;
  email?: string;
  approval_status: "Pending" | "Active" | "Rejected";
  created_at: string;
};

type Client = {
  client_id: number;
  full_name: string;
  city: string;
  phone_number?: string;
  email?: string;
  created_at: string;
};

type Report = {
  report_id: number;
  issue_text: string;
  status: "Pending" | "Reviewed" | "Resolved";
  created_at: string;
  request_id: number;
  care_category: string;
  start_date: string;
  end_date: string;
  client_name: string;
  client_phone?: string;
  client_email?: string;
};

const DOC_LABELS: { key: keyof CaregiverDetailDocs; label: string }[] = [
  { key: "education_docs", label: "Education documents" },
  { key: "certificates", label: "Certificates" },
  { key: "national_id", label: "National ID" },
  { key: "criminal_record", label: "Criminal record check" },
  { key: "references", label: "References" },
];

type CaregiverDetailDocs = {
  education_docs?: string | null;
  certificates?: string | null;
  national_id?: string | null;
  criminal_record?: string | null;
  references?: string | null;
};

type CaregiverDetail = Caregiver & CaregiverDetailDocs & Record<string, unknown>;

function formatDocPath(path: string | null | undefined): string {
  if (path == null || String(path).trim() === "") return "—";
  return String(path);
}

function safeDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function safeDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

function safeInitial(name: string | null | undefined): string {
  const normalized = String(name ?? "").trim();
  return normalized.length > 0 ? normalized.charAt(0).toUpperCase() : "?";
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState<"accounts" | "reports_documents">("accounts");
  const [accountsSub, setAccountsSub] = useState<"caregivers" | "clients">("caregivers");
  const [reportsSub, setReportsSub] = useState<"reports" | "documents">("reports");

  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [caregiverActionId, setCaregiverActionId] = useState<number | null>(null);
  const [reportActionId, setReportActionId] = useState<number | null>(null);

  const [docsExpandedId, setDocsExpandedId] = useState<number | null>(null);
  const [caregiverDetail, setCaregiverDetail] = useState<CaregiverDetail | null>(null);
  const [caregiverDetailId, setCaregiverDetailId] = useState<number | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const fetchListData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (mainTab === "accounts") {
        if (accountsSub === "caregivers") {
          const { data } = await axiosInstance.get("/admin/caregivers");
          setCaregivers(Array.isArray(data.caregivers) ? data.caregivers : []);
        } else {
          const { data } = await axiosInstance.get("/admin/clients");
          setClients(Array.isArray(data.clients) ? data.clients : []);
        }
      } else if (mainTab === "reports_documents") {
        if (reportsSub === "reports") {
          const { data } = await axiosInstance.get("/admin/reports");
          setReports(Array.isArray(data.reports) ? data.reports : []);
        } else {
          const { data } = await axiosInstance.get("/admin/caregivers");
          setCaregivers(Array.isArray(data.caregivers) ? data.caregivers : []);
        }
      }
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 403) {
        clearAuth();
        navigate("/login");
      } else {
        setError(
          "Failed to load dashboard data. Ensure your backend is running and you are signed in as an Admin.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [mainTab, accountsSub, reportsSub, navigate]);

  useEffect(() => {
    void fetchListData();
  }, [fetchListData]);

  useEffect(() => {
    if (mainTab !== "reports_documents" || reportsSub !== "documents") {
      setDocsExpandedId(null);
      setCaregiverDetail(null);
      setCaregiverDetailId(null);
      setDetailError(null);
    }
  }, [mainTab, reportsSub]);

  const loadCaregiverDetail = async (caregiverId: number) => {
    setDetailLoading(true);
    setDetailError(null);
    try {
      const { data } = await axiosInstance.get(`/admin/caregivers/${caregiverId}`);
      const cg = data.caregiver as CaregiverDetail | undefined;
      if (!cg) {
        setDetailError("No caregiver data returned.");
        setCaregiverDetail(null);
        setCaregiverDetailId(null);
      } else {
        setCaregiverDetail(cg);
        setCaregiverDetailId(caregiverId);
      }
    } catch {
      setDetailError("Could not load caregiver profile for document review.");
      setCaregiverDetail(null);
      setCaregiverDetailId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleDocsRow = (caregiverId: number) => {
    if (docsExpandedId === caregiverId) {
      setDocsExpandedId(null);
      setCaregiverDetail(null);
      setCaregiverDetailId(null);
      return;
    }
    setDocsExpandedId(caregiverId);
    setCaregiverDetail(null);
    setCaregiverDetailId(null);
    void loadCaregiverDetail(caregiverId);
  };

  const handleReviewAction = async (caregiverId: number, action: "Approve" | "Reject") => {
    setCaregiverActionId(caregiverId);
    try {
      await axiosInstance.put(`/admin/caregivers/${caregiverId}/review`, { action });
      await fetchListData();
      if (docsExpandedId === caregiverId) {
        void loadCaregiverDetail(caregiverId);
      }
    } catch {
      alert(`Failed to ${action.toLowerCase()} caregiver.`);
    } finally {
      setCaregiverActionId(null);
    }
  };

  const handleReportStatus = async (reportId: number, status: "Reviewed" | "Resolved") => {
    setReportActionId(reportId);
    try {
      await axiosInstance.put(`/admin/reports/${reportId}`, { status });
      await fetchListData();
    } catch {
      alert(`Failed to mark report as ${status.toLowerCase()}.`);
    } finally {
      setReportActionId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch {
      // ignore
    } finally {
      clearAuth();
      navigate("/login");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 font-sans">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-slate-300/30 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-blue-300/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-200/20 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/70 px-6 py-4 shadow-sm backdrop-blur-xl md:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-slate-800 to-slate-900 text-white shadow-md ring-1 ring-slate-700">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-800">CareLink Admin</h1>
          </div>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex items-center gap-2 rounded-xl border-2 border-red-100 bg-red-50 px-5 py-2 text-sm font-bold text-red-600 transition-all hover:bg-red-100 active:scale-95"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            Manage{" "}
            <span className="font-semibold text-slate-800">accounts</span>, review{" "}
            <span className="font-semibold text-slate-800">reports</span>, and inspect caregiver{" "}
            <span className="font-semibold text-slate-800">documents</span>.
          </p>
          <Link
            to="/"
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
          >
            ← Back to site
          </Link>
        </div>

        <div className="mb-6 flex gap-2 rounded-2xl bg-white/80 p-1.5 shadow-sm ring-1 ring-slate-200 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setMainTab("accounts")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all duration-200 ${
              mainTab === "accounts"
                ? "bg-slate-800 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            Accounts
          </button>
          <button
            type="button"
            onClick={() => setMainTab("reports_documents")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all duration-200 ${
              mainTab === "reports_documents"
                ? "bg-slate-800 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            Reports & documents
          </button>
        </div>

        {mainTab === "accounts" && (
          <div className="mb-8 flex gap-2 rounded-2xl bg-white/60 p-1.5 shadow-sm ring-1 ring-slate-200/80">
            {(
              [
                { id: "caregivers" as const, label: "Caregiver applications" },
                { id: "clients" as const, label: "Client accounts" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setAccountsSub(tab.id)}
                className={`flex flex-1 items-center justify-center rounded-xl py-3 text-sm font-bold transition-all ${
                  accountsSub === tab.id
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {mainTab === "reports_documents" && (
          <div className="mb-8 flex gap-2 rounded-2xl bg-white/60 p-1.5 shadow-sm ring-1 ring-slate-200/80">
            {(
              [
                { id: "reports" as const, label: "Issue reports" },
                { id: "documents" as const, label: "Caregiver documents" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setReportsSub(tab.id)}
                className={`flex flex-1 items-center justify-center rounded-xl py-3 text-sm font-bold transition-all ${
                  reportsSub === tab.id
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="mb-6 animate-in fade-in rounded-2xl border-2 border-red-200 bg-red-50 p-5 text-center text-sm font-bold text-red-700 slide-in-from-top-2">
            {error}
          </div>
        )}

        <div className="min-h-125 rounded-4xl bg-white/95 p-8 shadow-xl ring-1 ring-slate-200 backdrop-blur-xl">
          {loading ? (
            <div className="flex h-full min-h-100 flex-col items-center justify-center space-y-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
              <p className="animate-pulse text-sm font-bold text-slate-400">Fetching records…</p>
            </div>
          ) : (
            <>
              {mainTab === "accounts" && accountsSub === "caregivers" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                    <h2 className="text-2xl font-extrabold text-slate-800">Caregiver applications</h2>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                      {caregivers.length} total
                    </span>
                  </div>

                  {caregivers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                      <p className="font-bold">No caregivers found.</p>
                    </div>
                  ) : (
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                      {caregivers.map((cg) => (
                        <div
                          key={cg.caregiver_id}
                          className="flex flex-col justify-between rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
                        >
                          <div>
                            <div className="mb-4 flex items-start justify-between">
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-blue-500 text-lg font-bold text-white shadow-sm">
                                {safeInitial(cg.full_name)}
                              </div>
                              <span
                                className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                                  cg.approval_status === "Pending"
                                    ? "bg-amber-100 text-amber-700 ring-1 ring-amber-200"
                                    : cg.approval_status === "Active"
                                      ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                                      : "bg-red-100 text-red-700 ring-1 ring-red-200"
                                }`}
                              >
                                {cg.approval_status}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">{cg.full_name}</h3>
                            <p className="mt-1 text-sm font-semibold text-slate-500">📍 {cg.city}</p>
                            {cg.email && (
                              <p className="mt-1 truncate text-xs text-slate-600">{cg.email}</p>
                            )}
                            {cg.phone_number && (
                              <p className="mt-0.5 text-xs text-slate-600">{cg.phone_number}</p>
                            )}
                            <p className="mt-1 text-xs text-slate-400">
                              Applied: {safeDate(cg.created_at)}
                            </p>
                          </div>

                          {cg.approval_status === "Pending" && (
                            <div className="mt-6 flex gap-2 border-t border-slate-100 pt-4">
                              <button
                                type="button"
                                onClick={() => void handleReviewAction(cg.caregiver_id, "Approve")}
                                disabled={caregiverActionId === cg.caregiver_id}
                                className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-600 hover:shadow active:scale-95 disabled:opacity-50"
                              >
                                {caregiverActionId === cg.caregiver_id ? "Processing…" : "Approve"}
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleReviewAction(cg.caregiver_id, "Reject")}
                                disabled={caregiverActionId === cg.caregiver_id}
                                className="flex-1 rounded-xl border-2 border-red-100 bg-red-50 py-2.5 text-xs font-bold text-red-600 transition-all hover:bg-red-100 active:scale-95 disabled:opacity-50"
                              >
                                {caregiverActionId === cg.caregiver_id ? "…" : "Reject"}
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {mainTab === "accounts" && accountsSub === "clients" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                    <h2 className="text-2xl font-extrabold text-slate-800">Client accounts</h2>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                      {clients.length} total
                    </span>
                  </div>

                  {clients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                      <p className="font-bold">No clients found.</p>
                    </div>
                  ) : (
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                      {clients.map((client) => (
                        <div
                          key={client.client_id}
                          className="flex flex-col gap-3 rounded-3xl border-2 border-slate-100 bg-slate-50/50 p-5 transition-colors hover:border-blue-200"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600">
                              {safeInitial(client.full_name)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-slate-900">{client.full_name}</h3>
                              <p className="text-xs font-semibold text-slate-500">📍 {client.city}</p>
                            </div>
                          </div>
                          {client.email && (
                            <p className="truncate text-xs text-slate-700">{client.email}</p>
                          )}
                          {client.phone_number && (
                            <p className="text-xs text-slate-700">{client.phone_number}</p>
                          )}
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Joined: {safeDate(client.created_at)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {mainTab === "reports_documents" && reportsSub === "reports" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                    <h2 className="text-2xl font-extrabold text-slate-800">Issue reports</h2>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                      {reports.length} total
                    </span>
                  </div>

                  {reports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                      <p className="font-bold">No reports yet.</p>
                    </div>
                  ) : (
                    <div className="grid gap-5 lg:grid-cols-2">
                      {reports.map((report) => (
                        <div
                          key={report.report_id}
                          className="flex flex-col justify-between rounded-3xl border-2 border-red-100 bg-red-50/30 p-6 shadow-sm"
                        >
                          <div>
                            <div className="mb-3 flex items-start justify-between border-b border-red-100 pb-3">
                              <div className="min-w-0 pr-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-red-400">
                                  Report #{report.report_id}
                                </p>
                                <p className="mt-0.5 text-sm font-bold text-slate-800">
                                  Client: {report.client_name}
                                </p>
                                <p className="mt-1 text-xs text-slate-600">
                                  Request #{report.request_id} · {report.care_category}
                                </p>
                                <p className="mt-0.5 text-xs text-slate-500">
                                  {safeDate(report.start_date)} → {safeDate(report.end_date)}
                                </p>
                                {report.client_phone && (
                                  <p className="mt-1 text-xs text-slate-600">{report.client_phone}</p>
                                )}
                                {report.client_email && (
                                  <p className="truncate text-xs text-slate-600">{report.client_email}</p>
                                )}
                              </div>
                              <span
                                className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                                  report.status === "Pending"
                                    ? "bg-amber-100 text-amber-700 ring-1 ring-amber-200"
                                    : report.status === "Reviewed"
                                      ? "bg-blue-100 text-blue-700 ring-1 ring-blue-200"
                                      : "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                                }`}
                              >
                                {report.status}
                              </span>
                            </div>
                            <div className="rounded-xl bg-white p-4 ring-1 ring-slate-100">
                              <p className="text-sm font-medium leading-relaxed text-slate-700">
                                {report.issue_text}
                              </p>
                            </div>
                            <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Filed: {safeDateTime(report.created_at)}
                            </p>
                          </div>

                          {report.status !== "Resolved" && (
                            <div className="mt-4 flex flex-col gap-2 border-t border-red-100 pt-4 sm:flex-row">
                              {report.status === "Pending" && (
                                <button
                                  type="button"
                                  onClick={() => void handleReportStatus(report.report_id, "Reviewed")}
                                  disabled={reportActionId === report.report_id}
                                  className="flex-1 rounded-xl border-2 border-slate-200 bg-white py-3 text-xs font-bold text-slate-800 shadow transition-all hover:bg-slate-50 active:scale-[0.98] disabled:opacity-50"
                                >
                                  {reportActionId === report.report_id ? "Updating…" : "Mark reviewed"}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => void handleReportStatus(report.report_id, "Resolved")}
                                disabled={reportActionId === report.report_id}
                                className="flex-1 rounded-xl bg-slate-800 py-3 text-xs font-bold text-white shadow transition-all hover:bg-slate-700 active:scale-[0.98] disabled:opacity-50"
                              >
                                {reportActionId === report.report_id ? "Updating…" : "Mark resolved"}
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {mainTab === "reports_documents" && reportsSub === "documents" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="mb-6 border-b border-slate-100 pb-4">
                    <h2 className="text-2xl font-extrabold text-slate-800">Caregiver documents</h2>
                    <p className="mt-2 text-sm text-slate-600">
                      Open a caregiver to see uploaded file paths from registration (
                      <code className="rounded bg-slate-100 px-1 text-xs">GET /admin/caregivers/:id</code>
                      ). Approve or reject from the <span className="font-semibold">Accounts</span> tab.
                    </p>
                  </div>

                  {caregivers.length === 0 ? (
                    <div className="py-16 text-center text-slate-400">
                      <p className="font-bold">No caregivers found.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {caregivers.map((cg) => (
                        <div
                          key={`doc-${cg.caregiver_id}`}
                          className="overflow-hidden rounded-2xl border-2 border-slate-100 bg-white shadow-sm"
                        >
                          <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <h3 className="font-bold text-slate-900">{cg.full_name}</h3>
                              <p className="text-xs text-slate-500">
                                ID {cg.caregiver_id} · {cg.city} · {cg.approval_status}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleDocsRow(cg.caregiver_id)}
                              className="rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-700"
                            >
                              {docsExpandedId === cg.caregiver_id ? "Hide files" : "View uploaded paths"}
                            </button>
                          </div>
                          {docsExpandedId === cg.caregiver_id && (
                            <div className="border-t border-slate-100 bg-slate-50/80 p-5">
                              {detailLoading && (
                                <p className="text-sm font-semibold text-slate-500">Loading profile…</p>
                              )}
                              {detailError && (
                                <p className="text-sm font-bold text-red-600">{detailError}</p>
                              )}
                              {!detailLoading &&
                                !detailError &&
                                caregiverDetail &&
                                caregiverDetailId === cg.caregiver_id && (
                                <dl className="grid gap-3 sm:grid-cols-2">
                                  {DOC_LABELS.map(({ key, label }) => (
                                    <div key={key} className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
                                      <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        {label}
                                      </dt>
                                      <dd className="mt-1 break-all font-mono text-xs text-slate-800">
                                        {formatDocPath(
                                          caregiverDetail[key] as string | null | undefined,
                                        )}
                                      </dd>
                                    </div>
                                  ))}
                                </dl>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
