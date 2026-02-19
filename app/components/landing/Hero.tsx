import { Link } from "react-router";

export const Hero = () => {
  return (
    <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-16 text-center md:px-10">
      <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
        <span className="bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent drop-shadow-sm">
          Welcome to CareLink
        </span>
      </h1>
      <p className="mt-6 max-w-xl text-lg text-gray-600 sm:text-xl leading-relaxed">
        Connecting families with trusted, verified caregivers — matched to your loved one's needs.
      </p>
      <Link
        to="/get-started"
        className="mt-10 inline-flex rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/25 hover:from-blue-700 hover:to-teal-600 hover:shadow-xl hover:shadow-blue-600/30 hover:scale-[1.03] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
        aria-label="Find a caregiver on CareLink"
      >
        Find a Caregiver
      </Link>
    </main>
  );
};
