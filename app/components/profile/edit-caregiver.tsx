import {Form, Link, redirect, useLoaderData} from "react-router";

export function meta() {
    return [{title: "Edit Professional Profile - CareLink"}];
}


export async function action() {
    return redirect("/profile/caregiver");
}

export default function EditCaregiverProfile() {
    const {user} = useLoaderData();

    const availableSkills = [
    "Physical care", 
    "Medication management", 
    "Meal preparation", 
    "Housekeeping", 
    "Emotional support", 
    "Health monitoring",
    "Transportation"
    ];

    return (
    <div className="min-h-screen bg-linear-to-br from-emerald-100 via-white to-teal-100 py-12">
        <main className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="rounded-3xl bg-white/95 p-8 shadow-xl backdrop-blur-md ring-2 ring-emerald-100 sm:p-10">
            
            <div className="mb-8 flex items-center justify-between border-b-2 border-gray-100 pb-4">
            <h1 className="text-3xl font-extrabold text-emerald-900">Edit Professional Profile</h1>
            <Link to="/profile/caregiver" className="text-sm font-bold text-gray-500 hover:text-emerald-600 hover:underline">Cancel</Link>
            </div>

            <Form method="post" className="flex flex-col gap-10">
            
            {/* 1. Basic Information */}
            <section>
                <h2 className="mb-4 text-2xl font-bold text-emerald-900">Basic Information</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                
                <div className="rounded-xl border-2 border-gray-100 bg-gray-50 p-5">
                    <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-500">Contact Details</h3>
                    <div className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-bold text-gray-700">Email</label>
                        <input type="email" name="email" defaultValue={user.email} required className="w-full rounded-lg border-2 border-gray-300 p-2.5 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:outline-none bg-white" />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-bold text-gray-700">Phone</label>
                        <input type="tel" name="phone" defaultValue={user.phone} required className="w-full rounded-lg border-2 border-gray-300 p-2.5 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:outline-none bg-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="mb-1 block text-sm font-bold text-gray-700">Age</label>
                        <input type="number" name="age" defaultValue={user.age} required className="w-full rounded-lg border-2 border-gray-300 p-2.5 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:outline-none bg-white" />
                        </div>
                        <div>
                        <label className="mb-1 block text-sm font-bold text-gray-700">Gender</label>
                        <select name="gender" defaultValue={user.gender} required className="w-full rounded-lg border-2 border-gray-300 p-2.5 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:outline-none bg-white">
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                        </div>
                    </div>
                    </div>
                </div>

                <div className="rounded-xl border-2 border-gray-100 bg-gray-50 p-5">
                    <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-500">Service Area</h3>
                    <div className="h-full pb-8">
                    <label className="mb-1 block text-sm font-bold text-gray-700">Willing to travel within:</label>
                    <textarea 
                        name="serviceArea" 
                        defaultValue={user.serviceArea} 
                        placeholder="e.g., Dokki, Mohandseen, and Agouza" 
                        className="w-full h-32 resize-none rounded-lg border-2 border-gray-300 p-3 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:outline-none bg-white" 
                    />
                    </div>
                </div>

                </div>
            </section>

            {/* 2. Accepted Salaries Per Day */}
            <section>
                <h2 className="mb-4 text-2xl font-bold text-emerald-900">Accepted Salaries Per Day</h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                
                <div className="rounded-xl border-2 border-emerald-100 bg-emerald-50/30 p-4 text-center">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-600">Category A (3h)</label>
                    <div className="relative mx-auto max-w-30">
                    <span className="absolute left-3 top-2.5 font-bold text-emerald-700">E£</span>
                    <input type="number" name="salary_cat_a" defaultValue={user.salaries.catA} required className="w-full rounded-lg border-2 border-gray-300 bg-white py-2.5 pl-10 pr-2 text-center font-bold text-slate-900 focus:border-emerald-500 focus:outline-none" />
                    </div>
                </div>

                <div className="rounded-xl border-2 border-emerald-100 bg-emerald-50/30 p-4 text-center">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-600">Category B (6h)</label>
                    <div className="relative mx-auto max-w-30">
                    <span className="absolute left-3 top-2.5 font-bold text-emerald-700">E£</span>
                    <input type="number" name="salary_cat_b" defaultValue={user.salaries.catB} required className="w-full rounded-lg border-2 border-gray-300 bg-white py-2.5 pl-10 pr-2 text-center font-bold text-slate-900 focus:border-emerald-500 focus:outline-none" />
                    </div>
                </div>

                <div className="rounded-xl border-2 border-emerald-100 bg-emerald-50/30 p-4 text-center">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-600">Category C (9h)</label>
                    <div className="relative mx-auto max-w-30">
                    <span className="absolute left-3 top-2.5 font-bold text-emerald-700">E£</span>
                    <input type="number" name="salary_cat_c" defaultValue={user.salaries.catC} required className="w-full rounded-lg border-2 border-gray-300 bg-white py-2.5 pl-10 pr-2 text-center font-bold text-slate-900 focus:border-emerald-500 focus:outline-none" />
                    </div>
                </div>

                <div className="rounded-xl border-2 border-emerald-100 bg-emerald-50/30 p-4 text-center">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-600">Category D (12h)</label>
                    <div className="relative mx-auto max-w-30">
                    <span className="absolute left-3 top-2.5 font-bold text-emerald-700">E£</span>
                    <input type="number" name="salary_cat_d" defaultValue={user.salaries.catD} required className="w-full rounded-lg border-2 border-gray-300 bg-white py-2.5 pl-10 pr-2 text-center font-bold text-slate-900 focus:border-emerald-500 focus:outline-none" />
                    </div>
                </div>

                </div>
            </section>

            {/* 3. Skills & Experience */}
            <section>
                <h2 className="mb-4 text-2xl font-bold text-emerald-900">Skills & Experience</h2>
                <div className="rounded-xl border-2 border-gray-100 bg-gray-50 p-6">
                
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {availableSkills.map((skill) => (
                    <label key={skill} className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-900">
                        <input type="checkbox" name="skills" value={skill} defaultChecked={user.skills.includes(skill)} className="h-5 w-5 rounded border-2 border-gray-400 accent-emerald-600 focus:ring-emerald-500" />
                        {skill}
                    </label>
                    ))}
                </div>

                <div className="border-t-2 border-gray-200 pt-6">
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Medical Specialties</h3>
                    <input type="text" name="specialties" defaultValue={user.specialties} placeholder="e.g., Diabetic patient monitoring" className="w-full rounded-lg border-2 border-gray-300 p-3 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:outline-none bg-white" />
                </div>

                </div>
            </section>

            <div className="mt-4 flex justify-end gap-4 border-t-2 border-gray-100 pt-8 pb-4">
                <Link to="/profile/caregiver" className="rounded-xl border-2 border-gray-200 px-6 py-3 font-bold text-gray-600 transition-colors hover:bg-gray-50">Discard</Link>
                <button type="submit" className="rounded-xl bg-emerald-600 px-8 py-3 font-bold text-white shadow-md transition-all hover:bg-emerald-700 active:scale-95">Save Changes</button>
            </div>

            </Form>
        </div>
        </main>
    </div>
    );
}