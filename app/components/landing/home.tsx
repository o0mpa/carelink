import { LandingPage } from "./LandingPage";

export const meta = () => {
  return [
    { title: "CareLink – Trusted care for your family" },
    {
      name: "description",
      content:
        "Connect with verified caregivers for elderly, disabled, and chronically ill loved ones. Match by skills, experience, and location.",
    },
  ];
};

export default function Home() {
  return <LandingPage />;
}