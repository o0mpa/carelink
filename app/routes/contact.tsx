import { Header } from "../components/landing/Header";

export function meta() {
    return [
    { title: "Contact Us - CareLink" },
    { name: "description", content: "Get in touch with the CareLink team." },
    ];
}

export default function Contact() {
    return (
    <div className="min-h-screen bg-linear-to-br from-blue-100 via-white to-emerald-100">
        <Header />
        <main className="container mx-auto px-6 py-16 md:px-10">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white/95 p-8 shadow-xl backdrop-blur-md ring-2 ring-gray-300 sm:p-10">
        
        <h1 className="mb-4 text-center text-3xl font-extrabold text-blue-900 sm:text-4xl">
            Contact Us
        </h1>
            <p className="mb-10 text-center text-lg text-gray-600">
            Have questions or need support? We would love to hear from you.
            </p>

            <div className="grid gap-10 md:grid-cols-2">
            
            {/* Contact Information */}
            <div className="flex flex-col justify-center rounded-xl bg-blue-50/50 p-8 ring-2 ring-blue-100">
                <h2 className="mb-6 text-xl font-bold text-blue-900">Get in Touch</h2>
                <p className="mb-8 text-sm text-gray-600 leading-relaxed">
                Whether you are a family looking for care or a caregiver looking to join our network, our team is here to help. Reach out to us via email and we will respond as soon as possible.
                </p>
            
                <div className="space-y-6">
                {/* Email 1: Support */}
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-sm">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    </div>
                <div>
                    <p className="text-sm font-bold text-gray-900">Support Team</p>
                    <a href="mailto:carelink.support@gmail.com" className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline">
                        carelink.support@gmail.com
                    </a>
                    </div>
                </div>

                {/* Email 2: General Inquiries */}
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    </div>
                <div>
                    <p className="text-sm font-bold text-gray-900">General Inquiries</p>
                        <a href="mailto:carelink.inquiries@gmail.com" className="text-sm font-medium text-emerald-600 hover:text-emerald-800 hover:underline">
                            carelink.inquiries@gmail.com
                        </a>
                    </div>
                </div>
            </div>
        </div>

            {/* Contact Form */}
            <form className="flex flex-col gap-5">
                <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Your Name</label>
                <input 
                    type="text" 
                    required 
                    placeholder="your name" 
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
                </div>
            <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Email Address</label>
                <input 
                    type="email" 
                    required 
                    placeholder="ahmed@example.com" 
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
                </div>
            <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Message</label>
                <textarea 
                    required 
                    rows={5} 
                    placeholder="How can we help you?" 
                    className="w-full resize-none rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
                </div>
            <button 
                type="submit" 
                className="mt-2 w-full rounded-xl bg-blue-600 px-4 py-3.5 text-base font-bold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md active:scale-[0.98]"
            >
                Send Message
            </button>
            </form>

                </div>
            </div>
        </main>
    </div>
    );
}