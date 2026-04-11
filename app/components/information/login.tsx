import { Link, Form, redirect, useActionData } from "react-router"; 

export function meta() {
  return [
    { title: "Sign In - CareLink" },
    { name: "description", content: "Sign in to your CareLink account." },
  ];
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");

  // Simulate a fetch to Node.js/MySQL to verify credentials
  if (!username || !password) {
    return { error: "Please fill in all fields." };
  }

  // replace this with a fetch to their API
  // const response = await fetch("your-node-api/login", { method: "POST", body: formData });
  
  // Logic to redirect based on user role from database
  return redirect("/dashboard/client"); 
}

export default function Login() {
  // Catch error messages from the backend action
  const actionData = useActionData() as { error?: string };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-linear-to-br from-blue-200 via-white to-emerald-200">
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h2 className="text-center text-4xl font-extrabold tracking-tight">
            <span className="bg-linear-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
              Sign In
            </span>
          </h2>
          
          <div className="mt-8">
            <div className="rounded-3xl bg-white/90 p-8 shadow-xl backdrop-blur-md ring-2 ring-gray-300 sm:p-10">
              
              {/* Error Message Display  */}
              {actionData?.error && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-center text-sm font-semibold text-red-600 border border-red-100">
                  {actionData.error}
                </div>
              )}

              <Form method="post" className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-blue-800">Username</label>
                  <input
                    name="username" 
                    type="text"
                    required
                    placeholder="Enter your username"
                    className="mt-2 block w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-blue-800">Password</label>
                  <input
                    name="password" 
                    type="password"
                    required
                    minLength={8}
                    placeholder="********"
                    className="mt-2 block w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <Link to="/forgot-password" data-testid="forgot-password-link" className="text-xs font-bold text-blue-500 transition-colors hover:text-emerald-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                
                <button
                  type="submit"
                  className="w-full cursor-pointer rounded-xl bg-linear-to-r from-blue-600 to-teal-500 py-4 text-base font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Sign In
                </button>
              </Form>

              <div className="mt-8 flex flex-col items-center gap-2 border-t border-gray-200 pt-6 text-sm text-gray-600">
                <div>
                  New to CareLink?{" "}
                  <Link to="/get-started" className="font-bold text-blue-600 transition-colors hover:text-teal-600 hover:underline">
                    Create account
                  </Link>
                </div>
                <Link to="/" className="mt-2 font-semibold text-gray-500 transition-colors hover:text-gray-800 hover:underline">
                  ← Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}