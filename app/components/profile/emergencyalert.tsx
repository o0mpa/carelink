import { useState } from "react";
import { Link } from "react-router";
import { triggerEmergencyAlert } from "~/utils/emergency";

export function meta() {
  return [
    { title: "Emergency Alert - CareLink" },
    { name: "description", content: "One-tap emergency alert with GPS and medical profile sharing." },
  ];
}

type AlertStatus = "idle" | "locating" | "sending" | "success" | "error";

export default function EmergencyAlert() {
  const [status, setStatus] = useState<AlertStatus>("idle");
  const [responseData, setResponseData] = useState<{
    location?: string;
    mapsLink?: string;
    emailSentTo?: string[];
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [held, setHeld] = useState(false);

  const handleTrigger = async () => {
    setStatus("locating");
    setErrorMsg("");
    setResponseData(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setStatus("sending");
        try {
          const data = await triggerEmergencyAlert(latitude, longitude);
          setResponseData(data);
          setStatus("success");
        } catch (err: any) {
          setErrorMsg(err.message || "Something went wrong. Please try again.");
          setStatus("error");
        }
      },
      (err) => {
        setErrorMsg("Location access denied. Please enable GPS and try again.");
        setStatus("error");
      }
    );
  };

  const reset = () => {
    setStatus("idle");
    setResponseData(null);
    setErrorMsg("");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-red-50 via-white to-rose-100">
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        .animate-float-slow { animation: float 18s ease-in-out infinite; }
        .animate-float-medium { animation: float 12s ease-in-out infinite; }
        .pulse-ring {
          animation: pulse-ring 1.5s ease-out infinite;
        }
        .pulse-ring-2 {
          animation: pulse-ring 1.5s ease-out infinite 0.5s;
        }
        .btn-press:active { transform: scale(0.96); }
      `}</style>

      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-48 -top-48 h-96 w-96 rounded-full bg-red-400/20 blur-3xl animate-float-slow" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-rose-400/15 blur-3xl animate-float-medium" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-orange-400/15 blur-3xl animate-float-slow" style={{ animationDelay: "4s" }} />
      </div>

      {/* Wave pattern */}
      <svg className="absolute inset-0 h-full w-full text-red-200/40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <pattern id="waves" x="0" y="0" width="60" height="30" patternUnits="userSpaceOnUse">
            <path d="M0 15 Q15 8 30 15 T60 15" fill="none" stroke="currentColor" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#waves)" />
      </svg>

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header — same as ClientDashboard */}
        <header className="sticky top-0 z-50 w-full border-b border-red-100/50 bg-white/70 px-6 py-4 shadow-sm backdrop-blur-xl transition-all duration-300 md:px-10">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div className="flex flex-1 items-center justify-start">
              <Link to="/dashboard/client" className="flex items-center gap-2.5 select-none">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-red-100">
                  <svg className="h-6 w-6" viewBox="0 0 32 32" fill="none">
                    <path d="M16 6v6h6v4h-6v6h-4v-6H6v-4h6V6h4z" className="fill-blue-600" />
                    <path d="M22 24c-.4 0-.8-.1-1.2-.3C17 22.3 14 19 14 15c0-2.2 1.8-4 4-4 1.2 0 2.3.5 3 1.4.7-.9 1.8-1.4 3-1.4 2.2 0 4 1.8 4 4 0 4-3 7.3-6.8 8.7-.4.2-.8.3-1.2.3z" className="fill-emerald-500" />
                  </svg>
                </span>
                <span className="text-xl font-bold tracking-tight text-blue-900">CareLink</span>
              </Link>
            </div>

            <div className="flex flex-1 items-center justify-end">
              <Link to="/profile/client" className="group flex items-center gap-3">
                <span className="hidden font-bold text-blue-900 sm:block">My Profile</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-md ring-2 ring-blue-200">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
          <div className="mx-auto w-full max-w-md text-center">

            {/* IDLE / LOCATING / SENDING */}
            {(status === "idle" || status === "locating" || status === "sending") && (
              <>
                <div className="mb-6">
                  <span className="inline-block rounded-full bg-red-100 px-4 py-1.5 text-sm font-semibold uppercase tracking-widest text-red-700">
                    Emergency
                  </span>
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                  One-Tap Alert
                </h1>
                <p className="mt-3 text-gray-500">
                  Press the button below to instantly send your location and medical profile to your emergency contacts and our team.
                </p>

                {/* Big Emergency Button */}
                <div className="relative mt-12 flex items-center justify-center">
                  {/* Pulse rings — only show when idle */}
                  {status === "idle" && (
                    <>
                      <div className="pulse-ring absolute h-52 w-52 rounded-full border-2 border-red-300/60" />
                      <div className="pulse-ring-2 absolute h-52 w-52 rounded-full border-2 border-red-200/40" />
                    </>
                  )}

                  <button
                    onClick={handleTrigger}
                    disabled={status !== "idle"}
                    className="btn-press relative z-10 flex h-44 w-44 flex-col items-center justify-center rounded-full bg-red-600 text-white shadow-2xl ring-4 ring-red-200 transition-all duration-200 hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-80"
                    aria-label="Trigger emergency alert"
                  >
                    {status === "idle" && (
                      <>
                        <svg className="mb-2 h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span className="text-lg font-extrabold tracking-wide">SOS</span>
                        <span className="mt-0.5 text-xs font-medium opacity-80">Tap to alert</span>
                      </>
                    )}
                    {status === "locating" && (
                      <>
                        <svg className="mb-2 h-10 w-10 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm font-bold">Getting location...</span>
                      </>
                    )}
                    {status === "sending" && (
                      <>
                        <svg className="mb-2 h-10 w-10 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span className="text-sm font-bold">Sending alert...</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Info pills */}
                <div className="mt-10 flex flex-wrap justify-center gap-3">
                  {[
                    { icon: "📍", label: "Sends your GPS location" },
                    { icon: "🏥", label: "Shares medical profile" },
                    { icon: "📱", label: "SMS to emergency contacts" },
                    { icon: "📧", label: "Email alert sent" },
                  ].map(({ icon, label }) => (
                    <span key={label} className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-sm text-gray-600 shadow-sm ring-1 ring-red-100">
                      <span>{icon}</span> {label}
                    </span>
                  ))}
                </div>
              </>
            )}

            {/* SUCCESS */}
            {status === "success" && responseData && (
              <div className="rounded-3xl bg-white/90 p-8 shadow-xl ring-1 ring-emerald-100 backdrop-blur-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">Alert Sent!</h2>
                <p className="mt-2 text-gray-500">Your emergency contacts and our team have been notified.</p>

                <div className="mt-6 space-y-3 text-left">
                  {responseData.location && (
                    <div className="rounded-xl bg-gray-50 p-3 text-sm">
                      <p className="font-semibold text-gray-700">📍 Your location</p>
                      <p className="mt-0.5 text-gray-500">{responseData.location}</p>
                    </div>
                  )}
                  {responseData.emailSentTo && responseData.emailSentTo.length > 0 && (
                    <div className="rounded-xl bg-gray-50 p-3 text-sm">
                      <p className="font-semibold text-gray-700">📧 Email sent to</p>
                      <p className="mt-0.5 text-gray-500">{responseData.emailSentTo.join(", ")}</p>
                    </div>
                  )}
                  {responseData.mapsLink && (
                    <a
                      href={responseData.mapsLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl bg-blue-50 p-3 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open in Google Maps
                    </a>
                  )}
                </div>

                <button
                  onClick={reset}
                  className="mt-6 w-full rounded-2xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
              </div>
            )}

            {/* ERROR */}
            {status === "error" && (
              <div className="rounded-3xl bg-white/90 p-8 shadow-xl ring-1 ring-red-100 backdrop-blur-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">Alert Failed</h2>
                <p className="mt-2 text-gray-500">{errorMsg}</p>
                <button
                  onClick={reset}
                  className="mt-6 w-full rounded-2xl bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}