'use client';

import {useState} from 'react';
import { createBoard, deleteBoard } from '@/lib/actions';
import Link from 'next/link';

type Board = {
    id: number; 
    title: string;
    createdAt: Date;
};

export function BoardList({boards}: {boards: Board[]}){
    const [title, setTitle] = useState('');
    const [confirming, setConfirming] = useState<number | null>(null);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');

    async function handleCreate() {
        if(!title.trim()) return;
        setPending(true);
        setError('');
        try {
            await createBoard(title.trim());
            setTitle('');
        } catch{
            setError('Failed to create board. Try again.');
        } finally{
            setPending(false);
        }
    }

    const [deleting, setDeleting] = useState<number | null>(null);
    const [deleteError, setDeleteError] = useState<{id: number; msg: string} | null>(null);

    async function handleDelete(id:number) {
        setDeleting(id);
        setDeleteError(null);
        try {
            await deleteBoard(id);
            setConfirming(null);
        } catch{
            setDeleteError({id, msg: 'Failed to delete'});
        } finally{
            setDeleting(null);
        }

    }

    return (
        <div className="space-y-6">
            <div className="flex gap-3">
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    placeholder="New board name..."
                    className="border border-white/10 bg-card text-foreground placeholder-muted rounded-xl px-4 py-2 focus:outline-none focus:border-primary/60"
                />
                <button
                    type="button"
                    onClick={handleCreate}
                    disabled={ pending || !title.trim()}
                    className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-xl transition-colors cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {pending ? 'Creating...' : 'Create'}
                </button>
                {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
            </div>

            {boards.length === 0 ? (
                <p className="text-muted">No boards yet. Create one above.</p>
            ) : (
                <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))] gap-4">
                    {boards.map((board) => (
                        <li key={board.id} className="bg-card border border-white/10 rounded-2xl p-5 hover:border-primary/40 transition-colors flex flex-col gap-3">
                            <Link href={`/board/${board.id}`} className="font-semibold text-foreground text-lg hover:text-primary transition-colors">
                                {board.title}
                            </Link>
                            {confirming === board.id ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-muted text-xs">Delete?</span>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(board.id)}
                                        disabled={deleting === board.id}
                                        className="text-red-400 hover:text-red-300 text-xs cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {deleting === board.id ? 'Deleting...' : 'Yes'}
                                    </button>
                                    {deleteError?.id === board.id && <p className="text-red-400 text-xs mt-1">{deleteError.msg}</p>}
                                    <button
                                        type="button"
                                        onClick={() => setConfirming(null)}
                                        className="text-muted hover:text-foreground text-xs cursor-pointer transition-colors"
                                    >
                                        No
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setConfirming(board.id)}
                                    className="text-red-400 text-sm hover:text-red-300 transition-colors cursor-pointer text-left"
                                >
                                    Delete
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}