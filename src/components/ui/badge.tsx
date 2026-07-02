import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type Cor = "verde" | "amarelo" | "vermelho" | "azul" | "cinza" | "roxo";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  cor?: Cor;
}

const cores: Record<Cor, string> = {
  verde: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  amarelo: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  vermelho: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  azul: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  cinza: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
  roxo: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

export function Badge({ cor = "cinza", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        cores[cor],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
