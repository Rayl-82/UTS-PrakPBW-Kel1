import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

/**
 * Normalize a todo from the DB into the shape the frontend expects.
 */
function toClientTodo(todo) {
  return {
    id: String(todo.id),
    title: todo.title,
    description: todo.description ?? '',
    priority: todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1),
    status: todo.status,
    category: todo.category ?? '',
    dueDate: todo.dueDate
      ? todo.dueDate.toISOString().split('T')[0]
      : '',
    completed: todo.done,
    createdAt: todo.createdAt.toISOString(),
    updatedAt: todo.updatedAt.toISOString(),
  };
}

export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const numericId = parseInt(id, 10);
    const userId = parseInt(session.user.id, 10);

    if (isNaN(numericId) || isNaN(userId)) {
      return Response.json({ error: 'Invalid id' }, { status: 400 });
    }

    // Verify the todo belongs to the logged-in user before updating
    const existing = await prisma.todo.findUnique({ where: { id: numericId } });
    if (!existing || existing.userId !== userId) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, priority, status, category, dueDate, done } = body;

    // Build an update object with only the fields that were provided
    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (priority !== undefined) data.priority = priority.toLowerCase();
    if (status !== undefined) data.status = status;
    if (category !== undefined) data.category = category;
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
    if (done !== undefined) data.done = done;

    const todo = await prisma.todo.update({
      where: { id: numericId },
      data,
    });

    return Response.json(toClientTodo(todo));
  } catch (error) {
    // Prisma throws P2025 when the record does not exist
    if (error?.code === 'P2025') {
      return Response.json({ error: 'Todo not found' }, { status: 404 });
    }
    console.error('[PATCH /api/todos/:id]', error);
    return Response.json(
      { error: 'Failed to update todo' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const numericId = parseInt(id, 10);
    const userId = parseInt(session.user.id, 10);

    if (isNaN(numericId) || isNaN(userId)) {
      return Response.json({ error: 'Invalid id' }, { status: 400 });
    }

    // Verify ownership before deleting
    const existing = await prisma.todo.findUnique({ where: { id: numericId } });
    if (!existing || existing.userId !== userId) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.todo.delete({ where: { id: numericId } });

    return Response.json({ success: true });
  } catch (error) {
    if (error?.code === 'P2025') {
      return Response.json({ error: 'Todo not found' }, { status: 404 });
    }
    console.error('[DELETE /api/todos/:id]', error);
    return Response.json(
      { error: 'Failed to delete todo' },
      { status: 500 }
    );
  }
}
