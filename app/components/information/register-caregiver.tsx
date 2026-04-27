import { useState } from "react";
import { Link, Form, redirect, useActionData, useNavigation } from "react-router";

export function meta() {
  return [
    { title: "Caregiver Sign Up - CareLink" },
    { name: "description", content: "Apply to become a trusted caregiver." },
  ];
}

// BACKEND CONNECTION: Sends raw FormData (including files) to the backend.
// On success the backend returns 201 with approval_status = 'Pending',
// so we redirect to /login?pending=true — NOT ?registered=true.
export async function action({ request }: { request: Request }) {
  const formData = await request.formData();

  // ── Password match ──────────────────────────────────────────────────────
  if (formData.get("password") !== formData.get("confirmPassword")) {
    return { error: "Passwords do not match. Please try again." };
  }
  formData.delete("confirmPassword");

  // ── Skills validation ───────────────────────────────────────────────────
  const skills = formData.getAll("skills") as string[];
  if (skills.length === 0) {
    return { error: "Please select at least one skill." };
  }
  // Multer parses repeated fields into an array automatically — no manual
  // JSON.stringify needed here; the backend does JSON.stringify(skills).

  try {
    // FIX: do NOT set Content-Type — let the browser set multipart/form-data
    // with the correct boundary for file uploads automatically.
    const response = await fetch("http://localhost:5000/api/auth/signup-caregiver", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      // FIX: caregivers land in approval_status = 'Pending', so we redirect
      // to the pending banner in the login page — not the registered banner.
      return redirect("/login?pending=true");
    }

    // Safely parse error response
    const errorText = await response.text().catch(() => "");
    let errorData: Record<string, unknown> = {};
    try { errorData = errorText ? JSON.parse(errorText) : {}; } catch { /* */ }

    const msg =
      (typeof errorData.message === "string" && errorData.message) ||
      (typeof errorData.error   === "string" && errorData.error)   ||
      errorText.trim() ||
      "Registration failed. Please try again.";

    return { error: msg };

  } catch {
    return { error: "Cannot connect to the server. Is your backend running?" };
  }
}

