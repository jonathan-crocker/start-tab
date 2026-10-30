import * as React from 'react';
import { Bookmarks } from './bookmarks';
import { Clock } from './clock';
import { Settings, useSettings } from './settings';

export const App = () => {
    const settings = useSettings();

    return (
        <div className="container-fluid">
            <div className="row no-select">
                <div className="col brand d-flex align-items-center gap-3">
                    <span>Start Tab</span>
                    <Settings {...settings} />
                </div>
                <div className="col text-end">
                    {settings.showClock && <Clock />}
                </div>
            </div>
            <Bookmarks />
        </div>
    );
}
