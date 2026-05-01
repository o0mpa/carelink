import { Header } from "./Header";
import { Hero } from "./Hero";

export const LandingPage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-900">

      {/* Background photo — faded */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: `url('/carelink.jpg')` }}
        aria-hidden
      />

      {/* Blue/teal brand tint overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(135deg, rgb(14 116 144 / 0.55) 0%, rgb(15 118 110 / 0.45) 50%, rgb(30 64 175 / 0.4) 100%)",
        }}
        aria-hidden
      />

      {/* Soft radial vignette to deepen edges */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 30%, rgb(0 0 0 / 0.45) 100%)",
        }}
        aria-hidden
      />

      {/* Main Content */}
      <div className="relative flex min-h-screen flex-col">
        <Header />
        <Hero />
      </div>

    </div>
  );
};