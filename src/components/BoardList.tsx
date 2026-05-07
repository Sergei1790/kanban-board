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
    async function handleCreate() {
        if(!title.trim()) return;
        await createBoard(title.trim());
        setTitle('');
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
                    disabled={!title.trim()}
                    className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-xl transition-colors cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Create
                </button>
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
                                        onClick={() => { deleteBoard(board.id); setConfirming(null); }}
                                        className="text-red-400 hover:text-red-300 text-xs cursor-pointer transition-colors"
                                    >
                                        Yes
                                    </button>
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