import { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export default function PageShell({ children, className = "" }: PageShellProps) {
  return (
    <main
      className={`min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 px-4 py-8 md:px-8 md:py-12 ${className}`}
    >
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[32px] bg-white/90 p-6 shadow-xl ring-1 ring-slate-100 backdrop-blur md:p-8">
          {children}
        </div>
      </div>
    </main>
  );
}