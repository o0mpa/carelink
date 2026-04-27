import { useState } from "react";
import { Form, Link, redirect, useLoaderData } from "react-router";

export function meta() {
    return [{ title: "Edit Profile - CareLink" }];
}


export async function action() {
    return redirect("/profile/client");
}

export default function EditClientProfile() {
    const { user } = useLoaderData();

    const [selectedCity, setSelectedCity] = useState(user.city);

    const availableSkills = [
    "Mobility Assistance", 
    "Medication Management", 
    "Physical care", 
    "Meal preparation", 
    "Housekeeping", 
    "Emotional support"
    ];

    return (
    <div className="min-h-screen bg-linear-to-br from-blue-100 via-white to-emerald-100 py-12">
        <main className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="rounded-3xl bg-white/95 p-8 shadow-xl backdrop-blur-md ring-2 ring-blue-100 sm:p-10">
            
            <div className="mb-8 flex items-center justify-between border-b-2 border-gray-100 pb-4">
            <h1 className="text-3xl font-extrabold text-blue-900">Edit Profile</h1>
            <Link to="/profile/client" className="text-sm font-bold text-gray-500 hover:text-blue-600 hover:underline">Cancel</Link>
            </div>

            <Form method="post" className="flex flex-col gap-10">
            
            {/* 1. Personal Details */}
            <section>
                <h2 className="mb-4 text-2xl font-bold text-blue-900">Personal Details</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                
                <div className="rounded-xl border-2 border-gray-100 bg-gray-50 p-5">
                    <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-500">Contact Information</h3>
                    <div className="space-y-4">
                    <div>
                    <label className="mb-1 block text-sm font-bold text-gray-700">Email</label>
                        <input type="email" name="email" defaultValue={user.email} required className="w-full rounded-lg border-2 border-gray-300 p-2.5 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none bg-white" />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-bold text-gray-700">Phone</label>
                        <input type="tel" name="phone" defaultValue={user.phone} required className="w-full rounded-lg border-2 border-gray-300 p-2.5 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none bg-white" />
                    </div>
                    </div>
                </div>

                <div className="rounded-xl border-2 border-gray-100 bg-gray-50 p-5">
                    <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-500">Demographics</h3>
                    <div className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-bold text-gray-700">Age</label>
                        <input type="number" name="age" defaultValue={user.age} required className="w-full rounded-lg border-2 border-gray-300 p-2.5 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none bg-white" />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-bold text-gray-700">Gender</label>
                        <select name="gender" defaultValue={user.gender} required className="w-full rounded-lg border-2 border-gray-300 p-2.5 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none bg-white">
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        </select>
                    </div>
                    </div>
                </div>

                <div className="rounded-xl border-2 border-gray-100 bg-gray-50 p-5 md:col-span-2">
                    <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-500">Location</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-bold text-gray-700">City</label>
                        <select
                        name="city"
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        required
                        className="w-full rounded-lg border-2 border-gray-300 p-2.5 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none bg-white"
                        >
                        <option value="">Select City</option>
                        <option value="cairo">Cairo</option>
                        <option value="giza">Giza</option>
                        <option value="alexandria">Alexandria</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-bold text-gray-700">Area</label>
                        <select
                        name="area"
                        defaultValue={user.area}
                        required
                        disabled={!selectedCity}
                        className="w-full rounded-lg border-2 border-gray-300 p-2.5 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none bg-white disabled:bg-gray-100"
                        >
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
                        <label className="mb-1 block text-sm font-bold text-gray-700">Address</label>
                        <input type="text" name="address" defaultValue={user.address} required className="w-full rounded-lg border-2 border-gray-300 p-2.5 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none bg-white" />
                    </div>
                    </div>
                </div>
                </div>
            </section>

            {/* 2. Medical Profile */}
            <section>
                <h2 className="mb-4 text-2xl font-bold text-blue-900">Medical Profile</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                
                <div className="rounded-xl border-2 border-blue-100 bg-blue-50/50 p-5">
                    <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-blue-800">Vitals & Allergies</h3>
                    <div className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-bold text-gray-700">Blood Type</label>
                        <select name="bloodType" defaultValue={user.bloodType} className="w-full rounded-lg border-2 border-gray-300 p-2.5 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none bg-white">
                        <option value="">Select Blood Type</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="Unknown">Unknown</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-bold text-gray-700">Allergies</label>
                        <input type="text" name="allergies" defaultValue={user.allergies} placeholder="e.g., Penicillin (Leave blank if none)" className="w-full rounded-lg border-2 border-gray-300 p-2.5 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none bg-white" />
                    </div>
                    </div>
                </div>

                <div className="rounded-xl border-2 border-blue-100 bg-blue-50/50 p-5">
                    <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-blue-800">Supervising Physician</h3>
                    <div className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-bold text-gray-700">Doctor</label>
                        <input type="text" name="doctor" defaultValue={user.doctor} className="w-full rounded-lg border-2 border-gray-300 p-2.5 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none bg-white" />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-bold text-gray-700">Facility</label>
                        <input type="text" name="facility" defaultValue={user.facility} className="w-full rounded-lg border-2 border-gray-300 p-2.5 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none bg-white" />
                    </div>
                    </div>
                </div>

                </div>
            </section>

            {/* 3. Caregiving Needs */}
            <section>
                <h2 className="mb-4 text-2xl font-bold text-blue-900">Caregiving Needs</h2>
                <div className="grid grid-cols-1 gap-6">
                
                <div className="rounded-xl border-2 border-gray-100 bg-gray-50 p-5">
                    <h3 className="mb-4 text-sm font-bold text-gray-800">Required Skills & Assistance</h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {availableSkills.map((skill) => (
                        <label key={skill} className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-900">
                        <input type="checkbox" name="skills" value={skill} defaultChecked={user.skills.includes(skill)} className="h-4 w-4 rounded border-2 border-gray-400 accent-blue-600 focus:ring-blue-500" />
                        {skill}
                        </label>
                    ))}
                    </div>
                </div>

                <div className="rounded-xl border-2 border-gray-100 bg-gray-50 p-5">
                    <h3 className="mb-2 text-sm font-bold text-gray-800">Specific Medical Specialties Required</h3>
                    <input type="text" name="specialties" defaultValue={user.specialties} placeholder="e.g., Post-Surgery Care" className="w-full rounded-lg border-2 border-gray-300 p-2.5 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none bg-white" />
                </div>

                </div>
            </section>

            <div className="mt-4 flex justify-end gap-4 border-t-2 border-gray-100 pt-8 pb-4">
                <Link to="/profile/client" className="rounded-xl border-2 border-gray-200 px-6 py-3 font-bold text-gray-600 transition-colors hover:bg-gray-50">Discard</Link>
                <button type="submit" className="rounded-xl bg-blue-600 px-8 py-3 font-bold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95">Save Changes</button>
            </div>

            </Form>
        </div>
        </main>
    </div>
    );
}