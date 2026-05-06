import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return Response.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: { name, email, password: hashed },
    });

    return Response.json({ message: 'Account created' }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/register]', error);
    return Response.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
