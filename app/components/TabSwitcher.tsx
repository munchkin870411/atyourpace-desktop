"use client";

import { useSearchParams, useRouter } from "next/navigation";
import styles from "./TabSwitcher.module.css";

const TABS = [
  { label: "Schema", value: "schema" },
  { label: "Minuter", value: "minuter" },
  { label: "Ingen tid", value: "ingen-tid" },
] as const;

export default function TabSwitcher() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const current = searchParams.get("mode") ?? "schema";

  function setMode(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "schema") {
      params.delete("mode");
    } else {
      params.set("mode", value);
    }
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : "/", { scroll: false });
  }

  return (
    <div className={styles.card}>
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.value}
            className={`${styles.tab} ${current === tab.value ? styles.tabActive : ""}`}
            onClick={() => setMode(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
