import { RegistrationForm } from "@/components/RegistrationForm";
import { DesktopArtPanel, SceneBackground } from "@/components/SceneBackground";

export default function HomePage() {
  return (
    <main className="relative min-h-screen md:grid md:h-screen md:grid-cols-2 md:overflow-hidden">
      <SceneBackground />
      <DesktopArtPanel />
      <section className="relative flex min-h-screen items-start justify-center overflow-y-auto px-5 py-8 md:min-h-0 md:bg-[#0a0a0a] md:px-5 md:py-8">
        <RegistrationForm />
      </section>
    </main>
  );
}
