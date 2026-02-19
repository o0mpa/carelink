import { Link } from "react-router";
import { Header } from "../components/landing/Header";

export const meta = () => {
return [
    { title: "CareLink - How it Works & Benefits" },
    { name: "description", content: "Learn about CareLink's caregiver standards, client benefits, and our mission to connect families with trusted care." },
];
};

export default function Info() {
return (
    // bg-gray-50 for a soft background
    <div className="min-h-screen bg-gray-50">
    <Header />
    
    <main className="container mx-auto px-6 py-16 md:px-10">
        
        {/* Section 1: About CareLink */}
        <section className="mb-20 text-center">
        <h1 className="text-4xl font-extrabold text-blue-900 sm:text-5xl">
            About CareLink
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-600 leading-relaxed">
            CareLink is a dedicated platform designed to bridge the gap between families in need 
            and qualified, compassionate caregivers. We believe that finding trustworthy care 
            should be simple, transparent, and safe for everyone involved.
        </p>
        </section>

        <div className="grid gap-12 lg:grid-cols-2">
        
          {/* Section 2: For Caregivers (Rules & Skills) */}
        <section className="flex flex-col rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
            <div className="mb-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">For Caregivers</h2>
            </div>

            <div className="flex-grow space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-blue-800">Core Rules & Standards</h3>
                <ul className="mt-3 space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                    <span className="mt-1 text-green-500">✔</span>
                    <span><strong>Verification First:</strong> All caregivers must pass a strict background check and identity verification.</span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="mt-1 text-green-500">✔</span>
                    <span><strong>Professionalism:</strong> Punctuality, respect, and strict adherence to the client's care plan are mandatory.</span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="mt-1 text-green-500">✔</span>
                    <span><strong>Zero Tolerance:</strong> Any report of misconduct or neglect results in immediate suspension pending investigation.</span>
                </li>
                </ul>
            </div>

            <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-semibold text-blue-800">Required Skills</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                {["CPR Certified", "Elderly Care", "Mobility Assistance", "Medication Management", "Dementia Care", "First Aid", "Empathy"].map((skill) => (
                    <span key={skill} className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                    {skill}
                    </span>
                ))}
                </div>
            </div>
            </div>

            <div className="mt-8 text-center">
            <Link 
                to="/get-started" 
                className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md active:scale-[0.98]"
            >
                Be a Caregiver Now
            </Link>
            </div>
        </section>

          {/* Section 3: For Families (Benefits) */}
        <section className="flex flex-col rounded-2xl bg-gradient-to-br from-blue-600 to-teal-600 p-8 text-white shadow-lg">
            <div className="mb-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold">For Families</h2>
            </div>

            <div className="flex-grow space-y-6">
            <p className="text-blue-50">
                We know that trusting someone with your loved one is a big decision. Here is why thousands of families choose CareLink:
            </p>

            <ul className="space-y-4">
                <li className="flex gap-3">
                <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-400 text-blue-900">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <div>
                    <h4 className="font-bold">Verified Trust</h4>
                    <p className="text-sm text-blue-100">Every caregiver profile is manually reviewed and vetted by our team.</p>
                </div>
                </li>
                <li className="flex gap-3">
                <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-400 text-blue-900">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <div>
                    <h4 className="font-bold">Smart Matching</h4>
                    <p className="text-sm text-blue-100">We match you based on medical needs, not just location.</p>
                </div>
                </li>
                <li className="flex gap-3">
                <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-400 text-blue-900">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <div>
                    <h4 className="font-bold">Real-time Updates</h4>
                    <p className="text-sm text-blue-100">Get updates on task completion and care logs directly on your dashboard.</p>
                </div>
                </li>
            </ul>
            </div>
            
            <div className="mt-8 text-center">
            <Link 
                to="/get-started" 
                // Added hover:bg-blue-600 and hover:text-white for the blue hover effect
                className="inline-block rounded-lg bg-white px-6 py-3 text-sm font-bold text-blue-600 shadow-sm transition-all duration-200 hover:bg-blue-600 hover:text-white hover:shadow-md active:scale-[0.98]"
            >
                Find a Caregiver Now
            </Link>
            </div>
        </section>

        </div>
    </main>
    </div>
);
}