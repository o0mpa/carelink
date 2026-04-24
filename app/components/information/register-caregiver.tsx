import { useState } from "react";
import { Link, Form, redirect, useActionData, useNavigation } from "react-router";

export function meta() {
  return [
    { title: "Caregiver Sign Up - CareLink" },
    { name: "description", content: "Apply to become a trusted caregiver." },
  ];
}

// BACKEND CONNECTION: Sends raw FormData (including files) to the backend
export async function action({ request }: { request: Request }) {
  const formData = await request.formData();

  // FIX: Check if passwords match before sending
  if (formData.get("password") !== formData.get("confirmPassword")) {
    return { error: "Passwords do not match. Please try again." };
  }
  
  // Remove confirm field to keep data clean for the backend
  formData.delete("confirmPassword");

  try {
    const response = await fetch("http://localhost:5000/api/auth/signup-caregiver", {
      method: "POST",
      // NO "Content-Type" header. The browser sets it to multipart/form-data automatically.
      body: formData, 
    });

    if (response.ok) {
      return redirect("/login?registered=true");
    } else {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.message || "Registration failed. Please try again." };
    }
  } catch (error) {
    return { error: "Cannot connect to the server. Is your backend running?" };
  }
}

export default function RegisterCaregiver() {
  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [selectedCity, setSelectedCity] = useState("");
  
  // DOB and Age stay in sync
  const [dob, setDob] = useState("");
  const [age, setAge] = useState("");

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDob = e.target.value;
    setDob(newDob);

    if (newDob) {
      const birthDate = new Date(newDob);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
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

          <Form method="post" encType="multipart/form-data" className="flex flex-col gap-8">
            {/* Account Information & Security */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-emerald-800">Account Security</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Username</label>
                  <input type="text" name="username" required className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Email Address</label>
                  <input type="email" name="email" required className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Password</label>
                  <input type="password" name="password" required minLength={8} pattern=".*[A-Z].*" title="Password must be at least 8 characters long and contain at least one uppercase letter." placeholder="Min 8 chars, 1 Capital" className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Confirm Password</label>
                  <input type="password" name="confirmPassword" required minLength={8} className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>

                <div className="mt-4 rounded-xl border-2 border-gray-200 bg-gray-50 p-4 md:col-span-2">
                  <h3 className="mb-4 font-semibold text-gray-800">Password Recovery Questions</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">Security Question 1</label>
                      <input type="text" name="securityQuestion1" required placeholder="e.g. What is the name of your first pet?" className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">Answer 1</label>
                      <input type="text" name="securityAnswer1" required placeholder="Your answer" className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">Security Question 2</label>
                      <input type="text" name="securityQuestion2" required placeholder="e.g. In what city were you born?" className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">Answer 2</label>
                      <input type="text" name="securityAnswer2" required placeholder="Your answer" className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Personal Information */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-emerald-800">Personal Information</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Full Name</label>
                  <input type="text" name="full_name" required className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Gender</label>
                  <select name="gender" required className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
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
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Age</label>
                  <input 
                    type="number" 
                    name="age" 
                    required 
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "-" || e.key === "e" || e.key === "+" || e.key === ".") { e.preventDefault(); } }} 
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 [&::-webkit-inner-spin-button]:cursor-pointer [&::-webkit-inner-spin-button]:opacity-100" 
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Phone Number</label>
                  <input type="tel" name="phone_number" required maxLength={11} onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "").slice(0, 11); }} className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
            </section>

            {/* Location */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-emerald-800">Location</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">City</label>
                  <select name="city" required value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="">Select City</option>
                    <option value="cairo">Cairo</option>
                    <option value="giza">Giza</option>
                    <option value="alexandria">Alexandria</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Area</label>
                  <select name="area" required disabled={!selectedCity} className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100">
                    <option value="">Select Area</option>
                    {selectedCity === "cairo" && (
                      <>
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
                      </>
                    )}
                    {selectedCity === "giza" && (
                      <>
                        <option value="Dokki">Dokki</option>
                        <option value="Mohandessin">Mohandessin</option>
                        <option value="Haram">Haram</option>
                        <option value="Faisal">Faisal</option>
                        <option value="Sheikh Zayed">Sheikh Zayed</option>
                        <option value="6th of October">6th of October</option>
                        <option value="Agouza">Agouza</option>
                        <option value="Imbaba">Imbaba</option>
                      </>
                    )}
                    {selectedCity === "alexandria" && (
                      <>
                        <option value="Smouha">Smouha</option>
                        <option value="Sidi Gaber">Sidi Gaber</option>
                        <option value="Stanley">Stanley</option>
                        <option value="Miami">Miami</option>
                        <option value="Montaza">Montaza</option>
                        <option value="Raml Station">Raml Station</option>
                        <option value="Borg El Arab">Borg El Arab</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Full Address</label>
                  <input type="text" name="full_address" required className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
            </section>

            {/* Skills & Experience */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-emerald-800">Skills & Experience</h2>
              <div className="rounded-xl border-2 border-gray-300 bg-white p-4">
                <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" name="skills" value="physical_care" className="h-4 w-4 rounded border-2 border-gray-400 accent-emerald-600 focus:ring-emerald-500" /> Physical care
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" name="skills" value="medication_management" className="h-4 w-4 rounded border-2 border-gray-400 accent-emerald-600 focus:ring-emerald-500" /> Medication management
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" name="skills" value="meal_preparation" className="h-4 w-4 rounded border-2 border-gray-400 accent-emerald-600 focus:ring-emerald-500" /> Meal preparation
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" name="skills" value="housekeeping" className="h-4 w-4 rounded border-2 border-gray-400 accent-emerald-600 focus:ring-emerald-500" /> Housekeeping and cleaning
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" name="skills" value="emotional_support" className="h-4 w-4 rounded border-2 border-gray-400 accent-emerald-600 focus:ring-emerald-500" /> Emotional support
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" name="skills" value="transportation" className="h-4 w-4 rounded border-2 border-gray-400 accent-emerald-600 focus:ring-emerald-500" /> Transportation
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" name="skills" value="health_monitoring" className="h-4 w-4 rounded border-2 border-gray-400 accent-emerald-600 focus:ring-emerald-500" /> Health monitoring
                  </label>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Medical Specialties (Conditions/Disabilities Experienced In):</label>
                  <input type="text" name="medical_specialties" placeholder="e.g., Dementia care, Post-surgery recovery" className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
            </section>

            {/* Document Uploads */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-emerald-800">Verification Documents</h2>
              <div className="grid grid-cols-1 gap-4 rounded-xl border-2 border-emerald-200 bg-emerald-50/30 p-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">High School / Higher Ed</label>
                  <input type="file" name="education_docs" accept=".jpg, .jpeg, .png, .pdf" required className="max-w-full text-xs font-semibold text-gray-900 file:mr-2 file:cursor-pointer file:rounded-lg file:border-0 file:bg-emerald-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700 file:transition-colors file:hover:bg-emerald-200" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">Caregiving / First Aid Cert</label>
                  <input type="file" name="certificates" accept=".jpg, .jpeg, .png, .pdf" required className="max-w-full text-xs font-semibold text-gray-900 file:mr-2 file:cursor-pointer file:rounded-lg file:border-0 file:bg-emerald-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700 file:transition-colors file:hover:bg-emerald-200" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">National ID</label>
                  <input type="file" name="national_id" accept=".jpg, .jpeg, .png, .pdf" required className="max-w-full text-xs font-semibold text-gray-900 file:mr-2 file:cursor-pointer file:rounded-lg file:border-0 file:bg-emerald-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700 file:transition-colors file:hover:bg-emerald-200" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">Criminal Record</label>
                  <input type="file" name="criminal_record" accept=".jpg, .jpeg, .png, .pdf" required className="max-w-full text-xs font-semibold text-gray-900 file:mr-2 file:cursor-pointer file:rounded-lg file:border-0 file:bg-emerald-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700 file:transition-colors file:hover:bg-emerald-200" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">Past References (Optional)</label>
                  <input type="file" name="references" accept=".jpg, .jpeg, .png, .pdf" className="max-w-full text-xs font-semibold text-gray-900 file:mr-2 file:cursor-pointer file:rounded-lg file:border-0 file:bg-emerald-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700 file:transition-colors file:hover:bg-emerald-200" />
                </div>
              </div>
            </section>

            {/* Salary Settings */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-emerald-800">Accepted salaries Per Day</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Category A (3h)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-semibold text-gray-500">E£</span>
                    <input type="number" name="day_rate_a" min="0" max="5000" required placeholder="0.00" className="w-full rounded-xl border-2 border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Category B (6h)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-semibold text-gray-500">E£</span>
                    <input type="number" name="day_rate_b" min="0" max="5000" required placeholder="0.00" className="w-full rounded-xl border-2 border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Category C (9h)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-semibold text-gray-500">E£</span>
                    <input type="number" name="day_rate_c" min="0" max="5000" required placeholder="0.00" className="w-full rounded-xl border-2 border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Category D (12h)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-semibold text-gray-500">E£</span>
                    <input type="number" name="day_rate_d" min="0" max="5000" required placeholder="0.00" className="w-full rounded-xl border-2 border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
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
              <Link to="/login" className="font-semibold text-emerald-600 transition-colors hover:text-emerald-800 hover:underline">
                Sign In
              </Link>
            </div>
            <Link to="/" className="mt-2 font-semibold text-gray-500 transition-colors hover:text-gray-800 hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}