'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
    return (
        <div className="p-6 max-w-md mx-auto">
            <div className="bg-card border border-red-500/30 rounded-2xl p-6 space-y-3">
                <h2 className="text-lg font-semibold text-red-400">Something went wrong</h2>
                <p className="text-sm text-muted">{error.message || 'An unexpected error occurred.'}</p>
                <button onClick={reset} className="text-sm px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-xl transition-colors cursor-pointer">
                    Try again
                </button>
            </div>
        </div>
    );
}
