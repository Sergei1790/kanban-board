import {describe, it, expect} from 'vitest';
import {computeMove} from './board-logic';

const makeColumns = () =>[
    {
        id: 1, title: 'Todo', order: 0,
        cards: [
            {id: 10, title: 'A', order: 0, columnId: 1},
            {id: 11, title: 'B', order: 1, columnId: 1},
        ],
    },
    {
        id: 2, title: 'Done', order: 1,
        cards: [
            { id: 20, title: 'C', order: 0, columnId: 2 },
        ],
    },
];

describe('computeMove', () => {
    it('moves card to a different column (dropped on column)', () =>{
        const result = computeMove(makeColumns(), 10, 2);
        expect(result).not.toBeNull();
        expect(result!.newColumnId).toBe(2);
        // card 10 should now be in column 2
        const col2 = result!.newColumns.find(c => c.id === 2)!;
        expect(col2.cards.map(c => c.id)).toContain(10);
        // and removed from column 1
        const col1 = result!.newColumns.find(c => c.id === 1)!;
        expect(col1.cards.map(c => c.id)).not.toContain(10);
    });

    it('moves card to column when dropped on another card', () => {
        // Drop card 10 onto card 20 (which is in column 2)
        const result = computeMove(makeColumns(), 10, 20);
        expect(result).not.toBeNull();
        expect(result!.newColumnId).toBe(2);
        const col2 = result!.newColumns.find(c => c.id === 2)!;
        expect(col2.cards.map(c => c.id)).toContain(10);
    });

    it('returns null when cardId does not exist', () => {
        const result = computeMove(makeColumns(), 999, 2);
        expect(result).toBeNull();
    });

    it('returns null when overId matches neither a column nor a card', () => {
        const result = computeMove(makeColumns(), 10, 999);
        expect(result).toBeNull();
    });

    it('updates columnId on the moved card', () => {
        const result = computeMove(makeColumns(), 10, 2);
        const movedCard = result!.newColumns
            .find(c => c.id === 2)!
            .cards.find(card => card.id === 10);
        expect(movedCard?.columnId).toBe(2);
    });

    it('returns null when columns array is empty', () => {
        const result = computeMove([], 10, 2);
        expect(result).toBeNull();
    });

    it('handles drop on the cards own column (card stays in column at end)', () => {
        // Card 10 is in column 1. Drop it ON column 1 itself.
        const result = computeMove(makeColumns(), 10, 1);
        expect(result).not.toBeNull();
        expect(result!.newColumnId).toBe(1);

        const col1 = result!.newColumns.find(c => c.id === 1)!;
        // card 10 should be in column 1 (not duplicated)
        const card10s = col1.cards.filter(c => c.id === 10);
        expect(card10s).toHaveLength(1);
    });

    it('removes card from source column when moved to different column', () => {
        const result = computeMove(makeColumns(), 10, 2);
        const col1 = result!.newColumns.find(c => c.id === 1)!;
        // card 10 was in column 1, should be gone
        expect(col1.cards.map(c => c.id)).not.toContain(10);
        // other card (id 11) should still be there
        expect(col1.cards.map(c => c.id)).toContain(11);
    });

});