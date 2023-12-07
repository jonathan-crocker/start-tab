import * as React from 'react';
import { useState, useEffect } from 'react';
import { useAppContext } from './contexts';

interface FolderProps {
    folder: chrome.bookmarks.BookmarkTreeNode;
}

const Folder = ({ folder }: FolderProps) => {

    const bookmarks = folder.children!.filter(bookmark => bookmark.url).map(bookmark => <Bookmark bookmark={bookmark} />)

    return (
        <div className="row mt-4">
            <div className="col-12">
                <div className="card shadow-sm">
                    <div className="card-body">
                        <h4 className="card-title p-0 m-0">{folder.title}</h4>
                    </div>
                    <div className="row px-3 pb-3">
                        {bookmarks}
                    </div>
                </div>
            </div>
        </div>
    );
}

interface BookmarkProps {
    bookmark: chrome.bookmarks.BookmarkTreeNode;
}

const Bookmark = ({ bookmark }: BookmarkProps) => {

    const favIcon = `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(bookmark.url!)}&size=16`;

    return (
        <div className="col-lg-2 col-md-3 col-sm-6 col-xs-12 pt-3">
            <div className="text-truncate">
                <a className="text-nowrap favlink" href={bookmark.url} title={bookmark.title}><img className="favicon" src={favIcon} alt="" />&nbsp;&nbsp;&nbsp;{bookmark.title}</a>
            </div>
        </div>
    );
}

export const Bookmarks = () => {

    const {bookmarks} = useAppContext();
    const [folders, setFolders] = useState<JSX.Element[]>();

    console.log('bookmarks re-rendered');

    useEffect(() => {
        setFolders(bookmarks.map(folder => <Folder folder={folder} />));
    }, [bookmarks]);

    return (
        <>{folders}</>
    );
}
