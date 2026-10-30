import * as React from 'react';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

const flattenTree = (bookmarks: chrome.bookmarks.BookmarkTreeNode[]) => {

    let result = [] as chrome.bookmarks.BookmarkTreeNode[];

    for (const bookmark of bookmarks) {

        if (bookmark.children && bookmark.children.length > 0) {
            
            if (bookmark.children.some(child => child.url))
                result = [...result, bookmark];

            result = [...result, ...flattenTree(bookmark.children)];
        }
    }

    return result;
}

interface AppContextState {
    bookmarks: chrome.bookmarks.BookmarkTreeNode[];
}

const appContext = createContext<AppContextState | null>(null);

export const useAppContext = (): AppContextState => {
    const context = useContext(appContext);
    if (!context)
        throw new Error('useAppContext must be used within an AppContext provider.');

    return context;
}

interface AppContextProps {
    children?: ReactNode
}

export const AppContext = ({children = null}: AppContextProps) => {

    const [bookmarks, setBookmarks] = useState<chrome.bookmarks.BookmarkTreeNode[]>([]);

    useEffect(() => {
        let latestRequest = 0;

        const refreshBookmarks = () => {
            const request = ++latestRequest;

            chrome.bookmarks.getTree(tree => {
                if (request === latestRequest)
                    setBookmarks(flattenTree(tree));
            });
        };

        chrome.bookmarks.onCreated.addListener(refreshBookmarks);
        chrome.bookmarks.onRemoved.addListener(refreshBookmarks);
        chrome.bookmarks.onChanged.addListener(refreshBookmarks);
        chrome.bookmarks.onMoved.addListener(refreshBookmarks);
        chrome.bookmarks.onChildrenReordered.addListener(refreshBookmarks);
        chrome.bookmarks.onImportEnded.addListener(refreshBookmarks);

        refreshBookmarks();

        return () => {
            latestRequest++;
            chrome.bookmarks.onCreated.removeListener(refreshBookmarks);
            chrome.bookmarks.onRemoved.removeListener(refreshBookmarks);
            chrome.bookmarks.onChanged.removeListener(refreshBookmarks);
            chrome.bookmarks.onMoved.removeListener(refreshBookmarks);
            chrome.bookmarks.onChildrenReordered.removeListener(refreshBookmarks);
            chrome.bookmarks.onImportEnded.removeListener(refreshBookmarks);
        };
    }, []);

    return (
        <appContext.Provider value={{bookmarks}}>
            {children}
        </appContext.Provider>
    );
}
