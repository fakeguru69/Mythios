import {createRoot} from 'react-dom/client';
import OnlineApp from './online/OnlineApp.tsx';
import './index.css';

const root = createRoot(document.getElementById('root')!);

// Lets phones install the online game to the home screen (pwa/sw.js; built into the site's root).
const registerInstall = () => {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => undefined);
};

// Default to OnlineApp in all environments so the AI Studio preview loads the exact same code as Vercel production.
const query = new URLSearchParams(window.location.search);
if (query.has('demo')) {
  import('./App.tsx').then(({ default: App }) => root.render(<App />));
} else {
  registerInstall();
  root.render(<OnlineApp />);
}
