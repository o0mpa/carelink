import { useMemo, useState } from "react";
import { Link, Form } from "react-router";

export function meta() {
    return [
    { title: "My Profile - CareLink" },
    { name: "description", content: "Manage your CareLink client profile and care requirements." },
    ];
}

type ProfileUser = {
  name: string;
  role: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
  location: {
    city: string;
    area: string;
    address: string;
  };
  medical: {
    bloodType: string;
    allergies: string;
    doctor: string;
    facility: string;
  };
  careNeeds: {
    skills: string[];
    specialties: string[];
  };
  emergency: {
    primary: { name: string; relation: string; phone: string };
    secondary: { name: string; relation: string; phone: string };
  };
};

const defaultUser: ProfileUser = {
  name: "Your Name",
  role: "Client / Family Member",
  email: "",
  phone: "",
  age: "",
  gender: "",
  location: {
    city: "",
    area: "",
    address: "",
  },
  medical: {
    bloodType: "",
    allergies: "Not provided",
    doctor: "",
    facility: "",
  },
  careNeeds: {
    skills: [],
    specialties: [],
  },
  emergency: {
    primary: { name: "", relation: "Primary", phone: "" },
    secondary: { name: "", relation: "Secondary", phone: "" },
  },
};

const parseArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
};

const toText = (value: unknown): string => (value == null ? "" : String(value));

const mapProfile = (profile: Record<string, unknown>): ProfileUser => ({
  name: toText(profile.full_name) || "Your Name",
  role: "Client / Family Member",
  email: toText(profile.email),
  phone: toText(profile.phone_number),
  age: toText(profile.age),
  gender: toText(profile.gender),
  location: {
    city: toText(profile.city),
    area: toText(profile.area),
    address: toText(profile.full_address),
  },
  medical: {
    bloodType: toText(profile.blood_type),
    allergies: parseArray(profile.allergies).join(", ") || "Not provided",
    doctor: toText(profile.doctor_name),
    facility: toText(profile.doctor_facility),
  },
  careNeeds: {
    skills: parseArray(profile.skills),
    specialties: parseArray(profile.medical_specialties_required),
  },
  emergency: {
    primary: {
      name: toText(profile.emergency_contact1_name),
      relation: "Primary",
      phone: toText(profile.emergency_contact1_phone),
    },
    secondary: {
      name: toText(profile.emergency_contact2_name),
      relation: "Secondary",
      phone: toText(profile.emergency_contact2_phone),
    },
  },
});

