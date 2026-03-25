import { Link } from "react-router";

export function meta() {
  return [
    { title: "Caregiver Dashboard - CareLink" },
    {
      name: "description",
      content: "Manage your incoming job requests and schedule.",
    },
  ];
}

export default function CaregiverDashboard() {
  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-100 via-white to-blue-100">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between bg-white/80 px-6 py-4 shadow-sm backdrop-blur-md">
        {/* Profile Picture - Top Left */}
        <Link
          to="/profile/caregiver"
          className="group flex items-center gap-3 transition-all hover:opacity-80"
          title="Go to My Profile"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md ring-2 ring-emerald-200 group-hover:ring-emerald-400">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
          <span className="hidden font-bold text-emerald-900 sm:block">
            My Profile
          </span>
        </Link>

        {/* Logo / Brand Name */}
        <div className="bg-gradient-to-r from-emerald-600 to-blue-700 bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
          CareLink
        </div>

        {/* Empty div to balance the flexbox */}
        <div className="w-12 sm:w-24"></div>
      </header>

      {/* Main Dashboard Content */}
      <main className="container mx-auto px-4 py-12 sm:px-6 md:px-10">
        <div className="mx-auto max-w-4xl">
          {/* Centered Welcome Text */}
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-extrabold text-emerald-900 sm:text-4xl">
              Welcome back, Your Name
            </h1>
            <p className="mt-2 text-gray-600">
              You are currently visible to clients. Check your incoming job
              offers below.
            </p>
          </div>

          {/* Action Card - Single Column for Caregivers */}
          <div className="mx-auto max-w-lg">
            <Link
              to="/requests/caregiver"
              className="group flex flex-col items-center justify-center rounded-3xl border-2 border-emerald-100 bg-white p-12 text-center shadow-lg transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl"
            >
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <svg
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="mb-3 text-3xl font-bold text-emerald-900">
                Job Requests
              </h2>
              <p className="text-base text-gray-600">
                View your pending job offers, accept new clients, and manage
                your active caregiving schedule.
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}