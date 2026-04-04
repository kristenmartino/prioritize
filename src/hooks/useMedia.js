import { useState, useEffect } from "react";

export const useMedia = (q) => {
  const [m, setM] = useState(() => {
    if (typeof window === "undefined") return true; // SSR: assume mobile (stacked layout)
    return window.matchMedia(q).matches;
  });
  useEffect(() => {
    const mql = window.matchMedia(q);
    const h = (e) => setM(e.matches);
    mql.addEventListener("change", h);
    setM(mql.matches);
    return () => mql.removeEventListener("change", h);
  }, [q]);
  return m;
};
