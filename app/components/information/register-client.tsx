import { useState } from "react";
import { Link, Form } from "react-router"; 

export function meta() {
    return [
    { title: "Family Sign Up - CareLink" },
    { name: "description", content: "Create an account to find trusted caregivers." },
    ];
}

export default function RegisterClient() {
    const [selectedCity, setSelectedCity] = useState("");
    const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);

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

    return (
    <div className="min-h-screen bg-linear-to-br from-blue-100 via-white to-emerald-100 py-12">
        <main className="flex flex-col items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-4xl rounded-2xl bg-white/95 p-6 shadow-xl backdrop-blur-md ring-2 ring-gray-300 sm:p-10">
            
            <h1 className="mb-2 text-center text-3xl font-extrabold text-blue-900">
            Client Registration
            </h1>
            <p className="mb-8 text-center text-sm text-gray-600">
            Create an account to find the perfect caregiver for your needs.
            </p>

            <Form method="post" encType="multipart/form-data" className="flex flex-col gap-8">
            
            {/*  Account Information  */}
            <section>
                <h2 className="mb-4 border-b pb-2 text-lg font-bold text-blue-800">Account Information</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Username</label>
                    <input type="text" name="username" required className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Email Address</label>
                    <input type="email" name="email" required className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Confirm Password</label>
                    <input type="password" name="confirmPassword" required minLength={8} className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                </div>
            </section>

            {/*  Personal Information  */}
            <section>
                <h2 className="mb-4 border-b pb-2 text-lg font-bold text-blue-800">Personal Information</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Full Name</label>
                    <input type="text" name="fullName" required className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Gender</label>
                    <select name="gender" required className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    </select>
                </div>
                <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Date of Birth</label>
                    <input type="date" name="dateOfBirth" required max="9999-12-31" className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
                        if (e.key === '-' || e.key === 'e' || e.key === '+' || e.key === '.') e.preventDefault();
                    }}
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-inner-spin-button]:cursor-pointer [&::-webkit-inner-spin-button]:opacity-100" 
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
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                </div>
                </div>
            </section>

            {/*  Location  */}
            <section>
                <h2 className="mb-4 border-b pb-2 text-lg font-bold text-blue-800">Location</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">City</label>
                    <select 
                    name="city"
                    required 
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
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
                    <input type="text" name="address" required className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                </div>
            </section>

            {/*  Medical Details & Documents  */}
            <section>
                <h2 className="mb-4 border-b pb-2 text-lg font-bold text-blue-800">Medical Details & Documents</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Blood Type</label>
                    <select name="bloodType" required className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
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
                
                {/* Allergies Checkboxes */}
                <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Allergies</label>
                    <div className="flex min-h-11 w-full flex-wrap items-center gap-x-5 gap-y-3 rounded-xl border-2 border-gray-300 bg-white px-4 py-3">
                    
                    <label className={`flex cursor-pointer items-center gap-2 text-sm transition-opacity ${hasOtherAllergies ? "text-gray-400 opacity-60" : "text-gray-900 font-semibold"}`}>
                        <input 
                        type="checkbox" 
                        name="allergies"
                        value="none" 
                        checked={isNoneSelected}
                        onChange={handleAllergyChange}
                        disabled={hasOtherAllergies}
                        className="h-4 w-4 rounded border-2 border-gray-400 accent-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed" 
                        />
                        None
                    </label>

                    {[
                        { id: "food", label: "Food" },
                        { id: "medication", label: "Medication" },
                        { id: "environmental", label: "Environmental" },
                        { id: "pets", label: " home Pets" },
                        { id: "insects", label: "Insects " },
                        { id: "pollen", label: "Pollen" },
                        { id: "dust", label: "Dust " },
                    ].map((allergy) => (
                        <label 
                        key={allergy.id} 
                        className={`flex cursor-pointer items-center gap-2 text-sm transition-opacity ${isNoneSelected ? "text-gray-400 opacity-60" : "text-gray-900"}`}
                        >
                        <input 
                            type="checkbox" 
                            name="allergies" 
                            value={allergy.id}
                            checked={selectedAllergies.includes(allergy.id)}
                            onChange={handleAllergyChange}
                            disabled={isNoneSelected}
                            className="h-4 w-4 rounded border-2 border-gray-400 accent-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed" 
                        />
                        {allergy.label}
                        </label>
                    ))}

                    </div>
                </div>

                <div className="md:col-span-2 mt-2">
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Doctor / Medical Facility Supervising (Optional)</label>
                    <input type="text" name="supervisingDoctor" className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                
                <div className="md:col-span-2 mt-2 rounded-xl border-2 border-blue-200 bg-blue-50/30 p-4">
                    <h3 className="mb-3 font-semibold text-blue-900">Document Uploads</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-700">Upload National ID</label>
                        <input type="file" name="doc_national_id" required className="max-w-full text-xs text-gray-900 file:mr-2 file:cursor-pointer file:rounded-lg file:border-0 file:bg-blue-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700 file:transition-colors file:hover:bg-blue-200" />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-700">Upload Diagnoses</label>
                        <input type="file" name="doc_diagnoses" required className="max-w-full text-xs text-gray-900 file:mr-2 file:cursor-pointer file:rounded-lg file:border-0 file:bg-blue-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700 file:transition-colors file:hover:bg-blue-200" />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-700">Upload Conditions</label>
                        <input type="file" name="doc_conditions" required className="max-w-full text-xs text-gray-900 file:mr-2 file:cursor-pointer file:rounded-lg file:border-0 file:bg-blue-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700 file:transition-colors file:hover:bg-blue-200" />
                    </div>
                    </div>
                </div>
                </div>
            </section>

            {/*  Skills Needed  */}
            <section>
                <h2 className="mb-4 border-b pb-2 text-lg font-bold text-blue-800">Skills Needed</h2>
                <div className="rounded-xl border-2 border-gray-300 bg-white p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" name="skills" value="physical_care" className="h-4 w-4 rounded border-2 border-gray-400 accent-blue-600 focus:ring-blue-500" /> Physical care</label>
                    <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" name="skills" value="medication_management" className="h-4 w-4 rounded border-2 border-gray-400 accent-blue-600 focus:ring-blue-500" /> Medication management</label>
                    <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" name="skills" value="meal_preparation" className="h-4 w-4 rounded border-2 border-gray-400 accent-blue-600 focus:ring-blue-500" /> Meal preparation</label>
                    <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" name="skills" value="housekeeping" className="h-4 w-4 rounded border-2 border-gray-400 accent-blue-600 focus:ring-blue-500" /> Housekeeping and cleaning</label>
                    <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" name="skills" value="emotional_support" className="h-4 w-4 rounded border-2 border-gray-400 accent-blue-600 focus:ring-blue-500" /> Emotional support</label>
                    <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" name="skills" value="transportation" className="h-4 w-4 rounded border-2 border-gray-400 accent-blue-600 focus:ring-blue-500" /> Transportation</label>
                    <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" name="skills" value="health_monitoring" className="h-4 w-4 rounded border-2 border-gray-400 accent-blue-600 focus:ring-blue-500" /> Health monitoring</label>
                </div>
                <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Medical Specialties Required:</label>
                    <input type="text" name="medicalSpecialties" placeholder="e.g., Alzheimer's, Diabetes" className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                </div>
            </section>

            {/*  Emergency Contacts  */}
            <section>
                <h2 className="mb-4 border-b pb-2 text-lg font-bold text-blue-800">Emergency Contacts</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border-2 border-blue-200 bg-blue-50/30 p-4">
                    <h3 className="mb-2 font-semibold text-blue-900">Contact 1</h3>
                    <div className="mb-2">
                    <label className="mb-1 block text-xs font-semibold text-gray-700">Full Name</label>
                    <input type="text" name="emergencyContact1_name" required className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">Phone Number</label>
                    <input 
                        type="tel" 
                        name="emergencyContact1_phone"
                        required
                        maxLength={11}
                        onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 11);
                        }}
                        className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                    </div>
                </div>
                <div className="rounded-xl border-2 border-blue-200 bg-blue-50/30 p-4">
                    <h3 className="mb-2 font-semibold text-blue-900">Contact 2</h3>
                    <div className="mb-2">
                    <label className="mb-1 block text-xs font-semibold text-gray-700">Full Name</label>
                    <input type="text" name="emergencyContact2_name" required className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">Phone Number</label>
                    <input 
                        type="tel" 
                        name="emergencyContact2_phone"
                        required
                        maxLength={11}
                        onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 11);
                        }}
                        className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                    </div>
                </div>
                </div>
            </section>

            <button type="submit" className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-4 text-lg font-bold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md active:scale-[0.98]">
                Complete Registration
            </button>
            </Form>

            <div className="mt-8 flex flex-col items-center gap-2 text-sm text-gray-600">
            <div>
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-blue-600 transition-colors hover:text-blue-800 hover:underline">Sign In</Link>
            </div>
            <Link to="/" className="mt-2 font-semibold text-gray-500 transition-colors hover:text-gray-800 hover:underline">← Back to Home</Link>
            </div>
            
        </div>
        </main>
    </div>
    );
}