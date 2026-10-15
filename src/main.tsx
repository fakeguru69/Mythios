import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import OnlineApp from './online/OnlineApp.tsx';
import './index.css';

// Multiplayer (step 1: accounts and parties) opens with ?online=1 or an invite link (?join=CODE).
// Everything else is the one-phone demo, as before.
const query = new URLSearchParams(window.location.search);
const online = query.has('online') || query.has('join');

createRoot(document.getElementById('root')!).render(online ? <OnlineApp /> : <App />);