export default function RegisterCaregiver() {
  const actionData   = useActionData<{ error?: string }>();
  const navigation   = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [selectedCity, setSelectedCity] = useState("");

  // Password state for live strength indicators
  const [password, setPassword] = useState("");

  // DOB and Age stay in sync — age is recalculated server-side too via calculateAge()
  const [dob, setDob] = useState("");
  const [age, setAge] = useState("");

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDob = e.target.value;
    setDob(newDob);

    if (newDob) {
      const birthDate      = new Date(newDob);
      const today          = new Date();
      let calculatedAge    = today.getFullYear() - birthDate.getFullYear();
      const m              = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) calculatedAge--;
      setAge(calculatedAge >= 0 ? calculatedAge.toString() : "0");
    } else {
      setAge("");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-100 via-white to-blue-100 py-12">
      <main className="flex flex-col items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-4xl rounded-2xl bg-white/95 p-6 shadow-xl backdrop-blur-md ring-2 ring-gray-300 sm:p-10">
          <h1 className="mb-2 text-center text-3xl font-extrabold text-emerald-900">
            Caregiver Application
          </h1>
          <p className="mb-8 text-center text-sm text-gray-600">
            Join our network of professional caregivers.
          </p>

          {/* Error Banner */}
          {actionData?.error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-800 ring-1 ring-red-200">
              {actionData.error}
            </div>
          )}

          {/* encType="multipart/form-data" is required for file uploads */}
          <Form method="post" encType="multipart/form-data" className="flex flex-col gap-8">

            {/* ── Account Security ── */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-emerald-800">Account Security</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Username</label>
                  <input type="text" name="username" required
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Email Address</label>
                  <input type="email" name="email" required
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>

                {/* Password with live strength indicators matching backend validation:
                    length >= 8, uppercase, lowercase, number, special character */}
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Password</label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?&quot;:{}|<>]).{8,}"
                    title="Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character."
                    placeholder="Min 8 chars, 1 Capital, 1 Number, 1 Special"
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="mt-2 space-y-1">
                    <p className={`text-xs ${password.length >= 8 ? "text-emerald-600" : "text-gray-400"}`}>
                      ✓ Minimum 8 characters
                    </p>
                    <p className={`text-xs ${/[A-Z]/.test(password) ? "text-emerald-600" : "text-gray-400"}`}>
                      ✓ At least 1 uppercase letter
                    </p>
                    <p className={`text-xs ${/[a-z]/.test(password) ? "text-emerald-600" : "text-gray-400"}`}>
                      ✓ At least 1 lowercase letter
                    </p>
                    <p className={`text-xs ${/[0-9]/.test(password) ? "text-emerald-600" : "text-gray-400"}`}>
                      ✓ At least 1 number
                    </p>
                    <p className={`text-xs ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "text-emerald-600" : "text-gray-400"}`}>
                      ✓ At least 1 special character (!@#$%^&*…)
                    </p>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    minLength={8}
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Security / Recovery Questions */}
                <div className="mt-4 rounded-xl border-2 border-gray-200 bg-gray-50 p-4 md:col-span-2">
                  <h3 className="mb-4 font-semibold text-gray-800">Password Recovery Questions</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">Security Question 1</label>
                      <input type="text" name="securityQuestion1" required
                        placeholder="e.g. What is the name of your first pet?"
                        className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">Answer 1</label>
                      <input type="text" name="securityAnswer1" required placeholder="Your answer"
                        className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">Security Question 2</label>
                      <input type="text" name="securityQuestion2" required
                        placeholder="e.g. In what city were you born?"
                        className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">Answer 2</label>
                      <input type="text" name="securityAnswer2" required placeholder="Your answer"
                        className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Personal Information ── */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-emerald-800">Personal Information</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Full Name</label>
                  <input type="text" name="full_name" required
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Gender</label>
                  {/*
                    FIX: values must be "Male" / "Female" (capitalized) to match the
                    matching algorithm: AND cp.gender = ?
                    where ? = request.gender_preference which is "Male" or "Female".
                    Lowercase "male"/"female" would cause caregivers to never match.
                  */}
                  <select name="gender" required
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    required
                    max="9999-12-31"
                    value={dob}
                    onChange={handleDobChange}
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                {/* Age is read-only — calculated from DOB.
                    The backend also recalculates it server-side via calculateAge(). */}
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Age (auto-calculated)</label>
                  <input
                    type="number"
                    name="age"
                    required
                    readOnly
                    value={age}
                    className="w-full cursor-not-allowed rounded-xl border-2 border-gray-300 bg-gray-100 px-4 py-2.5 text-sm text-gray-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    name="phone_number"
                    required
                    maxLength={11}
                    onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "").slice(0, 11);
                    }}
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </section>

            {/* ── Location ── */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-emerald-800">Location</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">City</label>
                  <select name="city" required value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="">Select City</option>
                    <option value="Cairo">Cairo</option>
                    <option value="Giza">Giza</option>
                    <option value="Alexandria">Alexandria</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Area</label>
                  <select name="area" required disabled={!selectedCity}
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100">
                    <option value="">Select Area</option>
                    {selectedCity === "Cairo" && (<>
                      <option value="Nasr City">Nasr City</option>
                      <option value="Heliopolis">Heliopolis (Masr El Gedida)</option>
                      <option value="New Cairo">New Cairo</option>
                      <option value="Maadi">Maadi</option>
                      <option value="Mokattam">Mokattam</option>
                      <option value="Shubra">Shubra</option>
                      <option value="Zamalek">Zamalek</option>
                      <option value="Garden City">Garden City</option>
                      <option value="Downtown Cairo">Downtown Cairo</option>
                      <option value="El Rehab">El Rehab</option>
                      <option value="Madinaty">Madinaty</option>
                      <option value="Fifth Settlement">Fifth Settlement</option>
                    </>)}
                    {selectedCity === "Giza" && (<>
                      <option value="Dokki">Dokki</option>
                      <option value="Mohandessin">Mohandessin</option>
                      <option value="Haram">Haram</option>
                      <option value="Faisal">Faisal</option>
                      <option value="Sheikh Zayed">Sheikh Zayed</option>
                      <option value="6th of October">6th of October</option>
                      <option value="Agouza">Agouza</option>
                      <option value="Imbaba">Imbaba</option>
                    </>)}
                    {selectedCity === "Alexandria" && (<>
                      <option value="Smouha">Smouha</option>
                      <option value="Sidi Gaber">Sidi Gaber</option>
                      <option value="Stanley">Stanley</option>
                      <option value="Miami">Miami</option>
                      <option value="Montaza">Montaza</option>
                      <option value="Raml Station">Raml Station</option>
                      <option value="Borg El Arab">Borg El Arab</option>
                    </>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Full Address</label>
                  <input type="text" name="full_address" required
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
            </section>

            {/* ── Skills & Experience ── */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-emerald-800">Skills & Experience</h2>
              <div className="rounded-xl border-2 border-gray-300 bg-white p-4">
                {/*
                  Skills are sent as repeated multipart fields with name="skills".
                  Multer parses them into an array — the backend does JSON.stringify(skills)
                  before inserting into the DB. Values must match what the matching
                  algorithm's JSON_OVERLAPS() check expects.
                */}
                <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    { value: "physical_care",         label: "Physical care"            },
                    { value: "medication_management", label: "Medication management"    },
                    { value: "meal_preparation",      label: "Meal preparation"         },
                    { value: "housekeeping",          label: "Housekeeping and cleaning" },
                    { value: "emotional_support",     label: "Emotional support"        },
                    { value: "transportation",        label: "Transportation"           },
                    { value: "health_monitoring",     label: "Health monitoring"        },
                  ].map(({ value, label }) => (
                    <label key={value} className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" name="skills" value={value}
                        className="h-4 w-4 rounded border-2 border-gray-400 accent-emerald-600 focus:ring-emerald-500" />
                      {label}
                    </label>
                  ))}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Medical Specialties (Conditions / Disabilities Experienced In)
                  </label>
                  <input type="text" name="medical_specialties"
                    placeholder="e.g., Dementia care, Post-surgery recovery"
                    className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
            </section>

            {/* ── Document Uploads ── */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-emerald-800">Verification Documents</h2>
              {/*
                File field names must exactly match the backend multer config:
                upload.fields([
                  { name: "education_docs" },
                  { name: "certificates" },
                  { name: "national_id" },
                  { name: "criminal_record" },
                  { name: "references" }
                ])
              */}
              <div className="grid grid-cols-1 gap-4 rounded-xl border-2 border-emerald-200 bg-emerald-50/30 p-4 md:grid-cols-3">
                {[
                  { label: "High School / Higher Ed",    name: "education_docs",  required: true  },
                  { label: "Caregiving / First Aid Cert", name: "certificates",   required: true  },
                  { label: "National ID",                 name: "national_id",    required: true  },
                  { label: "Criminal Record",             name: "criminal_record", required: true },
                  { label: "Past References (Optional)", name: "references",      required: false },
                ].map(({ label, name, required }) => (
                  <div key={name}>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">{label}</label>
                    <input type="file" name={name} accept=".jpg,.jpeg,.png,.pdf" required={required}
                      className="max-w-full text-xs font-semibold text-gray-900 file:mr-2 file:cursor-pointer file:rounded-lg file:border-0 file:bg-emerald-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700 file:transition-colors file:hover:bg-emerald-200" />
                  </div>
                ))}
              </div>
            </section>

            {/* ── Salary Settings ── */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-emerald-800">Accepted Salaries Per Day</h2>
              {/*
                Field names: day_rate_a, day_rate_b, day_rate_c, day_rate_d
                These map to the CASE statement in the matching algorithm:
                  WHEN 'A' THEN cp.day_rate_a BETWEEN min AND max
              */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  { label: "Category A (3h)",  name: "day_rate_a" },
                  { label: "Category B (6h)",  name: "day_rate_b" },
                  { label: "Category C (9h)",  name: "day_rate_c" },
                  { label: "Category D (12h)", name: "day_rate_d" },
                ].map(({ label, name }) => (
                  <div key={name}>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">{label}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 font-semibold text-gray-500">E£</span>
                      <input type="number" name={name} min="0" max="5000" required placeholder="0"
                        className="w-full rounded-xl border-2 border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-4 text-lg font-bold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 hover:shadow-md active:scale-[0.98] disabled:opacity-70"
            >
              {isSubmitting ? "Submitting Application..." : "Submit Application"}
            </button>
          </Form>

          <div className="mt-8 flex flex-col items-center gap-2 text-sm text-gray-600">
            <div>
              Already have an account?{" "}
              <Link to="/login"
                className="font-semibold text-emerald-600 transition-colors hover:text-emerald-800 hover:underline">
                Sign In
              </Link>
            </div>
            <Link to="/"
              className="mt-2 font-semibold text-gray-500 transition-colors hover:text-gray-800 hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}