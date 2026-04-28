import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { getAuthHeaders, getToken } from "~/utils/auth";
import { apiUrl } from "~/utils/api";

export function meta() {
  return [
    { title: "Request a Caregiver - CareLink" },
    { name: "description", content: "Submit a request to find a matched caregiver." },
  ];
}

const SKILLS_LIST = [
  { value: "physical_care", label: "Physical care" },
  { value: "medication_management", label: "Medication management" },
  { value: "meal_preparation", label: "Meal preparation" },
  { value: "housekeeping", label: "Housekeeping and cleaning" },
  { value: "emotional_support", label: "Emotional support" },
  { value: "transportation", label: "Transportation" },
  { value: "health_monitoring", label: "Health monitoring" },
];

export default function RequestForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // SMART FEATURE: If the client clicked "Book" directly from a caregiver's profile,
  // we can grab their ID from the URL (e.g., /request?caregiverId=5)
  const targetCaregiverId = searchParams.get("caregiverId") || "";

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Safely manage checkbox arrays
  const handleSkillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedSkills((prev) => [...prev, value]);
    } else {
      setSelectedSkills((prev) => prev.filter((item) => item !== value));
    }
  };

  // BACKEND CONNECTION: Send JSON payload to POST /api/requests
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    const formData = new FormData(e.currentTarget);
    
    // Map the form inputs exactly to the backend's expected snake_case variables
    const startDate = String(formData.get("start_date") || "");
    const endDate = String(formData.get("end_date") || "");

    const payload = {
      caregiver_id: targetCaregiverId ? parseInt(targetCaregiverId) : null,
      service_type: formData.get("service_type"),
      day_category: formData.get("day_category"),
      care_category: formData.get("care_category"),
      gender_preference: formData.get("gender_preference") || null,
      start_date: startDate,
      end_date: endDate,
      min_compensation: Number(formData.get("min_compensation")),
      max_compensation: Number(formData.get("max_compensation")),
      medical_specialties_needed: formData.get("medical_specialties_needed") || null,
      skills_needed: selectedSkills, // Pass as an array, the backend will serialize it
    };

    // Frontend validation guardrails
    if (payload.min_compensation > payload.max_compensation) {
      setError("Minimum compensation cannot be greater than maximum.");
      setSubmitting(false);
      return;
    }

    if (!payload.start_date || !payload.end_date) {
      setError("Please select both a start and end date.");
      setSubmitting(false);
      return;
    }

    if (payload.end_date < payload.start_date) {
      setError("End date cannot be earlier than start date.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch(apiUrl("/api/requests"), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Success! Redirect them to their dashboard to see the pending request
        navigate("/dashboard/client?requestCreated=true");
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || "Failed to submit request. Please try again.");
      }
    } catch (err) {
      setError("Cannot connect to the server. Is your backend running?");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-100 via-white to-emerald-100 py-12">
      <main className="flex flex-col items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-4xl rounded-2xl bg-white/95 p-6 shadow-xl backdrop-blur-md ring-2 ring-gray-300 sm:p-10">
          
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold text-blue-900">
              Request a Caregiver
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {targetCaregiverId 
                ? "You are booking a specific caregiver. Fill out the job details below." 
                : "Fill out your requirements, and we will find the perfect matches."}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-800 ring-1 ring-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            
            {/* Job Details Section */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-blue-800">
                Job Details
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-bold text-gray-700">
                    Service Type
                  </label>
                  <select
                    name="service_type"
                    required
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Service Type</option>
                    <option value="hourly">Hourly (Category A/B/C)</option>
                    <option value="live_in">Full Day / Live-in (Category D)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-bold text-gray-700">
                    Day Category
                  </label>
                  <select
                    name="day_category"
                    required
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Duration Category</option>
                    <option value="A">A - 3 Hours</option>
                    <option value="B">B - 6 Hours</option>
                    <option value="C">C - 12 Hours</option>
                    <option value="D">D - 24 Hours</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-bold text-gray-700">
                    Care Category
                  </label>
                  <select
                    name="care_category"
                    required
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Care Category</option>
                    <option value="Elderly Care">Elderly Care</option>
                    <option value="Medical Care">Medical Care</option>
                    <option value="Post-Surgery">Post-Surgery</option>
                    <option value="Companion Care">Companion Care</option>
                    <option value="Disability Support">Disability Support</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-bold text-gray-700">
                    Caregiver Gender Preference (Optional)
                  </label>
                  <select
                    name="gender_preference"
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No Preference</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-bold text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-bold text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </section>

            {/* Compensation Section */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-blue-800">
                Compensation Offered (Daily)
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-bold text-gray-700">
                    Minimum Rate (E£)
                  </label>
                  <input
                    type="number"
                    name="min_compensation"
                    min="0"
                    step="50"
                    required
                    placeholder="e.g. 500"
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold text-gray-700">
                    Maximum Rate (E£)
                  </label>
                  <input
                    type="number"
                    name="max_compensation"
                    min="0"
                    step="50"
                    required
                    placeholder="e.g. 1000"
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </section>

            {/* Medical & Skills Section */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-blue-800">
                Care Requirements
              </h2>
              <div className="rounded-xl border-2 border-gray-300 bg-white p-4">
                <label className="mb-3 block text-sm font-bold text-gray-700 border-b pb-2">
                  Skills Needed
                </label>
                <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {SKILLS_LIST.map((skill) => (
                    <label key={skill.value} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        value={skill.value}
                        checked={selectedSkills.includes(skill.value)}
                        onChange={handleSkillChange}
                        className="h-4 w-4 rounded border-2 border-gray-400 accent-blue-600 focus:ring-blue-500"
                      />
                      {skill.label}
                    </label>
                  ))}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Specific Medical Specialties Needed
                  </label>
                  <input
                    type="text"
                    name="medical_specialties_needed"
                    placeholder="e.g., Alzheimer's, Diabetes, Post-surgery recovery"
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </section>

            <div className="border-t-2 border-gray-100 pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-blue-600 px-4 py-4 text-lg font-bold text-white shadow-md transition-all duration-200 hover:scale-[1.01] hover:bg-blue-700 hover:shadow-lg active:scale-[0.98] disabled:opacity-70"
              >
                {submitting ? "Submitting Request..." : "Find Matching Caregivers"}
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

          </form>
        </div>
      </main>
    </div>
  );
}