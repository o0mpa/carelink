import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { getAuthHeaders, getToken } from "~/utils/auth";
import { apiUrl } from "~/utils/api";

export function meta() {
  return [
    { title: "Edit Professional Profile - CareLink" },
    { name: "description", content: "Update your caregiver profile and rates." },
  ];
}

// ─── Backend notes ─────────────────────────────────────────────────────────────
// GET  /api/caregiver/profile        → { profile: {...} }
// PUT  /api/caregiver/edit-profile   → JSON body (NO multer on this route)
// POST /api/caregiver/upload-picture → multipart/form-data with field "picture"
//
// Backend whitelist for edit-profile:
//   full_name | city | area | full_address | phone_number | email |
//   education_docs | certificates | criminal_record | references |
//   skills | day_rate_a | day_rate_b | day_rate_c | day_rate_d | profile_picture
//
// NOT in whitelist (read-only): gender, date_of_birth, age, medical_specialties
// skills must be JSON.stringified — backend does JSON.stringify() on insert
//   and the matching algo uses JSON_OVERLAPS(cp.skills, ?)
//
// BACKEND BUG : authMiddleware never calls next() after
// setting req.user/req.token → all protected routes hang forever.
// Fix: add next() after `req.token = token;` in authMiddleware.js (IMPORTANT)
// ──────────────────────────────────────────────────────────────────────────────

const parseJsonArray = (val: unknown): string[] => {
  if (Array.isArray(val)) return val.map(String);
  if (typeof val === "string") {
    try {
      const p = JSON.parse(val);
      return Array.isArray(p) ? p.map(String) : [];
    } catch {
      return val ? val.split(",").map(s => s.trim()).filter(Boolean) : [];
    }
  }
  return [];
};

const INPUT_CLS =
  "w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500";

const READONLY_CLS =
  "w-full cursor-not-allowed rounded-xl border-2 border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-500 focus:outline-none";

const SKILLS = [
  { value: "physical_care",         label: "Physical care"             },
  { value: "medication_management", label: "Medication management"     },
  { value: "meal_preparation",      label: "Meal preparation"          },
  { value: "housekeeping",          label: "Housekeeping and cleaning"  },
  { value: "emotional_support",     label: "Emotional support"         },
  { value: "transportation",        label: "Transportation"            },
  { value: "health_monitoring",     label: "Health monitoring"         },
];

const RATES = [
  { label: "Category A (3h)",  name: "day_rate_a" as const },
  { label: "Category B (6h)",  name: "day_rate_b" as const },
  { label: "Category C (12h)", name: "day_rate_c" as const },
  { label: "Category D (24h)", name: "day_rate_d" as const },
];

type Rates = { day_rate_a: string; day_rate_b: string; day_rate_c: string; day_rate_d: string };

