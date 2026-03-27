"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import styles from "./ProfileDropdown.module.css";

type Props = {
  userName: string | null;
  userEmail: string | null;
  userImage: string | null;
};

const THEMES = [
  { name: "Grön", value: "#2d6a4f" },
  { name: "Blå", value: "#1d3557" },
  { name: "Lila", value: "#6a4c93" },
  { name: "Röd", value: "#e63946" },
  { name: "Orange", value: "#e76f51" },
  { name: "Mörk", value: "#343a40" },
];

export default function ProfileDropdown({
  userName,
  userEmail,
  userImage,
}: Props) {
  const [open, setOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>(THEMES[0].value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  return (
    <div className={styles.wrapper} ref={ref}>
      <button className={styles.toggle} onClick={() => setOpen(!open)}>
        {userImage ? (
          <Image
            src={userImage}
            alt=""
            width={32}
            height={32}
            className={styles.avatar}
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className={styles.avatarFallback}>👤</span>
        )}
        <span className={styles.name}>{userName ?? "Användare"}</span>
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}>
          ▾
        </span>
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.profileInfo}>
            {userImage && (
              <Image
                src={userImage}
                alt=""
                width={40}
                height={40}
                className={styles.profileImg}
                referrerPolicy="no-referrer"
              />
            )}
            <div className={styles.profileText}>
              <span className={styles.profileName}>{userName}</span>
              <span className={styles.profileEmail}>{userEmail}</span>
            </div>
          </div>

          <div className={styles.section}>
            <span className={styles.sectionLabel}>Färgtema</span>
            <div className={styles.themeGrid}>
              {THEMES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  className={`${styles.themeDot} ${selectedTheme === t.value ? styles.themeDotActive : ""}`}
                  style={{ background: t.value }}
                  onClick={() => setSelectedTheme(t.value)}
                  title={t.name}
                />
              ))}
            </div>
          </div>

          <div className={styles.footer}>
            <button className={styles.signOutBtn} onClick={() => signOut()}>
              Logga ut
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
