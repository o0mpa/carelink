import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("info", "routes/info.tsx"),
    route("contact", "routes/contact.tsx"),

  // Information 
    route("get-started", "components/information/get-started.tsx"),
    route("register/client", "components/information/register-client.tsx"),
    route("register/caregiver", "components/information/register-caregiver.tsx"),
    route("login", "components/information/login.tsx"),

  // Profile 
    route("profile/client", "components/profile/client-profile.tsx"),
] satisfies RouteConfig;