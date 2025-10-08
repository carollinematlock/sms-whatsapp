import clsx from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  tone?: "default" | "success" | "warning" | "neutral";
}

const toneClasses: Record<NonNullable<BadgeProps["tone"]>, string> = {
  default: "bg-indigo-100 text-indigo-800",
  success: "bg-emerald-100 text-emerald-900",
  warning: "bg-amber-100 text-amber-900",
  neutral: "bg-gray-100 text-gray-700"
};

export default function Badge({ children, tone = "default" }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide",
        toneClasses[tone]
      )}
    >
      {children}
    </span>
  );
}
