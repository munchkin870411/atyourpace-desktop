"use server";

import { revalidatePath } from "next/cache";
import { auth } from "../../auth";
import { prisma } from "../../lib/prisma";

async function getUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Du måste vara inloggad");
  }
  return session.user.id;
}

export async function createTodo(formData: FormData) {
  const userId = await getUserId();

  const title = formData.get("title") as string;
  if (!title || title.trim().length === 0) {
    throw new Error("Titel krävs");
  }

  const bucket = (formData.get("bucket") as string) || "TODAY";
  const durationStr = formData.get("durationMinutes") as string;
  const durationMinutes = durationStr ? parseInt(durationStr, 10) : null;
  const startTime = (formData.get("startTime") as string) || null;
  const notes = (formData.get("notes") as string) || null;
  const color = (formData.get("color") as string) || null;

  const dueDateStr = formData.get("dueDate") as string;
  const dueDate = dueDateStr ? new Date(dueDateStr) : null;

  await prisma.todo.create({
    data: {
      userId,
      title: title.trim(),
      bucket: bucket === "FUTURE" ? "FUTURE" : "TODAY",
      durationMinutes,
      startTime,
      dueDate,
      notes,
      color,
    },
  });

  revalidatePath("/");
}

export async function toggleTodo(id: string) {
  const userId = await getUserId();

  const todo = await prisma.todo.findUnique({ where: { id } });
  if (!todo || todo.userId !== userId) {
    throw new Error("Todo hittades inte");
  }

  await prisma.todo.update({
    where: { id },
    data: {
      isDone: !todo.isDone,
      completedAt: todo.isDone ? null : new Date(),
    },
  });

  revalidatePath("/");
}

export async function deleteTodo(id: string) {
  const userId = await getUserId();

  const todo = await prisma.todo.findUnique({ where: { id } });
  if (!todo || todo.userId !== userId) {
    throw new Error("Todo hittades inte");
  }

  await prisma.todo.delete({ where: { id } });

  revalidatePath("/");
}

export async function updateTodo(id: string, formData: FormData) {
  const userId = await getUserId();

  const todo = await prisma.todo.findUnique({ where: { id } });
  if (!todo || todo.userId !== userId) {
    throw new Error("Todo hittades inte");
  }

  const title = formData.get("title") as string;
  if (!title || title.trim().length === 0) {
    throw new Error("Titel krävs");
  }

  const durationStr = formData.get("durationMinutes") as string;
  const durationMinutes = durationStr ? parseInt(durationStr, 10) : null;
  const startTime = (formData.get("startTime") as string) || null;
  const notes = (formData.get("notes") as string) || null;
  const color = (formData.get("color") as string) || null;

  const dueDateStr = formData.get("dueDate") as string;
  const dueDate = dueDateStr ? new Date(dueDateStr) : null;

  await prisma.todo.update({
    where: { id },
    data: {
      title: title.trim(),
      durationMinutes,
      startTime,
      dueDate,
      notes,
      color,
    },
  });

  revalidatePath("/");
}
