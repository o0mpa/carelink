import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { getAuthHeaders, clearAuth, getProfile, saveProfile } from "~/utils/auth";

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

export async function loader() {
  return null;
}

// ── Types ──────────────────────────────────────────────────────────────────

type DocumentEntry = {
  label: string;
  /** The file path/URL returned by the backend, or null if not uploaded */
  path: string | null;
};

type CaregiverViewData = {
  name: string;
  title: string;
  rating: number;
  email: string;
  phone: string;
  age: string;
  gender: string;
  serviceArea: string;
  salaries: { label: string; price: string }[];
  skills: string[];
  specialties: string;
  documents: DocumentEntry[];
};

// ── Helpers ────────────────────────────────────────────────────────────────

const SKILL_LABEL: Record<string, string> = {
  physical_care: "Physical care",
  medication_management: "Medication management",
  meal_preparation: "Meal preparation",
  housekeeping: "Housekeeping",
  housekeeping_and_cleaning: "Housekeeping",
  emotional_support: "Emotional support",
  health_monitoring: "Health monitoring",
  transportation: "Transportation",
};

function parseSkills(skills: unknown): string[] {
  if (Array.isArray(skills)) {
    return skills.map((s) => SKILL_LABEL[String(s)] ?? String(s));
  }
  if (typeof skills === "string") {
    try {
      const parsed = JSON.parse(skills);
      if (Array.isArray(parsed)) {
        return parsed.map((s) => SKILL_LABEL[String(s)] ?? String(s));
      }
    } catch {
      return skills
        .split(",")
        .map((s) => SKILL_LABEL[s.trim()] ?? s.trim())
        .filter(Boolean);
    }
  }
  return [];
}

/**
 * Maps a raw profile object (from backend OR localStorage) into the
 * CaregiverViewData shape the UI expects.
 */
function mapProfile(profile: Record<string, unknown>): CaregiverViewData {
  return {
    name: String(profile.full_name || "Your Name"),
    title: "Certified Caregiver",
    rating: 4.9, // placeholder until a ratings system exists
    email: String(profile.email || ""),
    phone: String(profile.phone_number || ""),
    age: String(profile.age || ""),
    gender: String(profile.gender || ""),
    serviceArea: [profile.city, profile.area, profile.full_address]
      .filter(Boolean)
      .join(", "),
    salaries: [
      { label: "Category A (3h)", price: String(profile.day_rate_a || "—") },
      { label: "Category B (6h)", price: String(profile.day_rate_b || "—") },
      { label: "Category C (9h)", price: String(profile.day_rate_c || "—") },
      { label: "Category D (12h)", price: String(profile.day_rate_d || "—") },
    ],
    skills: parseSkills(profile.skills),
    specialties: String(
      profile.medical_specialties || profile.specialties || "Not provided"
    ),
    // Real document paths from the backend — null means not uploaded / not returned yet
    documents: [
      { label: "High School / Higher Education", path: String(profile.education_docs || "") || null },
      { label: "Caregiving / First Aid Cert",    path: String(profile.certificates   || "") || null },
      { label: "National ID",                    path: String(profile.national_id     || "") || null },
      { label: "Criminal Record",                path: String(profile.criminal_record || "") || null },
      { label: "Past References",                path: String(profile.references      || "") || null },
    ],
  };
}

// ── Empty / loading placeholder ────────────────────────────────────────────

const EMPTY: CaregiverViewData = {
  name: "Loading…",
  title: "Certified Caregiver",
  rating: 0,
  email: "",
  phone: "",
  age: "",
  gender: "",
  serviceArea: "",
  salaries: [
    { label: "Category A (3h)", price: "—" },
    { label: "Category B (6h)", price: "—" },
    { label: "Category C (9h)", price: "—" },
    { label: "Category D (12h)", price: "—" },
  ],
  skills: [],
  specialties: "",
  documents: [],
};

// ── Component ──────────────────────────────────────────────────────────────

