"use client";

import { useEffect, useState } from "react";

/** O app não tem toggle manual — segue só a preferência do sistema (ver globals.css). */
export function useIsDarkMode(): boolean {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(query.matches);

    function handleChange(event: MediaQueryListEvent) {
      setIsDark(event.matches);
    }

    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return isDark;
}
