import {createRoot} from 'react-dom/client';
import OnlineApp from './online/OnlineApp.tsx';
import './index.css';

const root = createRoot(document.getElementById('root')!);

// The public website (VITE_ONLINE_ONLY=1, see vercel.json) holds only the online screens: the one-phone demo
// carries the whole season's text, the secret included, so it is left out of that build entirely.
if (import.meta.env.VITE_ONLINE_ONLY === '1') {
  root.render(<OnlineApp />);
} else {
  // Multiplayer (accounts, parties, Session Zero) opens with ?online=1 or an invite link (?join=CODE).
  // Everything else is the one-phone demo, as before.
  const query = new URLSearchParams(window.location.search);
  if (query.has('online') || query.has('join')) root.render(<OnlineApp />);
  else import('./App.tsx').then(({ default: App }) => root.render(<App />));
}
