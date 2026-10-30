import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './components/app';
import { AppContext } from './components/contexts';
import * as bootstrap from 'bootstrap'

bootstrap.Modal.Default.focus = true;

const rootId = 'app';
const container = document.getElementById(rootId);
const root = createRoot(container!);

root.render(<AppContext><App /></AppContext>);
