import { useState, forwardRef } from "react";
import { Link, Form, redirect, useActionData, useNavigation } from "react-router";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarDays } from "lucide-react";

export function meta() {
  return [
    { title: "Family Sign Up - CareLink" },
    { name: "description", content: "Create an account to find trusted caregivers." },
  ];
}

const calculateAgeFromDate = (date: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const m = today.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age--;
  return age < 0 ? 0 : age;
};

const formatDateDDMMYYYY = (date: Date): string => {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const parseDDMMYYYY = (value: string): Date | null => {
  const parts = value.split("/");
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts.map(Number);
  if (!dd || !mm || !yyyy || yyyy < 1900) return null;
  const date = new Date(yyyy, mm - 1, dd);
  if (isNaN(date.getTime())) return null;
  return date;
};

const DateInput = forwardRef<
  HTMLInputElement,
  {
    value?: string;
    onClick?: () => void;
    onChange?: (val: string) => void;
    placeholder?: string;
  }
>(({ value, onClick, onChange, placeholder }, ref) => {
  const [rawInput, setRawInput] = useState(value ?? "");
  const displayValue = value !== undefined && value !== rawInput ? value : rawInput;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRawInput(val);
    if (onChange) onChange(val);
  };

  return (
    <div className="flex w-full items-center rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 hover:border-blue-400">
      <input
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder || "DD/MM/YYYY"}
        className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400"
      />
      <CalendarDays
        onClick={onClick}
        className="h-4 w-4 text-blue-500 cursor-pointer shrink-0"
      />
    </div>
  );
});

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();

  const password        = String(formData.get("password")        ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password !== confirmPassword) {
    return { error: "Passwords do not match. Please try again." };
  }

  if (
    password.length < 8 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[!@#$%^&*(),.?":{}|<>]/.test(password)
  ) {
    return {
      error:
        "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character (!@#$%^&*…).",
    };
  }

  formData.delete("confirmPassword");

  const skills = formData.getAll("skills") as string[];
  if (skills.length === 0) {
    return { error: "Please select at least one skill needed." };
  }

  const allergies    = formData.getAll("allergies").map(String).filter(Boolean);
  const otherAllergy = String(formData.get("otherAllergiesSpecify") ?? "").trim();
  if (otherAllergy) allergies.push(otherAllergy);
  const finalAllergies = allergies.filter((a) => a !== "none");

  formData.delete("allergies");
  finalAllergies.forEach((a) => formData.append("allergies", a));
  formData.delete("otherAllergiesSpecify");

  try {
    const response = await fetch("http://localhost:5000/api/auth/signup-client", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      return redirect("/login?registered=true");
    }

    const errorText = await response.text().catch(() => "");
    let errorData: Record<string, unknown> = {};
    try { errorData = errorText ? JSON.parse(errorText) : {}; } catch { /* */ }

    const msg =
      (typeof errorData.message === "string" && errorData.message) ||
      (typeof errorData.error   === "string" && errorData.error)   ||
      errorText.trim() ||
      "Registration failed. Please try again.";

    return { error: msg };

  } catch {
    return { error: "Cannot connect to the server. Is your backend running?" };
  }
}

