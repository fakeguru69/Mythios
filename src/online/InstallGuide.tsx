// How to put the game on the home screen, for iPhone and for Android (Fake Guru, 16 Oct).
// Hidden once the game is opened from the home screen. Notifications are added here when they are built.
import { useEffect, useState } from 'react';
import { card, goldButton, heading, note, quietButton } from './ui';

type InstallEvent = Event & { prompt: () => Promise<void> };

const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
const isIPhone = () => /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isAndroid = () => /Android/i.test(navigator.userAgent);

const HIDE_KEY = 'mythios_install_guide_hidden';

export default function InstallGuide({ always = false }: { always?: boolean }) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(HIDE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  const [platform, setPlatform] = useState<'iphone' | 'android'>(isIPhone() ? 'iphone' : 'android');

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as InstallEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  if (isStandalone()) return null;
  if (hidden && !always) return null;

  return (
    <div className={card}>
      <h3 className={`${heading} text-[15px]`}>Put Mythios on your home screen</h3>
      <p className="text-[14px]">It opens like an app, one tap a day.</p>
      {installEvent && isAndroid() && (
        <button className={goldButton} onClick={() => installEvent.prompt().catch(() => undefined)}>
          INSTALL
        </button>
      )}
      {!open ? (
        <button className={quietButton} onClick={() => setOpen(true)}>
          SHOW ME HOW
        </button>
      ) : (
        <>
          <div className="flex gap-2">
            <button className={`${quietButton} ${platform === 'iphone' ? 'border-[#D4B876] text-[#E5C158]' : ''}`} onClick={() => setPlatform('iphone')}>
              iPhone
            </button>
            <button className={`${quietButton} ${platform === 'android' ? 'border-[#D4B876] text-[#E5C158]' : ''}`} onClick={() => setPlatform('android')}>
              Android
            </button>
          </div>
          {platform === 'iphone' ? (
            <ol className="list-decimal pl-5 space-y-1 text-[14px]">
              <li>Open this page in <b>Safari</b>.</li>
              <li>
                Tap the <b>Share</b> button (the square with an arrow pointing up), at the bottom of the screen.
              </li>
              <li>
                Scroll down and tap <b>Add to Home Screen</b>, then <b>Add</b>.
              </li>
              <li>
                Open <b>Mythios</b> from your home screen and sign in once.
              </li>
            </ol>
          ) : (
            <ol className="list-decimal pl-5 space-y-1 text-[14px]">
              <li>Open this page in <b>Chrome</b>.</li>
              <li>
                Tap the menu <b>⋮</b> at the top right.
              </li>
              <li>
                Tap <b>Install app</b> or <b>Add to Home screen</b>, then <b>Install</b>.
              </li>
              <li>
                Open <b>Mythios</b> from your home screen and sign in once.
              </li>
            </ol>
          )}
        </>
      )}
      {!always && (
        <button
          className={`${note} underline`}
          onClick={() => {
            try {
              localStorage.setItem(HIDE_KEY, '1');
            } catch {
              /* private window: hide for now only */
            }
            setHidden(true);
          }}
        >
          NOT NOW
        </button>
      )}
    </div>
  );
}
