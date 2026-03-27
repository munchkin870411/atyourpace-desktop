import { auth } from "../auth";
import { getTodos } from "./actions/getTodos";
import SignInButton from "./components/SignInButton";
import TodoItem from "./components/TodoItem";
import AddTodoForm from "./components/AddTodoForm";
import TabSwitcher from "./components/TabSwitcher";
import ProfileDropdown from "./components/ProfileDropdown";
import Sidebar from "./components/Sidebar";
import styles from "./page.module.css";

type PageProps = {
  searchParams: Promise<{ mode?: string }>;
};

export default async function Home({ searchParams }: PageProps) {
  const { mode = "schema" } = await searchParams;
  const session = await auth();

  if (!session?.user) {
    return (
      <div className={styles.loginPage}>
        <div className={styles.loginCard}>
          <h1 className={styles.loginTitle}>AtYourPace</h1>
          <p className={styles.loginSubtitle}>Planera din dag i din egen takt</p>
          <SignInButton className={styles.loginBtn} />
        </div>
      </div>
    );
  }

  const { today, future } = await getTodos();

  const todayActive = today.filter((t) => !t.isDone);
  const todayDone = today.filter((t) => t.isDone);
  const futureActive = future.filter((t) => !t.isDone);
  const futureDone = future.filter((t) => t.isDone);

  // Sort today tasks based on mode
  const hideTime = mode === "ingen-tid";

  // Compute scheduled start times for schema mode
  const scheduledTimes = new Map<string, string>();
  let scheduleCursor = 0;

  if (mode === "schema") {
    // Separate tasks with and without explicit start times
    const withTime = todayActive.filter((t) => t.startTime);
    const withoutTime = todayActive.filter((t) => !t.startTime);

    // Sort explicit-time tasks by their start time
    withTime.sort((a, b) => a.startTime!.localeCompare(b.startTime!));

    // Build schedule: use latest completedAt as cursor start, or first task's createdAt
    const lastDone = todayDone
      .filter((t) => t.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];

    let cursor: number;
    if (lastDone?.completedAt) {
      const doneTime = new Date(lastDone.completedAt);
      cursor = doneTime.getHours() * 60 + doneTime.getMinutes();
    } else {
      const firstTask = withoutTime[0] ?? withTime[0];
      const baseTime = firstTask ? new Date(firstTask.createdAt) : new Date();
      const rawMinutes = baseTime.getHours() * 60 + baseTime.getMinutes();
      cursor = Math.floor(rawMinutes / 15) * 15;
    }

    const scheduled: { todo: typeof todayActive[number]; start: number }[] = [];
    let timeIdx = 0;

    for (const todo of withoutTime) {
      // Before placing this task, insert any explicit-time tasks that start before cursor + this task's duration
      while (timeIdx < withTime.length) {
        const [h, m] = withTime[timeIdx].startTime!.split(":").map(Number);
        const explicitStart = h * 60 + m;
        if (explicitStart <= cursor) {
          // Explicit task starts at or before cursor — place it and advance cursor
          scheduled.push({ todo: withTime[timeIdx], start: explicitStart });
          cursor = explicitStart + (withTime[timeIdx].durationMinutes ?? 0);
          timeIdx++;
        } else {
          break;
        }
      }
      // Place this no-time task at cursor
      scheduled.push({ todo, start: cursor });
      cursor += todo.durationMinutes ?? 0;
    }

    // Append any remaining explicit-time tasks
    while (timeIdx < withTime.length) {
      const [h, m] = withTime[timeIdx].startTime!.split(":").map(Number);
      const explicitStart = h * 60 + m;
      const start = Math.max(cursor, explicitStart);
      scheduled.push({ todo: withTime[timeIdx], start });
      cursor = start + (withTime[timeIdx].durationMinutes ?? 0);
      timeIdx++;
    }

    // Build scheduledTimes map and reorder todayActive
    todayActive.length = 0;
    for (const entry of scheduled) {
      const hh = String(Math.floor(entry.start / 60) % 24).padStart(2, "0");
      const mm = String(entry.start % 60).padStart(2, "0");
      scheduledTimes.set(entry.todo.id, `${hh}:${mm}`);
      todayActive.push(entry.todo);
    }
    scheduleCursor = cursor;
  } else if (mode === "minuter") {
    todayActive.sort((a, b) => {
      const am = a.durationMinutes ?? Infinity;
      const bm = b.durationMinutes ?? Infinity;
      return am - bm;
    });
  }

  const totalMinutes = todayActive.reduce(
    (sum, t) => sum + (t.durationMinutes ?? 0),
    0
  );

  const doneMinutes = todayDone.reduce(
    (sum, t) => sum + (t.durationMinutes ?? 0),
    0
  );

  // Calculate estimated finish time
  const now = new Date();
  let finishStr: string;
  if (mode === "schema" && scheduleCursor > 0) {
    const hh = String(Math.floor(scheduleCursor / 60) % 24).padStart(2, "0");
    const mm = String(scheduleCursor % 60).padStart(2, "0");
    finishStr = `${hh}:${mm}`;
  } else {
    const finishTime = new Date(now.getTime() + totalMinutes * 60000);
    finishStr = finishTime.toLocaleTimeString("sv-SE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <>
      {/* Header */}
      <header className={styles.header}>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/AtYourPace_logo_transparent.png"
            alt="AtYourPace"
            className={styles.logoImg}
          />
        </div>
        <ProfileDropdown
          userName={session.user.name ?? null}
          userEmail={session.user.email ?? null}
          userImage={session.user.image ?? null}
        />
      </header>

      {/* Main layout */}
      <main className={styles.main}>
        {/* Tab switcher — above columns on mobile, in sidebar area on desktop */}
        <TabSwitcher />

        {/* Today column */}
        <section className={styles.column}>
          <div className={styles.columnHeader}>
            <h2 className={styles.columnTitle}>På agendan idag!</h2>
            <AddTodoForm bucket="TODAY" />
          </div>

          <div className={styles.todoList}>
            {todayActive.length === 0 && todayDone.length === 0 && (
              <p className={styles.emptyMsg}>Inga uppgifter ännu.</p>
            )}
            {todayActive.map((todo) => (
              <TodoItem
                key={todo.id}
                id={todo.id}
                title={todo.title}
                isDone={todo.isDone}
                bucket="TODAY"
                durationMinutes={todo.durationMinutes}
                startTime={scheduledTimes.get(todo.id) ?? todo.startTime}
                dueDate={null}
                notes={todo.notes}
                color={todo.color}
                hideTime={hideTime}
                hideDuration={mode === "schema"}
              />
            ))}
          </div>

          {totalMinutes > 0 && !hideTime && (
            <div className={styles.finishTime}>
              <span>🎯 Du är klar vid</span>
              <span className={styles.finishTimeValue}>{finishStr}</span>
            </div>
          )}

          {todayDone.length > 0 && (
            <div className={styles.doneSection}>
              <div className={styles.doneSectionLabel}>Klara ✓</div>
              {todayDone.map((todo) => (
                <TodoItem
                  key={todo.id}
                  id={todo.id}
                  title={todo.title}
                  isDone={todo.isDone}
                  bucket="TODAY"
                  durationMinutes={todo.durationMinutes}
                  startTime={todo.startTime}
                  dueDate={null}
                  notes={todo.notes}
                  color={todo.color}
                  hideTime={hideTime}
                />
              ))}
            </div>
          )}
        </section>

        {/* Future column */}
        <section className={styles.column}>
          <div className={styles.columnHeader}>
            <h2 className={styles.columnTitle}>Längre fram</h2>
            <AddTodoForm bucket="FUTURE" />
          </div>

          <div className={styles.todoList}>
            {futureActive.length === 0 && futureDone.length === 0 && (
              <p className={styles.emptyMsg}>Inga uppgifter ännu.</p>
            )}
            {futureActive.map((todo) => (
              <TodoItem
                key={todo.id}
                id={todo.id}
                title={todo.title}
                isDone={todo.isDone}
                bucket="FUTURE"
                durationMinutes={todo.durationMinutes}
                startTime={null}
                dueDate={todo.dueDate?.toISOString() ?? null}
                notes={todo.notes}
                color={todo.color}
                hideTime={hideTime}
              />
            ))}
          </div>

          {futureDone.length > 0 && (
            <div className={styles.doneSection}>
              <div className={styles.doneSectionLabel}>Klara ✓</div>
              {futureDone.map((todo) => (
                <TodoItem
                  key={todo.id}
                  id={todo.id}
                  title={todo.title}
                  isDone={todo.isDone}
                  bucket="FUTURE"
                  durationMinutes={todo.durationMinutes}
                  startTime={null}
                  dueDate={todo.dueDate?.toISOString() ?? null}
                  notes={todo.notes}
                  color={todo.color}
                  hideTime={hideTime}
                />
              ))}
            </div>
          )}
        </section>

        {/* Sidebar */}
        <Sidebar
          todayCount={today.length}
          futureCount={future.length}
          todayDoneCount={todayDone.length}
          totalMinutes={totalMinutes}
          doneMinutes={doneMinutes}
          mode={mode}
        />
      </main>
    </>
  );
}
