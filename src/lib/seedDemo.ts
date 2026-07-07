import {prisma} from '@/lib/prisma';

export default async function seedDemo() {
    const demoUser = await prisma.user.upsert({
        where: {email: 'demo@kanban-board.app'},
        update: {},
        create: {email: 'demo@kanban-board.app'},
    });
    await prisma.board.deleteMany({where: {userId: demoUser.id}});

    await prisma.board.create({
        data: {
            title: 'Demo Board',
            userId: demoUser.id,
            columns: {
                create: [
                    {
                        title: 'To Do',
                        order: 0,
                        cards: {
                            create: [
                                {title: 'Design landing page', order: 0},
                                {title: 'Write API documentation', order: 1},
                                {title: 'Set up analytics', order: 2},
                            ],
                        },
                    },
                    {
                        title: 'In Progress',
                        order: 1,
                        cards: {
                            create: [
                                {title: 'Build authentication flow', order: 0},
                                {title: 'Add dark mode toggle', order: 1},
                            ],
                        },
                    },
                    {
                        title: 'Done',
                        order: 2,
                        cards: {
                            create: [
                                {title: 'Set up database schema', order: 0},
                                {title: 'Configure CI pipeline', order: 1},
                                {title: 'Deploy to production', order: 2},
                            ],
                        },
                    },
                ],
            },
        },
    });
}
