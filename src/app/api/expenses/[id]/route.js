import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

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

    const existing = await prisma.expense.findUnique({ where: { id: numericId } });
    if (!existing || existing.userId !== userId) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.expense.delete({ where: { id: numericId } });

    return Response.json({ message: 'Deleted' });
  } catch (error) {
    if (error?.code === 'P2025') {
      return Response.json({ error: 'Expense not found' }, { status: 404 });
    }
    console.error('[DELETE /api/expenses/:id]', error);
    return Response.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
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

    const existing = await prisma.expense.findUnique({ where: { id: numericId } });
    if (!existing || existing.userId !== userId) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { amount, category, note, paymentMethod, date } = body;

    const data = {};
    if (amount !== undefined) data.amount = parseFloat(amount);
    if (category !== undefined) data.category = category;
    if (note !== undefined) data.note = note;
    if (paymentMethod !== undefined) data.paymentMethod = paymentMethod;
    if (date !== undefined) data.date = date;

    const expense = await prisma.expense.update({
      where: { id: numericId },
      data,
    });

    return Response.json(expense);
  } catch (error) {
    if (error?.code === 'P2025') {
      return Response.json({ error: 'Expense not found' }, { status: 404 });
    }
    console.error('[PATCH /api/expenses/:id]', error);
    return Response.json({ error: 'Failed to update expense' }, { status: 500 });
  }
}
