'use server';

import {prisma} from '@/lib/prisma';
import {auth} from '@/auth';
import {revalidatePath} from 'next/cache';

export async function getBoards() {
    const session = await auth();
    if (!session?.user?.email) return [];

    const user = await prisma.user.findUnique({
        where: {email: session?.user.email},
        include: {boards: {orderBy: {createdAt: 'desc'}}},
    });

    return user?.boards ?? [];
}

export async function createBoard(title: string) {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Not authenticated');

    let user = await prisma.user.findUnique({where: {email: session.user.email}});
    if (!user) {
        user = await prisma.user.create({data: {email: session.user.email}});
    }

    await prisma.board.create({
        data: {title, userId: user.id},
    });

    revalidatePath('/');
}

export async function deleteBoard(id: number) {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Not authenticated');

    await prisma.board.delete({where: {id}});
    revalidatePath('/');
}

export async function getBoardWithColumns(id: number) {
    const session = await auth();
    if (!session?.user?.email) return null;

    const user = await prisma.user.findUnique({where: {email: session.user.email}});
    if (!user) return null;

    return prisma.board.findFirst({
        where: {id, userId: user.id},
        include: {
            columns: {
                orderBy: {order: 'asc'},
                include: {cards: {orderBy: {order: 'asc'}}},
            },
        },
    });
}

export async function createColumn(boardId: number, title: string) {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Not authenticated');

    const count = await prisma.column.count({where: {boardId}});

    await prisma.column.create({
        data: {title, boardId, order: count},
    });

    revalidatePath(`/board/${boardId}`);
}

export async function deleteColumn(id: number, boardId: number) {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Not authenticated');

    await prisma.column.delete({where: {id}});
    revalidatePath(`/board/${boardId}`);
}

export async function createCard(columnId: number, title: string, boardId: number) {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Not authenticated');

    const count = await prisma.card.count({where: {columnId}});

    await prisma.card.create({
        data: {title, columnId, order: count},
    });

    revalidatePath(`/board/${boardId}`);
}

export async function deleteCard(id: number, boardId: number) {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Not authenticated');

    await prisma.card.delete({where: {id}});

    revalidatePath(`/board/${boardId}`);
}

export async function moveCard(cardId: number, newColumnId: number, boardId: number) {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Not authenticated');

    const count = await prisma.card.count({where: {columnId: newColumnId}});

    await prisma.card.update({
        where: {id: cardId},
        data: {columnId: newColumnId, order: count},
    });
    revalidatePath(`/board/${boardId}`);
}
