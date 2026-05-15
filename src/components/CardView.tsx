'use client';

import {useState} from 'react';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {deleteCard} from '@/lib/actions';

type Card = {id: number; title: string; order: number; columnId: number};

export default function CardView({card, boardId}: {card: Card; boardId: number}) {
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id: card.id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };
    const [deletingCard, setDeletingCard] = useState(false);
    const [deleteCardError, setDeleteCardError] = useState('');

    async function handleDeleteCard() {
        setDeletingCard(true);
        setDeleteCardError('');
        try {
            await deleteCard(card.id, boardId);
        } catch {
            setDeleteCardError('Failed to delete card. Try again.');
        } finally {
            setDeletingCard(false);
        }
    }

    return (
        <div className="flex flex-col gap-1">
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                className="bg-bg border border-white/10 rounded-xl p-3 flex items-center justify-between group cursor-grab active:cursor-grabbing"
            >
                <span className="text-foreground text-sm">{card.title}</span>
                <button
                    type="button"
                    onClick={handleDeleteCard}
                    disabled={deletingCard}
                    className="text-muted hover:text-red-400 text-xs transition-colors cursor-pointer opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {deletingCard ? 'Deleting Card...' : '✕'}
                </button>
            </div>
            {deleteCardError && <p className="text-red-400 text-xs mt-1">{deleteCardError}</p>}
        </div>
    );
}
