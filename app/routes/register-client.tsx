import { Link } from "react-router";
import { Header } from "../components/landing/Header";

export function meta() {
    return [
    { title: "Family Registration - CareLink" },
    { name: "description", content: "Create an account to find trusted caregivers." },
    ];
}

export default function RegisterClient() {
    return (
    <div className="min-h-screen bg-linear-to-br from-blue-100 via-white to-emerald-100">
    <Header />
    
    <main className="flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-3xl bg-white/90 p-8 shadow-xl backdrop-blur-md ring-1 ring-gray-200 sm:p-10">
        
        <h1 className="mb-2 text-center text-3xl font-extrabold text-blue-900">
            Find Care
        </h1>
        <p className="mb-8 text-center text-sm text-gray-600">
            Create a family account to connect with trusted caregivers.
        </p>

        <form className="flex flex-col gap-5">
            {/* Full Name Input */}
            <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Full Name</label>
            <input 
                type="text" 
                placeholder="e.g. John Doe" 
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
            />
            </div>

            {/* Email Input */}
            <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Email Address</label>
            <input 
                type="email" 
                placeholder="john@example.com" 
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
            />
            </div>

            {/* Phone Number Input */}
            <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Phone Number</label>
            <input 
                type="tel" 
                placeholder="+20 100 000 0000" 
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
            />
            </div>

            {/* Password Input */}
            <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Password</label>
            <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
            />
            </div>

            {/* Submit Button */}
            <button 
            type="button" 
            className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3.5 text-base font-bold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md active:scale-[0.98]"
            >
            Create Family Account
            </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-blue-600 transition-colors hover:text-blue-800 hover:underline">
            Sign In
            </Link>
        </div>
        
        </div>
    </main>
    </div>
    );
}