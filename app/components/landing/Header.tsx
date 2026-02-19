import { Link } from "react-router";

const NAV_LINKS = [
  { to: "/#about", label: "About Us" },
  { to: "/#contact", label: "Contact" },
] as const;

export const Header = () => {
  return (
    <header className="relative z-10 w-full border-b border-blue-100 bg-white/80 px-6 py-4 backdrop-blur-sm md:px-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        {/* Logo Section - Now unclickable and static */}
        <div className="flex items-center gap-2.5 text-blue-700 select-none">
          <span
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-md ring-1 ring-blue-100"
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
          <span className="text-xl font-bold tracking-tight text-blue-800">
            CareLink
          </span>
        </div>

        <nav
          className="hidden md:flex items-center gap-10"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="text-base font-semibold text-gray-600 hover:text-blue-600 hover:underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm transition-colors duration-200"
            >
              {label}
            </Link>
          ))}
        </nav>

        <Link
          to="/login"
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
          aria-label="Sign in"
        >
          Sign In
        </Link>
      </div>
    </header>
  );
};