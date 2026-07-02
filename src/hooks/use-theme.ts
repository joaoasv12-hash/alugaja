"use client";

import { useEffect, useState } from "react";

type Tema = "light" | "dark";

export function useTheme() {
  const [tema, setTema] = useState<Tema>("light");

  useEffect(() => {
    const salvo = localStorage.getItem("tema") as Tema | null;
    const preferencia = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    const inicial = salvo ?? preferencia;
    setTema(inicial);
    aplicarTema(inicial);
  }, []);

  function alternarTema() {
    const novo: Tema = tema === "light" ? "dark" : "light";
    setTema(novo);
    localStorage.setItem("tema", novo);
    aplicarTema(novo);
  }

  return { tema, alternarTema };
}

function aplicarTema(tema: Tema) {
  if (tema === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}
