import * as React from 'react';
import { useState } from 'react';
import { useAppContext } from './contexts';

type MoveBookmark = (bookmarkId: string, destination: chrome.bookmarks.MoveDestination) => void;

interface FolderProps {
    folder: chrome.bookmarks.BookmarkTreeNode;
    onMove: MoveBookmark;
}

const Folder = ({ folder, onMove }: FolderProps) => {
    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const bookmarkId = event.dataTransfer.getData('text/plain');

        if (bookmarkId)
            onMove(bookmarkId, { parentId: folder.id, index: folder.children?.length ?? 0 });
    };

    const bookmarks = (folder.children ?? [])
        .filter(bookmark => bookmark.url)
        .map(bookmark => (
            <Bookmark
                key={bookmark.id}
                bookmark={bookmark}
                siblingCount={folder.children?.length ?? 0}
                onMove={onMove} />
        ));

    return (
        <div className="row mt-4" onDragOver={handleDragOver} onDrop={handleDrop}>
            <div className="col-12">
                <div className="card shadow-sm">
                    <div className="card-body">
                        <h4 className="card-title p-0 m-0">{folder.title}</h4>
                    </div>
                    <div className="bookmark-grid px-3 pb-3">
                        {bookmarks}
                    </div>
                </div>
            </div>
        </div>
    );
}

interface BookmarkProps {
    bookmark: chrome.bookmarks.BookmarkTreeNode;
    siblingCount: number;
    onMove: MoveBookmark;
}

const Bookmark = ({ bookmark, siblingCount, onMove }: BookmarkProps) => {
    const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const getDropPosition = (event: React.DragEvent<HTMLDivElement>) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        return event.clientX > bounds.left + bounds.width / 2 ? 'after' : 'before';
    };

    const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
        event.dataTransfer.setData('text/plain', bookmark.id);
        event.dataTransfer.effectAllowed = 'move';
        setIsDragging(true);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = 'move';
        setDropPosition(getDropPosition(event));
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        const relatedTarget = event.relatedTarget;
        if (!(relatedTarget instanceof Node) || !event.currentTarget.contains(relatedTarget))
            setDropPosition(null);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const dropPosition = getDropPosition(event);
        setDropPosition(null);

        const draggedBookmarkId = event.dataTransfer.getData('text/plain');
        if (!draggedBookmarkId || draggedBookmarkId === bookmark.id || !bookmark.parentId)
            return;

        const index = (bookmark.index ?? 0) + (dropPosition === 'after' ? 1 : 0);
        onMove(draggedBookmarkId, { parentId: bookmark.parentId, index });
    };

    const handleDragEnd = () => {
        setDropPosition(null);
        setIsDragging(false);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (!event.altKey || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') || !bookmark.parentId)
            return;

        event.preventDefault();
        const currentIndex = bookmark.index ?? 0;
        const targetIndex = event.key === 'ArrowUp' ? 0 : Math.max(0, siblingCount - 1);
        if (targetIndex !== currentIndex) {
            const destinationIndex = event.key === 'ArrowUp' ? targetIndex : siblingCount;
            onMove(bookmark.id, { parentId: bookmark.parentId, index: destinationIndex });
        }
    };

    const favIcon = `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(bookmark.url!)}&size=64`;

    return (
        <div
            className={`bookmark-item${dropPosition ? ` bookmark-drop-${dropPosition}` : ''}${isDragging ? ' bookmark-dragging' : ''}`}
            draggable
            tabIndex={0}
            aria-label={`${bookmark.title}. Drag to reorder or move to another folder; press Alt+ArrowUp or Alt+ArrowDown to move to the start or end of this folder.`}
            aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown"
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onKeyDown={handleKeyDown}>
            <a className="favlink bookmark-link" href={bookmark.url} title={bookmark.title}>
                <img className="favicon" src={favIcon} alt="" />
                <span className="bookmark-title">{bookmark.title}</span>
            </a>
        </div>
    );
}

export const Bookmarks = () => {

    const {bookmarks} = useAppContext();
    const [moveError, setMoveError] = useState(false);
    const bookmarkIds = new Set(
        bookmarks.flatMap(folder => (folder.children ?? [])
            .filter(bookmark => bookmark.url)
            .map(bookmark => bookmark.id))
    );

    const moveBookmark: MoveBookmark = (bookmarkId, destination) => {
        if (!bookmarkIds.has(bookmarkId))
            return;

        setMoveError(false);
        void chrome.bookmarks.move(bookmarkId, destination)
            .then(() => setMoveError(false))
            .catch(() => setMoveError(true));
    };

    return (
        <>
            {moveError && <div className="alert alert-danger" role="alert">Could not move that bookmark. Please try again.</div>}
            {bookmarks.map(folder => <Folder key={folder.id} folder={folder} onMove={moveBookmark} />)}
        </>
    );
}
