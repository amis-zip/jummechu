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
    "rounded-2xl px-5 py-3 text-sm font-semibold transition duration-200 active:scale-[0.98]";

  const variantClass = {
    primary:
      "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700",
    secondary:
      "bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700",
    outline:
      "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
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