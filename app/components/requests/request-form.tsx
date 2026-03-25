import { useState } from "react";
import { Link, Form } from "react-router";

export function meta() {
  return [
    { title: "Request a Caregiver - CareLink" },
    {
      name: "description",
      content: "Submit a request to find a matched caregiver.",
    },
  ];
}

export default function RequestForm() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  let duration = 0;
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end >= start) {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-100 via-white to-emerald-100 py-12">
      <main className="container mx-auto px-4 sm:px-6 md:px-10">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white/95 p-8 shadow-xl backdrop-blur-md ring-2 ring-blue-100 sm:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold text-blue-900">
              Request Caregiver
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Fill out your care requirements to find the perfect match.
            </p>
          </div>

<Form method="post" action="/match-results" className="space-y-8">   
            <section>
              <h2 className="mb-4 border-b-2 border-gray-100 pb-2 text-xl font-bold text-blue-800">
                1. Service Details
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Service Type
                  </label>
                  <select
                    name="serviceType"
                    required
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Service Type</option>
                    <option value="live-out">
                      Live-out (Hourly/Daily shifts)
                    </option>
                    <option value="live-in">Live-in (24/7 care)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Day Category (Shift Length)
                  </label>
                  <select
                    name="dayCategory"
                    required
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    <option value="A">Category A (3 Hours)</option>
                    <option value="B">Category B (6 Hours)</option>
                    <option value="C">Category C (9 Hours)</option>
                    <option value="D">Category D (12 Hours)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Gender Preference
                  </label>
                  <select
                    name="genderPreference"
                    required
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="any">No Preference</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Compensation Range (E£ per day)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="minCompensation"
                      placeholder="Min"
                      required
                      min="0"
                      className="w-full rounded-xl border-2 border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="font-bold text-gray-500">-</span>
                    <input
                      type="number"
                      name="maxCompensation"
                      placeholder="Max"
                      required
                      min="0"
                      className="w-full rounded-xl border-2 border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Schedule */}
            <section>
              <h2 className="mb-4 border-b-2 border-gray-100 pb-2 text-xl font-bold text-blue-800">
                2. Schedule & Duration
              </h2>
              <div className="rounded-xl border-2 border-blue-100 bg-blue-50/50 p-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      min={startDate}
                      className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                {duration > 0 && (
                  <div className="mt-6 flex flex-col items-center justify-center rounded-xl border-2 border-blue-200 bg-white py-4 shadow-sm">
                    <p className="text-sm font-bold text-gray-600">
                      Total Duration
                    </p>
                    <p className="text-2xl font-black text-blue-600">
                      {duration} <span className="text-lg">Days</span>
                    </p>
                    <input type="hidden" name="totalDays" value={duration} />
                  </div>
                )}
              </div>
            </section>

            {/* Care Requirements */}
            <section>
              <h2 className="mb-4 border-b-2 border-gray-100 pb-2 text-xl font-bold text-blue-800">
                3. Care Requirements
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-3 block text-sm font-bold text-gray-700">
                    Skills Needed
                  </label>
                  <div className="grid grid-cols-1 gap-3 rounded-xl border-2 border-gray-200 bg-gray-50 p-4 sm:grid-cols-2 md:grid-cols-3">
                    {[
                      "Physical care",
                      "Medication management",
                      "Meal preparation",
                      "Housekeeping and cleaning",
                      "Emotional support",
                      "Transportation",
                      "Health monitoring",
                    ].map((skill) => (
                      <label
                        key={skill}
                        className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-800"
                      >
                        <input
                          type="checkbox"
                          name="skills"
                          value={skill}
                          className="h-4 w-4 rounded border-2 border-gray-400 accent-blue-600 focus:ring-blue-500"
                        />
                        {skill}
                      </label>
                    ))}
                  </div>
                  <p className="mt-2 text-xs italic text-gray-500">
                    * Note: If left blank, we will auto-fetch skills from your
                    medical profile.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Specific Medical Specialties Needed
                  </label>
                  <input
                    type="text"
                    name="medicalSpecialties"
                    placeholder="e.g., Alzheimer's, Diabetes, Post-surgery recovery"
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </section>

<div className="border-t-2 border-gray-100 pt-6">
              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 px-4 py-4 text-lg font-bold text-white shadow-md transition-all duration-200 hover:scale-[1.01] hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]"
              >
                Find Matching Caregivers
              </button>
              <div className="mt-4 text-center">
                <Link
                  to="/dashboard/client"
                  className="text-sm font-semibold text-gray-500 transition-colors hover:text-gray-800 hover:underline"
                >
                  Cancel and return to Dashboard
                </Link>
              </div>
            </div>
          </Form>
        </div>
      </main>
    </div>
  );
}   