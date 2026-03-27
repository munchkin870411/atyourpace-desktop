"use client";

import { useState, useOptimistic, useTransition } from "react";
import { toggleTodo, deleteTodo } from "../actions/todo";
import EditTodoForm from "./EditTodoForm";
import styles from "./TodoItem.module.css";

type Props = {
  id: string;
  title: string;
  isDone: boolean;
  bucket: "TODAY" | "FUTURE";
  durationMinutes: number | null;
  startTime: string | null;
  dueDate: string | null;
  notes: string | null;
  color: string | null;
  hideTime?: boolean;
  hideDuration?: boolean;
};

export default function TodoItem({
  id,
  title,
  isDone,
  bucket,
  durationMinutes,
  startTime,
  dueDate,
  notes,
  color,
  hideTime,
  hideDuration,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [optimisticDone, setOptimisticDone] = useOptimistic(isDone);
  const [, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      setOptimisticDone(!optimisticDone);
      await toggleTodo(id);
    });
  }

  return (
    <>
      <div
        className={`${styles.item} ${optimisticDone ? styles.done : ""}`}
        style={{ borderLeftColor: color || "transparent" }}
      >
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={optimisticDone}
          onChange={handleToggle}
        />
        <span
          className={styles.title}
          onClick={() => setEditing(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setEditing(true)}
        >
          {title}
        </span>
        <div className={styles.meta}>
          {!hideTime && !hideDuration && durationMinutes && (
            <span className={styles.badge}>{durationMinutes} min</span>
          )}
          {!hideTime && startTime && <span className={styles.badge}>{startTime}</span>}
          {dueDate && (
            <span className={styles.badge}>
              {new Date(dueDate).toLocaleDateString("sv-SE")}
            </span>
          )}
        </div>
        <button
          onClick={() => deleteTodo(id)}
          className={styles.deleteBtn}
          title="Ta bort"
        >
          🗑
        </button>
      </div>

      {editing && (
        <EditTodoForm
          id={id}
          title={title}
          bucket={bucket}
          durationMinutes={durationMinutes}
          startTime={startTime}
          dueDate={dueDate}
          notes={notes}
          color={color}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}
