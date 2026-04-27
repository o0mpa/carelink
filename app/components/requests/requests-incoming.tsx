import { useState, useEffect } from "react";
import { Link } from "react-router";
import axiosInstance from "~/utils/axiosinstance"; //  

// ── Types ──────────────────────────────────────────────────────────────────────
interface IncomingRequest {
    request_id: number;
    service_type: string;
    day_category: string;           // "A" | "B" | "C" | "D"
    min_compensation: number;
    max_compensation: number;
    start_date: string;             // "2026-04-05"
    end_date: string;
    care_category: string;
    skills_needed: string[];
    medical_specialties_needed: string | null;
    city: string;
    area: string;
    status: string;
    client_name: string;
    age: number;
    gender: string;
}

// Shape returned by GET /requests/:requestId/details (getRequestDetailsForCaregiver)
interface ClientDetail {
    request_id: number;
    service_type: string;
    day_category: string;
    gender_preference: string | null;
    min_compensation: number;
    max_compensation: number;
    start_date: string;
    end_date: string;
    care_category: string;
    skills_needed: string | string[];
    medical_specialties_needed: string | null;
    city: string;
    area: string;
    status: string;
    client_id: number;
    client_name: string;
    age: number;
    gender: string;
    client_city: string;
    client_area: string;
}

interface BookedDate {
    booked_date: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const MONTH_NAMES = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
];

const DAY_CATEGORY_LABEL: Record<string, string> = {
    A: "3 Hours",
    B: "6 Hours",
    C: "12 Hours",
    D: "24 Hours",
};

const parseDate = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return { year: y, month: m, day: d };
};

const formatDate = (iso: string) => {
    const { year, month, day } = parseDate(iso);
    return `${MONTH_NAMES[month - 1]} ${String(day).padStart(2, "0")}, ${year}`;
};

const parseSkills = (s: string | string[]): string[] => {
    if (Array.isArray(s)) return s;
    try { return JSON.parse(s); } catch { return s ? [s] : []; }
};

// ── MOCK DATA ──────────────────────────────────────────────────────────────────
// const MOCK_REQUESTS: IncomingRequest[] = [
//     {
//         request_id: 101, service_type: "Home Care", day_category: "B",
//         min_compensation: 300, max_compensation: 500,
//         start_date: "2026-04-28", end_date: "2026-04-28",
//         care_category: "Elderly Care",
//         skills_needed: ["First Aid", "Mobility Assistance"],
//         medical_specialties_needed: "Cardiology",
//         city: "Cairo", area: "Maadi", status: "Pending",
//         client_name: "Layla Hassan", age: 72, gender: "Female",
//     },
//     {
//         request_id: 102, service_type: "Medical Care", day_category: "C",
//         min_compensation: 600, max_compensation: 900,
//         start_date: "2026-05-01", end_date: "2026-05-03",
//         care_category: "Post-Surgery",
//         skills_needed: ["Wound Care", "IV Administration", "Vital Signs Monitoring"],
//         medical_specialties_needed: null,
//         city: "Alexandria", area: "Smouha", status: "Pending",
//         client_name: "Omar Naguib", age: 58, gender: "Male",
//     },
//     {
//         request_id: 103, service_type: "Companion Care", day_category: "A",
//         min_compensation: 150, max_compensation: 250,
//         start_date: "2026-04-30", end_date: "2026-04-30",   // conflicts with booked date
//         care_category: "Mental Health",
//         skills_needed: ["Communication", "Dementia Care"],
//         medical_specialties_needed: null,
//         city: "Cairo", area: "Heliopolis", status: "Pending",
//         client_name: "Fatma Khalil", age: 80, gender: "Female",
//     },
// ];