export default function CaregiverProfile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"professional" | "experience">(
    "professional"
  );
  const [caregiver, setCaregiver] = useState<CaregiverViewData>(EMPTY);

  useEffect(() => {
    const loadProfile = async () => {
      // 1. Try the backend first
      try {
        const res = await fetch("http://localhost:5000/api/caregiver/profile", {
          headers: getAuthHeaders(),
        });

        if (res.ok) {
          const data = await res.json();
          // Backend may return { profile: {...} } or the profile object directly.
          const raw = data?.profile ?? data;
          if (raw && typeof raw === "object") {
            const profile = raw as Record<string, unknown>;
            setCaregiver(mapProfile(profile));
            // Keep local storage in sync so other pages benefit too.
            saveProfile(profile);
            return;
          }
        }
      } catch {
        // Network error or endpoint not ready yet — fall through to localStorage
      }

      // 2. Fall back to whatever was saved at login
      const saved = getProfile();
      if (saved) {
        setCaregiver(mapProfile(saved));
      }
    };

    loadProfile();
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  // ── Render ────────────────────────────────────────────────────────────────
    return (
    <div className="min-h-screen bg-linear-to-br from-blue-100 via-white to-emerald-100">
        <main className="container mx-auto px-4 py-4 sm:px-6 md:px-10">
        <div className="mx-auto max-w-5xl">
                    <Link to="/dashboard/caregiver" className="inline-flex items-center gap-2 text-sm py-3 font-semibold text-emerald-500 transition-colors hover:text-emerald-900 hover:underline">
            ← Back to Dashboard
          </Link>

          {/* Profile Header */}
          <div className="mb-6 flex flex-col items-center justify-between rounded-3xl bg-white/90 p-8 shadow-lg backdrop-blur-md ring-2 ring-blue-100 sm:flex-row sm:p-10">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-3xl font-bold text-white shadow-md">
                {caregiver.name.charAt(0)}
                {/* Profile picture upload — wired to the existing backend endpoint */}
                <label
                  className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-teal-600 shadow-md ring-2 ring-blue-100 transition-colors hover:bg-gray-50 hover:text-blue-800"
                  title="Upload Profile Picture"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const fd = new FormData();
                      fd.append("picture", file);
                      const token = localStorage.getItem("carelink_token") ?? "";
                      await fetch("http://localhost:5000/api/caregiver/profile/picture", {
                        method: "POST",
                        headers: { Authorization: `Bearer ${token}` },
                        body: fd,
                      });
                    }}
                  />
                </label>
              </div>

              <div className="text-center sm:text-left">
                <h1 className="text-3xl font-extrabold text-green-900">{caregiver.name}</h1>
                <p className="mt-1 text-sm font-semibold text-gray-600">{caregiver.title}</p>
                <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-300">
                    Account Verified
                  </span>
                  {caregiver.rating > 0 && (
                    <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-300">
                      {caregiver.rating} ★ Rating
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:mt-0">
              <Link
                to="/profile/caregiver/edit"
                className="flex items-center justify-center rounded-xl border-2 border-emerald-600 bg-transparent px-5 py-2.5 text-sm font-bold text-emerald-600 transition-all hover:bg-emerald-50 active:scale-[0.98]"
              >
                Edit Profile
              </Link>

              <Link
                to="/change-password"
                className="flex items-center justify-center rounded-xl border-2 border-orange-500 bg-transparent px-5 py-2.5 text-sm font-bold text-orange-500 transition-all hover:bg-orange-50 active:scale-[0.98]"
              >
                Change Password
              </Link>

              {/* Fixed logout — client-side only, no broken SSR Form */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center rounded-xl border-2 border-red-500 bg-transparent px-5 py-2.5 text-sm font-bold text-red-500 transition-all hover:bg-red-50 active:scale-[0.98]"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Tabs */}
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

            {/* PROFESSIONAL TAB */}
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
                    <p className="mt-2 text-sm text-gray-900"><span className="font-semibold">Email:</span> {caregiver.email || "—"}</p>
                    <p className="mt-1 text-sm text-gray-900"><span className="font-semibold">Phone:</span> {caregiver.phone || "—"}</p>
                    <p className="mt-1 text-sm text-gray-900"><span className="font-semibold">Age:</span> {caregiver.age || "—"}</p>
                    <p className="mt-1 text-sm text-gray-900"><span className="font-semibold">Gender:</span> {caregiver.gender || "—"}</p>
                  </div>
                  <div className="rounded-xl border-2 border-gray-100 bg-gray-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Service Area
                    </p>
                    <p className="mt-2 text-sm text-gray-900">{caregiver.serviceArea || "—"}</p>
                  </div>
                </div>

                <section>
                  <h2 className="mb-1 pb-3 text-2xl font-bold text-emerald-900">
                    Accepted Salaries Per Day
                  </h2>
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {caregiver.salaries.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl border-2 border-gray-100 bg-white p-2 text-center shadow-sm"
                      >
                        <p className="mb-2 text-[10px] font-bold uppercase text-gray-700">
                          {item.label}
                        </p>
                        <div className="flex items-center justify-center gap-1 text-emerald-700">
                          <span className="text-sm font-semibold">E£</span>
                          <span className="text-sm font-black">{item.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* EXPERIENCE TAB */}
            {activeTab === "experience" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 space-y-12 duration-300">

                {/* Skills */}
                <section>
                  <h2 className="mb-6 border-b-2 border-emerald-50 pb-3 text-2xl font-bold text-emerald-900">
                    Skills & Experience
                  </h2>
                  <div className="rounded-2xl border-2 border-gray-100 bg-gray-50/50 p-6 sm:p-8">
                    {caregiver.skills.length > 0 ? (
                      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                        {caregiver.skills.map((skill) => (
                          <div key={skill} className="flex items-center gap-3">
                            <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-600 shadow-sm">
                              <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="text-sm font-semibold text-slate-700">{skill}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mb-8 text-sm text-gray-400">No skills listed yet.</p>
                    )}

                    <div className="border-t border-gray-200 pt-3">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                        Medical Specialties
                      </p>
                      <p className="text-md font-medium italic text-slate-700">
                        "{caregiver.specialties}"
                      </p>
                    </div>
                  </div>
                </section>

                {/* Documents */}
                <section>
                  <h2 className="mb-6 border-b-2 border-emerald-50 pb-3 text-2xl font-bold text-emerald-900">
                    Verification Documents
                  </h2>

                  {caregiver.documents.length === 0 ? (
                    <p className="text-sm text-gray-400">
                      Documents will appear here once profile is loaded from the server.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {caregiver.documents.map((doc) => (
                        <div
                          key={doc.label}
                          className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                        >
                          <div className="flex flex-col">
                            <span className="text-[12px] font-bold uppercase text-gray-700">
                              {doc.label}
                            </span>
                            {doc.path ? (
                              <a
                                href={`http://localhost:5000/${doc.path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold text-emerald-600 hover:underline"
                              >
                                View File
                              </a>
                            ) : (
                              <span className="text-xs font-semibold text-gray-400">
                                Not uploaded
                              </span>
                            )}
                          </div>

                          {doc.path ? (
                            <a
                              href={`http://localhost:5000/${doc.path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 transition-colors hover:text-emerald-600"
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                              </svg>
                            </a>
                          ) : (
                            <svg className="h-5 w-5 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>

              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}