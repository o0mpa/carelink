import { useState, useEffect } from "react";
import { useLoaderData, Link, useFetcher } from "react-router";

export async function loader() {
    return {
    initialRequests: [
        { id: 1, patientName: "Patient A", serviceType: "Nursing Care", requirements: ["physical care", "Diabetes", "Housekeeping and cleaning"], date: "March 15, 2026", duration: "3 Hours", dayNumber: 15 },
        { id: 2, patientName: "Patient B", serviceType: "Elderly Care", requirements: ["Alzheimer's", "physical care"], date: "March 22, 2026", duration: "6 Hours", dayNumber: 22 },
        { id: 3, patientName: "Patient C", serviceType: "Specialized Care", requirements: ["Physical Therapy",  "Medication managment"], date: "March 25, 2026", duration: "12 Hours", dayNumber: 25 },
        { id: 4, patientName: "Patient D", serviceType: "Home Care", requirements: ["Health monitoring", "Elderly Care"], date: "March 27, 2026", duration: "3 Hours", dayNumber: 27 },
        { id: 5, patientName: "Patient E", serviceType: "Companion Care", requirements: ["Emotional Support"], date: "March 28, 2026", duration: "6 Hours", dayNumber: 28 },
        { id: 6, patientName: "Patient F", serviceType: "Elderly Care", requirements: [ "Diabetes", "Mobility"], date: "March 30, 2026", duration: "12 Hours", dayNumber: 30 },
        { id: 7, patientName: "Patient G", serviceType: "Nursing Care", requirements: [ "Medication managment"], date: "April 02, 2026", duration: "6 Hours", dayNumber: 2 },
        { id: 8, patientName: "Patient H", serviceType: "Companion Care", requirements: ["Emotional Support", "Meal Prep", "Transportation"], date: "April 04, 2026", duration: "3 Hours", dayNumber: 4 },
        { id: 9, patientName: "Patient I", serviceType: "Specialized Care", requirements: ["Elderly Care", "Diabetes"], date: "April 05, 2026", duration: "12 Hours", dayNumber: 5 },
        { id: 10, patientName: "Patient J", serviceType: "Home Care", requirements: ["Dementia", "Transportation"], date: "April 07, 2026", duration: "6 Hours", dayNumber: 7 }
    ],
    initialBookedDays: [1]
    };
}

export default function RequestsPage() {
    const { initialRequests, initialBookedDays } = useLoaderData();
    const fetcher = useFetcher();

    const [requests, setRequests] = useState<{ id: number; patientName: string; serviceType: string; requirements: string[]; date: string; duration: string; dayNumber: number }[]>(initialRequests);
    const [bookedDays, setBookedDays] = useState<number[]>(initialBookedDays);

    const handleAction = (id: number, day: number, intent: string) => {
    if (intent === "accept") {
        setBookedDays((prev) => [...prev, day]);
    }
    setRequests((prev) => prev.filter((r: { id: number }) => r.id !== id));
    };

    return (
    <div className="relative min-h-screen origin-top bg-white font-sans">
      {/* Background: Linear Gradient */}
        <div
        className="pointer-events-none fixed inset-0 opacity-20"
        style={{
            background:
            "linear-gradient(135deg, #0978ff 0%, #ffffff 50%, #008e5a 100%)",
        }}
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
          {/* Requests List */}
            <div className="space-y-4 lg:col-span-8">
            {requests.map((req: any) => (
                <div
                key={req.id}
                className="group rounded-[2.5rem] bg-white p-6 shadow-xl shadow-blue-900/5 ring-1 ring-blue-100 transition-all hover:ring-emerald-300"
                >
                <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                  {/* PROFILE ICON: White Icon on Solid Blue */}
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-4xl bg-blue-600 shadow-lg">
                    <svg
                        className="h-7 w-7 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                    </svg>
                    </div>

                    <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xl font-semibold text-slate-700">
                        {req.patientName}
                        </h4>
                        <span className="rounded-lg bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                        {req.serviceType}
                        </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                        {req.requirements.map((skill: string) => (
                        <span
                            key={skill}
                            className="rounded-full bg-slate-50 px-3 py-1 text-[10px] font-bold text-slate-700 ring-1 ring-slate-200"
                        >
                            {skill}
                        </span>
                        ))}
                    </div>

                    <div className="mt-4 flex items-center gap-5 text-[12px] font-bold tracking-tight text-blue-800 uppercase">
                        <span className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                            <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                            </svg>
                        </div>
                        {req.date}
                        </span>

                        <span className="flex items-center gap-2 font-black text-emerald-700">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                            </svg>
                        </div>
                        {req.duration}
                        </span>
                    </div>
                    </div>

                    <div className="flex w-full flex-row gap-2 sm:w-auto sm:flex-col">
                    <button
                        onClick={() =>
                        handleAction(req.id, req.dayNumber, "accept")
                        }
                        className="w-full rounded-2xl bg-emerald-500 px-8 py-4 text-[12px] font-black text-white shadow-lg transition-all hover:bg-emerald-600 active:scale-95"
                    >
                        ACCEPT
                    </button>
                    <button
                        onClick={() =>
                        handleAction(req.id, req.dayNumber, "decline")
                        }
                        className="w-full rounded-2xl border-2 border-slate-100 px-8 py-4 text-[12px] font-bold text-slate-500 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                        DECLINE
                    </button>
                    </div>
                </div>
                </div>
            ))}
            </div>

          {/* Calendar Section */}
            <div className="lg:col-span-4">
            <div className="sticky top-12 mx-auto max-w-150 rounded-[2.5rem] bg-white p-8 shadow-2xl ring-1 ring-emerald-200">
                <h3 className="mb-6 text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
                Current month calendar
                </h3>
                <div className="grid grid-cols-7 gap-2 text-center">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, index) => (
                    <span
                    key={index}
                    className="mb-1 text-[9px] font-black text-slate-400"
                    >
                    {d}
                    </span>
                ))}
                {[...Array(31)].map((_, i) => {
                    const day = i + 1;
                    const isBooked = bookedDays.includes(day);
                    return (
                    <div
                        key={day}
                        className={`flex h-9 w-9 items-center justify-center rounded-xl text-[11px] font-black transition-all duration-500 ${
                        isBooked
                            ? "scale-105 bg-emerald-500 text-white shadow-lg shadow-emerald-100"
                            : "bg-blue-50 text-blue-700"
                        }`}
                    >
                        {day}
                    </div>
                    );
                })}
                </div>
                <div className="mt-8 flex items-center justify-center gap-4 border-t border-slate-50 pt-6">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    Available
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    Booked
                    </span>
                </div>
                </div>
            </div>
            </div>
        </div>
        </main>
    </div>
    );
}