// // Mirrors what getRequestDetailsForCaregiver returns — includes gender_preference + client_id
// const MOCK_DETAILS: Record<number, ClientDetail> = {
//     101: {
//         request_id: 101, service_type: "Home Care", day_category: "B",
//         gender_preference: "Female", min_compensation: 300, max_compensation: 500,
//         start_date: "2026-04-28", end_date: "2026-04-28", care_category: "Elderly Care",
//         skills_needed: ["First Aid", "Mobility Assistance"],
//         medical_specialties_needed: "Cardiology",
//         city: "Cairo", area: "Maadi", status: "Pending",
//         client_id: 1, client_name: "Layla Hassan", age: 72, gender: "Female",
//         client_city: "Cairo", client_area: "Maadi",
//     },
//     102: {
//         request_id: 102, service_type: "Medical Care", day_category: "C",
//         gender_preference: null, min_compensation: 600, max_compensation: 900,
//         start_date: "2026-05-01", end_date: "2026-05-03", care_category: "Post-Surgery",
//         skills_needed: ["Wound Care", "IV Administration", "Vital Signs Monitoring"],
//         medical_specialties_needed: null,
//         city: "Alexandria", area: "Smouha", status: "Pending",
//         client_id: 2, client_name: "Omar Naguib", age: 58, gender: "Male",
//         client_city: "Alexandria", client_area: "Smouha",
//     },
//     103: {
//         request_id: 103, service_type: "Companion Care", day_category: "A",
//         gender_preference: "Female", min_compensation: 150, max_compensation: 250,
//         start_date: "2026-04-30", end_date: "2026-04-30", care_category: "Mental Health",
//         skills_needed: ["Communication", "Dementia Care"],
//         medical_specialties_needed: null,
//         city: "Cairo", area: "Heliopolis", status: "Pending",
//         client_id: 3, client_name: "Fatma Khalil", age: 80, gender: "Female",
//         client_city: "Cairo", client_area: "Heliopolis",
//     },
// };

// const MOCK_BOOKED_DATES: string[] = [
//     "2026-04-25", "2026-04-26", "2026-04-30", "2026-05-05", "2026-05-06",
// ];
// ── END MOCK DATA ──────────────────────────────────────────────────────────────

// ── Sub-components ─────────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h3 className="border-b border-slate-100 pb-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            {children}
        </h3>
    );
}

