import { getBoards } from '@/lib/actions';
import { BoardList } from '@/components/BoardList';

export default async function Home() {
  const boards = await getBoards();
  return (
      <main className="p-6">
          <h1 className="text-3xl font-bold mb-8 tracking-tight bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(to right, var(--color-primary), var(--color-highlight))' }}>
              My Boards
          </h1>
          <BoardList boards={boards} />
      </main>
  );
}