export default function RegisterClient() {
  const actionData   = useActionData<{ error?: string }>();
  const navigation   = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [selectedCity,      setSelectedCity]      = useState("");
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedDate,      setSelectedDate]      = useState<Date | null>(null);
  const [calculatedAge,     setCalculatedAge]      = useState<number | string>("");
  const [password,          setPassword]           = useState("");

  const handleAllergyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setSelectedAllergies((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };

  const handleDateSelect = (date: Date | null) => {
    setSelectedDate(date);
    if (date) setCalculatedAge(calculateAgeFromDate(date));
    else setCalculatedAge("");
  };

  const handleDateRawChange = (val: string) => {
    const parsed = parseDDMMYYYY(val);
    if (parsed) {
      setSelectedDate(parsed);
      setCalculatedAge(calculateAgeFromDate(parsed));
    }
  };

  const isNoneSelected    = selectedAllergies.includes("none");
  const hasOtherAllergies = selectedAllergies.some((a) => a !== "none");

  const foodAllergies      = ["Peanuts","Tree Nuts","Milk / Dairy","Eggs","Fish","Shellfish","Soy","Wheat / Gluten","Sesame","Strawberries"];
  const medAllergies       = ["Penicillin","Antibiotics (General)","Aspirin","Ibuprofen / NSAIDS","Sulfa Drugs","Codeine"];
  const envAllergies       = ["Dust","Pollen","Mold","Pet Dander","Insect Stings"];
  const otherAllergiesList = ["Latex","Certain Fabrics","Cleaning Chemicals","Perfumes / Fragrances"];

  const strengthChecks = [
    { label: "Minimum 8 characters",                       ok: password.length >= 8 },
    { label: "At least 1 uppercase letter",                ok: /[A-Z]/.test(password) },
    { label: "At least 1 lowercase letter",                ok: /[a-z]/.test(password) },
    { label: "At least 1 number",                          ok: /[0-9]/.test(password) },
    { label: "At least 1 special character (!@#$%^&*...)", ok: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

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

          {actionData?.error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-800 ring-1 ring-red-200">
              {actionData.error}
            </div>
          )}

          <Form method="post" encType="multipart/form-data" className="flex flex-col gap-8">

            {/* ── Account Security ── */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-blue-800">Account Security</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Username</label>
                  <input type="text" name="username" required
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Email Address</label>
                  <input type="email" name="email" required
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Password</label>
                  <input
                    type="password" name="password" required minLength={8}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 chars, 1 Capital, 1 Number, 1 Special"
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="mt-2 space-y-1">
                    {strengthChecks.map(({ label, ok }) => (
                      <p key={label} className={`text-xs ${ok ? "text-blue-600" : "text-gray-400"}`}>
                        {ok ? "✓" : "○"} {label}
                      </p>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Confirm Password</label>
                  <input type="password" name="confirmPassword" required minLength={8}
                    placeholder="Repeat your password"
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div className="mt-4 rounded-xl border-2 border-gray-200 bg-gray-50 p-4 md:col-span-2">
                  <h3 className="mb-4 font-semibold text-gray-800">Password Recovery Questions</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">Security Question 1</label>
                      <input type="text" name="securityQuestion1" required
                        placeholder="e.g. What is the name of your first pet?"
                        className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">Answer 1</label>
                      <input type="text" name="securityAnswer1" required placeholder="Your answer"
                        className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">Security Question 2</label>
                      <input type="text" name="securityQuestion2" required
                        placeholder="e.g. In what city were you born?"
                        className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">Answer 2</label>
                      <input type="text" name="securityAnswer2" required placeholder="Your answer"
                        className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Personal Information ── */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-blue-800">Personal Information</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Full Name</label>
                  <input type="text" name="full_name" required
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Gender</label>
                  <select name="gender" required
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                {/* ── Date of Birth ── */}
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Date of Birth</label>
                  <input
                    type="hidden"
                    name="date_of_birth"
                    value={selectedDate ? formatDateDDMMYYYY(selectedDate) : ""}
                  />
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date: Date | null) => handleDateSelect(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="DD/MM/YYYY"
                    maxDate={new Date()}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    customInput={
                      <DateInput
                        placeholder="DD/MM/YYYY"
                        onChange={handleDateRawChange}
                      />
                    }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Age (auto-calculated)</label>
                  <input type="number" name="age" value={calculatedAge} readOnly required
                    className="w-full cursor-not-allowed rounded-xl border-2 border-gray-300 bg-gray-100 px-4 py-2.5 text-sm text-gray-900 focus:outline-none" />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Phone Number</label>
                  <input type="tel" name="phone_number" required maxLength={11}
                    onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "").slice(0, 11); }}
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </section>

            {/* ── Location ── */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-blue-800">Location</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">City</label>
                  <select name="city" required value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select City</option>
                    <option value="Cairo">Cairo</option>
                    <option value="Giza">Giza</option>
                    <option value="Alexandria">Alexandria</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Area</label>
                  <select name="area" required disabled={!selectedCity}
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                    <option value="">Select Area</option>
                    {selectedCity === "Cairo" && (<>
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
                    </>)}
                    {selectedCity === "Giza" && (<>
                      <option value="Dokki">Dokki</option>
                      <option value="Mohandessin">Mohandessin</option>
                      <option value="Haram">Haram</option>
                      <option value="Faisal">Faisal</option>
                      <option value="Sheikh Zayed">Sheikh Zayed</option>
                      <option value="6th of October">6th of October</option>
                      <option value="Agouza">Agouza</option>
                      <option value="Imbaba">Imbaba</option>
                    </>)}
                    {selectedCity === "Alexandria" && (<>
                      <option value="Smouha">Smouha</option>
                      <option value="Sidi Gaber">Sidi Gaber</option>
                      <option value="Stanley">Stanley</option>
                      <option value="Miami">Miami</option>
                      <option value="Montaza">Montaza</option>
                      <option value="Raml Station">Raml Station</option>
                      <option value="Borg El Arab">Borg El Arab</option>
                    </>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Full Address</label>
                  <input type="text" name="full_address" required
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </section>

            {/* ── Medical Details & Documents ── */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-blue-800">Medical Details & Documents</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Blood Type</label>
                  <select name="blood_type" required
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Blood Type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                {/* Allergies */}
                <div className="md:col-span-2">
                  <label className="mb-2 block border-b pb-1 text-sm font-bold text-gray-800">Allergies</label>
                  <div className="w-full rounded-xl border-2 border-gray-300 bg-white p-4">
                    <label className={`mb-4 flex cursor-pointer items-center gap-2 text-sm font-bold ${hasOtherAllergies ? "text-gray-400 opacity-60" : "text-blue-700"}`}>
                      <input type="checkbox" name="allergies" value="none"
                        checked={isNoneSelected} onChange={handleAllergyChange} disabled={hasOtherAllergies}
                        className="h-5 w-5 rounded border-2 border-gray-400 accent-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed" />
                      No Known Allergies
                    </label>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        { title: "Food",          list: foodAllergies },
                        { title: "Medication",    list: medAllergies },
                        { title: "Environmental", list: envAllergies },
                        { title: "Other",         list: otherAllergiesList },
                      ].map(({ title, list }) => (
                        <div key={title}>
                          <h4 className="mb-2 text-xs font-bold uppercase text-gray-500">{title}</h4>
                          <div className="flex flex-col gap-2">
                            {list.map((allergy) => (
                              <label key={allergy}
                                className={`flex cursor-pointer items-start gap-2 text-sm transition-opacity ${isNoneSelected ? "text-gray-400 opacity-60" : "text-gray-900"}`}>
                                <input type="checkbox" name="allergies" value={allergy}
                                  checked={selectedAllergies.includes(allergy)}
                                  onChange={handleAllergyChange} disabled={isNoneSelected}
                                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-2 border-gray-400 accent-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed" />
                                <span className="leading-tight">{allergy}</span>
                              </label>
                            ))}
                            {title === "Other" && (
                              <div className={`mt-2 transition-opacity ${isNoneSelected ? "opacity-60" : "opacity-100"}`}>
                                <label className="mb-1 block text-xs font-semibold text-gray-700">Other (Specify):</label>
                                <input type="text" name="otherAllergiesSpecify" disabled={isNoneSelected}
                                  className="w-full rounded-md border-2 border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-2 md:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Doctor / Medical Facility Supervising (Optional)
                  </label>
                  <input type="text" name="doctor_facility"
                    className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div className="mt-2 rounded-xl border-2 border-blue-200 bg-blue-50/30 p-4 md:col-span-2">
                  <h3 className="mb-3 font-semibold text-blue-900">Document Uploads</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {[
                      { label: "Upload National ID", name: "national_id" },
                      { label: "Upload Diagnoses",   name: "diagnoses"   },
                      { label: "Upload Conditions",  name: "conditions"  },
                    ].map(({ label, name }) => (
                      <div key={name}>
                        <label className="mb-1 block text-xs font-semibold text-gray-700">{label}</label>
                        <input type="file" name={name} accept=".jpg,.jpeg,.png,.pdf,.txt" required
                          className="max-w-full text-xs font-semibold text-gray-900 file:mr-2 file:cursor-pointer file:rounded-lg file:border-0 file:bg-blue-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700 file:transition-colors file:hover:bg-blue-200" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ── Skills Needed ── */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-blue-800">Skills Needed</h2>
              <div className="rounded-xl border-2 border-gray-300 bg-white p-4">
                <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    { value: "physical_care",         label: "Physical care"            },
                    { value: "medication_management", label: "Medication management"    },
                    { value: "meal_preparation",      label: "Meal preparation"         },
                    { value: "housekeeping",          label: "Housekeeping and cleaning" },
                    { value: "emotional_support",     label: "Emotional support"        },
                    { value: "transportation",        label: "Transportation"           },
                    { value: "health_monitoring",     label: "Health monitoring"        },
                  ].map(({ value, label }) => (
                    <label key={value} className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" name="skills" value={value}
                        className="h-4 w-4 rounded border-2 border-gray-400 accent-blue-600 focus:ring-blue-500" />
                      {label}
                    </label>
                  ))}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Medical Specialties Required:</label>
                  <input type="text" name="medical_specialties_required"
                    placeholder="e.g., Alzheimer's, Diabetes"
                    className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </section>

            {/* ── Emergency Contacts ── */}
            <section>
              <h2 className="mb-4 border-b pb-2 text-lg font-bold text-blue-800">Emergency Contacts</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  { n: 1, nameField: "emergency_contact1_name", phoneField: "emergency_contact1_phone" },
                  { n: 2, nameField: "emergency_contact2_name", phoneField: "emergency_contact2_phone" },
                ].map(({ n, nameField, phoneField }) => (
                  <div key={n} className="rounded-xl border-2 border-blue-200 bg-blue-50/30 p-4">
                    <h3 className="mb-2 font-semibold text-blue-900">Contact {n}</h3>
                    <div className="mb-2">
                      <label className="mb-1 block text-xs font-semibold text-gray-700">Full Name</label>
                      <input type="text" name={nameField} required
                        className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">Phone Number</label>
                      <input type="tel" name={phoneField} required maxLength={11}
                        onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "").slice(0, 11); }}
                        className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-4 text-lg font-bold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md active:scale-[0.98] disabled:opacity-70"
            >
              {isSubmitting ? "Creating Account..." : "Complete Registration"}
            </button>
          </Form>

          <div className="mt-8 flex flex-col items-center gap-2 text-sm text-gray-600">
            <div>
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-blue-600 transition-colors hover:text-blue-800 hover:underline">
                Sign In
              </Link>
            </div>
            <Link to="/" className="mt-2 font-semibold text-gray-500 transition-colors hover:text-gray-800 hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}