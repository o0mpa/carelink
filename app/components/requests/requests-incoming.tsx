import { useState } from "react";
import { useLoaderData, Link } from "react-router";

export async function loader() {
    return {
        initialRequests: [
            { id: 1,  patientName: "Patient A", gender: "Male",   city: "Cairo", area: "Maadi",         phone: "+20 100 123 4567", serviceType: "Nursing Care",    requirements: ["Physical Care", "Diabetes", "Housekeeping"],       rateOffered: "E£ 250", date: "March 15, 2026",  month: 3, year: 2026, dayNumber: 15, duration: "3 Hours"  },
            { id: 2,  patientName: "Patient B", gender: "Female", city: "Giza",  area: "Dokki",          phone: "+20 111 234 5678", serviceType: "Elderly Care",     requirements: ["Alzheimer's", "Physical Care"],                    rateOffered: "E£ 450", date: "March 22, 2026",  month: 3, year: 2026, dayNumber: 22, duration: "6 Hours"  },
            { id: 3,  patientName: "Patient C", gender: "Male",   city: "Cairo", area: "Heliopolis",     phone: "+20 122 345 6789", serviceType: "Specialized Care", requirements: ["Physical Therapy", "Medication Management"],       rateOffered: "E£ 850", date: "March 25, 2026",  month: 3, year: 2026, dayNumber: 25, duration: "12 Hours" },
            { id: 4,  patientName: "Patient D", gender: "Female", city: "Cairo", area: "Nasr City",      phone: "+20 100 456 7890", serviceType: "Home Care",        requirements: ["Health Monitoring", "Elderly Care"],               rateOffered: "E£ 250", date: "March 27, 2026",  month: 3, year: 2026, dayNumber: 27, duration: "3 Hours"  },
            { id: 5,  patientName: "Patient E", gender: "Male",   city: "Giza",  area: "Mohandseen",     phone: "+20 111 567 8901", serviceType: "Companion Care",   requirements: ["Emotional Support"],                               rateOffered: "E£ 450", date: "March 28, 2026",  month: 3, year: 2026, dayNumber: 28, duration: "6 Hours"  },
            { id: 6,  patientName: "Patient F", gender: "Female", city: "Cairo", area: "Zamalek",        phone: "+20 122 678 9012", serviceType: "Elderly Care",     requirements: ["Diabetes", "Mobility"],                            rateOffered: "E£ 850", date: "March 30, 2026",  month: 3, year: 2026, dayNumber: 30, duration: "12 Hours" },
            { id: 7,  patientName: "Patient G", gender: "Male",   city: "Cairo", area: "Maadi",          phone: "+20 100 789 0123", serviceType: "Nursing Care",     requirements: ["Medication Management"],                           rateOffered: "E£ 450", date: "April 02, 2026",  month: 4, year: 2026, dayNumber: 2,  duration: "6 Hours"  },
            { id: 8,  patientName: "Patient H", gender: "Female", city: "Giza",  area: "6th of October", phone: "+20 111 890 1234", serviceType: "Companion Care",   requirements: ["Emotional Support", "Meal Prep", "Transportation"], rateOffered: "E£ 250", date: "April 04, 2026",  month: 4, year: 2026, dayNumber: 4,  duration: "3 Hours"  },
            { id: 9,  patientName: "Patient I", gender: "Male",   city: "Cairo", area: "New Cairo",      phone: "+20 122 901 2345", serviceType: "Specialized Care", requirements: ["Elderly Care", "Diabetes"],                        rateOffered: "E£ 850", date: "April 05, 2026",  month: 4, year: 2026, dayNumber: 5,  duration: "12 Hours" },
            { id: 10, patientName: "Patient J", gender: "Female", city: "Cairo", area: "Heliopolis",     phone: "+20 100 012 3456", serviceType: "Home Care",        requirements: ["Dementia", "Transportation"],                      rateOffered: "E£ 450", date: "April 07, 2026",  month: 4, year: 2026, dayNumber: 7,  duration: "6 Hours"  },
        ],
        initialBookedDates: ["2026-4-1"],
    };
}

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

