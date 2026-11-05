import * as React from 'react';
import { useState } from 'react';
import { useAppContext } from './contexts';

type MoveBookmark = (bookmarkId: string, destination: chrome.bookmarks.MoveDestination) => void;
type DropPosition = 'before' | 'after';
const bookmarkDataType = 'application/x-start-tab-bookmark';

interface FolderProps {
    folder: chrome.bookmarks.BookmarkTreeNode;
    siblingFolders: chrome.bookmarks.BookmarkTreeNode[];
    onMove: MoveBookmark;
    onMoveFolder: MoveBookmark;
}

const Folder = ({ folder, siblingFolders, onMove, onMoveFolder }: FolderProps) => {
    const [dropPosition, setDropPosition] = useState<DropPosition | null>(null);
    const [isDragging, setIsDragging] = useState(false);

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

    const getDropPosition = (event: React.DragEvent<HTMLHeadingElement>): DropPosition => {
        const bounds = event.currentTarget.getBoundingClientRect();
        return event.clientY > bounds.top + bounds.height / 2 ? 'after' : 'before';
    };

    const handleFolderDragStart = (event: React.DragEvent<HTMLHeadingElement>) => {
        event.dataTransfer.setData('application/x-start-tab-folder', folder.id);
        event.dataTransfer.effectAllowed = 'move';
        setIsDragging(true);
    };

    const handleFolderDragOver = (event: React.DragEvent<HTMLHeadingElement>) => {
        if (!event.dataTransfer.types.includes('application/x-start-tab-folder'))
            return;

        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = 'move';
        setDropPosition(getDropPosition(event));
    };

    const handleFolderDragLeave = (event: React.DragEvent<HTMLHeadingElement>) => {
        const relatedTarget = event.relatedTarget;
        if (!(relatedTarget instanceof Node) || !event.currentTarget.contains(relatedTarget))
            setDropPosition(null);
    };

    const handleFolderDrop = (event: React.DragEvent<HTMLHeadingElement>) => {
        const draggedFolderId = event.dataTransfer.getData('application/x-start-tab-folder');
        if (!draggedFolderId)
            return;

        event.preventDefault();
        event.stopPropagation();
        const position = getDropPosition(event);
        setDropPosition(null);

        if (draggedFolderId === folder.id || !folder.parentId)
            return;

        const index = (folder.index ?? 0) + (position === 'after' ? 1 : 0);
        onMoveFolder(draggedFolderId, { parentId: folder.parentId, index });
    };

    const handleFolderDragEnd = () => {
        setDropPosition(null);
        setIsDragging(false);
    };

    const handleFolderKeyDown = (event: React.KeyboardEvent<HTMLHeadingElement>) => {
        if (!event.altKey || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') || !folder.parentId)
            return;

        const siblings = siblingFolders
            .filter(sibling => sibling.parentId === folder.parentId)
            .sort((left, right) => (left.index ?? 0) - (right.index ?? 0));
        const currentIndex = siblings.findIndex(sibling => sibling.id === folder.id);
        const targetFolder = siblings[currentIndex + (event.key === 'ArrowUp' ? -1 : 1)];
        if (!targetFolder)
            return;

        event.preventDefault();
        const index = (targetFolder.index ?? 0) + (event.key === 'ArrowDown' ? 1 : 0);
        onMoveFolder(folder.id, { parentId: folder.parentId, index });
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
        <div
            className={`row mt-4 folder-panel${dropPosition ? ` folder-drop-${dropPosition}` : ''}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}>
            <div className="col-12">
                <div className="card shadow-sm">
                    <div className="card-body">
                        <h4
                            className={`card-title folder-title p-0 m-0${isDragging ? ' folder-dragging' : ''}`}
                            draggable
                            tabIndex={0}
                            aria-label={`${folder.title}. Drag to reorder this folder, or press Alt+ArrowUp or Alt+ArrowDown to move it among folders.`}
                            aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown"
                            onDragStart={handleFolderDragStart}
                            onDragEnd={handleFolderDragEnd}
                            onDragOver={handleFolderDragOver}
                            onDragLeave={handleFolderDragLeave}
                            onDrop={handleFolderDrop}
                            onKeyDown={handleFolderKeyDown}>
                            {folder.title}
                        </h4>
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
        event.dataTransfer.setData(bookmarkDataType, bookmark.id);
        event.dataTransfer.setData('text/plain', bookmark.id);
        event.dataTransfer.effectAllowed = 'move';
        setIsDragging(true);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        if (!event.dataTransfer.types.includes(bookmarkDataType))
            return;

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
        const draggedBookmarkId = event.dataTransfer.getData(bookmarkDataType);
        if (!draggedBookmarkId)
            return;

        event.preventDefault();
        event.stopPropagation();
        const dropPosition = getDropPosition(event);
        setDropPosition(null);

        if (draggedBookmarkId === bookmark.id || !bookmark.parentId)
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
    const bookmarkIds = new Set(bookmarks.flatMap(folder => (folder.children ?? [])
        .filter(bookmark => bookmark.url)
        .map(bookmark => bookmark.id)));
    const folderIds = new Set(bookmarks.map(folder => folder.id));

    const moveBookmark: MoveBookmark = (bookmarkId, destination) => {
        if (!bookmarkIds.has(bookmarkId))
            return;

        setMoveError(false);
        void chrome.bookmarks.move(bookmarkId, destination)
            .then(() => setMoveError(false))
            .catch(() => setMoveError(true));
    };

    const moveFolder: MoveBookmark = (folderId, destination) => {
        const folder = bookmarks.find(bookmark => bookmark.id === folderId);
        if (!folderIds.has(folderId) || !folder?.parentId || folder.parentId !== destination.parentId)
            return;

        setMoveError(false);
        void chrome.bookmarks.move(folderId, destination)
            .then(() => setMoveError(false))
            .catch(() => setMoveError(true));
    };

    return (
        <>
            {moveError && <div className="alert alert-danger" role="alert">Could not move that bookmark or folder. Please try again.</div>}
            {bookmarks.map(folder => (
                <Folder
                    key={folder.id}
                    folder={folder}
                    siblingFolders={bookmarks}
                    onMove={moveBookmark}
                    onMoveFolder={moveFolder} />
            ))}
        </>
    );
}