export default function EditCaregiverProfile() {
  const navigate = useNavigate();

  // ── Form state ──────────────────────────────────────────────────────────────
  const [full_name,    setFullName]    = useState("");
  const [city,         setCity]        = useState("");
  const [area,         setArea]        = useState("");
  const [full_address, setAddress]     = useState("");
  const [phone_number, setPhone]       = useState("");
  const [email,        setEmail]       = useState("");
  const [skills,       setSkills]      = useState<string[]>([]);
  const [rates,        setRates]       = useState<Rates>({
    day_rate_a: "", day_rate_b: "", day_rate_c: "", day_rate_d: "",
  });

  // Read-only (not in update whitelist)
  const [gender,              setGender]       = useState("");
  const [dob,                 setDob]          = useState("");
  const [age,                 setAge]          = useState("");
  const [medical_specialties, setSpecialties]  = useState("");
  const [approval_status,     setApproval]     = useState("");

  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState("");

  // ── Fetch existing profile on mount ─────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Correct URL: /api/caregiver/profile (singular, NOT /caregivers/)
        const res = await fetch(apiUrl("/api/caregiver/profile"), {
          headers: getAuthHeaders(),
        });

        if (!res.ok) {
          if (res.status === 401) { navigate("/login"); return; }
          setError("Failed to load profile.");
          return;
        }

        const data = await res.json();
        const p = data?.profile ?? data;

        setFullName(p.full_name     || "");

        // Normalize city to Title Case to match the matching algorithm
        const rawCity = String(p.city || "");
        const normalized = rawCity.charAt(0).toUpperCase() + rawCity.slice(1).toLowerCase();
        setCity(normalized);

        setArea(p.area              || "");
        setAddress(p.full_address   || "");
        setPhone(p.phone_number     || "");
        setEmail(p.email            || "");
        setSkills(parseJsonArray(p.skills));
        setRates({
          day_rate_a: p.day_rate_a != null ? String(p.day_rate_a) : "",
          day_rate_b: p.day_rate_b != null ? String(p.day_rate_b) : "",
          day_rate_c: p.day_rate_c != null ? String(p.day_rate_c) : "",
          day_rate_d: p.day_rate_d != null ? String(p.day_rate_d) : "",
        });

        // Read-only fields
        setGender(p.gender          || "");
        // Strip time component from MySQL DATETIME e.g. "1990-05-15T00:00:00.000Z"
        setDob((p.date_of_birth     || "").split("T")[0]);
        setAge(p.age != null        ? String(p.age) : "");
        setSpecialties(p.medical_specialties || "");
        setApproval(p.approval_status        || "");
      } catch {
        setError("Cannot connect to server.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // ── Skills checkbox handler ──────────────────────────────────────────────────
  const handleSkillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setSkills(prev =>
      checked ? [...prev, value] : prev.filter(s => s !== value)
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
      // Correct route: POST /api/caregiver/upload-picture
      const res = await fetch(apiUrl("/api/caregiver/upload-picture"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) {
        setError("Profile picture upload failed. Please try again.");
      }
    } catch {
      setError("Cannot upload profile picture right now.");
    }
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (skills.length === 0) {
      setError("Please select at least one skill.");
      return;
    }

    setSubmitting(true);

    // Body must be plain JSON — edit-profile has NO multer middleware.
    // Sending multipart/form-data would leave req.body completely empty.
    //
    // skills must be JSON.stringified to match the format stored by signup
    // and expected by the matching algorithm's JSON_OVERLAPS(cp.skills, ?).
    //
    // City must be capitalized to match matching algo: WHERE cp.city = ?
    const body = {
      full_name,
      city: city.charAt(0).toUpperCase() + city.slice(1).toLowerCase(),
      area,
      full_address,
      phone_number,
      email,
      // JSON.stringify matches how signupCaregiver stores this column
      skills: JSON.stringify(skills),
      ...rates,
    };

    try {
      // Correct URL: PUT /api/caregiver/edit-profile (NOT /caregivers/profile)
      const res = await fetch(apiUrl("/api/caregiver/edit-profile"), {
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
      setTimeout(() => navigate("/profile/caregiver"), 1500);
    } catch {
      setError("Cannot connect to server.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-emerald-100 via-white to-blue-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm font-semibold text-gray-500">Loading profile…</p>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────
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

          {/* Approval status badge */}
          {approval_status && (
            <div className={`mb-6 rounded-xl p-3 text-center text-sm font-semibold ring-1 ${
              approval_status === "Active"
                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                : approval_status === "Pending"
                ? "bg-amber-50 text-amber-700 ring-amber-200"
                : "bg-red-50 text-red-700 ring-red-200"
            }`}>
              Account status: {approval_status}
            </div>
          )}

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
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-emerald-800">
                Profile Picture
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-2xl font-bold text-white shadow-md">
                  {full_name.charAt(0) || "?"}
                </div>
                {/* Picture upload goes to its own dedicated route with multer */}
                <label className="cursor-pointer rounded-xl border-2 border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors">
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
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-emerald-800">
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

                {/* Gender — NOT in whitelist, shown read-only */}
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-500">
                    Gender <span className="text-xs font-normal italic">(not editable)</span>
                  </label>
                  <input type="text" value={gender} readOnly className={READONLY_CLS} />
                </div>

                {/* DOB — NOT in whitelist, shown read-only */}
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-500">
                    Date of Birth <span className="text-xs font-normal italic">(not editable)</span>
                  </label>
                  <input type="text" value={dob} readOnly className={READONLY_CLS} />
                </div>

                {/* Age — NOT in whitelist, shown read-only */}
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-500">
                    Age <span className="text-xs font-normal italic">(not editable)</span>
                  </label>
                  <input type="text" value={age} readOnly className={READONLY_CLS} />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Phone Number</label>
                  <input
                    type="tel" required value={phone_number}
                    onChange={e => setPhone(e.target.value)}
                    maxLength={11}
                    onInput={e => {
                      e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "").slice(0, 11);
                    }}
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
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-emerald-800">Location</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">City</label>
                  {/*
                    Values must be "Cairo"/"Giza"/"Alexandria" (capitalized).
                    The matching algorithm does WHERE cp.city = ? where ? comes
                    from the client's city. A lowercase mismatch means no matches.
                  */}
                  <select
                    required value={city}
                    onChange={e => setCity(e.target.value)}
                    className={INPUT_CLS}
                  >
                    <option value="">Select City</option>
                    <option value="Cairo">Cairo</option>
                    <option value="Giza">Giza</option>
                    <option value="Alexandria">Alexandria</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Area</label>
                  <select
                    required value={area}
                    onChange={e => setArea(e.target.value)}
                    disabled={!city}
                    className={`${INPUT_CLS} disabled:bg-gray-100`}
                  >
                    <option value="">Select Area</option>
                    {city === "Cairo" && (<>
                      <option>Nasr City</option>
                      <option>Heliopolis (Masr El Gedida)</option>
                      <option>New Cairo</option>
                      <option>Maadi</option>
                      <option>Mokattam</option>
                      <option>Shubra</option>
                      <option>Zamalek</option>
                      <option>Garden City</option>
                      <option>Downtown Cairo</option>
                      <option>El Rehab</option>
                      <option>Madinaty</option>
                      <option>Fifth Settlement</option>
                    </>)}
                    {city === "Giza" && (<>
                      <option>Dokki</option>
                      <option>Mohandessin</option>
                      <option>Haram</option>
                      <option>Faisal</option>
                      <option>Sheikh Zayed</option>
                      <option>6th of October</option>
                      <option>Agouza</option>
                      <option>Imbaba</option>
                    </>)}
                    {city === "Alexandria" && (<>
                      <option>Smouha</option>
                      <option>Sidi Gaber</option>
                      <option>Stanley</option>
                      <option>Miami</option>
                      <option>Montaza</option>
                      <option>Raml Station</option>
                      <option>Borg El Arab</option>
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

            {/* ── Skills & Experience ── */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-emerald-800">
                Skills & Experience
              </h2>
              <div className="rounded-xl border-2 border-gray-300 bg-white p-4">
                {/*
                  Skills sent as JSON.stringified array.
                  Field name in whitelist: "skills" (singular, not "skills_needed").
                  Values must match the matching algorithm's JSON_OVERLAPS(cp.skills, ?).
                */}
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Select all that apply (at least one required)
                </p>
                <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {SKILLS.map(({ value, label }) => (
                    <label key={value} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        value={value}
                        checked={skills.includes(value)}
                        onChange={handleSkillChange}
                        className="h-4 w-4 rounded border-2 border-gray-400 accent-emerald-600 focus:ring-emerald-500"
                      />
                      {label}
                    </label>
                  ))}
                </div>

                {/* medical_specialties is NOT in the update whitelist — shown read-only */}
                <div className="border-t-2 border-gray-100 pt-4">
                  <label className="mb-1 block text-sm font-semibold text-gray-500">
                    Medical Specialties{" "}
                    <span className="text-xs font-normal italic">(not editable — set during registration)</span>
                  </label>
                  <input
                    type="text"
                    value={medical_specialties}
                    readOnly
                    className={READONLY_CLS}
                  />
                </div>
              </div>
            </section>

            {/* ── Accepted Salaries ── */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-emerald-800">
                Accepted Salaries Per Day
              </h2>
              {/*
                Field names: day_rate_a / day_rate_b / day_rate_c / day_rate_d
                These map to the matching algorithm's CASE statement:
                  WHEN 'A' THEN cp.day_rate_a BETWEEN min_compensation AND max_compensation
                A wrong field name here would silently break caregiver matching.
              */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {RATES.map(({ label, name }) => (
                  <div key={name}>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">{label}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 font-semibold text-gray-500">E£</span>
                      <input
                        type="number"
                        required
                        min="0"
                        max="5000"
                        value={rates[name]}
                        onChange={e => setRates(prev => ({ ...prev, [name]: e.target.value }))}
                        placeholder="0"
                        className="w-full rounded-xl border-2 border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Actions ── */}
            <div className="flex gap-4">
              <Link
                to="/profile/caregiver"
                className="w-1/3 rounded-xl border-2 border-gray-300 bg-white px-4 py-4 text-center text-lg font-bold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="w-2/3 rounded-xl bg-emerald-600 px-4 py-4 text-lg font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-70"
              >
                {submitting ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}