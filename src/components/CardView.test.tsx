import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import CardView from './CardView';

// Mock dnd-kit because useSortable needs SortableContext we're not providing
vi.mock('@dnd-ki/sortable', () => ({
    useSortable: () => ({
        attributes: {},
        listeners: {},
        setNodeRef: vi.fn(),
        transform: null,
        transition: null,
        isDragging: false,
    })
}));

vi.mock('@/lib/actions', () => ({
    deleteCard: vi.fn(),
}));

const mockCard = { id: 1, title: 'Buy milk', order: 0, columnId: 10 };

describe('CardView', () => {
    it('renders card title', () => {
        render(<CardView card={mockCard} boardId={5} />);
        expect(screen.getByText('Buy milk')).toBeInTheDocument();
    });

    it('renders delete button', () => {
        render(<CardView card={mockCard} boardId={5} />);
        expect(screen.getByRole('button', { name: '✕' })).toBeInTheDocument();
    });

    it('calls deleteCard with correct ids when delete is clicked', async () => {
        const user = userEvent.setup();
        const { deleteCard } = await import('@/lib/actions');
        render(<CardView card={mockCard} boardId={5} />);

        await user.click(screen.getByRole('button', { name: '✕' }));

        expect(deleteCard).toHaveBeenCalledWith(mockCard.id, 5);
    });
});