import { useLoaderData, Form, Link } from "react-router";

export function meta() {
  return [
    { title: "Your Requests - CareLink" },
    {
      name: "description",
      content: "Track the status of your caregiver job offers.",
    },
  ];
}

export async function loader() {
  return {
    myRequests: [
      {
        id: 1,
        caregiverName: "Caregiver A",
        serviceType: "Elderly Care",
        date: "March 15, 2026",
        duration: "3 Hours",
        status: "Accepted",
        price: "E£ 450",
      },
      {
        id: 2,
        caregiverName: "Caregiver B",
        serviceType: "Post-surgery Recovery",
        date: "March 22, 2026",
        duration: "6 Hours",
        status: "Pending",
        price: "E£ 400",
      },
      {
        id: 3,
        caregiverName: "Caregiver C",
        serviceType: "Nursing Care",
        date: "March 25, 2026",
        duration: "12 Hours",
        status: "Declined",
        price: "E£ 600",
      },
    ],
  };
}

export default function ClientRequests() {
  // Grabs the data from the loader above
  const { myRequests } = useLoaderData();

  return (
    <div className="relative min-h-screen origin-top bg-white font-sans">
      {/* Background: Linear Gradient from the Caregiver Dashboard */}
      <div
        className="pointer-events-none fixed inset-0 opacity-20"
        style={{
          background:
            "linear-gradient(135deg, #0978ff 0%, #ffffff 50%, #008e5a 100%)",
        }}
      />

      <main className="relative z-10 mx-auto max-w-5xl px-6 py-12 md:px-10">
        <div className="mb-6">
          <Link
            to="/dashboard/client"
            className="text-med mt-2 font-semibold text-gray-500 transition-colors hover:text-gray-800 hover:underline"
          >
            <span className="text-med">←</span> Return to Dashboard
          </Link>
        </div>

        <div className="mb-10">
          <h2 className="bg-linear-to-r from-blue-700 to-emerald-500 bg-clip-text text-4xl font-extrabold text-transparent">
            Your Job Requests
          </h2>
          <p className="mt-3 text-lg text-gray-600">
            Track the status of the offers you have sent to caregivers.
          </p>
          <div className="mt-4 h-1.5 w-20 bg-blue-600" />
        </div>

        <div className="grid gap-6">
          {myRequests.map((req: any) => (
            <div
              key={req.id}
              className={`group flex flex-col items-start gap-6 rounded-4xl bg-white p-6 shadow-lg ring-1 transition-all hover:-translate-y-1 sm:flex-row sm:items-center sm:p-8 ${
                req.status === "Accepted"
                  ? "ring-emerald-200 hover:shadow-emerald-100"
                  : req.status === "Pending"
                    ? "ring-blue-200 hover:shadow-blue-100"
                    : "opacity-75 ring-red-100 hover:shadow-red-50"
              }`}
            >
              {/* Profile Icon */}
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl text-xl font-bold text-white shadow-md ${
                  req.status === "Accepted"
                    ? "bg-emerald-500"
                    : req.status === "Pending"
                      ? "bg-blue-500"
                      : "bg-gray-400"
                }`}
              >
                {req.caregiverName.charAt(0)}
              </div>

              {/* Request Details */}
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold text-slate-800">
                    {req.caregiverName}
                  </h3>

                  {/* Dynamic Status Badge */}
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                      req.status === "Accepted"
                        ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300"
                        : req.status === "Pending"
                          ? "bg-blue-100 text-blue-700 ring-1 ring-blue-300"
                          : "bg-red-50 text-red-600 ring-1 ring-red-200"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                <p className="mt-1 font-semibold text-gray-500">
                  {req.serviceType}
                </p>

                <div className="mt-4 flex flex-wrap gap-4 text-sm font-bold text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="text-blue-500">📅</span> {req.date}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-blue-500">⏱️</span> {req.duration}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-600">💰</span> {req.price}
                  </div>
                </div>
              </div>

              {/* Action Buttons based on status */}
              <div className="flex w-full shrink-0 flex-col sm:w-auto">
                {req.status === "Accepted" && (
                  <Form method="post" className="w-full">
                    <input type="hidden" name="requestId" value={req.id} />
                    <input type="hidden" name="intent" value="pay" />
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-700"
                    >
                      Pay & Confirm
                    </button>
                  </Form>
                )}
                
                {req.status === "Pending" && (
                  <Form method="post" className="w-full">
                    <input type="hidden" name="requestId" value={req.id} />
                    <input type="hidden" name="intent" value="cancel" />
                    <button
                      type="submit"
                      className="w-full rounded-xl border-2 border-slate-200 px-6 py-3 text-sm font-bold text-slate-500 transition-all hover:bg-slate-50"
                    >
                      Cancel Offer
                    </button>
                  </Form>
                )}

                {req.status === "Declined" && (
                  <Link
                    to="/match-results"
                    className="w-full rounded-xl bg-blue-50 px-6 py-3 text-center text-sm font-bold text-blue-600 transition-all hover:bg-blue-100"
                  >
                    Find Another
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}