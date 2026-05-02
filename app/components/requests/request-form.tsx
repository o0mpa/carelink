import { useState, forwardRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { getAuthHeaders, getToken } from "~/utils/auth";
import { apiUrl } from "~/utils/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarDays } from "lucide-react";

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

const formatDateYYYYMMDD = (date: Date): string => {
  // Backend expects ISO date (YYYY-MM-DD)
  return date.toISOString().split("T")[0];
};

const parseDDMMYYYY = (value: string): Date | null => {
  const parts = value.split("/");
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts.map(Number);
  if (!dd || !mm || !yyyy || yyyy < 1900) return null;
  const date = new Date(yyyy, mm - 1, dd);
  if (isNaN(date.getTime())) return null;
  return date;
};

// DateInput supports both typing and clicking the calendar icon
const DateInput = forwardRef<
  HTMLInputElement,
  {
    value?: string;
    onClick?: () => void;
    onChange?: (val: string) => void;
    placeholder?: string;
  }
>(({ value, onClick, onChange, placeholder }, ref) => {
  const [rawInput, setRawInput] = useState(value ?? "");

  // Sync when DatePicker updates value from calendar selection
  const displayValue = value !== undefined && value !== rawInput ? value : rawInput;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRawInput(val);
    if (onChange) onChange(val);
  };

  return (
    <div className="flex w-full items-center rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 hover:border-blue-400">
      <input
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder ?? "DD/MM/YYYY"}
        className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400"
      />
      <CalendarDays
        onClick={onClick}
        className="h-4 w-4 text-blue-500 cursor-pointer shrink-0"
      />
    </div>
  );
});

export default function RequestForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetCaregiverId = searchParams.get("caregiverId") || "";

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleSkillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedSkills((prev) => [...prev, value]);
    } else {
      setSelectedSkills((prev) => prev.filter((item) => item !== value));
    }
  };

  // Called when user types manually in the start date input
  const handleStartRawChange = (val: string) => {
    const parsed = parseDDMMYYYY(val);
    if (parsed) setStartDate(parsed);
  };

  // Called when user types manually in the end date input
  const handleEndRawChange = (val: string) => {
    const parsed = parseDDMMYYYY(val);
    if (parsed) setEndDate(parsed);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const token = getToken();
    if (!token) {
      setSubmitting(false);
      navigate("/login");
      return;
    }

    const formData = new FormData(e.currentTarget);

    const startDateStr = startDate ? formatDateYYYYMMDD(startDate) : "";
    const endDateStr = endDate ? formatDateYYYYMMDD(endDate) : "";

    const payload = {
      service_type: formData.get("service_type"),
      day_category: formData.get("day_category"),
      care_category: formData.get("care_category"),
      // Backend matching currently requires a concrete gender value (cp.gender = ?).
      gender_preference: formData.get("gender_preference"),
      start_date: startDateStr,
      end_date: endDateStr,
      min_compensation: Number(formData.get("min_compensation")),
      max_compensation: Number(formData.get("max_compensation")),
      medical_specialties_needed: formData.get("medical_specialties_needed") || null,
      skills_needed: selectedSkills,
    };

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

    if (startDate && endDate && endDate.getTime() < startDate.getTime()) {
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
        const data = await response.json().catch(() => ({}));
        const requestId = data?.requestId;
        if (requestId) {
          navigate(`/match-results?requestId=${requestId}`);
        } else {
          navigate("/match-results");
        }
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-200 via-white to-emerald-200 py-12">
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
                    <option value="live_out">Live-out (Caregiver visits daily)</option>
                    <option value="live_in">Live-in (Caregiver stays in the client’s home)</option>
                  </select>
                  <p className="mt-2 text-xs font-semibold text-gray-500">
                    Live-in vs live-out only determines accommodation (stays vs goes home). Your selected day category (A/B/C/D) determines the shift length.
                  </p>
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
                    <option value="C">C - 9 Hours</option>
                    <option value="D">D - 12 Hours</option>
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
                    Caregiver Gender Preference
                  </label>
                  <select
                    name="gender_preference"
                    required
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                  <p className="mt-2 text-xs font-semibold text-gray-500">
                    This is required for matching with the current backend rules.
                  </p>
                </div>

                {/* ── Start Date ── */}
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-bold text-gray-700">
                    Start Date
                  </label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date: Date | null) => setStartDate(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="DD/MM/YYYY"
                    minDate={today}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    customInput={
                      <DateInput
                        placeholder="DD/MM/YYYY"
                        onChange={handleStartRawChange}
                      />
                    }
                  />
                </div>

                {/* ── End Date ── */}
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-bold text-gray-700">
                    End Date
                  </label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date: Date | null) => setEndDate(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="DD/MM/YYYY"
                    minDate={startDate ?? today}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    customInput={
                      <DateInput
                        placeholder="DD/MM/YYYY"
                        onChange={handleEndRawChange}
                      />
                    }
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