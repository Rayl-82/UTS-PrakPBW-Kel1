import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'


export async function GET(request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')

    const userId = parseInt(session.user.id, 10)
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 401 })
    }
    const entry = await prisma.journal.findFirst({
      where: {
        userId,
        date: dateParam,
      },
    })

    return NextResponse.json(entry ?? null)
  } catch (error) {
    console.error('GET /api/journal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, mood, date } = await request.json()

    const userId = parseInt(session.user.id, 10)
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 401 })
    }
    const existing = await prisma.journal.findFirst({
      where: { userId, date },
    })

    let entry
    if (existing) {
      entry = await prisma.journal.update({
        where: { id: existing.id },
        data: { content, mood },
      })
    } else {
      entry = await prisma.journal.create({
        data: { content, mood, date, userId },
      })
    }

    return NextResponse.json(entry)
  } catch (error) {
    console.error('POST /api/journal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
