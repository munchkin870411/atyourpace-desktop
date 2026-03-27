import { prisma } from "../../lib/prisma";
import { auth } from "../../auth";

export async function getTodos() {
  const session = await auth();
  if (!session?.user?.id) return { today: [], future: [] };

  const todos = await prisma.todo.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDone: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return {
    today: todos.filter((t) => t.bucket === "TODAY"),
    future: todos.filter((t) => t.bucket === "FUTURE"),
  };
}
