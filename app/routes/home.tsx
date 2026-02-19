import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "CareLink app" },
    { name: "description", content: "Welcome to CareLink!" },
  ];
}

export default function Home() {
  return <Welcome />;
}
