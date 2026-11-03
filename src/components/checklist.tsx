import * as React from 'react';
import { useState } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';

const checklistKey = 'start-tab.checklist';
const maxItemLength = 200;

interface ChecklistItem {
    id: string;
    text: string;
    done: boolean;
}

type DropPosition = 'before' | 'after';

const isChecklistItem = (value: unknown): value is ChecklistItem => {
    if (typeof value !== 'object' || value === null)
        return false;

    const item = value as Record<string, unknown>;
    return typeof item.id === 'string'
        && typeof item.text === 'string'
        && item.text.trim().length > 0
        && item.text.length <= maxItemLength
        && typeof item.done === 'boolean';
};

// Returns the saved items, or an empty list when storage is missing, invalid, or unavailable.
const readItems = (): ChecklistItem[] => {
    try {
        const saved = window.localStorage.getItem(checklistKey);
        const parsed: unknown = saved ? JSON.parse(saved) : [];
        return Array.isArray(parsed) ? parsed.filter(isChecklistItem) : [];
    } catch {
        return [];
    }
};

const useChecklist = () => {
    const [items, setItems] = useState(readItems);

    // Browsers fire "storage" in other pages of this extension when the list changes there, so re-read it here.
    React.useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.storageArea === window.localStorage && (event.key === null || event.key === checklistKey))
                setItems(readItems());
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    React.useEffect(() => {
        try {
            window.localStorage.setItem(checklistKey, JSON.stringify(items));
        } catch {
            // Keep the list active for this page even if persistent storage is unavailable.
        }
    }, [items]);

    const addItem = (text: string) =>
        setItems(current => [{ id: crypto.randomUUID(), text, done: false }, ...current]);

    const toggleItem = (id: string) =>
        setItems(current => current.map(item => item.id === id ? { ...item, done: !item.done } : item));

    const removeItem = (id: string) =>
        setItems(current => current.filter(item => item.id !== id));

    const moveItem = (sourceId: string, targetId: string, position: DropPosition) => {
        setItems(current => {
            if (sourceId === targetId)
                return current;

            const sourceIndex = current.findIndex(item => item.id === sourceId);
            const targetIndex = current.findIndex(item => item.id === targetId);
            if (sourceIndex < 0 || targetIndex < 0)
                return current;

            const reordered = [...current];
            const [item] = reordered.splice(sourceIndex, 1);
            const adjustedTargetIndex = reordered.findIndex(candidate => candidate.id === targetId);
            reordered.splice(adjustedTargetIndex + (position === 'after' ? 1 : 0), 0, item);
            return reordered;
        });
    };

    return { items, addItem, toggleItem, removeItem, moveItem };
};

interface ChecklistItemRowProps {
    item: ChecklistItem;
    previousItemId?: string;
    nextItemId?: string;
    onToggle: (id: string) => void;
    onRemove: (id: string) => void;
    onMove: (sourceId: string, targetId: string, position: DropPosition) => void;
}

const ChecklistItemRow = ({ item, previousItemId, nextItemId, onToggle, onRemove, onMove }: ChecklistItemRowProps) => {
    const [dropPosition, setDropPosition] = useState<DropPosition | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const getDropPosition = (event: React.DragEvent<HTMLLIElement>): DropPosition => {
        const bounds = event.currentTarget.getBoundingClientRect();
        return event.clientY > bounds.top + bounds.height / 2 ? 'after' : 'before';
    };

    const handleDragStart = (event: React.DragEvent<HTMLLIElement>) => {
        event.dataTransfer.setData('text/plain', item.id);
        event.dataTransfer.effectAllowed = 'move';
        setIsDragging(true);
    };

    const handleDragOver = (event: React.DragEvent<HTMLLIElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        setDropPosition(getDropPosition(event));
    };

    const handleDragLeave = (event: React.DragEvent<HTMLLIElement>) => {
        const relatedTarget = event.relatedTarget;
        if (!(relatedTarget instanceof Node) || !event.currentTarget.contains(relatedTarget))
            setDropPosition(null);
    };

    const handleDrop = (event: React.DragEvent<HTMLLIElement>) => {
        event.preventDefault();
        const position = getDropPosition(event);
        const sourceId = event.dataTransfer.getData('text/plain');
        setDropPosition(null);

        if (sourceId)
            onMove(sourceId, item.id, position);
    };

    const handleDragEnd = () => {
        setDropPosition(null);
        setIsDragging(false);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLLIElement>) => {
        if (!event.altKey || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown'))
            return;

        const targetId = event.key === 'ArrowUp' ? previousItemId : nextItemId;
        if (!targetId)
            return;

        event.preventDefault();
        onMove(item.id, targetId, event.key === 'ArrowUp' ? 'before' : 'after');
    };

    return (
        <li
            className={`checklist-item${item.done ? ' done' : ''}${dropPosition ? ` checklist-drop-${dropPosition}` : ''}${isDragging ? ' checklist-dragging' : ''}`}
            draggable
            tabIndex={0}
            aria-label={`${item.text}. Drag to reorder; press Alt+ArrowUp or Alt+ArrowDown to move.`}
            aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown"
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onKeyDown={handleKeyDown}>
            <input
                className="form-check-input checklist-check"
                type="checkbox"
                id={`checklist-${item.id}`}
                checked={item.done}
                onChange={() => onToggle(item.id)} />
            <label className="checklist-text" htmlFor={`checklist-${item.id}`}>{item.text}</label>
            <button
                className="checklist-button"
                type="button"
                aria-label={`Remove ${item.text}`}
                title="Remove"
                onClick={() => onRemove(item.id)}>
                <FiX aria-hidden="true" size={16} />
            </button>
        </li>
    );
};

export const Checklist = () => {
    const { items, addItem, toggleItem, removeItem, moveItem } = useChecklist();
    const [draft, setDraft] = useState('');
    const completed = items.filter(item => item.done).length;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const text = draft.trim();
        if (!text || text.length > maxItemLength)
            return;

        addItem(text);
        setDraft('');
    };

    return (
        <div className="card shadow-sm checklist mt-4">
            <div className="card-body pb-2">
                <div className="d-flex align-items-baseline justify-content-between gap-2">
                    <h4 className="card-title p-0 m-0">Checklist</h4>
                    <span className="small text-muted">{completed} of {items.length} done</span>
                </div>
                <form className="checklist-form mt-2" onSubmit={handleSubmit}>
                    <label className="visually-hidden" htmlFor="checklistNewItem">New checklist item</label>
                    <input
                        className="form-control form-control-sm checklist-input"
                        type="text"
                        id="checklistNewItem"
                        placeholder="Add an item"
                        maxLength={maxItemLength}
                        autoComplete="off"
                        value={draft}
                        onChange={event => setDraft(event.currentTarget.value)} />
                    <button
                        className="checklist-button"
                        type="submit"
                        aria-label="Add item"
                        title="Add item"
                        disabled={!draft.trim()}>
                        <FiPlus aria-hidden="true" size={18} />
                    </button>
                </form>
            </div>
            <div className="checklist-content px-3 pb-3">
                {items.length === 0
                    ? <div className="small text-muted mt-3">Nothing to do yet.</div>
                    : (
                        <ul className="checklist-items list-unstyled mb-0 mt-2">
                            {items.map((item, index) => (
                                <ChecklistItemRow
                                    key={item.id}
                                    item={item}
                                    previousItemId={items[index - 1]?.id}
                                    nextItemId={items[index + 1]?.id}
                                    onToggle={toggleItem}
                                    onRemove={removeItem}
                                    onMove={moveItem} />
                            ))}
                        </ul>
                    )}
            </div>
        </div>
    );
}
