import { StoreProvider } from '@manga/stores';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@manga/ui-kit/styles.css';
import { App } from './App';
import { bootstrap, rootStore } from './store-bootstrap';

const el = document.getElementById('root');
if (!el) throw new Error('missing #root');

void bootstrap();
createRoot(el).render(
  <StrictMode>
    <StoreProvider store={rootStore}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StoreProvider>
  </StrictMode>,
);
