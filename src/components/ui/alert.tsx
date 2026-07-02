import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";
import { HTMLAttributes } from "react";

type Tipo = "info" | "sucesso" | "aviso" | "erro";

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  tipo?: Tipo;
  titulo?: string;
}

const config: Record<Tipo, { cor: string; Icone: typeof Info }> = {
  info: {
    cor: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200",
    Icone: Info,
  },
  sucesso: {
    cor: "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200",
    Icone: CheckCircle2,
  },
  aviso: {
    cor: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200",
    Icone: AlertCircle,
  },
  erro: {
    cor: "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200",
    Icone: XCircle,
  },
};

export function Alert({ tipo = "info", titulo, className, children, ...props }: AlertProps) {
  const { cor, Icone } = config[tipo];

  return (
    <div className={cn("flex gap-3 rounded-lg border p-4 text-sm", cor, className)} {...props}>
      <Icone className="h-5 w-5 shrink-0 mt-0.5" />
      <div>
        {titulo && <p className="font-semibold mb-1">{titulo}</p>}
        {children}
      </div>
    </div>
  );
}
