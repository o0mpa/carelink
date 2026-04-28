import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { getAuthHeaders, getToken } from "~/utils/auth";

export function meta() {
  return [
    { title: "Edit Profile - CareLink" },
    { name: "description", content: "Update your CareLink client profile." },
  ];
}

// ─── Field lists ───────────────────────────────────────────────────────────────
// Only fields that exist in the backend updateClientProfile whitelist:
// full_name | city | area | full_address | phone_number | email |
// allergies | blood_type | doctor_facility | medical_specialties_required |
// skills_needed | emergency_contact1_name | emergency_contact1_phone |
// emergency_contact2_name | emergency_contact2_phone | profile_picture
//
// NOTE: diagnoses, conditions (file paths) and date_of_birth, age, gender
// are NOT in the whitelist — they are shown read-only for reference only.
//
// BACKEND BUG (tell your partner): authMiddleware never calls next() after
// setting req.user/req.token → all protected routes hang. Add next() after
// `req.token = token;` in authMiddleware.js. (IMPORTANT)
// ──────────────────────────────────────────────────────────────────────────────

const FOOD_ALLERGIES    = ["Peanuts","Tree Nuts","Milk / Dairy","Eggs","Fish","Shellfish","Soy","Wheat / Gluten","Sesame","Strawberries"];
const MED_ALLERGIES     = ["Penicillin","Antibiotics (General)","Aspirin","Ibuprofen / NSAIDS","Sulfa Drugs","Codeine"];
const ENV_ALLERGIES     = ["Dust","Pollen","Mold","Pet Dander","Insect Stings"];
const OTHER_ALLERGIES   = ["Latex","Certain Fabrics","Cleaning Chemicals","Perfumes / Fragrances"];
const SKILLS = [
  { value: "physical_care",         label: "Physical care" },
  { value: "medication_management", label: "Medication management" },
  { value: "meal_preparation",      label: "Meal preparation" },
  { value: "housekeeping",          label: "Housekeeping and cleaning" },
  { value: "emotional_support",     label: "Emotional support" },
  { value: "transportation",        label: "Transportation" },
  { value: "health_monitoring",     label: "Health monitoring" },
];

const parseJsonArray = (val: unknown): string[] => {
  if (Array.isArray(val)) return val.map(String);
  if (typeof val === "string") {
    try { const p = JSON.parse(val); return Array.isArray(p) ? p.map(String) : []; }
    catch { return val ? val.split(",").map(s => s.trim()).filter(Boolean) : []; }
  }
  return [];
};

