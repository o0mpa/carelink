import { useState, useEffect } from "react";
import { Link, Form, redirect, useActionData, useNavigation, useLoaderData } from "react-router";
import { apiUrl } from "../../utils/api";

export function meta() {
  return [
    { title: "Edit Family Profile - CareLink" },
    { name: "description", content: "Update your family profile details." },
  ];
}

// 1. FETCH EXISTING DATA
export async function loader() {
  const token = typeof window !== "undefined" ? localStorage.getItem("carelink_token") : null;
  if (!token) return redirect("/login");

  try {
    const response = await fetch(`${apiUrl}/api/clients/profile`, {
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

  // Handle "Other" allergy logic
  const otherAllergy = formData.get("otherAllergiesSpecify");
  if (otherAllergy) {
    formData.append("allergies", otherAllergy as string);
  }
  formData.delete("otherAllergiesSpecify");

  // CRITICAL FIX 1: If user unchecked all allergies, force an empty array
  // so the backend knows to clear them in the database!
  if (!formData.has("allergies")) {
    formData.append("allergies", "[]");
  }

  // CRITICAL FIX 2: Remove empty file inputs so Multer doesn't overwrite existing files with blanks
  for (const [key, value] of Array.from(formData.entries())) {
    if (value instanceof File && value.size === 0) {
      formData.delete(key);
    }
  }

  try {
    const response = await fetch(`${apiUrl}/api/clients/profile`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData, 
    });

    if (response.ok) {
      return redirect("/dashboard/client?updated=true");
    } else {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.message || "Update failed. Please try again." };
    }
  } catch (error) {
    return { error: "Cannot connect to the server." };
  }
}

export default function EditClientProfile() {
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

  // Safe JSON parsing for allergies array
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(() => {
    if (!user?.allergies) return [];
    if (Array.isArray(user.allergies)) return user.allergies;
    try { return JSON.parse(user.allergies); } catch { return []; }
  });

  const handleAllergyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedAllergies((prev) => [...prev, value]);
    } else {
      setSelectedAllergies((prev) => prev.filter((item) => item !== value));
    }
  };

  const isNoneSelected = selectedAllergies.includes("none");
  const hasOtherAllergies = selectedAllergies.some((a) => a !== "none");

  const foodAllergies = ["Peanuts", "Tree Nuts", "Milk / Dairy", "Eggs", "Fish", "Shellfish", "Soy", "Wheat / Gluten", "Sesame", "Strawberries"];
  const medAllergies = ["Penicillin", "Antibiotics (General)", "Aspirin", "Ibuprofen / NSAIDS", "Sulfa Drugs", "Codeine"];
  const envAllergies = ["Dust", "Pollen", "Mold", "Pet Dander", "Insect Stings"];
  const otherAllergiesList = ["Latex", "Certain Fabrics", "Cleaning Chemicals", "Perfumes / Fragrances"];

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-100 via-white to-emerald-100 py-12">
      <main className="flex flex-col items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-4xl rounded-2xl bg-white/95 p-6 shadow-xl backdrop-blur-md ring-2 ring-gray-300 sm:p-10">
          <h1 className="mb-2 text-center text-3xl font-extrabold text-blue-900">
            Edit Family Profile
          </h1>
          <p className="mb-8 text-center text-sm text-gray-600">
            Keep your information up to date for your caregivers.
          </p>

          {actionData?.error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-800 ring-1 ring-red-200">
              {actionData.error}
            </div>
          )}

          <Form method="post" encType="multipart/form-data" className="flex flex-col gap-8">
            
            {/* Personal Information */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-blue-800">Personal Information</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Full Name</label>
                  <input type="text" name="full_name" defaultValue={user?.full_name} required className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Gender</label>
                  <select name="gender" defaultValue={user?.gender} required className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Date of Birth</label>
                  <input type="date" name="date_of_birth" value={dob} onChange={handleDobChange} required max="9999-12-31" className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Age</label>
                  <input type="number" name="age" value={age} readOnly className="w-full rounded-xl border-2 border-gray-300 bg-gray-100 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Phone Number</label>
                  <input type="tel" name="phone_number" defaultValue={user?.phone_number} required maxLength={11} onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "").slice(0, 11); }} className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </section>

            {/* Location */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-blue-800">Location</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">City</label>
                  <select name="city" required value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select City</option>
                    <option value="cairo">Cairo</option>
                    <option value="giza">Giza</option>
                    <option value="alexandria">Alexandria</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Area</label>
                  <select name="area" required defaultValue={user?.area} disabled={!selectedCity} className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
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
                  <input type="text" name="full_address" defaultValue={user?.full_address} required className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </section>

            {/* Medical Details */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-blue-800">Medical Details & Documents</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Blood Type</label>
                  <select name="blood_type" defaultValue={user?.blood_type} required className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Blood Type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-gray-800 border-b pb-1">Allergies</label>
                  <div className="w-full rounded-xl border-2 border-gray-300 bg-white p-4">
                    <label className={`mb-4 flex cursor-pointer items-center gap-2 text-sm font-bold ${hasOtherAllergies ? "text-gray-400 opacity-60" : "text-blue-700"}`}>
                      <input type="checkbox" name="allergies" value="none" checked={isNoneSelected} onChange={handleAllergyChange} disabled={hasOtherAllergies} className="h-5 w-5 rounded border-2 border-gray-400 accent-blue-600 focus:ring-blue-500" />
                      No Known Allergies
                    </label>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <h4 className="mb-2 text-xs font-bold uppercase text-gray-500">Food</h4>
                        <div className="flex flex-col gap-2">
                          {foodAllergies.map((allergy) => (
                            <label key={allergy} className={`flex cursor-pointer items-start gap-2 text-sm transition-opacity ${isNoneSelected ? "text-gray-400 opacity-60" : "text-gray-900"}`}>
                              <input type="checkbox" name="allergies" value={allergy} checked={selectedAllergies.includes(allergy)} onChange={handleAllergyChange} disabled={isNoneSelected} className="mt-0.5 h-4 w-4 shrink-0 rounded border-2 border-gray-400 accent-blue-600" />
                              <span>{allergy}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="mb-2 text-xs font-bold uppercase text-gray-500">Medication</h4>
                        <div className="flex flex-col gap-2">
                          {medAllergies.map((allergy) => (
                            <label key={allergy} className={`flex cursor-pointer items-start gap-2 text-sm transition-opacity ${isNoneSelected ? "text-gray-400 opacity-60" : "text-gray-900"}`}>
                              <input type="checkbox" name="allergies" value={allergy} checked={selectedAllergies.includes(allergy)} onChange={handleAllergyChange} disabled={isNoneSelected} className="mt-0.5 h-4 w-4 shrink-0 rounded border-2 border-gray-400 accent-blue-600" />
                              <span>{allergy}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="mb-2 text-xs font-bold uppercase text-gray-500">Environmental</h4>
                        <div className="flex flex-col gap-2">
                          {envAllergies.map((allergy) => (
                            <label key={allergy} className={`flex cursor-pointer items-start gap-2 text-sm transition-opacity ${isNoneSelected ? "text-gray-400 opacity-60" : "text-gray-900"}`}>
                              <input type="checkbox" name="allergies" value={allergy} checked={selectedAllergies.includes(allergy)} onChange={handleAllergyChange} disabled={isNoneSelected} className="mt-0.5 h-4 w-4 shrink-0 rounded border-2 border-gray-400 accent-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed" />
                              <span className="leading-tight">{allergy}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-2 text-xs font-bold uppercase text-gray-500">Other</h4>
                        <div className="flex flex-col gap-2">
                          {otherAllergiesList.map((allergy) => (
                            <label key={allergy} className={`flex cursor-pointer items-start gap-2 text-sm transition-opacity ${isNoneSelected ? "text-gray-400 opacity-60" : "text-gray-900"}`}>
                              <input type="checkbox" name="allergies" value={allergy} checked={selectedAllergies.includes(allergy)} onChange={handleAllergyChange} disabled={isNoneSelected} className="mt-0.5 h-4 w-4 shrink-0 rounded border-2 border-gray-400 accent-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed" />
                              <span className="leading-tight">{allergy}</span>
                            </label>
                          ))}
                          <div className={`mt-2 transition-opacity ${isNoneSelected ? "opacity-60" : "opacity-100"}`}>
                            <label className="mb-1 block text-xs font-semibold text-gray-700">Other (Specify):</label>
                            <input type="text" name="otherAllergiesSpecify" disabled={isNoneSelected} className="w-full rounded-md border-2 border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed" />
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                <div className="mt-2 md:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Doctor / Medical Facility Supervising</label>
                  <input type="text" name="doctor_facility" defaultValue={user?.doctor_facility} className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none" />
                </div>

                <div className="mt-2 rounded-xl border-2 border-blue-200 bg-blue-50/30 p-4 md:col-span-2">
                  <h3 className="mb-3 font-semibold text-blue-900">Update Documents (Optional)</h3>
                  <p className="text-xs text-blue-700 mb-3">Leave blank to keep your current files.</p>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">Update National ID</label>
                      <input type="file" name="national_id" accept=".jpg, .jpeg, .png, .pdf" className="max-w-full text-xs" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">Update Diagnoses</label>
                      <input type="file" name="diagnoses" accept=".jpg, .jpeg, .png, .pdf" className="max-w-full text-xs" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">Update Conditions</label>
                      <input type="file" name="conditions" accept=".jpg, .jpeg, .png, .pdf" className="max-w-full text-xs" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Emergency Contacts  */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-blue-800">Emergency Contacts</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border-2 border-blue-200 bg-blue-50/30 p-4">
                  <h3 className="mb-2 font-semibold text-blue-900">Contact 1</h3>
                  <div className="mb-2">
                    <label className="mb-1 block text-xs font-semibold text-gray-700">Full Name</label>
                    <input type="text" name="emergency_contact1_name" defaultValue={user?.emergency_contact1_name} required className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">Phone Number</label>
                    <input type="tel" name="emergency_contact1_phone" defaultValue={user?.emergency_contact1_phone} required maxLength={11} className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none" />
                  </div>
                </div>
                <div className="rounded-xl border-2 border-blue-200 bg-blue-50/30 p-4">
                  <h3 className="mb-2 font-semibold text-blue-900">Contact 2</h3>
                  <div className="mb-2">
                    <label className="mb-1 block text-xs font-semibold text-gray-700">Full Name</label>
                    <input type="text" name="emergency_contact2_name" defaultValue={user?.emergency_contact2_name} required className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">Phone Number</label>
                    <input type="tel" name="emergency_contact2_phone" defaultValue={user?.emergency_contact2_phone} required maxLength={11} className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none" />
                  </div>
                </div>
              </div>
            </section>

            <div className="flex gap-4">
              <Link to="/dashboard/client" className="w-1/3 rounded-xl border-2 border-gray-300 bg-white px-4 py-4 text-center text-lg font-bold text-gray-700 hover:bg-gray-50">
                Cancel
              </Link>
              <button type="submit" disabled={isSubmitting} className="w-2/3 rounded-xl bg-blue-600 px-4 py-4 text-lg font-bold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-70">
                {isSubmitting ? "Saving Updates..." : "Save Profile"}
              </button>
            </div>
          </Form>
        </div>
      </main>
    </div>
  );
}