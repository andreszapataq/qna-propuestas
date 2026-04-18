import Image from "next/image";

export function Header() {
  return (
    <header className="bg-header-gradient relative overflow-hidden px-8 py-5 shadow-[0_4px_20px_rgba(0,113,169,0.25)]">
      <div className="pointer-events-none absolute -right-10 -top-10 h-[200px] w-[200px] rounded-full bg-white/[0.06]" />
      <div className="relative flex items-center gap-4">
        <Image
          src="/qna_logo.svg"
          alt="QNA Medical"
          width={236}
          height={77}
          priority
          className="logo-white h-11 w-auto"
        />
        <div>
          <h1 className="text-[20px] font-medium text-white">Generador de propuestas</h1>
          <p className="mt-0.5 text-[13px] text-white/70">
            Propuestas económicas — Aloinjertos Gold Standard
          </p>
        </div>
      </div>
    </header>
  );
}
