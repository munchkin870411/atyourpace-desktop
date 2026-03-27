"use client";

import { useRef, useState } from "react";
import { updateTodo } from "../actions/todo";
import styles from "./AddTodoForm.module.css";

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

type Props = {
  id: string;
  title: string;
  bucket: "TODAY" | "FUTURE";
  durationMinutes: number | null;
  startTime: string | null;
  dueDate: string | null;
  notes: string | null;
  color: string | null;
  onClose: () => void;
};

export default function EditTodoForm({
  id,
  title,
  bucket,
  durationMinutes,
  startTime,
  dueDate,
  notes,
  color: initialColor,
  onClose,
}: Props) {
  const [color, setColor] = useState<string | null>(initialColor);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    if (color) formData.set("color", color);
    await updateTodo(id, formData);
    onClose();
  }

  const dueDateValue = dueDate ? dueDate.split("T")[0] : "";

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>Redigera uppgift</span>
          <button className={styles.closeBtn} onClick={onClose}>
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
                defaultValue={title}
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
                  defaultValue={durationMinutes ?? ""}
                />
              </div>

              {bucket === "TODAY" && (
                <div className={styles.field}>
                  <label className={styles.label}>Starttid</label>
                  <input
                    name="startTime"
                    type="time"
                    className={styles.input}
                    defaultValue={startTime ?? ""}
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
                    defaultValue={dueDateValue}
                  />
                </div>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Kommentar</label>
              <textarea
                name="notes"
                className={styles.textarea}
                defaultValue={notes ?? ""}
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
              onClick={onClose}
            >
              Avbryt
            </button>
            <button type="submit" className={styles.submitBtn}>
              Spara
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
