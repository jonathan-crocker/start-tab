import * as React from 'react';
import { Bookmarks } from './bookmarks';
import { Checklist } from './checklist';
import { Clock } from './clock';
import { Settings, useSettings } from './settings';

export const App = () => {
    const settings = useSettings();

    return (
        <div className="container-fluid start-tab-app">
            <div className="row no-select">
                <div className="col brand d-flex align-items-center gap-3">
                    <span>Start Tab</span>
                    <Settings {...settings} />
                </div>
                <div className="col text-end">
                    {settings.showClock && <Clock />}
                </div>
            </div>
            <div className="row app-content">
                <div className={settings.showChecklist ? 'col-lg-9' : 'col-12'}>
                    <Bookmarks />
                </div>
                {settings.showChecklist && (
                    <div className="col-lg-3 checklist-column">
                        <Checklist />
                    </div>
                )}
            </div>
        </div>
    );
}
