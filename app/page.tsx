import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";

export default function Home() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-16 pt-6">
        <AppShell />
      </main>
      <footer className="text-text-tert py-5 text-center text-[11px]">
        QNA Medical S.A.S. — Carrera 46 No 95-09, Barranquilla, Colombia — Tel. (605) 304 9756
      </footer>
    </>
  );
}
