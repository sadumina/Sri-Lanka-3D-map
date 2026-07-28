"use client";

import dynamic from "next/dynamic";

const SriLankaHazardMap = dynamic(() => import("./SriLankaHazardMap"), {
  ssr: false,
  loading: () => <main className="loading-screen">Preparing Sri Lanka hazard terrain...</main>,
});

export default function ClientMapShell() {
  return <SriLankaHazardMap />;
}
