import { useState } from "react";
import { Link, Form } from "react-router";

export function meta() {
    return [
    { title: "Caregiver Sign Up - CareLink" },
    { name: "description", content: "Apply to become a trusted caregiver." },
    ];
}

export default function RegisterCaregiver() {
    const [selectedCity, setSelectedCity] = useState("");

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

            <Form method="post" encType="multipart/form-data" className="flex flex-col gap-8">
            
            {/* Account Information  */}
            <section>
                <h2 className="mb-4 border-b pb-2 text-lg font-bold text-emerald-800">Account Information</h2>
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
                    <input 
                    type="password" 
                    name="password"
                    required 
                    minLength={8}
                    pattern=".*[A-Z].*" 
                    title="Password must be at least 8 characters long and contain at least one uppercase letter."
                    placeholder="Min 8 chars, 1 Capital"
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Confirm Password</label>
                    <input type="password" name="confirmPassword" required minLength={8} className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                </div>
            </section>

            {/*  Personal Information  */}
            <section>
                <h2 className="mb-4 border-b pb-2 text-lg font-bold text-emerald-800">Personal Information</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Full Name</label>
                    <input type="text" name="fullName" required className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
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
                    <input type="date" name="dateOfBirth" required max="9999-12-31" className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Age</label>
                    <input 
                    type="number" 
                    name="age"
                    min="0"
                    max="100"
                    required
                    onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e' || e.key === '+' || e.key === '.') {
                        e.preventDefault();
                        }
                    }}
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 [&::-webkit-inner-spin-button]:cursor-pointer [&::-webkit-inner-spin-button]:opacity-100" 
                    />
                </div>
                    <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Phone Number</label>
                    <input 
                    type="tel" 
                    name="phone"
                    required
                    maxLength={11}
                    onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 11);
                    }}
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                    />
                </div>
                </div>
            </section>

            {/*  Location  */}
            <section>
                <h2 className="mb-4 border-b pb-2 text-lg font-bold text-emerald-800">Location</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">City</label>
                    <select 
                    name="city"
                    required 
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                    <option value="">Select City</option>
                    <option value="cairo">Cairo</option>
                    <option value="giza">Giza</option>
                    </select>
                </div>
                <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Area</label>
                    <select 
                    name="area"
                    required 
                    disabled={!selectedCity}
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                    >
                    <option value="">Select Area</option>
                    {selectedCity === "cairo" && (
                        <>
                        <option value="maadi">Maadi</option>
                        <option value="tagamoa">Tagamoa</option>
                        <option value="nasr_city">Nasr City</option>
                        <option value="heliopolis">Heliopolis</option>
                        </>
                    )}
                    {selectedCity === "giza" && (
                        <>
                        <option value="dokki">Dokki</option>
                        <option value="mohandeseen">Mohandeseen</option>
                        <option value="haram">Haram</option>
                        <option value="october">6th of October</option>
                        </>
                    )}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Full Address</label>
                    <input type="text" name="address" required className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                </div>
            </section>

            {/*  Skills & Experience  */}
            <section>
                <h2 className="mb-4 border-b pb-2 text-lg font-bold text-emerald-800">Skills & Experience</h2>
                <div className="rounded-xl border-2 border-gray-300 bg-white p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" name="skills" value="physical_care" className="h-4 w-4 rounded border-2 border-gray-400 accent-emerald-600 focus:ring-emerald-500" /> Physical care</label>
                    <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" name="skills" value="medication_management" className="h-4 w-4 rounded border-2 border-gray-400 accent-emerald-600 focus:ring-emerald-500" /> Medication management</label>
                    <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" name="skills" value="meal_preparation" className="h-4 w-4 rounded border-2 border-gray-400 accent-emerald-600 focus:ring-emerald-500" /> Meal preparation</label>
                    <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" name="skills" value="housekeeping" className="h-4 w-4 rounded border-2 border-gray-400 accent-emerald-600 focus:ring-emerald-500" /> Housekeeping and cleaning</label>
                    <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" name="skills" value="emotional_support" className="h-4 w-4 rounded border-2 border-gray-400 accent-emerald-600 focus:ring-emerald-500" /> Emotional support</label>
                    <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" name="skills" value="transportation" className="h-4 w-4 rounded border-2 border-gray-400 accent-emerald-600 focus:ring-emerald-500" /> Transportation</label>
                    <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" name="skills" value="health_monitoring" className="h-4 w-4 rounded border-2 border-gray-400 accent-emerald-600 focus:ring-emerald-500" /> Health monitoring</label>
                </div>
                <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Medical Specialties (Conditions/Disabilities Experienced In):</label>
                    <input type="text" name="medicalSpecialties" placeholder="e.g., Dementia care, Post-surgery recovery" className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                </div>
            </section>

            {/*  Document Uploads  */}
            <section>
                <h2 className="mb-4 border-b pb-2 text-lg font-bold text-emerald-800">Verification Documents</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 rounded-xl border-2 border-emerald-200 bg-emerald-50/30 p-4">
                <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">High School / Higher Education</label>
                    <input type="file" name="doc_education" required className="max-w-full text-xs text-gray-900 file:mr-2 file:cursor-pointer file:rounded-lg file:border-0 file:bg-emerald-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700 file:transition-colors file:hover:bg-emerald-200" />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">Caregiving / First Aid Cert</label>
                    <input type="file" name="doc_certification" required className="max-w-full text-xs text-gray-900 file:mr-2 file:cursor-pointer file:rounded-lg file:border-0 file:bg-emerald-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700 file:transition-colors file:hover:bg-emerald-200" />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">National ID</label>
                    <input type="file" name="doc_national_id" required className="max-w-full text-xs text-gray-900 file:mr-2 file:cursor-pointer file:rounded-lg file:border-0 file:bg-emerald-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700 file:transition-colors file:hover:bg-emerald-200" />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">Criminal Record</label>
                    <input type="file" name="doc_criminal_record" required className="max-w-full text-xs text-gray-900 file:mr-2 file:cursor-pointer file:rounded-lg file:border-0 file:bg-emerald-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700 file:transition-colors file:hover:bg-emerald-200" />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">Past References (Optional)</label>
                    <input type="file" name="doc_references" className="max-w-full text-xs text-gray-900 file:mr-2 file:cursor-pointer file:rounded-lg file:border-0 file:bg-emerald-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700 file:transition-colors file:hover:bg-emerald-200" />
                </div>
                </div>
            </section>

            {/*  Salary Settings  */}
            <section>
                <h2 className="mb-4 border-b pb-2 text-lg font-bold text-emerald-800">Accepted salaries Per Day</h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Category A (3h)</label>
                    <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500 font-semibold">E£</span>
                    <input 
                        type="number" 
                        name="salary_category_a"
                        min="0" 
                        max="500"
                        required 
                        placeholder="0.00" 
                        onInput={(e) => {
                        if (Number(e.currentTarget.value) > 500) e.currentTarget.value = '500';
                        }}
                        className="w-full rounded-xl border-2 border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                    />
                    </div>
                </div>
                <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Category B (6h)</label>
                    <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500 font-semibold">E£</span>
                    <input 
                        type="number" 
                        name="salary_category_b"
                        min="0" 
                        max="500"
                        required 
                        placeholder="0.00" 
                        onInput={(e) => {
                        if (Number(e.currentTarget.value) > 500) e.currentTarget.value = '500';
                        }}
                        className="w-full rounded-xl border-2 border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                    />
                    </div>
                </div>
                <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Category C (9h)</label>
                    <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500 font-semibold">E£</span>
                    <input 
                        type="number" 
                        name="salary_category_c"
                        min="0" 
                        max="500"
                        required 
                        placeholder="0.00" 
                        onInput={(e) => {
                        if (Number(e.currentTarget.value) > 500) e.currentTarget.value = '500';
                        }}
                        className="w-full rounded-xl border-2 border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                    />
                    </div>
                </div>
                <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Category D (12h)</label>
                    <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500 font-semibold">E£</span>
                    <input 
                        type="number" 
                        name="salary_category_d"
                        min="0" 
                        max="500"
                        required 
                        placeholder="0.00" 
                        onInput={(e) => {
                        if (Number(e.currentTarget.value) > 500) e.currentTarget.value = '500';
                        }}
                        className="w-full rounded-xl border-2 border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                    />
                    </div>
                </div>
                </div>
            </section>

            <button type="submit" className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-4 text-lg font-bold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 hover:shadow-md active:scale-[0.98]">
                Submit Application
            </button>
            </Form>

            <div className="mt-8 flex flex-col items-center gap-2 text-sm text-gray-600">
            <div>
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-emerald-600 transition-colors hover:text-emerald-800 hover:underline">Sign In</Link>
            </div>
            <Link to="/" className="mt-2 font-semibold text-gray-500 transition-colors hover:text-gray-800 hover:underline">← Back to Home</Link>
            </div>
            
        </div>
        </main>
    </div>
    );
}