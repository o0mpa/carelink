import { Link } from "react-router";

export function meta() {
  return [
    { title: "Client Dashboard - CareLink" },
    {
      name: "description",
      content: "Manage your care requests and find caregivers.",
    },
  ];
}

export default function ClientDashboard() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-100 via-white to-emerald-100">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between bg-white/80 px-6 py-4 shadow-sm backdrop-blur-md">
        {/* Profile Picture - Top Left */}
        <Link
          to="/profile/client"
          className="group flex items-center gap-3 transition-all hover:opacity-80"
          title="Go to My Profile"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-md ring-2 ring-blue-200 group-hover:ring-blue-400">
            <svg
              className="h-6 w-6"
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
          <span className="hidden font-bold text-blue-900 sm:block">
            My Profile
          </span>
        </Link>

        {/* Logo / Brand Name */}
        <div className="bg-gradient-to-r from-blue-700 to-emerald-600 bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
          CareLink
        </div>

        {/* Empty div to balance the flexbox */}
        <div className="w-12 sm:w-24"></div>
      </header>

      {/* Main Dashboard Content */}
      <main className="container mx-auto px-4 py-12 sm:px-6 md:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center sm:text-left">
            <h1 className="text-3xl font-extrabold text-blue-900 sm:text-4xl">
              Welcome back, Your Name
            </h1>
            <p className="mt-2 text-gray-600">
              What would you like to do today?
            </p>
          </div>

          {/* Action Cards Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Link
              to="/request-care"
              className="group flex flex-col items-center justify-center rounded-3xl border-2 border-blue-100 bg-white p-10 text-center shadow-lg transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl"
            >
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <svg
                  className="h-10 w-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z M10 7v3m0 0v3m0-3h3m-3 0H7"
                  />
                </svg>
              </div>
              <h2 className="mb-2 text-2xl font-bold text-blue-900">
                Request a Caregiver
              </h2>
              <p className="text-sm text-gray-600">
                Create a new care request to find verified professionals.
              </p>
            </Link>

            <Link
              to="/requests/client"
              className="group flex flex-col items-center justify-center rounded-3xl border-2 border-emerald-100 bg-white p-10 text-center shadow-lg transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl"
            >
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <svg
                  className="h-10 w-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <h2 className="mb-2 text-2xl font-bold text-emerald-900">
                Your Requests
              </h2>
              <p className="text-sm text-gray-600">
                Track statuses and manage your accepted caregivers.
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}