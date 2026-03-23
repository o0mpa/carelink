import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
<<<<<<< HEAD
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
=======
    index("routes/home.tsx"),
    route("info", "routes/info.tsx"),
    route("contact", "routes/contact.tsx"),
    route("login", "routes/login.tsx"),
    
>>>>>>> 2f2434ffc83abfb25a1bd2f35a60139146b90ced
] satisfies RouteConfig;