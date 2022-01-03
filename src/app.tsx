import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Bookmarks } from './components/bookmarks';
import { Clock } from './components/clock';

const root = 'root';
const app = (
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

ReactDOM.render(app, document.getElementById(root));