export default function ClientProfile() {
    const [activeTab, setActiveTab] = useState<"personal" | "care">("personal");
    const user = useMemo(() => {
      if (typeof window === "undefined") return defaultUser;

      const raw = localStorage.getItem("carelink_profile");
      if (!raw) return defaultUser;

      try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return defaultUser;
        return mapProfile(parsed as Record<string, unknown>);
      } catch {
        return defaultUser;
      }
    }, []);

    return (
    <div className="min-h-screen bg-linear-to-br from-blue-100 via-white to-emerald-100">
        <main className="container mx-auto px-4 py-10 sm:px-6 md:px-10">
        <div className="mx-auto max-w-5xl">
            
          {/* Profile Header Card */}
            <div className="mb-6 flex flex-col items-center justify-between rounded-3xl bg-white/90 p-8 shadow-lg backdrop-blur-md ring-2 ring-blue-100 sm:flex-row sm:p-10">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-blue-600 text-3xl font-bold text-white shadow-md">
                {user.name.charAt(0)}
                
                <Form method="post" encType="multipart/form-data">
                    <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-blue-600 shadow-md ring-2 ring-blue-100 transition-colors hover:bg-gray-50 hover:text-blue-800" title="Upload Profile Picture">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                    <input type="file" name="profile_picture" accept="image/*" className="hidden" onChange={(e) => e.target.form?.requestSubmit()} />
                    </label>
                </Form>
                </div>

                <div className="text-center sm:text-left">
                <h1 className="text-3xl font-extrabold text-blue-900">{user.name}</h1>
                <p className="mt-1 text-sm font-medium text-gray-600">{user.role}</p>
                <span className="mt-3 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 ring-1 ring-green-300">
                    Account Verified
                </span>
                </div>
            </div>
            
            {/* Buttons */}
            <div className="mt-6 flex flex-wrap justify-center gap-3 sm:mt-0 sm:justify-end">
            <Link 
                    to="/profile/client/edit"
                    className="flex items-center justify-center rounded-xl border-2 border-blue-600 bg-transparent px-5 py-2.5 text-sm font-bold text-blue-600 transition-all hover:bg-blue-50 active:scale-[0.98]"
                >
                    Edit Profile
            </Link>

                <Link 
                to="/forgot-password"
                className="flex items-center justify-center rounded-xl border-2 border-orange-500 bg-transparent px-5 py-2.5 text-sm font-bold text-orange-500 transition-all hover:bg-orange-50 active:scale-[0.98]"
                >
                change Password
                </Link>

                <Form method="post" action="/logout">
                <button 
                    type="submit"
                    className="flex w-full items-center justify-center rounded-xl border-2 border-red-500 bg-transparent px-5 py-2.5 text-sm font-bold text-red-500 transition-all hover:bg-red-50 active:scale-[0.98]"
                >
                    Logout
                </button>
                </Form>
            </div>
            </div>

          {/* Navigation Tabs */}
            <div className="mb-6 flex space-x-2 rounded-xl bg-white/50 p-1 ring-1 ring-gray-200 backdrop-blur-sm">
            <button onClick={() => setActiveTab("personal")} className={`flex-1 rounded-lg py-3 text-sm font-bold transition-all ${activeTab === "personal" ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:bg-white/80 hover:text-blue-600"}`}>
                Personal & Medical Info
            </button>
            <button onClick={() => setActiveTab("care")} className={`flex-1 rounded-lg py-3 text-sm font-bold transition-all ${activeTab === "care" ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:bg-white/80 hover:text-blue-600"}`}>
                Care Requirements
            </button>
            </div>

            <div className="rounded-3xl bg-white/90 p-8 shadow-xl backdrop-blur-md ring-2 ring-gray-300 sm:p-10">
            {/* PERSONAL & MEDICAL INFO */}
            {activeTab === "personal" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="mb-6 border-b-2 border-gray-100 pb-3 text-2xl font-bold text-blue-900">Personal Details</h2>
                
                <div className="mb-10 grid gap-6 md:grid-cols-2">
                    <div className="rounded-xl border-2 border-gray-100 bg-gray-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Contact Information</p>
                    <p className="mt-2 text-sm text-gray-900"><span className="font-semibold">Email:</span> {user.email}</p>
                    <p className="mt-1 text-sm text-gray-900"><span className="font-semibold">Phone:</span> {user.phone}</p>
                    </div>

                    <div className="rounded-xl border-2 border-gray-100 bg-gray-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Demographics</p>
                    <p className="mt-2 text-sm text-gray-900"><span className="font-semibold">Age:</span> {user.age}</p>
                    <p className="mt-1 text-sm text-gray-900"><span className="font-semibold">Gender:</span> {user.gender}</p>
                    </div>

                    <div className="rounded-xl border-2 border-gray-100 bg-gray-50 p-4 md:col-span-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Location</p>
                    <p className="mt-2 text-sm text-gray-900"><span className="font-semibold">City:</span> {user.location.city}</p>
                    <p className="mt-1 text-sm text-gray-900"><span className="font-semibold">Area:</span> {user.location.area}</p>
                    <p className="mt-1 text-sm text-gray-900"><span className="font-semibold">Address:</span> {user.location.address}</p>
                    </div>
                </div>

                <h2 className="mb-6 border-b-2 border-gray-100 pb-3 text-2xl font-bold text-blue-900">Medical Profile</h2>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-xl border-2 border-blue-100 bg-blue-50/50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-800">Vitals & Allergies</p>
                    <p className="mt-2 text-sm text-gray-900"><span className="font-semibold">Blood Type:</span> {user.medical.bloodType}</p>
                    <p className="mt-1 text-sm text-gray-900"><span className="font-semibold">Allergies:</span> {user.medical.allergies}</p>
                    </div>

                    <div className="rounded-xl border-2 border-blue-100 bg-blue-50/50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-800">Supervising Physician</p>
                    <p className="mt-2 text-sm text-gray-900"><span className="font-semibold">Doctor:</span> {user.medical.doctor}</p>
                    <p className="mt-1 text-sm text-gray-900"><span className="font-semibold">Facility:</span> {user.medical.facility}</p>
                    </div>
                </div>
                </div>
            )}

            {/* CARE REQUIREMENTS */}
            {activeTab === "care" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="mb-6 border-b-2 border-gray-100 pb-3 text-2xl font-bold text-blue-900">Caregiving Needs</h2>
                
                <div className="mb-10 grid gap-6 md:grid-cols-2">
                    <div className="rounded-xl border-2 border-gray-100 bg-gray-50 p-5 md:col-span-2">
                    <p className="mb-4 text-sm font-bold text-gray-700">Required Skills & Assistance</p>
                    <div className="flex flex-wrap gap-2">
                        {user.careNeeds.skills.map((skill: string, i: number) => (
                        <span key={i} className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">{skill}</span>
                        ))}
                    </div>
                    </div>

                    <div className="rounded-xl border-2 border-gray-100 bg-gray-50 p-5 md:col-span-2">
                    <p className="mb-4 text-sm font-bold text-gray-700">Specific Medical Specialties Required</p>
                    <div className="flex flex-wrap gap-2">
                        {user.careNeeds.specialties.map((spec: string, i: number) => (
                        <span key={i} className="rounded-lg bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">{spec}</span>
                        ))}
                    </div>
                    </div>
                </div>

                <h2 className="mb-6 border-b-2 border-gray-100 pb-3 text-2xl font-bold text-red-900">Emergency Contacts</h2>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-xl border-2 border-red-100 bg-red-50 p-5">
                    <div className="mb-2 flex items-center justify-between">
                        <h3 className="font-bold text-red-900">Primary Contact</h3>
                        <span className="rounded bg-red-200 px-2 py-0.5 text-xs font-bold text-red-800">{user.emergency.primary.relation}</span>
                    </div>
                    <p className="text-sm text-gray-900"><span className="font-semibold">Name:</span> {user.emergency.primary.name}</p>
                    <p className="mt-1 text-sm text-gray-900"><span className="font-semibold">Phone:</span> {user.emergency.primary.phone}</p>
                    </div>

                    <div className="rounded-xl border-2 border-red-100 bg-red-50 p-5">
                    <div className="mb-2 flex items-center justify-between">
                        <h3 className="font-bold text-red-900">Secondary Contact</h3>
                        <span className="rounded bg-red-200 px-2 py-0.5 text-xs font-bold text-red-800">{user.emergency.secondary.relation}</span>
                    </div>
                    <p className="text-sm text-gray-900"><span className="font-semibold">Name:</span> {user.emergency.secondary.name}</p>
                    <p className="mt-1 text-sm text-gray-900"><span className="font-semibold">Phone:</span> {user.emergency.secondary.phone}</p>
                    </div>
                </div>
                </div>
            )}
            </div>
        </div>
        </main>
    </div>
    );
}