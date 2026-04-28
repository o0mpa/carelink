import { Link } from "react-router";
import { getProfile } from "~/utils/auth";

export function meta() {
  return [
    { title: "Caregiver Dashboard - CareLink" },
    {
      name: "description",
      content: "Manage your incoming job requests and schedule.",
    },
  ];
}
const profile = getProfile();
  const fullName = profile?.full_name as string || "there";

export default function CaregiverDashboard() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-blue-100 via-white to-emerald-100">
      
      {/* 1. BACKGROUND LAYER: Static Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-48 -top-48 h-96 w-96 rounded-full bg-blue-400/30 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-teal-400/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-400/20 blur-3xl" />
      </div>

      {/* 2. BACKGROUND LAYER: Wave pattern */}
      <svg className="absolute inset-0 h-full w-full text-blue-200/50" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <pattern id="waves-caregiver" x="0" y="0" width="60" height="30" patternUnits="userSpaceOnUse">
            <path d="M0 15 Q15 8 30 15 T60 15" fill="none" stroke="currentColor" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#waves-caregiver)" />
      </svg>

      {/* 3. BACKGROUND LAYER: Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(30 64 175 / 0.5) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
        aria-hidden="true"
      />

      {/* 4. CONTENT LAYER */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b border-blue-100/50 bg-white/70 px-6 py-4 shadow-sm backdrop-blur-xl transition-all duration-300 md:px-10">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div className="flex flex-1 items-center justify-start">
              <div className="flex items-center gap-2.5 select-none">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-blue-100">
                  <svg className="h-6 w-6" viewBox="0 0 32 32" fill="none">
                    <path d="M16 6v6h6v4h-6v6h-4v-6H6v-4h6V6h4z" className="fill-blue-600" />
                    <path d="M22 24c-.4 0-.8-.1-1.2-.3C17 22.3 14 19 14 15c0-2.2 1.8-4 4-4 1.2 0 2.3.5 3 1.4.7-.9 1.8-1.4 3-1.4 2.2 0 4 1.8 4 4 0 4-3 7.3-6.8 8.7-.4.2-.8.3-1.2.3z" className="fill-emerald-500" />
                  </svg>
                </span>
                <span className="text-xl font-bold tracking-tight text-blue-900">CareLink</span>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center justify-center gap-10">
              <Link to="/dashboard/contact" className="text-base font-semibold text-gray-600 hover:text-blue-700">Contact Us</Link>
            </nav>
            
            <div className="flex flex-1 items-center justify-end">
              <Link to="/profile/caregiver" className="group flex items-center gap-3">
                <span className="hidden font-bold text-emerald-900 sm:block">My Profile</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md ring-2 ring-emerald-100 group-hover:ring-emerald-300">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 sm:px-6 md:px-10">
          <div className="mx-auto max-w-4xl">
            <div className="mb-10 text-center">
              <h1 className="text-3xl font-extrabold text-emerald-900 sm:text-4xl">Welcome back, {fullName}!</h1>
              <p className="mt-2 text-gray-600">You are currently visible to clients. Check your incoming job offers below.</p>
            </div>

            <div className="mx-auto max-w-lg">
              <Link to="/requests/caregiver" className="group flex flex-col items-center justify-center rounded-3xl border-2 border-emerald-100 bg-white/80 p-12 text-center shadow-lg backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="mb-3 text-3xl font-bold text-emerald-900">Job Requests</h2>
                <p className="text-base text-gray-600">View your pending job offers, accept new clients, and manage your active caregiving schedule.</p>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}