const INPUT_CLS = "w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function EditClientProfile() {
  const navigate = useNavigate();

  // ── Form state ──────────────────────────────────────────────────────────────
  const [full_name,   setFullName]   = useState("");
  const [city,        setCity]       = useState("");
  const [area,        setArea]       = useState("");
  const [full_address,setAddress]    = useState("");
  const [phone_number,setPhone]      = useState("");
  const [email,       setEmail]      = useState("");
  const [blood_type,  setBloodType]  = useState("");
  const [doctor_facility, setDoctor] = useState("");
  const [medical_specialties_required, setSpecialties] = useState("");
  const [skills_needed, setSkillsNeeded] = useState<string[]>([]);
  const [emergency1_name,  setE1Name]  = useState("");
  const [emergency1_phone, setE1Phone] = useState("");
  const [emergency2_name,  setE2Name]  = useState("");
  const [emergency2_phone, setE2Phone] = useState("");
  const [allergies,   setAllergies]  = useState<string[]>([]);

  // Read-only reference fields (not in whitelist)
  const [gender,   setGender]   = useState("");
  const [dob,      setDob]      = useState("");
  const [age,      setAge]      = useState("");

  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState("");

  // ── Fetch existing profile on mount ─────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Correct URL: /api/client/profile (singular, not /clients/)
        const res = await fetch("http://localhost:5000/api/client/profile", {
          headers: getAuthHeaders(),
        });
        if (!res.ok) {
          if (res.status === 401) { navigate("/login"); return; }
          setError("Failed to load profile.");
          return;
        }
        const data = await res.json();
        const p = data?.profile ?? data;

        setFullName(p.full_name   || "");
        // Capitalize first letter to match matching algorithm expectations
        const rawCity = String(p.city || "");
        setCity(rawCity.charAt(0).toUpperCase() + rawCity.slice(1).toLowerCase());
        setArea(p.area            || "");
        setAddress(p.full_address || "");
        setPhone(p.phone_number   || "");
        setEmail(p.email          || "");
        setBloodType(p.blood_type || "");
        setDoctor(p.doctor_facility || "");
        setSpecialties(p.medical_specialties_required || "");
        setSkillsNeeded(parseJsonArray(p.skills_needed));
        setE1Name(p.emergency_contact1_name   || "");
        setE1Phone(p.emergency_contact1_phone || "");
        setE2Name(p.emergency_contact2_name   || "");
        setE2Phone(p.emergency_contact2_phone || "");
        setAllergies(parseJsonArray(p.allergies));
        setGender(p.gender          || "");
        // Strip the time part from MySQL DATETIME fields e.g. "1990-05-15T00:00:00.000Z"
        setDob((p.date_of_birth || "").split("T")[0]);
        setAge(p.age != null ? String(p.age) : "");
      } catch {
        setError("Cannot connect to server.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  // ── Allergy helpers ──────────────────────────────────────────────────────────
  const isNoneSelected    = allergies.includes("none");
  const hasOtherAllergies = allergies.some(a => a !== "none");

  const handleAllergyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setAllergies(prev =>
      checked ? [...prev, value] : prev.filter(a => a !== value)
    );
  };

  const handleSkillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setSkillsNeeded((prev) =>
      checked ? [...prev, value] : prev.filter((s) => s !== value)
    );
  };

  // ── Profile picture upload ───────────────────────────────────────────────────
  const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("picture", file);
    const token = getToken() ?? "";
    try {
      // Correct route: POST /api/client/upload-picture
      await fetch("http://localhost:5000/api/client/upload-picture", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
    } catch {
      // Silently fail — picture upload is non-critical
    }
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    // Collect allergies — filter out "none" sentinel, JSON.stringify for DB
    const finalAllergies = allergies.filter(a => a !== "none");
    const finalSkillsNeeded = skills_needed.filter(Boolean);

    // Body must be JSON — the edit-profile route has NO multer middleware,
    // so sending multipart/form-data would leave req.body empty.
    // Arrays must be JSON.stringified to match the stored format from signup.
    const body = {
      full_name,
      // Capitalize city to match the matching algorithm's cp.city = ? check
      city: city.charAt(0).toUpperCase() + city.slice(1).toLowerCase(),
      area,
      full_address,
      phone_number,
      email,
      blood_type,
      doctor_facility,
      medical_specialties_required,
      emergency_contact1_name:  emergency1_name,
      emergency_contact1_phone: emergency1_phone,
      emergency_contact2_name:  emergency2_name,
      emergency_contact2_phone: emergency2_phone,
      // JSON.stringify matches how signup stores these columns
      allergies: JSON.stringify(finalAllergies),
      // keep edit behavior aligned with signup + request fallback logic
      skills_needed: JSON.stringify(finalSkillsNeeded),
    };

    try {
      // Correct URL: PUT /api/client/edit-profile (not /clients/profile)
      const res = await fetch("http://localhost:5000/api/client/edit-profile", {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Update failed. Please try again.");
        return;
      }

      setSuccess("Profile updated successfully!");
      setTimeout(() => navigate("/profile/client"), 1500);
    } catch {
      setError("Cannot connect to server.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-100 via-white to-emerald-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-sm font-semibold text-gray-500">Loading profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-100 via-white to-emerald-100 py-12">
      <main className="flex flex-col items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-4xl rounded-2xl bg-white/95 p-6 shadow-xl backdrop-blur-md ring-2 ring-gray-300 sm:p-10">

          <h1 className="mb-2 text-center text-3xl font-extrabold text-blue-900">
            Edit Profile
          </h1>
          <p className="mb-8 text-center text-sm text-gray-600">
            Update your care requirements and contact information.
          </p>

          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-800 ring-1 ring-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200">
              ✓ {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-8">

            {/* ── Profile Picture ── */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-blue-800">
                Profile Picture
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white shadow-md">
                  {full_name.charAt(0) || "?"}
                </div>
                <label className="cursor-pointer rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors">
                  Upload New Picture
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePictureUpload}
                  />
                </label>
              </div>
            </section>

            {/* ── Personal Information ── */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-blue-800">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Full Name</label>
                  <input
                    type="text" required value={full_name}
                    onChange={e => setFullName(e.target.value)}
                    className={INPUT_CLS}
                  />
                </div>

                {/* Read-only — not in update whitelist */}
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-500">
                    Gender <span className="text-xs font-normal italic">(not editable)</span>
                  </label>
                  <input type="text" value={gender} readOnly
                    className="w-full cursor-not-allowed rounded-xl border-2 border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-500 focus:outline-none" />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-500">
                    Date of Birth <span className="text-xs font-normal italic">(not editable)</span>
                  </label>
                  <input type="text" value={dob} readOnly
                    className="w-full cursor-not-allowed rounded-xl border-2 border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-500 focus:outline-none" />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-500">
                    Age <span className="text-xs font-normal italic">(not editable)</span>
                  </label>
                  <input type="text" value={age} readOnly
                    className="w-full cursor-not-allowed rounded-xl border-2 border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-500 focus:outline-none" />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Phone Number</label>
                  <input
                    type="tel" required value={phone_number}
                    onChange={e => setPhone(e.target.value)}
                    maxLength={11}
                    onInput={e => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "").slice(0, 11); }}
                    className={INPUT_CLS}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Email Address</label>
                  <input
                    type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={INPUT_CLS}
                  />
                </div>
              </div>
            </section>

            {/* ── Location ── */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-blue-800">Location</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">City</label>
                  {/*
                    Values must be "Cairo"/"Giza"/"Alexandria" (capitalized)
                    to match client_profiles city values used in caregiver matching.
                  */}
                  <select required value={city} onChange={e => setCity(e.target.value)} className={INPUT_CLS}>
                    <option value="">Select City</option>
                    <option value="Cairo">Cairo</option>
                    <option value="Giza">Giza</option>
                    <option value="Alexandria">Alexandria</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Area</label>
                  <select required value={area} onChange={e => setArea(e.target.value)}
                    disabled={!city}
                    className={`${INPUT_CLS} disabled:bg-gray-100`}>
                    <option value="">Select Area</option>
                    {city === "Cairo" && (<>
                      <option>Nasr City</option><option>Heliopolis (Masr El Gedida)</option>
                      <option>New Cairo</option><option>Maadi</option><option>Mokattam</option>
                      <option>Shubra</option><option>Zamalek</option><option>Garden City</option>
                      <option>Downtown Cairo</option><option>El Rehab</option>
                      <option>Madinaty</option><option>Fifth Settlement</option>
                    </>)}
                    {city === "Giza" && (<>
                      <option>Dokki</option><option>Mohandessin</option><option>Haram</option>
                      <option>Faisal</option><option>Sheikh Zayed</option>
                      <option>6th of October</option><option>Agouza</option><option>Imbaba</option>
                    </>)}
                    {city === "Alexandria" && (<>
                      <option>Smouha</option><option>Sidi Gaber</option><option>Stanley</option>
                      <option>Miami</option><option>Montaza</option>
                      <option>Raml Station</option><option>Borg El Arab</option>
                    </>)}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Full Address</label>
                  <input
                    type="text" required value={full_address}
                    onChange={e => setAddress(e.target.value)}
                    className={INPUT_CLS}
                  />
                </div>
              </div>
            </section>

            {/* ── Medical Details ── */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-blue-800">Medical Details</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Blood Type</label>
                  <select value={blood_type} onChange={e => setBloodType(e.target.value)} className={INPUT_CLS}>
                    <option value="">Select Blood Type</option>
                    <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                    <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Doctor / Medical Facility (Optional)
                  </label>
                  <input
                    type="text" value={doctor_facility}
                    onChange={e => setDoctor(e.target.value)}
                    className={INPUT_CLS}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Medical Specialties Required
                  </label>
                  {/*
                    Field name in backend whitelist: medical_specialties_required
                    (not medical_specialties)
                  */}
                  <input
                    type="text" value={medical_specialties_required}
                    onChange={e => setSpecialties(e.target.value)}
                    placeholder="e.g., Alzheimer's, Diabetes"
                    className={INPUT_CLS}
                  />
                </div>

                {/* Allergies */}
                <div className="md:col-span-2">
                  <label className="mb-2 block border-b pb-1 text-sm font-bold text-gray-800">
                    Allergies
                  </label>
                  <div className="w-full rounded-xl border-2 border-gray-300 bg-white p-4">

                    <label className={`mb-4 flex cursor-pointer items-center gap-2 text-sm font-bold ${hasOtherAllergies ? "text-gray-400 opacity-60" : "text-blue-700"}`}>
                      <input
                        type="checkbox" value="none"
                        checked={isNoneSelected}
                        onChange={handleAllergyChange}
                        disabled={hasOtherAllergies}
                        className="h-5 w-5 rounded border-2 border-gray-400 accent-blue-600 disabled:cursor-not-allowed"
                      />
                      No Known Allergies
                    </label>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        { title: "Food",          list: FOOD_ALLERGIES  },
                        { title: "Medication",    list: MED_ALLERGIES   },
                        { title: "Environmental", list: ENV_ALLERGIES   },
                        { title: "Other",         list: OTHER_ALLERGIES },
                      ].map(({ title, list }) => (
                        <div key={title}>
                          <h4 className="mb-2 text-xs font-bold uppercase text-gray-500">{title}</h4>
                          <div className="flex flex-col gap-2">
                            {list.map(allergy => (
                              <label key={allergy}
                                className={`flex cursor-pointer items-start gap-2 text-sm transition-opacity ${isNoneSelected ? "text-gray-400 opacity-60" : "text-gray-900"}`}>
                                <input
                                  type="checkbox" value={allergy}
                                  checked={allergies.includes(allergy)}
                                  onChange={handleAllergyChange}
                                  disabled={isNoneSelected}
                                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-2 border-gray-400 accent-blue-600 disabled:cursor-not-allowed"
                                />
                                <span className="leading-tight">{allergy}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block border-b pb-1 text-sm font-bold text-gray-800">
                    Skills Needed
                  </label>
                  <div className="rounded-xl border-2 border-gray-300 bg-white p-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Used as fallback when creating care requests
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {SKILLS.map(({ value, label }) => (
                        <label key={value} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            value={value}
                            checked={skills_needed.includes(value)}
                            onChange={handleSkillChange}
                            className="h-4 w-4 rounded border-2 border-gray-400 accent-blue-600 focus:ring-blue-500"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Emergency Contacts ── */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-blue-800">Emergency Contacts</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  { label: "Contact 1", name: emergency1_name, phone: emergency1_phone,
                    setName: setE1Name, setPhone: setE1Phone },
                  { label: "Contact 2", name: emergency2_name, phone: emergency2_phone,
                    setName: setE2Name, setPhone: setE2Phone },
                ].map(({ label, name, phone, setName, setPhone: setSP }) => (
                  <div key={label} className="rounded-xl border-2 border-blue-200 bg-blue-50/30 p-4">
                    <h3 className="mb-2 font-semibold text-blue-900">{label}</h3>
                    <div className="mb-2">
                      <label className="mb-1 block text-xs font-semibold text-gray-700">Full Name</label>
                      <input type="text" required value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">Phone Number</label>
                      <input type="tel" required value={phone}
                        onChange={e => setSP(e.target.value)}
                        maxLength={11}
                        onInput={e => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "").slice(0, 11); }}
                        className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Actions ── */}
            <div className="flex gap-4">
              <Link to="/profile/client"
                className="w-1/3 rounded-xl border-2 border-gray-300 bg-white px-4 py-4 text-center text-lg font-bold text-gray-700 transition-colors hover:bg-gray-50">
                Cancel
              </Link>
              <button type="submit" disabled={submitting}
                className="w-2/3 rounded-xl bg-blue-600 px-4 py-4 text-lg font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-70">
                {submitting ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}