function InfoTile({ label, value, icon, className = "" }: {
    label: string; value: string; icon: string; className?: string;
}) {
    return (
        <div className={`rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100 ${className}`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{icon} {label}</p>
            <p className="mt-1 text-sm font-bold text-slate-700">{value || "—"}</p>
        </div>
    );
}

// ── Client Detail Modal ────────────────────────────────────────────────────────
function ClientDetailModal({
    detail, onClose, onAccept, onDecline, isActing, conflict,
}: {
    detail: ClientDetail;
    onClose: () => void;
    onAccept: () => void;
    onDecline: () => void;
    isActing: boolean;
    conflict: boolean;
}) {
    const skills = parseSkills(detail.skills_needed);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ backdropFilter: "blur(6px)", background: "rgba(15,23,42,0.45)" }}
            onClick={onClose}
        >
            <div
                className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2.5rem] bg-white shadow-2xl ring-1 ring-blue-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    className="flex items-center gap-5 rounded-t-[2.5rem] px-8 pb-6 pt-8"
                    style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #059669 100%)" }}
                >
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl font-black text-white shadow-lg ring-2 ring-white/30">
                        {detail.client_name.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-extrabold text-white">{detail.client_name}</h2>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className="rounded-lg bg-white/20 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-white">
                                {detail.care_category}
                            </span>
                            <span className="rounded-lg bg-white/20 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-white">
                                {detail.service_type}
                            </span>
                            <span
                                className="text-xl leading-none"
                                style={{ color: detail.gender === "Female" ? "#fce7f3" : "#dbeafe" }}
                                title={detail.gender}
                            >
                                {detail.gender === "Female" ? "♀" : "♂"}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="space-y-6 px-8 py-7">

                    {/* Conflict warning */}
                    {conflict && (
                        <div className="flex items-center gap-3 rounded-2xl bg-red-50 px-5 py-4 ring-1 ring-red-200">
                            <span className="text-xl">⚠️</span>
                            <p className="text-sm font-bold text-red-600">
                                One or more dates in this request overlap with your existing bookings.
                            </p>
                        </div>
                    )}

                    {/* Client basics */}
                    <div>
                        <SectionTitle>Client Info</SectionTitle>
                        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
                            <InfoTile label="Age" value={`${detail.age} years`} icon="🎂" />
                            <InfoTile label="Gender" value={detail.gender} icon="👤" />
                            <InfoTile label="Location" value={`${detail.client_area}, ${detail.client_city}`} icon="📍" />
                        </div>
                    </div>

                    {/* Request details */}
                    <div>
                        <SectionTitle>Request Details</SectionTitle>
                        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
                            <InfoTile label="Duration / Day" value={DAY_CATEGORY_LABEL[detail.day_category] ?? detail.day_category} icon="⏱" />
                            <InfoTile label="Start Date" value={formatDate(detail.start_date)} icon="📅" />
                            <InfoTile
                                label="End Date"
                                value={detail.start_date !== detail.end_date ? formatDate(detail.end_date) : "Same day"}
                                icon="📅"
                            />
                            <InfoTile
                                label="Compensation"
                                value={`E£ ${detail.min_compensation} – E£ ${detail.max_compensation}`}
                                icon="💰"
                                className="col-span-2 sm:col-span-1"
                            />
                            {detail.gender_preference && (
                                <InfoTile label="Gender Preference" value={detail.gender_preference} icon="🔎" />
                            )}
                        </div>
                    </div>

                    {/* Skills */}
                    {skills.length > 0 && (
                        <div>
                            <SectionTitle>Required Skills</SectionTitle>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {skills.map((s) => (
                                    <span key={s} className="rounded-full bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-blue-200">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Medical specialty */}
                    {detail.medical_specialties_needed && (
                        <div>
                            <SectionTitle>Medical Specialty Required</SectionTitle>
                            <div className="mt-3">
                                <span className="rounded-full bg-purple-50 px-4 py-1.5 text-[11px] font-bold text-purple-700 ring-1 ring-purple-200">
                                    {detail.medical_specialties_needed}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onAccept}
                            disabled={conflict || isActing}
                            className={`flex-1 rounded-2xl px-6 py-4 text-[12px] font-black text-white shadow-lg transition-all active:scale-95 ${
                                conflict || isActing
                                    ? "cursor-not-allowed bg-slate-300 shadow-none"
                                    : "bg-emerald-500 hover:bg-emerald-600"
                            }`}
                        >
                            {isActing ? "..." : "ACCEPT REQUEST"}
                        </button>
                        <button
                            onClick={onDecline}
                            disabled={isActing}
                            className="flex-1 rounded-2xl border-2 border-slate-100 px-6 py-4 text-[12px] font-bold text-slate-500 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isActing ? "..." : "DECLINE"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function RequestsPage() {
    const today     = new Date();

    const [requests,       setRequests]       = useState<IncomingRequest[]>([]);
    const [bookedDates,    setBookedDates]    = useState<string[]>([]);
    const [loading,        setLoading]        = useState(true);
    const [error,          setError]          = useState<string | null>(null);
    const [actionLoading,  setActionLoading]  = useState<number | null>(null);
    const [selectedDetail, setSelectedDetail] = useState<ClientDetail | null>(null);
    const [detailLoading,  setDetailLoading]  = useState(false);

    const [calendarMonth, setCalendarMonth] = useState(today.getMonth() + 1);
    const [calendarYear,  setCalendarYear]  = useState(today.getFullYear());

    // ── Fetch ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); setError(null);
            try {
                // ── HARDCODED ────────────────────────────────────────────────
                // await new Promise(r => setTimeout(r, 600));
                // setRequests(MOCK_REQUESTS);
                // setBookedDates(MOCK_BOOKED_DATES);
                // ── END HARDCODED ────────────────────────────────────────────

                // ── REAL API ─────────────────────────────────────────────────
                const { data: reqData } = await axiosInstance.get("/requests/incoming");
                const incoming: IncomingRequest[] = (reqData.requests ?? []).map(
                    (r: IncomingRequest) => ({
                        ...r,
                        skills_needed: typeof r.skills_needed === "string"
                            ? JSON.parse(r.skills_needed) : r.skills_needed ?? [],
                    })
                );
                setRequests(incoming);
                if (reqData.caregiverId) {
                    const { data: availData } = await axiosInstance.get(
                        `/requests/caregiver-availability/${reqData.caregiverId}`
                    );
                    setBookedDates(
                        (availData.bookedDates ?? []).map((b: BookedDate | string) =>
                            typeof b === "string" ? b : b.booked_date
                        )
                    );
                }
                // ── END REAL API ─────────────────────────────────────────────
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Failed to load requests");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // ── Open detail modal ──────────────────────────────────────────────────────
    const handleOpenDetail = async (req: IncomingRequest) => {
        setDetailLoading(true);
        try {
            // ── HARDCODED ────────────────────────────────────────────────────
            // await new Promise(r => setTimeout(r, 300));
            // setSelectedDetail(MOCK_DETAILS[req.request_id] ?? null);
            // ── END HARDCODED ────────────────────────────────────────────────

            // ── REAL API ─────────────────────────────────────────────────────
            const { data } = await axiosInstance.get(`/requests/${req.request_id}/details`);
            setSelectedDetail(data.request);
            // ── END REAL API ─────────────────────────────────────────────────
        } catch {
            // Graceful fallback: build from list data we already have
            setSelectedDetail({
                ...req,
                gender_preference: null,
                client_id: 0,
                client_city: req.city,
                client_area: req.area,
                skills_needed: req.skills_needed,
            });
        } finally {
            setDetailLoading(false);
        }
    };

    // ── Calendar helpers ───────────────────────────────────────────────────────
    const isDayBooked = (day: number) => {
        const key = `${calendarYear}-${String(calendarMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return bookedDates.includes(key);
    };

    const isRequestConflict = (req: IncomingRequest) => {
        const start = new Date(req.start_date), end = new Date(req.end_date);
        const cursor = new Date(start);
        while (cursor <= end) {
            if (bookedDates.includes(cursor.toISOString().split("T")[0])) return true;
            cursor.setDate(cursor.getDate() + 1);
        }
        return false;
    };

    const isDetailConflict = (detail: ClientDetail) =>
        isRequestConflict({ ...detail, skills_needed: parseSkills(detail.skills_needed) } as IncomingRequest);

    const daysInMonth    = new Date(calendarYear, calendarMonth, 0).getDate();
    const firstDayOfWeek = new Date(calendarYear, calendarMonth - 1, 1).getDay();

    const goToPrevMonth = () => {
        if (calendarMonth === 1) { setCalendarMonth(12); setCalendarYear(y => y - 1); }
        else setCalendarMonth(m => m - 1);
    };
    const goToNextMonth = () => {
        if (calendarMonth === 12) { setCalendarMonth(1); setCalendarYear(y => y + 1); }
        else setCalendarMonth(m => m + 1);
    };

    // ── Accept ─────────────────────────────────────────────────────────────────
    const handleAccept = async (req: IncomingRequest) => {
        setActionLoading(req.request_id);
        try {
            // ── HARDCODED ────────────────────────────────────────────────────
            // await new Promise(r => setTimeout(r, 500));
            // const start = new Date(req.start_date), end = new Date(req.end_date);
            // const cursor = new Date(start); const newDates: string[] = [];
            // while (cursor <= end) { newDates.push(cursor.toISOString().split("T")[0]); cursor.setDate(cursor.getDate() + 1); }
            // setBookedDates(prev => [...new Set([...prev, ...newDates])]);
            // setRequests(prev => prev.filter(r => r.request_id !== req.request_id));
            // setSelectedDetail(null);
            // ── END HARDCODED ────────────────────────────────────────────────

            // ── REAL API ─────────────────────────────────────────────────────
            const { data } = await axiosInstance.post(`/requests/${req.request_id}/accept`);
            setBookedDates(prev => [...new Set([...prev, ...(data.bookedDates ?? [])])]);
            setRequests(prev => prev.filter(r => r.request_id !== req.request_id));
            setSelectedDetail(null);
            // ── END REAL API ─────────────────────────────────────────────────
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to accept request";
            alert(msg);
        } finally { setActionLoading(null); }
    };

    // ── Decline ────────────────────────────────────────────────────────────────
    const handleDecline = async (req: IncomingRequest) => {
        setActionLoading(req.request_id);
        try {
            // ── HARDCODED ────────────────────────────────────────────────────
            // await new Promise(r => setTimeout(r, 400));
            // setRequests(prev => prev.filter(r => r.request_id !== req.request_id));
            // setSelectedDetail(null);
            // ── END HARDCODED ────────────────────────────────────────────────

            // ── REAL API ─────────────────────────────────────────────────────
            await axiosInstance.post(`/requests/${req.request_id}/decline`);
            setRequests(prev => prev.filter(r => r.request_id !== req.request_id));
            setSelectedDetail(null);
            // ── END REAL API ─────────────────────────────────────────────────
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to decline request";
            alert(msg);
        } finally { setActionLoading(null); }
    };

    // ── Loading / Error ────────────────────────────────────────────────────────
    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
                <p className="text-sm font-semibold text-slate-500">Loading requests…</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="flex min-h-screen items-center justify-center bg-white">
            <div className="rounded-2xl bg-red-50 p-8 text-center ring-1 ring-red-200">
                <p className="text-sm font-bold text-red-600">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-4 rounded-xl bg-red-500 px-6 py-2 text-xs font-black text-white hover:bg-red-600">Retry</button>
            </div>
        </div>
    );

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="relative min-h-screen origin-top bg-white font-sans">
            {/* Background gradient */}
            <div
                className="pointer-events-none fixed inset-0 opacity-20"
                style={{ background: "linear-gradient(135deg, #0978ff 0%, #ffffff 50%, #008e5a 100%)" }}
            />

            {/* Client detail modal */}
            {selectedDetail && (
                <ClientDetailModal
                    detail={selectedDetail}
                    onClose={() => setSelectedDetail(null)}
                    onAccept={() => {
                        const req = requests.find(r => r.request_id === selectedDetail.request_id);
                        if (req) handleAccept(req);
                    }}
                    onDecline={() => {
                        const req = requests.find(r => r.request_id === selectedDetail.request_id);
                        if (req) handleDecline(req);
                    }}
                    isActing={actionLoading === selectedDetail.request_id}
                    conflict={isDetailConflict(selectedDetail)}
                />
            )}

            {/* Detail loading overlay */}
            {detailLoading && (
                <div
                    className="fixed inset-0 z-40 flex items-center justify-center"
                    style={{ backdropFilter: "blur(3px)", background: "rgba(15,23,42,0.2)" }}
                >
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
                </div>
            )}

            <main className="relative z-10 mx-auto max-w-7xl px-10 py-6">
                <div className="mb-2">
                    <Link
                        to="/dashboard/caregiver"
                        className="text-med mt-2 font-semibold text-gray-500 transition-colors hover:text-gray-800 hover:underline"
                    >
                        <span className="text-med">←</span> Return to Dashboarad
                    </Link>
                </div>

                <div className="mb-6">
                    <h2 className="bg-gradient-to-r from-emerald-700 to-emerald-500 bg-clip-text text-4xl font-extrabold text-transparent">
                        Incoming Requests
                    </h2>
                </div>

                <div className="grid gap-10 lg:grid-cols-12">

                    {/* ── Requests List ── */}
                    <div className="space-y-4 lg:col-span-8">

                        {requests.length === 0 && (
                            <div className="rounded-[2.5rem] bg-white p-12 text-center shadow-xl ring-1 ring-blue-100">
                                <p className="text-sm font-bold text-slate-400">No incoming requests at the moment.</p>
                            </div>
                        )}

                        {requests.map((req) => {
                            const conflict = isRequestConflict(req);
                            const isActing = actionLoading === req.request_id;
                            const skills   = parseSkills(req.skills_needed);

                            return (
                                <div
                                    key={req.request_id}
                                    className="group cursor-pointer rounded-[2.5rem] bg-white p-6 shadow-xl shadow-blue-900/5 ring-1 ring-blue-100 transition-all hover:ring-emerald-300"
                                    onClick={() => handleOpenDetail(req)}
                                    title="Click to view client details"
                                >
                                    <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                                        {/* Profile Icon */}
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-4xl bg-blue-600 shadow-lg">
                                            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>

                                        <div className="flex-1">
                                            {/* Name + badges */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="text-xl font-semibold text-slate-700">{req.client_name}</h4>
                                                <span className="rounded-lg bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                                                    {req.service_type}
                                                </span>
                                                <span className="rounded-lg bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-600">
                                                    {req.care_category}
                                                </span>
                                                {conflict && (
                                                    <span className="rounded-lg bg-red-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-500">
                                                        Day Taken
                                                    </span>
                                                )}
                                                <span className="rounded-lg bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-700">
                                                    {req.status}
                                                </span>
                                                {/* View details hint — appears on hover */}
                                                <span className="ml-auto rounded-lg bg-slate-50 px-3 py-1 text-[10px] font-bold text-slate-400 ring-1 ring-slate-100 transition-all group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:ring-emerald-200">
                                                    Click to view details
                                                </span>
                                            </div>

                                            {/* Location + Gender + Age */}
                                            <div className="mt-2 flex flex-wrap items-center gap-4 text-[14px] font-semibold text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <svg className="h-3.5 w-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    {req.area}, {req.city}
                                                </span>
                                                <span className="flex items-center gap-1 text-slate-500">
                                                    Age: <strong className="ml-1 text-slate-700">{req.age}</strong>
                                                </span>
                                                <span
                                                    className="text-lg leading-none"
                                                    style={{ color: req.gender === "Female" ? "#ec4899" : "#3b82f6" }}
                                                    title={req.gender}
                                                >
                                                    {req.gender === "Female" ? "♀" : "♂"}
                                                </span>
                                            </div>

                                            {/* Skills */}
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {skills.map((skill) => (
                                                    <span key={skill} className="rounded-full bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-blue-200">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {req.medical_specialties_needed && (
                                                    <span className="rounded-full bg-purple-50 px-3 py-1 text-[11px] font-bold text-purple-600 ring-1 ring-purple-200">
                                                        {req.medical_specialties_needed}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Date + Duration + Rate */}
                                            <div className="mt-4 flex flex-wrap items-center gap-5 text-[12px] font-bold tracking-tight text-blue-800 uppercase">
                                                <span className="flex items-center gap-2">
                                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    {formatDate(req.start_date)}
                                                    {req.start_date !== req.end_date && (
                                                        <span className="text-slate-400">→ {formatDate(req.end_date)}</span>
                                                    )}
                                                </span>
                                                <span className="flex items-center gap-2 font-black text-emerald-700">
                                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                    {DAY_CATEGORY_LABEL[req.day_category] ?? req.day_category}
                                                </span>
                                                <span className="flex items-center gap-2 font-bold text-blue-700">
                                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                    E£ {req.min_compensation} – E£ {req.max_compensation}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Accept / Decline — stopPropagation so card click doesn't fire */}
                                        <div
                                            className="flex w-full flex-row gap-2 sm:w-auto sm:flex-col"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button
                                                onClick={() => handleAccept(req)}
                                                disabled={conflict || isActing}
                                                className={`w-full rounded-2xl px-8 py-4 text-[12px] font-black text-white shadow-lg transition-all active:scale-95 ${
                                                    conflict || isActing
                                                        ? "cursor-not-allowed bg-slate-300 shadow-none"
                                                        : "bg-emerald-500 hover:bg-emerald-600"
                                                }`}
                                            >
                                                {isActing ? "..." : "ACCEPT"}
                                            </button>
                                            <button
                                                onClick={() => handleDecline(req)}
                                                disabled={isActing}
                                                className="w-full rounded-2xl border-2 border-slate-100 px-8 py-4 text-[12px] font-bold text-slate-500 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {isActing ? "..." : "DECLINE"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ── Calendar ── */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-12 mx-auto max-w-150 rounded-[2.5rem] bg-white p-8 shadow-2xl ring-1 ring-emerald-200">
                            <div className="mb-6 flex items-center justify-between">
                                <button onClick={goToPrevMonth} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-emerald-100 hover:text-emerald-700 text-lg font-bold">‹</button>
                                <h3 className="text-center text-[11px] font-black uppercase tracking-[0.3em] text-slate-600">
                                    {MONTH_NAMES[calendarMonth - 1]} {calendarYear}
                                </h3>
                                <button onClick={goToNextMonth} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-emerald-100 hover:text-emerald-700 text-lg font-bold">›</button>
                            </div>

                            <div className="grid grid-cols-7 gap-1 text-center">
                                {["S","M","T","W","T","F","S"].map((d, i) => (
                                    <span key={i} className="mb-1 text-[9px] font-black text-slate-400">{d}</span>
                                ))}
                                {Array(firstDayOfWeek).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
                                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                                    const booked = isDayBooked(day);
                                    return (
                                        <div key={day} className="relative flex items-center justify-center">
                                            <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-[11px] font-black transition-all duration-300 ${booked ? "scale-105 bg-emerald-500 text-white shadow-lg shadow-emerald-100" : "bg-blue-50 text-blue-700"}`}>
                                                {day}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 border-t border-slate-50 pt-6">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Available</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Booked</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}