import { RegistrationForm } from "@/components/RegistrationForm";
import { DesktopArtPanel, SceneBackground } from "@/components/SceneBackground";

export default function HomePage() {
  return (
    <main className="relative min-h-screen md:grid md:h-screen md:grid-cols-2 md:overflow-hidden">
      <SceneBackground />
      <DesktopArtPanel />
      <section className="relative flex min-h-screen items-center justify-center md:min-h-0 md:overflow-y-auto md:bg-[#0a0a0a]">
        <RegistrationForm />
      </section>
    </main>
  );
}
