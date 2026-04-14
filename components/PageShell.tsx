import { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
};

export default function PageShell({ children }: PageShellProps) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-pink-50 px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[32px] bg-white/90 p-6 shadow-xl ring-1 ring-rose-100 backdrop-blur md:p-8">
          {children}
        </div>
      </div>
    </main>
  );
}