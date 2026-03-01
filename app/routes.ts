import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("info", "routes/info.tsx"),
    route("contact", "routes/contact.tsx"),
    route("get-started", "routes/get-started.tsx"),
    route("register/client", "routes/register-client.tsx"),
    route("register/caregiver", "routes/register-caregiver.tsx"),
    route("login", "routes/login.tsx"),
] satisfies RouteConfig;