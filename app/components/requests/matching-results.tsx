import { useLoaderData, Link, Form } from "react-router";

export function meta() {
  return [
    { title: "Matching Caregivers - CareLink" },
    {
      name: "description",
      content: "View caregivers that match your specific care requirements.",
    },
  ];
}

export async function loader() {
  return {
    matchedCaregivers: [
      {
        id: 1,
        name: "Caregiver A",
        title: "Certified Registered Nurse (RN)",
        rating: 4.9,
        reviews: 34,
        experience: "8 Years",
        specialties: ["Alzheimer's", "Diabetic Patient Monitoring"],
        price: "E£ 450 / 6h Shift",
        matchPercentage: 98,
      },
      {
        id: 2,
        name: "Caregiver B",
        title: "Licensed Practical Nurse (LPN)",
        rating: 4.7,
        reviews: 19,
        experience: "5 Years",
        specialties: ["Post-surgery Recovery", "Physical Care"],
        price: "E£ 400 / 6h Shift",
        matchPercentage: 85,
      },
      {
        id: 3,
        name: "Caregiver C",
        title: "Certified Caregiver & First Aid",
        rating: 4.8,
        reviews: 42,
        experience: "10 Years",
        specialties: ["Mobility Assistance", "Medication Management"],
        price: "E£ 450 / 6h Shift",
        matchPercentage: 82,
      },
    ],
  };
}

export default function MatchingResults() {
  // Grabs the array from the loader above
  const { matchedCaregivers } = useLoaderData();

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-100 via-white to-emerald-100 py-12">
      <main className="container mx-auto px-4 sm:px-6 md:px-10">
        <div className="mx-auto max-w-5xl">
          {/* Header Section */}
          <div className="mb-8 flex flex-col items-center justify-between gap-4 rounded-3xl bg-white/90 p-6 shadow-md ring-2 ring-blue-100 backdrop-blur-md sm:flex-row sm:p-8">
            <div>
              <h1 className="text-2xl font-extrabold text-blue-900 sm:text-3xl">
                Your Top Matches
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                We found <span className="font-bold text-blue-600">{matchedCaregivers.length}</span> caregivers available in your area who match your medical requirements.
              </p>
            </div>
            <Link
              to="/request-care"
              className="rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-100"
            >
              Modify Search
            </Link>
          </div>

          {/* Caregiver Cards List */}
          <div className="flex flex-col gap-6">
            {matchedCaregivers.map((caregiver: any) => (
              <div
                key={caregiver.id}
                className="flex flex-col gap-6 rounded-3xl border-2 border-gray-100 bg-white p-6 shadow-lg transition-all hover:border-emerald-200 hover:shadow-xl sm:flex-row sm:items-center sm:p-8"
              >
                {/* Profile Pic Placeholder */}
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-2xl font-bold text-white shadow-md">
                  {caregiver.name.charAt(0)}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900">
                      {caregiver.name}
                    </h2>
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700 ring-1 ring-green-300">
                      {caregiver.matchPercentage}% Match
                    </span>
                  </div>
                  <p className="font-semibold text-emerald-700">
                    {caregiver.title}
                  </p>
                  
                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1 font-medium">
                      <span className="text-yellow-500">★</span> {caregiver.rating} ({caregiver.reviews} reviews)
                    </div>
                    <div className="flex items-center gap-1 font-medium">
                      <span className="text-gray-400">💼</span> {caregiver.experience} Exp.
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="mb-1 text-xs font-bold uppercase text-gray-500">
                      Top Specialties
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {caregiver.specialties.map((specialty: string, index: number) => (
                        <span
                          key={index}
                          className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Column */}
                <div className="flex shrink-0 flex-col items-start justify-center border-t-2 border-gray-100 pt-4 sm:items-end sm:border-l-2 sm:border-t-0 sm:pl-6 sm:pt-0">
                  <p className="mb-4 text-lg font-black text-emerald-700">
                    {caregiver.price}
                  </p>
                  
                  <Form method="post" action="/requests/client" className="w-full sm:w-auto">
                    <input type="hidden" name="caregiverId" value={caregiver.id} />
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-md transition-all hover:scale-[1.02] hover:bg-emerald-700 active:scale-[0.98]"
                    >
                      Send Job Offer
                    </button>
                  </Form>
                  
                  <button className="mt-3 w-full text-center text-sm font-semibold text-gray-500 hover:text-blue-600 hover:underline">
                    View Full Profile
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}