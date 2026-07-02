"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

export function NotificationBell() {
  const [naoLidas, setNaoLidas] = useState(0);

  useEffect(() => {
    async function buscar() {
      try {
        const res = await fetch("/api/notifications?naoLidas=true");
        if (res.ok) {
          const data = await res.json();
          setNaoLidas(data.totalNaoLidas ?? 0);
        }
      } catch {}
    }
    buscar();
    const id = setInterval(buscar, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <Link
      href="/notificacoes"
      className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      aria-label="Notificações"
    >
      <Bell className="h-5 w-5" />
      {naoLidas > 0 && (
        <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
          {naoLidas > 9 ? "9+" : naoLidas}
        </span>
      )}
    </Link>
  );
}
