import { Link } from "react-router";
import { Header } from "../landing/Header";

export function meta() {
    return [
    { title: "Get Started - CareLink" },
    { name: "description", content: "Join CareLink as a caregiver or find care for a loved one." }
    ];
}

export default function GetStarted() {
    return (
        <div className="min-h-screen bg-linear-to-br from-blue-100 via-white to-emerald-100">
            <Header /> 
        <main className="container mx-auto px-6 py-16 text-center md:px-10">
        <h1 className="text-4xl font-extrabold text-blue-900 sm:text-5xl drop-shadow-sm">
            Join CareLink
        </h1>
        <p className="mt-4 text-lg font-medium text-gray-600">
            Please select how you would like to use our platform today.
        </p>

        <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-2">
        
          {/* Option 1: Family/Client Selection Card */}
            <Link
            to="/register/client"
            className="group flex flex-col items-center rounded-3xl bg-white/90 backdrop-blur-sm p-10 shadow-lg ring-2 ring-transparent transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:ring-blue-400 active:scale-[0.98]"
            >
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-inner transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white">
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-900 transition-colors">Find Care</h2>
            <p className="mt-4 grow text-sm text-gray-600 leading-relaxed">
                I am looking for a qualified, verified caregiver to assist my loved one with their daily or medical needs.
            </p>
            <span className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-50 px-5 py-2.5 text-sm font-bold text-blue-700 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white">
                Continue as Client <span>→</span>
            </span>
            </Link>

          {/* Option 2: Caregiver Selection Card */}
            <Link
            to="/register/caregiver"
            className="group flex flex-col items-center rounded-3xl bg-white/90 backdrop-blur-sm p-10 shadow-lg ring-2 ring-transparent transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:ring-emerald-400 active:scale-[0.98]"
            >
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-inner transition-colors duration-300 group-hover:bg-emerald-600 group-hover:text-white">
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 group-hover:text-emerald-900 transition-colors">Apply as Caregiver</h2>
            <p className="mt-4 grow text-sm text-gray-600 leading-relaxed">
                I am a professional caregiver looking to offer my services, manage my schedule, and connect with families in need.
            </p>
            <span className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-5 py-2.5 text-sm font-bold text-emerald-700 transition-colors duration-300 group-hover:bg-emerald-600 group-hover:text-white">
                Continue as Caregiver <span>→</span>
            </span>
                </Link>

            </div>
        </main>
    </div>
    );
}