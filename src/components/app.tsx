import * as React from 'react';
import { Bookmarks } from './bookmarks';
import { Clock } from './clock';

export const App = () => {

    return (
        <div className="container-fluid">
            <div className="row no-select">
                <div className="col brand">
                    <span>Start Tab</span>
                </div>
                <div className="col text-end">
                    <Clock />
                </div>
            </div>
            <Bookmarks />
        </div>
    );
}
