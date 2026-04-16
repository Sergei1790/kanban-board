import {getBoardWithColumns} from '@/lib/actions';
import { notFound } from 'next/navigation';
import BoardView from '@/components/BoardView';

export default async function BoardPage({params}:{ params: Promise<{id: string}>}) {
    const {id} = await params;
    const board = await getBoardWithColumns(Number(id));

    if (!board) notFound();

    return <BoardView board={board} />
}