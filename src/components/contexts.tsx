import { DateTime } from 'luxon';
import * as React from 'react';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

const flatternTree = (bookmarks: chrome.bookmarks.BookmarkTreeNode[]) => {

    let result = [] as chrome.bookmarks.BookmarkTreeNode[];

    for (const bookmark of bookmarks) {

        if (bookmark.children && bookmark.children.length > 0) {
            
            if (bookmark.children.some(child => child.url))
                result = [...result, bookmark];

            result = [...result, ...flatternTree(bookmark.children)];
        }
    }

    return result;
}

interface AppContextState {
    now: DateTime;
    bookmarks: chrome.bookmarks.BookmarkTreeNode[];
}

const appContext = createContext<AppContextState | null>(null);

export const useAppContext = () => useContext(appContext) as AppContextState;

interface AppContextProps {
    children?: ReactNode
}

export const AppContext = ({children = null}: AppContextProps) => {

    const [now, setNow] = useState(DateTime.local());
    const [bookmarks, setBookmarks] = useState<chrome.bookmarks.BookmarkTreeNode[]>([]);



    useEffect(() => chrome.bookmarks.getTree(tree => setBookmarks(flatternTree(tree))), []);

    return (
        <appContext.Provider value={{now: now, bookmarks: bookmarks}}>
            {children}
        </appContext.Provider>
    );
}
