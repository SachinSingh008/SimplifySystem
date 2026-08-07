import { ReactNode } from "react";

type BadgeVariant = "green" | "yellow" | "red" | "slate" | "blue";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
}

const variantMap: Record<BadgeVariant, string> = {
  green: "badge-green",
  yellow: "badge-yellow",
  red: "badge-red",
  slate: "badge-slate",
  blue: "bg-blue-100 text-blue-700 badge",
};

export default function Badge({ variant = "slate", children }: BadgeProps) {
  return <span className={variantMap[variant]}>{children}</span>;
}