export default function RequestsPage() {
    const { initialRequests, initialBookedDates } = useLoaderData();

    const today = new Date();

    const [requests, setRequests] = useState<{
        id: number; patientName: string; gender: string; city: string; area: string; phone: string;
        serviceType: string; requirements: string[]; rateOffered: string;
        date: string; month: number; year: number; dayNumber: number; duration: string;
    }[]>(initialRequests);

    const [bookedDates, setBookedDates]     = useState<string[]>(initialBookedDates);
    const [calendarMonth, setCalendarMonth] = useState(today.getMonth() + 1); // 1–12
    const [calendarYear,  setCalendarYear]  = useState(today.getFullYear());

    // ── helpers ────────────────────────────────────────────────────────────────
    const dateKey = (year: number, month: number, day: number) => `${year}-${month}-${day}`;

    const isDayBooked  = (day: number) =>
        bookedDates.includes(dateKey(calendarYear, calendarMonth, day));

    const isRequestDayBooked = (r: typeof requests[0]) =>
        bookedDates.includes(dateKey(r.year, r.month, r.dayNumber));

    // ── actions ────────────────────────────────────────────────────────────────
    const handleAction = (id: number, month: number, year: number, day: number, intent: string) => {
        if (intent === "accept") {
            setBookedDates(prev => [...prev, dateKey(year, month, day)]);
        }
        setRequests(prev => prev.filter(r => r.id !== id));
    };

    // ── calendar math ──────────────────────────────────────────────────────────
    const daysInMonth    = new Date(calendarYear, calendarMonth, 0).getDate();
    const firstDayOfWeek = new Date(calendarYear, calendarMonth - 1, 1).getDay(); // 0 = Sunday

    const goToPrevMonth = () => {
        if (calendarMonth === 1) { setCalendarMonth(12); setCalendarYear(y => y - 1); }
        else setCalendarMonth(m => m - 1);
    };
    const goToNextMonth = () => {
        if (calendarMonth === 12) { setCalendarMonth(1); setCalendarYear(y => y + 1); }
        else setCalendarMonth(m => m + 1);
    };

    // ── render ─────────────────────────────────────────────────────────────────
    return (
        <div className="relative min-h-screen origin-top bg-white font-sans">
            {/* Background gradient */}
            <div
                className="pointer-events-none fixed inset-0 opacity-20"
                style={{ background: "linear-gradient(135deg, #0978ff 0%, #ffffff 50%, #008e5a 100%)" }}
            />

            <main className="relative z-10 mx-auto max-w-7xl px-10 py-12">
                <div className="mb-6">
                    <Link
                        to="/dashboard/caregiver"
                        className="text-med mt-2 font-semibold text-gray-500 transition-colors hover:text-gray-800 hover:underline"
                    >
                        <span className="text-med">←</span> Return Home
                    </Link>
                </div>

                <div className="mb-6">
                    <h2 className="bg-linear-to-r from-emerald-700 to-emerald-500 bg-clip-text text-4xl font-extrabold text-transparent">
                        Incoming Requests
                    </h2>
                    <div className="mt-2 h-1.5 w-20" />
                </div>

                <div className="grid gap-10 lg:grid-cols-12">

                    {/* ── Requests List ── */}
                    <div className="space-y-4 lg:col-span-8">
                        {requests.map((req) => {
                            const alreadyBooked = isRequestDayBooked(req);
                            return (
                                <div
                                    key={req.id}
                                    className="group rounded-[2.5rem] bg-white p-6 shadow-xl shadow-blue-900/5 ring-1 ring-blue-100 transition-all hover:ring-emerald-300"
                                >
                                    <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                                        {/* Profile Icon */}
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-4xl bg-blue-600 shadow-lg">
                                            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>

                                        <div className="flex-1">
                                            {/* Name + Service Type + Booked warning */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="text-xl font-semibold text-slate-700">{req.patientName}</h4>
                                                <span className="rounded-lg bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                                                    {req.serviceType}
                                                </span>
                                                {alreadyBooked && (
                                                    <span className="rounded-lg bg-red-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-500">
                                                        Day Taken
                                                    </span>
                                                )}
                                            </div>

                                            {/* Location + Phone + Gender */}
                                            <div className="mt-2 flex flex-wrap items-center gap-4 text-[14px] font-semibold text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <svg className="h-3.5 w-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    {req.area}, {req.city}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <svg className="h-3.5 w-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                    {req.phone}
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
                                                {req.requirements.map((skill: string) => (
                                                    <span
                                                        key={skill}
                                                        className="rounded-full bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-blue-200"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Date + Duration + Rate */}
                                            <div className="mt-4 flex flex-wrap items-center gap-5 text-[12px] font-bold tracking-tight text-blue-800 uppercase">
                                                <span className="flex items-center gap-2">
                                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    {req.date}
                                                </span>
                                                <span className="flex items-center gap-2 font-black text-emerald-700">
                                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                    {req.duration}
                                                </span>
                                                <span className="flex items-center gap-2 font-bold text-blue-700">
                                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                    {req.rateOffered}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Accept / Decline */}
                                        <div className="flex w-full flex-row gap-2 sm:w-auto sm:flex-col">
                                            <button
                                                onClick={() => handleAction(req.id, req.month, req.year, req.dayNumber, "accept")}
                                                disabled={alreadyBooked}
                                                className={`w-full rounded-2xl px-8 py-4 text-[12px] font-black text-white shadow-lg transition-all active:scale-95 ${
                                                    alreadyBooked
                                                        ? "cursor-not-allowed bg-slate-300 shadow-none"
                                                        : "bg-emerald-500 hover:bg-emerald-600"
                                                }`}
                                            >
                                                ACCEPT
                                            </button>
                                            <button
                                                onClick={() => handleAction(req.id, req.month, req.year, req.dayNumber, "decline")}
                                                className="w-full rounded-2xl border-2 border-slate-100 px-8 py-4 text-[12px] font-bold text-slate-500 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                            >
                                                DECLINE
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

                            {/* Month navigation */}
                            <div className="mb-6 flex items-center justify-between">
                                <button
                                    onClick={goToPrevMonth}
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-emerald-100 hover:text-emerald-700 text-lg font-bold"
                                >
                                    ‹
                                </button>
                                <h3 className="text-center text-[11px] font-black uppercase tracking-[0.3em] text-slate-600">
                                    {MONTH_NAMES[calendarMonth - 1]} {calendarYear}
                                </h3>
                                <button
                                    onClick={goToNextMonth}
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-emerald-100 hover:text-emerald-700 text-lg font-bold"
                                >
                                    ›
                                </button>
                            </div>

                            {/* Day-of-week headers */}
                            <div className="grid grid-cols-7 gap-1 text-center">
                                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                                    <span key={i} className="mb-1 text-[9px] font-black text-slate-400">{d}</span>
                                ))}

                                {/* Empty offset cells so day 1 lands on the right column */}
                                {Array(firstDayOfWeek).fill(null).map((_, i) => (
                                    <div key={`empty-${i}`} />
                                ))}

                                {/* Day cells */}
                                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                                    const booked  = isDayBooked(day);
                                    return (
                                        <div key={day} className="relative flex items-center justify-center">
                                            <div
                                                className={`flex h-9 w-9 items-center justify-center rounded-xl text-[11px] font-black transition-all duration-300 ${
                                                    booked
                                                        ? "scale-105 bg-emerald-500 text-white shadow-lg shadow-emerald-100"
                                                        : "bg-blue-50 text-blue-700"
                                                }`}
                                            >
                                                {day}
                                            </div>

                                        </div>
                                    );
                                })}
                            </div>

                            {/* Legend */}
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