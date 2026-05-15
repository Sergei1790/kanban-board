import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { BoardList } from './BoardList';

vi.mock('@/lib/actions', () => ({
    createBoard: vi.fn(),
    deleteBoard: vi.fn(),
}));

const mockBoards = [
    { id: 1, title: 'Work', createdAt: new Date() },
    { id: 2, title: 'Personal', createdAt: new Date()},
];

describe('BoardList', () => {
    it('shows empty state when no boards', () => {
        render(<BoardList boards={[]} />);
        expect(screen.getByText(/no boards yet/i)).toBeInTheDocument();
    });

    it('renders board titles when boards exist', () => {
        render(<BoardList boards={mockBoards} />);
        expect(screen.getByText('Work')).toBeInTheDocument();
        expect(screen.getByText('Personal')).toBeInTheDocument();
    });

    it('disables Create button when input is empty', () => {
        render(<BoardList boards={[]} />);
        expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();
    });

    it('enables Create button when input has text', async () => {
        const user = userEvent.setup();
        render(<BoardList boards={[]} />);

        await user.type(screen.getByPlaceholderText(/new board name/i), 'Project X');
        expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled();
    });

    it('asks for confirmation when Delete is clicked', async () => {
        const user = userEvent.setup();
        render(<BoardList boards={mockBoards} />);

        const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
        await user.click(deleteButtons[0]);   // delete first board

        expect(screen.getByText('Delete?')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
    });

    it('cancels confirmation when No is clicked', async () => {
        const user = userEvent.setup();
        render(<BoardList boards={mockBoards} />);

        const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
        await user.click(deleteButtons[0]);
        expect(screen.getByText('Delete?')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'No' }));
        expect(screen.queryByText('Delete?')).not.toBeInTheDocument();
    });

    it('calls deleteBoard with id when Yes is confirmed', async () => {
        const user = userEvent.setup();
        const { deleteBoard } = await import('@/lib/actions');
        render(<BoardList boards={mockBoards} />);

        const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
        await user.click(deleteButtons[0]);
        await user.click(screen.getByRole('button', { name: 'Yes' }));

        expect(deleteBoard).toHaveBeenCalledWith(mockBoards[0].id);
    });
});