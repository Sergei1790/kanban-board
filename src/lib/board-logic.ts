type Card = {id:number; title: string; order: number; columnId: number};
type Column = {id: number; title: string; order: number; cards: Card[]};

export function computeMove(
    columns: Column[],
    cardId: number,
    overId: number
) : {newColumns: Column[]; newColumnId: number} | null{
    const overColumn = columns.find(col => col.id === overId);
    const overCard = columns.flatMap(col => col.cards).find(c => c.id === overId);

    const newColumnId = overColumn?.id ?? overCard?.columnId;
    if(!newColumnId) return null;

    const card = columns.flatMap(col => col.cards).find(c => c.id === cardId);
    if(!card) return null;

    const newColumns = columns.map(col => {
        if(col.id === newColumnId){
            return{
                ...col,
                cards: [...col.cards.filter(c => c.id !== cardId), { ...card, columnId: newColumnId }],
            }
        }
        return { ...col, cards: col.cards.filter(c => c.id !== cardId) };
    })

    return { newColumns, newColumnId };
};