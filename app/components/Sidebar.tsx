"use client";

import Weather from "./Weather";
import styles from "./Sidebar.module.css";

type Props = {
  todayCount: number;
  futureCount: number;
  todayDoneCount: number;
  totalMinutes: number;
  doneMinutes: number;
  mode?: string;
};

function getMessage(pct: number, mode?: string): string {
  if (mode === "ingen-tid") {
    if (pct === 0) return "Ta det lugnt, en sak i taget 🌿";
    if (pct < 50) return "Fint jobbat hittills! 🌱";
    if (pct < 100) return "Du har gjort massor! ☀️";
    return "Allt klart — njut av resten av dagen! 🌈";
  }
  if (mode === "minuter") {
    if (pct === 0) return "Redo att börja? 😊";
    if (pct < 50) return "Bra flyt! Fortsätt i din takt 👍";
    if (pct < 100) return "Mer än halvvägs — snyggt! ⭐";
    return "Allt avklarat! Snyggt jobbat! 🎉";
  }
  // schema
  if (pct === 0) return "Dags att köra igång! 💪";
  if (pct < 25) return "Bra start! Nu kör vi! 🚀";
  if (pct < 50) return "Du är på gång! Håll takten! 🔥";
  if (pct < 75) return "Halvvägs! Starkt jobbat! ⭐";
  if (pct < 100) return "Nästan framme — du fixar det! 💎";
  return "Alla uppgifter klara! Fantastiskt! 🎉🎊";
}

export default function Sidebar({
  todayCount,
  todayDoneCount,
  totalMinutes,
  doneMinutes,
  mode,
}: Props) {
  const pct = todayCount > 0 ? Math.round((todayDoneCount / todayCount) * 100) : 0;
  const msg = getMessage(pct, mode);

  return (
    <div className={styles.sidebar}>
      {/* Weather */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>Väder</div>
        <div className={styles.cardBody}>
          <Weather />
        </div>
      </div>

      {/* Summary */}
      <div className={`${styles.card} ${styles.summaryCard}`}>
        <div className={styles.cardHeader}>Sammanfattning för idag</div>
        <div className={styles.cardBody}>
          <div className={styles.summaryList}>
            {/* Motiverande meddelande */}
            <div className={styles.motivation}>{msg}</div>

            {/* Progress bar — schema & minuter */}
            {mode !== "ingen-tid" && (
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${pct}%` }} />
              </div>
            )}

            {/* Schema: allt */}
            {mode !== "ingen-tid" && (
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Uppgifter</span>
                <span className={styles.summaryValue}>
                  {todayDoneCount}/{todayCount} klara ({pct}%)
                </span>
              </div>
            )}

            {/* Alla lägen: avklarad tid */}
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Avklarad tid</span>
              <span className={styles.summaryValue}>{doneMinutes} min</span>
            </div>

            {/* Bara schema: kvar att göra */}
            {mode === "schema" && (
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Kvar att göra</span>
                <span className={styles.summaryValue}>{totalMinutes} min</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
