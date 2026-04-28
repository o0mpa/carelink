import { useState, useEffect } from "react";
import { Link, Form, redirect, useActionData, useNavigation, useLoaderData } from "react-router";
import { apiUrl } from "../../utils/api";

export function meta() {
  return [
    { title: "Edit Professional Profile - CareLink" },
    { name: "description", content: "Update your caregiver profile and rates." },
  ];
}

// 1. FETCH EXISTING DATA
export async function loader() {
  const token = typeof window !== "undefined" ? localStorage.getItem("carelink_token") : null;
  if (!token) return redirect("/login");

  try {
    const response = await fetch(`${apiUrl}/api/caregivers/profile`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error("Failed to load profile:", error);
  }
  return {};
}

// 2. SEND UPDATED DATA
export async function action({ request }: { request: Request }) {
  const token = localStorage.getItem("carelink_token");
  if (!token) return redirect("/login");

  const formData = await request.formData();

  // CRITICAL FIX 1: If user unchecked all skills, force an empty array
  // so the backend knows to clear them in the database!
  if (!formData.has("skills")) {
    formData.append("skills", "[]");
  }

  // CRITICAL FIX 2: Remove empty file inputs so Multer doesn't overwrite existing files
  for (const [key, value] of Array.from(formData.entries())) {
    if (value instanceof File && value.size === 0) {
      formData.delete(key);
    }
  }

  try {
    const response = await fetch(`${apiUrl}/api/caregivers/profile`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData, 
    });

    if (response.ok) {
      return redirect("/dashboard/caregiver?updated=true");
    } else {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.message || "Update failed. Please try again." };
    }
  } catch (error) {
    return { error: "Cannot connect to the server." };
  }
}

