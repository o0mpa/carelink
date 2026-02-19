import { Header } from "./Header";
import { Hero } from "./Hero";

export const LandingPage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-blue-100 via-white to-emerald-100">
      {/* Layered gradient orbs —  */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-48 -top-48 h-96 w-96 rounded-full bg-blue-400/50 blur-3xl animate-pulse" />
        <div className="absolute right-0 top-1/3 h-112 w-md rounded-full bg-teal-400/45 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-400/45 blur-3xl" />
        <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-sky-300/40 blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute right-1/4 bottom-1/4 h-56 w-56 rounded-full bg-violet-300/30 blur-3xl" />
        <div className="absolute left-1/3 bottom-1/3 h-40 w-40 rounded-full bg-pink-300/25 blur-2xl" />
      </div>

      {/* Wave pattern */}
      <svg
        className="absolute inset-0 h-full w-full text-blue-200/70"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <pattern
            id="waves"
            x="0"
            y="0"
            width="60"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 15 Q15 8 30 15 T60 15"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.6"
            />
          </pattern>
          <pattern
            id="wavesAlt"
            x="0"
            y="0"
            width="60"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 10 Q20 4 40 10 T60 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#waves)" />
        <rect width="100%" height="100%" fill="url(#wavesAlt)" className="opacity-70" />
      </svg>

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(30 64 175 / 0.5) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
        aria-hidden
      />

      {/* Diagonal color sweep */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          background:
            "linear-gradient(135deg, #60a5fa 0%, transparent 40%, #34d399 100%)",
        }}
        aria-hidden
      />

      {/* Soft radial vignette */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_40%,rgb(255_255_255/0.55)_100%)]"
        aria-hidden
      />

      <div className="relative flex min-h-screen flex-col">
        <Header />
        <Hero />
      </div>
    </div>
  );
};
