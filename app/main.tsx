import React from 'react';
import {createRoot} from 'react-dom/client';
import {AuthGate} from './auth-gate';
createRoot(document.getElementById('root')!).render(<AuthGate/>);