export default function EditCaregiverProfile() {
  const actionData = useActionData<{ error?: string }>();
  const user = useLoaderData<any>() || {};
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [selectedCity, setSelectedCity] = useState(user?.city || "");

  // CRITICAL FIX 3: Safely parse MySQL Timestamp to YYYY-MM-DD
  const safeDob = user?.date_of_birth ? user.date_of_birth.split('T')[0] : "";
  const [dob, setDob] = useState(safeDob);
  const [age, setAge] = useState(user?.age?.toString() || "");

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

  // Safe JSON parsing for skills array
  const [selectedSkills, setSelectedSkills] = useState<string[]>(() => {
    if (!user?.skills) return [];
    if (Array.isArray(user.skills)) return user.skills;
    try { return JSON.parse(user.skills); } catch { return []; }
  });

  const handleSkillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedSkills((prev) => [...prev, value]);
    } else {
      setSelectedSkills((prev) => prev.filter((item) => item !== value));
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-100 via-white to-blue-100 py-12">
      <main className="flex flex-col items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-4xl rounded-2xl bg-white/95 p-6 shadow-xl backdrop-blur-md ring-2 ring-gray-300 sm:p-10">
          <h1 className="mb-2 text-center text-3xl font-extrabold text-emerald-900">
            Edit Professional Profile
          </h1>
          <p className="mb-8 text-center text-sm text-gray-600">
            Update your rates, skills, and contact information.
          </p>

          {actionData?.error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-800 ring-1 ring-red-200">
              {actionData.error}
            </div>
          )}

          <Form method="post" encType="multipart/form-data" className="flex flex-col gap-8">
            
            {/* Personal Information */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-emerald-800">Personal Information</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Full Name</label>
                  <input type="text" name="full_name" defaultValue={user?.full_name} required className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Gender</label>
                  <select name="gender" defaultValue={user?.gender} required className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Date of Birth</label>
                  <input type="date" name="date_of_birth" value={dob} onChange={handleDobChange} required max="9999-12-31" className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Age</label>
                  <input type="number" name="age" value={age} readOnly className="w-full rounded-xl border-2 border-gray-300 bg-gray-100 px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Phone Number</label>
                  <input type="tel" name="phone_number" defaultValue={user?.phone_number} required maxLength={11} onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "").slice(0, 11); }} className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
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
                  <select name="area" required defaultValue={user?.area} disabled={!selectedCity} className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100">
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
                  <input type="text" name="full_address" defaultValue={user?.full_address} required className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
            </section>

            {/* Skills & Experience */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-emerald-800">Skills & Experience</h2>
              <div className="rounded-xl border-2 border-gray-300 bg-white p-4">
                <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    "physical_care", "medication_management", "meal_preparation", 
                    "housekeeping", "emotional_support", "transportation", "health_monitoring"
                  ].map((skill) => (
                    <label key={skill} className="flex items-center gap-2 text-sm text-gray-700">
                      <input 
                        type="checkbox" 
                        name="skills" 
                        value={skill} 
                        checked={selectedSkills.includes(skill)} 
                        onChange={handleSkillChange}
                        className="h-4 w-4 rounded border-2 border-gray-400 accent-emerald-600" 
                      /> 
                      {skill.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                  ))}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Medical Specialties:</label>
                  <input type="text" name="medical_specialties" defaultValue={user?.medical_specialties} className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
                </div>
              </div>
            </section>

            {/* Document Uploads */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-emerald-800">Update Documents (Optional)</h2>
              <p className="text-xs text-emerald-700 mb-4">Leave blank to keep your current verification files.</p>
              <div className="grid grid-cols-1 gap-4 rounded-xl border-2 border-emerald-200 bg-emerald-50/30 p-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">High School / Higher Ed</label>
                  <input type="file" name="education_docs" accept=".jpg, .jpeg, .png, .pdf" className="max-w-full text-xs" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">Caregiving / First Aid Cert</label>
                  <input type="file" name="certificates" accept=".jpg, .jpeg, .png, .pdf" className="max-w-full text-xs" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">National ID</label>
                  <input type="file" name="national_id" accept=".jpg, .jpeg, .png, .pdf" className="max-w-full text-xs" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">Criminal Record</label>
                  <input type="file" name="criminal_record" accept=".jpg, .jpeg, .png, .pdf" className="max-w-full text-xs" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">Past References</label>
                  <input type="file" name="references" accept=".jpg, .jpeg, .png, .pdf" className="max-w-full text-xs" />
                </div>
              </div>
            </section>

            {/* Salary Settings */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-emerald-800">Accepted salaries Per Day</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Cat A (3h)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-semibold text-gray-500">E£</span>
                    <input type="number" name="day_rate_a" defaultValue={user?.day_rate_a} min="0" max="5000" required className="w-full rounded-xl border-2 border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Cat B (6h)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-semibold text-gray-500">E£</span>
                    <input type="number" name="day_rate_b" defaultValue={user?.day_rate_b} min="0" max="5000" required className="w-full rounded-xl border-2 border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Cat C (9h)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-semibold text-gray-500">E£</span>
                    <input type="number" name="day_rate_c" defaultValue={user?.day_rate_c} min="0" max="5000" required className="w-full rounded-xl border-2 border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Cat D (12h)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-semibold text-gray-500">E£</span>
                    <input type="number" name="day_rate_d" defaultValue={user?.day_rate_d} min="0" max="5000" required className="w-full rounded-xl border-2 border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none" />
                  </div>
                </div>
              </div>
            </section>

            <div className="flex gap-4">
              <Link to="/dashboard/caregiver" className="w-1/3 rounded-xl border-2 border-gray-300 bg-white px-4 py-4 text-center text-lg font-bold text-gray-700 hover:bg-gray-50">
                Cancel
              </Link>
              <button type="submit" disabled={isSubmitting} className="w-2/3 rounded-xl bg-emerald-600 px-4 py-4 text-lg font-bold text-white shadow-sm transition-all hover:bg-emerald-700 disabled:opacity-70">
                {isSubmitting ? "Saving Updates..." : "Save Profile"}
              </button>
            </div>
          </Form>
        </div>
      </main>
    </div>
  );
}