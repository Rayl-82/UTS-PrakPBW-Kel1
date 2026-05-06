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
    const month = parseInt(searchParams.get('month'), 10);
    const year = parseInt(searchParams.get('year'), 10);

    if (isNaN(month) || isNaN(year)) {
      return Response.json(null);
    }

    const budget = await prisma.budget.findUnique({
      where: { userId_month_year: { userId, month, year } },
    });

    // Return null (not 404) when no budget is set for this month
    return Response.json(budget ?? null);
  } catch (error) {
    console.error('[GET /api/budget]', error);
    return Response.json({ error: 'Failed to fetch budget' }, { status: 500 });
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
    const { amount, month, year } = body;

    const parsedAmount = parseFloat(amount);
    const parsedMonth = parseInt(month, 10);
    const parsedYear = parseInt(year, 10);

    if (!parsedAmount || parsedAmount <= 0) {
      return Response.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }
    if (isNaN(parsedMonth) || isNaN(parsedYear)) {
      return Response.json({ error: 'Invalid month or year' }, { status: 400 });
    }

    const budget = await prisma.budget.upsert({
      where: { userId_month_year: { userId, month: parsedMonth, year: parsedYear } },
      update: { amount: parsedAmount },
      create: { amount: parsedAmount, month: parsedMonth, year: parsedYear, userId },
    });

    return Response.json(budget);
  } catch (error) {
    console.error('[POST /api/budget]', error);
    return Response.json({ error: 'Failed to save budget' }, { status: 500 });
  }
}
