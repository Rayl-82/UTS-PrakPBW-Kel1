import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10);
    if (isNaN(userId)) {
      return Response.json({ error: 'Invalid user ID' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');

    let where = { userId };

    if (monthParam && yearParam) {
      const month = parseInt(monthParam, 10);
      const year = parseInt(yearParam, 10);

      if (!isNaN(month) && !isNaN(year)) {
        // Build date prefix strings: e.g. "2026-04-" for month=4, year=2026
        const monthStr = String(month).padStart(2, '0');
        const prefix = `${year}-${monthStr}-`;

        where = {
          userId,
          date: { startsWith: prefix },
        };
      }
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });

    return Response.json(expenses);
  } catch (error) {
    console.error('[GET /api/expenses]', error);
    return Response.json({ error: 'Failed to fetch expenses' }, { status: 500 });
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
    const { amount, category, note, paymentMethod, date } = body;

    if (!amount || parseFloat(amount) <= 0) {
      return Response.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }
    if (!category || typeof category !== 'string' || !category.trim()) {
      return Response.json({ error: 'Category is required' }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        category: category.trim(),
        note: note ?? null,
        paymentMethod: paymentMethod ?? null,
        date: date ?? new Date().toISOString().split('T')[0],
        userId,
      },
    });

    return Response.json(expense, { status: 201 });
  } catch (error) {
    console.error('[POST /api/expenses]', error);
    return Response.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}
