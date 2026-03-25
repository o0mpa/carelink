import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Landing Pages
  index("components/landing/home.tsx"),
  route("info", "components/landing/info.tsx"),
  route("contact", "components/landing/contact.tsx"),

  // Information & Authentication
  route("get-started", "components/information/get-started.tsx"),
  route("register/client", "components/information/register-client.tsx"),
  route("register/caregiver", "components/information/register-caregiver.tsx"),
  route("login", "components/information/login.tsx"),
  route("forgot-password", "components/information/forgot-password.tsx"),

  // Profile
  route("profile/client", "components/profile/client-profile.tsx"),
  route("profile/caregiver", "components/profile/caregiver-profile.tsx"),

  // Dashboards 
  route("dashboard/client", "components/requests/client-dashboard.tsx"),
  route("dashboard/caregiver", "components/requests/caregiver-dashboard.tsx"),
  
  // Request Flow
  route("request-care", "components/requests/request-form.tsx"),
  route("match-results", "components/requests/matching-results.tsx"),
  
  // Status Tracking Pages
  route("requests/client", "components/requests/client-requests.tsx"),
  route("requests/caregiver", "components/requests/requests-incoming.tsx"),
] satisfies RouteConfig;