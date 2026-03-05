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

  // Profile 
  route("profile/client", "components/profile/client-profile.tsx"),
] satisfies RouteConfig;