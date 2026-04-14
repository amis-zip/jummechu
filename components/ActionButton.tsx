import { ReactNode } from "react";
import Link from "next/link";

type ActionButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline";
};

export default function ActionButton({
  children,
  href,
  onClick,
  variant = "primary",
}: ActionButtonProps) {
  const baseClass =
    "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98]";

  const variantClass = {
    primary:
      "bg-rose-500 text-white shadow-lg shadow-rose-200 hover:-translate-y-0.5 hover:bg-rose-600 hover:shadow-rose-300",
    secondary:
      "bg-pink-500 text-white shadow-lg shadow-pink-200 hover:-translate-y-0.5 hover:bg-pink-600 hover:shadow-pink-300",
    outline:
      "border border-slate-200 bg-white text-slate-700 shadow-sm hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md",
  };

  const className = `${baseClass} ${variantClass[variant]}`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}