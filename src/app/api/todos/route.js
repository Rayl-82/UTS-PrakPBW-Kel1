import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

/**
 * Normalize a todo from the DB into the shape the frontend expects.
 * - Maps DB `done` → frontend `completed`
 * - Capitalizes priority for display (e.g. "high" → "High")
 * - Converts numeric id to string
 * - Formats dueDate as YYYY-MM-DD string (or '')
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

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10);
    if (isNaN(userId)) {
      return Response.json({ error: 'Invalid user ID' }, { status: 401 });
    }
    const todos = await prisma.todo.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return Response.json(todos.map(toClientTodo));
  } catch (error) {
    console.error('[GET /api/todos]', error);
    return Response.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10);
    if (isNaN(userId)) {
      return Response.json({ error: 'Invalid user ID' }, { status: 401 });
    }
    const body = await request.json();
    const { title, description, priority, category, dueDate } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return Response.json({ error: 'Title is required' }, { status: 400 });
    }

    const todo = await prisma.todo.create({
      data: {
        title: title.trim(),
        description: description ?? null,
        // Store priority lowercase in DB regardless of what the frontend sends
        priority: priority ? priority.toLowerCase() : 'medium',
        category: category ?? null,
        // Parse dueDate string to Date, or null if empty
        dueDate: dueDate ? new Date(dueDate) : null,
        userId,
      },
    });

    return Response.json(toClientTodo(todo), { status: 201 });
  } catch (error) {
    console.error('[POST /api/todos]', error);
    return Response.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    );
  }
}
