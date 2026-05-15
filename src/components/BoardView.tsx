'use client';

import Link from 'next/link';
import {useState} from 'react';
import {DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors} from '@dnd-kit/core';
import {SortableContext, useSortable, verticalListSortingStrategy} from '@dnd-kit/sortable';
import {createColumn, deleteColumn, createCard, moveCard, updateColumnTitle} from '@/lib/actions';
import CardView from './CardView';

type Card = {id: number; title: string; order: number; columnId: number};
type Column = {id: number; title: string; order: number; cards: Card[]};
type Board = {id: number; title: string; columns: Column[]};

export default function BoardView({board}: {board: Board}) {
    const [newColumnTitle, setNewColumnTitle] = useState('');
    const [columns, setColumns] = useState(board.columns);
    const [prevBoardColumns, setPrevBoardColumns] = useState(board.columns);
    if (prevBoardColumns !== board.columns) {
        setPrevBoardColumns(board.columns);
        setColumns(board.columns);
    }
    const [activeCard, setActiveCard] = useState<Card | null>(null);
    const sensors = useSensors(useSensor(PointerSensor, {activationConstraint: {distance: 8}}));

    const [addingColumn, setAddingColumn] = useState(false);
    const [addColumnError, setAddColumnError] = useState('');
    const [dragError, setDragError] = useState('');

    async function handleAddColumn() {
        if (!newColumnTitle.trim()) return;
        setAddingColumn(true);
        setAddColumnError('');
        try{
            await createColumn(board.id, newColumnTitle.trim());
            setNewColumnTitle('');
        } catch{
            setAddColumnError('Failed to add Column. Try again.');
        } finally{
            setAddingColumn(false);
        }
  
    }

    function handleDragStart(event: DragStartEvent){
        const card = columns.flatMap(col => col.cards).find(c => c.id === Number(event.active.id));
        setActiveCard(card ?? null);
    }

    async function handleDragEnd(event: DragEndEvent) {
        setActiveCard(null); 
        setDragError('');
        const {active, over} = event;
        if (!over || active.id === over.id) return;

        const cardId = Number(active.id);
        const overId = Number(over.id);

        const overColumn = columns.find(col => col.id === overId);
        const overCard = columns.flatMap(col => col.cards).find(card => card.id === overId);

        const newColumnId = overColumn?.id ?? overCard?.columnId;
        if (!newColumnId) return;

        const previousColumns = columns;  

        setColumns(prev => {
            const card = prev.flatMap(col => col.cards).find(c => c.id === cardId);
            if (!card) return prev;
            return prev.map(col => {
                if (col.id === newColumnId) return {...col, cards: [...col.cards.filter(c => c.id !== cardId), {...card, columnId: newColumnId}]};
                return {...col, cards: col.cards.filter(c => c.id !== cardId)};
            });
        });
        try{
            await moveCard(cardId, newColumnId, board.id);
        } catch{
            setColumns(previousColumns); 
            setDragError('Failed to drag. Try again.');
        } 
    }

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="p-6">
                <Link href="/" className="text-muted hover:text-foreground text-sm transition-colors mb-2 inline-block">
                    ← Back to boards
                </Link>
                {dragError && <p className="text-red-400 text-xs">{dragError}</p>}
                <h1 className="text-2xl font-bold text-foreground mb-6">{board.title}</h1>
                {columns.length === 0 && (
                    <p className="text-muted text-sm mb-4">No columns yet — add one</p>
                )}
                <div className="flex gap-4 items-start overflow-x-auto pb-4">
                    {columns.map((col) => (
                        <ColumnView key={col.id} column={col} boardId={board.id} />
                    ))}
                    <div className="shrink-0 w-64">
                        <input
                            value={newColumnTitle}
                            onChange={(e) => setNewColumnTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
                            placeholder="New column..."
                            className="border border-white/10 bg-card text-foreground placeholder-muted rounded-xl px-3 py-2 w-full focus:outline-none focus:border-primary/60 mb-2"
                        />
                        <button type="button" onClick={handleAddColumn} disabled={ addingColumn || !newColumnTitle.trim()} className="w-full bg-primary hover:bg-primary/80 text-white px-3 py-2 rounded-xl transition-colors cursor-pointer text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                            {addingColumn ? 'Adding Column...' : '+ Add Column'}
                        </button>
                        {addColumnError && <p className="text-red-400 text-xs mt-1">{addColumnError}</p>}
                    </div>
                </div>
            </div>
            <DragOverlay>
                {activeCard ? (
                    <div className="bg-bg border border-primary/40 rounded-xl p-3 flex items-center justify-between shadow-xl cursor-grabbing opacity-90">
                        <span className="text-foreground text-sm">{activeCard.title}</span>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

function ColumnView({column, boardId}: {column: Column; boardId: number}) {
    const [newCardTitle, setNewCardTitle] = useState('');
    const [editing, setEditing] = useState(false);
    const [updatingColumnTitle, setUpdatingColumnTitle] = useState(false);
    const [errorUpdateColumnTitle, setErrorUpdateColumnTitle] = useState('');
    const [titleValue, setTitleValue] = useState(column.title);
    const [confirming, setConfirming] = useState(false);
    const {setNodeRef} = useSortable({id: column.id});

    const [addingCard, setAddingCard] = useState(false);
    const [addingCardError, setAddingCardError] = useState('');
    const [deletingColumn, setDeletingColumn] = useState(false);
    const [errorDeleteColumn, setErrorDeleteColumn] = useState('');

    async function handleAddCard() {
        if (!newCardTitle.trim()) return;
        setAddingCard(true);
        setAddingCardError('');
        try{
            await createCard(column.id, newCardTitle.trim(), boardId);
            setNewCardTitle('');
        } catch{
            setAddingCardError('Failed to add card. Try again.');
        } finally{
            setAddingCard(false);
        }

    }

    async function handleUpdateColumnTitle() {
        setUpdatingColumnTitle(true);
        setErrorUpdateColumnTitle('');
        try {
            await updateColumnTitle(column.id, titleValue, boardId);
            setEditing(false);
        } catch {
            setErrorUpdateColumnTitle('Failed to update column title. Try again.');
        } finally {
            setUpdatingColumnTitle(false);
        }
    }


    async function handleDeleteColumn() {
        setDeletingColumn(true);
        setErrorDeleteColumn('');
        try {
            await deleteColumn(column.id, boardId)
        } catch {
            setErrorDeleteColumn('Failed to delete column. Try again.');
        } finally {
            setDeletingColumn(false);
        }
    }
    return (
        <div ref={setNodeRef} className="shrink-0 w-64 bg-card border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                {editing ? (
                    <input
                        autoFocus
                        value={titleValue}
                        onChange={(e) => setTitleValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {handleUpdateColumnTitle()}
                            if (e.key === 'Escape') { setTitleValue(column.title); setEditing(false); }
                        }}
                        className="bg-transparent border-b border-primary/60 text-foreground font-semibold focus:outline-none w-full"
                    />
                ) : (
                    <h2 className="font-semibold text-foreground cursor-pointer" onDoubleClick={() => setEditing(true)}>{titleValue}</h2>
                )}
                {confirming ? (
                    <div className='flex items-center gap-2' onKeyDown={(e) => e.key === 'Escape' && setConfirming(false)}>
                        <span className="text-muted text-xs">Delete?</span>
                        <button type="button" onClick={handleDeleteColumn} disabled={deletingColumn} className="text-red-400 hover:text-red-300 text-xs cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {deletingColumn ? 'Deleting...' : 'Yes'}
                        </button>
                        <button type="button" onClick={() =>setConfirming(false)}className="text-muted hover:text-foreground text-xs cursor-pointer transition-colors">No</button>
                    </div>
                ):(
                    <button type='button' onClick={() => setConfirming(true)} className="text-muted hover:text-red-400 text-sm transition-colors cursor-pointer">✕</button>
                )}
            </div>
            {errorUpdateColumnTitle && <p className="text-red-400 text-xs mt-1">{errorUpdateColumnTitle}</p>}
            {errorDeleteColumn && <p className="text-red-400 text-xs mt-1">{errorDeleteColumn}</p>}

            <SortableContext items={column.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-2">
                    {column.cards.map((card) => (
                        <CardView key={card.id} card={card} boardId={boardId} />
                    ))}
                </div>
            </SortableContext>
            <input
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCard()}
                placeholder="Add card..."
                className="border border-white/10 bg-bg text-foreground placeholder-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/60"
            />
            <button type="button" onClick={handleAddCard} disabled={addingCard || !newCardTitle.trim()} className="w-full bg-accent/40 hover:bg-accent/60 text-foreground px-3 py-1 rounded-xl transition-colors cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {addingCard ? 'Adding Card...' : '+ Add Card'}
            </button>
            {addingCardError && <p className="text-red-400 text-xs mt-1">{addingCardError}</p>}
        </div>
    );
}

