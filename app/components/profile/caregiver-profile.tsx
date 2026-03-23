import { useState } from "react";
import { Link, Form } from "react-router";

export function meta() {
  return [
    { title: "Caregiver Profile - CareLink" },
    {
      name: "description",
      content:
        "Manage your professional caregiver profile, certifications, and availability.",
    },
  ];
}

export default function CaregiverProfile() {
  const [activeTab, setActiveTab] = useState<"professional" | "experience">(
    "professional"
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-100 via-white to-emerald-100">
      <main className="container mx-auto px-4 py-10 sm:px-6 md:px-10">
        <div className="mx-auto max-w-5xl">
          {/* Profile Header */}
          <div className="mb-6 flex flex-col items-center justify-between rounded-3xl bg-white/90 p-8 shadow-lg backdrop-blur-md ring-2 ring-blue-100 sm:flex-row sm:p-10">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-3xl font-bold text-white shadow-md">
                <svg
                  className="h-10 w-10 text-white/90"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
                {/* Profile upload */}
                <Form method="post" encType="multipart/form-data">
                  <label
                    className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-teal-600 shadow-md ring-2 ring-blue-100 transition-colors hover:bg-gray-50 hover:text-blue-800"
                    title="Upload Profile Picture"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <input
                      type="file"
                      name="profile_picture"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.form?.requestSubmit()}
                    />
                  </label>
                </Form>
              </div>

              <div className="text-center sm:text-left">
                <h1 className="text-slate-0 text-3xl font-extrabold text-green-900">
                  Your Name
                </h1>
                <p className="mt-1 text-sm font-semibold text-gray-600">
                  Certified Caregiver
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-300">
                    Account Verified
                  </span>
                  <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-300">
                    4.9 ★ Rating
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:mt-0">
              <button className="rounded-xl border-2 border-emerald-600 bg-transparent px-5 py-2.5 text-sm font-bold text-emerald-600 transition-all hover:bg-emerald-50 active:scale-[0.98]">
                Edit Profile
              </button>
              
              <Link
                to="/forgot-password"
                className="flex items-center justify-center rounded-xl border-2 border-orange-500 bg-transparent px-5 py-2.5 text-sm font-bold text-orange-500 transition-all hover:bg-orange-50 active:scale-[0.98]"
              >
                Change Password
              </Link>

              <Form method="post" action="/logout">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center rounded-xl border-2 border-red-500 bg-transparent px-5 py-2.5 text-sm font-bold text-red-500 transition-all hover:bg-red-50 active:scale-[0.98]"
                >
                  Logout
                </button>
              </Form>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-6 flex space-x-2 rounded-xl bg-white/50 p-1 ring-1 ring-gray-200 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab("professional")}
              className={`flex-1 rounded-lg py-3 text-sm font-bold transition-all ${
                activeTab === "professional"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-white/80 hover:text-emerald-600"
              }`}
            >
              Professional Profile
            </button>
            <button
              onClick={() => setActiveTab("experience")}
              className={`flex-1 rounded-lg py-3 text-sm font-bold transition-all ${
                activeTab === "experience"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-white/80 hover:text-emerald-600"
              }`}
            >
              Experience & Skills
            </button>
          </div>
          <div className="rounded-3xl bg-white/90 p-8 shadow-xl backdrop-blur-md ring-2 ring-gray-300 sm:p-10">
            {/* PROFESSIONAL INFO */}
            {activeTab === "professional" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="mb-6 border-b-2 border-gray-100 pb-3 text-2xl font-bold text-slate-900">
                  Basic Information
                </h2>
                <div className="mb-10 grid gap-6 md:grid-cols-2">
                  <div className="rounded-xl border-2 border-gray-100 bg-gray-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Contact Details
                    </p>
                    <p className="mt-2 text-sm text-gray-900">
                      <span className="font-semibold">Email:</span>{" "}
                      email@example.com
                    </p>
                    <p className="mt-1 text-sm text-gray-900">
                      <span className="font-semibold">Phone:</span> phone number
                    </p>
                    <p className="mt-1 text-sm text-gray-900">
                      <span className="font-semibold">Age:</span> X{" "}
                    </p>
                    <p className="mt-1 text-sm text-gray-900">
                      <span className="font-semibold">Gender:</span> X{" "}
                    </p>
                  </div>
                  <div className="rounded-xl border-2 border-gray-100 bg-gray-50 p-4 md:col-span-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Service Area
                    </p>
                    <p className="mt-2 text-sm text-gray-900">
                      Willing to travel within Dokki & Mohandseen
                    </p>
                  </div>
                </div>

                {/* 3. Accepted Salaries */}
                <section>
                  <h2 className="mb-1 border-b-0.5 border-emerald-50 pb-3 text-2xl font-bold text-emerald-900">
                    Accepted Salaries Per Day
                  </h2>
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {[
                      { label: "Category A (3h)", price: "250.00" },
                      { label: "Category B (6h)", price: "450.00" },
                      { label: "Category C (9h)", price: "600.00" },
                      { label: "Category D (12h)", price: "850.00" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl border-2 border-gray-100 bg-white p-2 text-center shadow-sm"
                      >
                        <p className="mb-2 text-[10px] font-bold uppercase text-gray-700">
                          {item.label}
                        </p>
                        <div className="flex items-center justify-center gap-1 text-emerald-700">
                          <span className="text-sm font-semibold">E£</span>
                          <span className="text-sm font-black">
                            {item.price}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
            {/* EXPERIENCE & SKILLS TAB CONTENT */}
            {activeTab === "experience" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 space-y-12 duration-300">
                {/* 1. Skills & Experience */}
                <section>
                  <h2 className="mb-6 border-b-2 border-emerald-50 pb-3 text-2xl font-bold text-emerald-900">
                    Skills & Experience
                  </h2>
                  <div className="rounded-2xl border-2 border-gray-100 bg-gray-50/50 p-6 sm:p-8">
                    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                      {[
                        "Physical care",
                        "Medication management",
                        "Emotional support",
                        "Health monitoring",
                      ].map((skill) => (
                        <div key={skill} className="flex items-center gap-3">
                          <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-600 shadow-sm">
                            <svg
                              className="h-3.5 w-3.5 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={4}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                          <span className="text-sm font-semibold text-slate-700">
                            {skill}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-200 pt-3">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                        Medical Specialties
                      </p>
                      <p className="text-md font-medium italic text-slate-700">
                        "diabetic patient monitoring"
                      </p>
                    </div>
                  </div>
                </section>

                {/* 2. Verification Documents */}
                <section>
                  <h2 className="mb-6 border-b-2 border-emerald-50 pb-3 text-2xl font-bold text-emerald-900">
                    Verification Documents
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      "High School / Higher Education",
                      "Caregiving / First Aid Cert",
                      "National ID",
                      "Criminal Record",
                      "Past References (Optional)",
                    ].map((doc) => (
                      <div
                        key={doc}
                        className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex flex-col">
                          <span className="text-[12px] font-bold uppercase text-gray-700">
                            {doc}
                          </span>
                          <span className="text-xs font-semibold text-emerald-600">
                            View File
                          </span>
                        </div>

                        {/* Simplified View Icon*/}
                        <button className="text-gray-400 transition-colors hover:text-emerald-600">
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}