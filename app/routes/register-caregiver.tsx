import { Link } from "react-router";
import { Header } from "../components/landing/Header";

export function meta() {
    return [
    { title: "Caregiver Registration - CareLink" },
    { name: "description", content: "Apply to become a trusted caregiver." },
    ];
}

export default function RegisterCaregiver() {
    return (
    <div className="min-h-screen bg-linear-to-br from-emerald-100 via-white to-blue-100">
        <Header />
    <main className="flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-3xl bg-white/90 p-8 shadow-xl backdrop-blur-md ring-1 ring-gray-200 sm:p-10">
        <h1 className="mb-2 text-center text-3xl font-extrabold text-emerald-900">
            Apply as Caregiver
        </h1>
        <p className="mb-8 text-center text-sm text-gray-600">
            Join our network of professional caregivers.
        </p>

        <form className="flex flex-col gap-5">
            {/* Full Name Input */}
            <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Full Name</label>
            <input 
                type="text" 
                placeholder="e.g. Jane Doe" 
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
            />
            </div>

            {/* Email Input */}
            <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Email Address</label>
            <input 
                type="email" 
                placeholder="jane@example.com" 
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
            />
            </div>

            {/* Specialization Input */}
            <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Primary Specialization</label>
            <input 
                type="text" 
                placeholder="e.g. Elderly Care, CPR Certified" 
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
            />
            </div>

            {/* Password Input */}
            <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Password</label>
            <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
            />
            </div>

            {/* Submit Button */}
            <button 
            type="button" 
            className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3.5 text-base font-bold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 hover:shadow-md active:scale-[0.98]"
            >
            Submit Application
            </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-emerald-600 transition-colors hover:text-emerald-800 hover:underline">
            Sign In
            </Link>
        </div>
        
        </div>
    </main>
    </div>
    );
}