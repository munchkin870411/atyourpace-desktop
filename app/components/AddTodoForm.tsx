"use client";

import { useRef, useState } from "react";
import { createTodo } from "../actions/todo";
import styles from "./AddTodoForm.module.css";

type Props = {
  bucket: "TODAY" | "FUTURE";
};

const COLORS = [
  "#e63946",
  "#f4a261",
  "#e9c46a",
  "#2a9d8f",
  "#264653",
  "#6a4c93",
  "#1982c4",
  "#8ac926",
  "#ff595e",
  "#6d6875",
];

export default function AddTodoForm({ bucket }: Props) {
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    formData.set("bucket", bucket);
    if (color) formData.set("color", color);
    await createTodo(formData);
    formRef.current?.reset();
    setColor(null);
    setOpen(false);
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className={styles.triggerBtn}>
        Lägg till uppgift!
      </button>
    );
  }

  return (
    <div className={styles.overlay} onClick={() => setOpen(false)}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>
            {bucket === "TODAY" ? "Ny uppgift — Idag" : "Ny uppgift — Längre fram"}
          </span>
          <button className={styles.closeBtn} onClick={() => setOpen(false)}>
            ✕
          </button>
        </div>

        <form ref={formRef} action={handleSubmit}>
          <div className={styles.body}>
            <div className={styles.field}>
              <label className={styles.label}>Uppgift</label>
              <input
                name="title"
                className={styles.input}
                placeholder="Skriv din uppgift här..."
                required
                autoFocus
              />
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Minuter</label>
                <input
                  name="durationMinutes"
                  type="number"
                  min={1}
                  className={styles.input}
                  placeholder="t.ex. 30"
                />
              </div>

              {bucket === "TODAY" && (
                <div className={styles.field}>
                  <label className={styles.label}>Starttid</label>
                  <input
                    name="startTime"
                    type="time"
                    className={styles.input}
                  />
                </div>
              )}

              {bucket === "FUTURE" && (
                <div className={styles.field}>
                  <label className={styles.label}>Datum</label>
                  <input
                    name="dueDate"
                    type="date"
                    className={styles.input}
                  />
                </div>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Kommentar</label>
              <textarea
                name="notes"
                className={styles.textarea}
                placeholder="Valfri anteckning..."
                rows={2}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Färg</label>
              <div className={styles.colorPicker}>
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`${styles.colorDot} ${color === c ? styles.colorDotActive : ""}`}
                    style={{ background: c }}
                    onClick={() => setColor(color === c ? null : c)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => setOpen(false)}
            >
              Avbryt
            </button>
            <button type="submit" className={styles.submitBtn}>
              Lägg till
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
