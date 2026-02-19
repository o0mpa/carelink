import { Link } from "react-router";

// Navigation links with "Home" removed
const NAV_LINKS = [
  { to: "/info", label: "About Us" },
] as const;

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-blue-100/50 bg-gradient-to-r from-blue-50/80 via-white/80 to-emerald-50/80 px-6 py-4 shadow-sm backdrop-blur-xl transition-all duration-300 md:px-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        
        {/* Logo Section - Now has an active click scale effect */}
        <Link 
          to="/" 
          className="flex items-center gap-2.5 select-none transition-transform duration-200 active:scale-[0.98]" 
          aria-label="CareLink home"
        >
          <span
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/60 shadow-sm ring-1 ring-blue-100 backdrop-blur-sm"
            aria-hidden
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 32 32"
              fill="none"
              aria-hidden
            >
              <path
                d="M16 6v6h6v4h-6v6h-4v-6H6v-4h6V6h4z"
                className="fill-blue-600"
              />
              <path
                d="M22 24c-.4 0-.8-.1-1.2-.3C17 22.3 14 19 14 15c0-2.2 1.8-4 4-4 1.2 0 2.3.5 3 1.4.7-.9 1.8-1.4 3-1.4 2.2 0 4 1.8 4 4 0 4-3 7.3-6.8 8.7-.4.2-.8.3-1.2.3z"
                className="fill-emerald-500"
              />
            </svg>
          </span>
          <span className="text-xl font-bold tracking-tight text-blue-900">
            CareLink
          </span>
        </Link>

        {/* Navigation Links */}
        <nav
          className="hidden md:flex items-center gap-8"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="group relative text-sm font-semibold text-gray-600 transition-colors duration-200 hover:text-blue-700 focus:outline-none"
            >
              {label}
              {/* Animated underline effect */}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-blue-600 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Sign In Button */}
        <Link
          to="/login"
          className="rounded-xl bg-white/80 px-5 py-2.5 text-sm font-semibold text-blue-700 shadow-sm ring-1 ring-blue-100 backdrop-blur-sm transition-all duration-200 hover:bg-blue-600 hover:text-white hover:shadow-md hover:ring-blue-600 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Sign in"
        >
          Sign In
        </Link>
      </div>
    </header>
  );
};