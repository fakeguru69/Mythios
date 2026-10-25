// Shared look for the online screens: the game's night palette and Cinzel headings.
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export const card = 'rounded-2xl bg-[#1E1232] border border-[#3A2555] p-4 space-y-3';
export const input =
  'w-full rounded-lg bg-[#130B1F] border border-[#3A2555] px-3 py-2 text-[16px] text-[#F4F1F8] placeholder-[#8B7A9E] focus:outline-none focus:border-[#D4B876]';
export const goldButton =
  'w-full rounded-lg bg-[#D4B876] hover:bg-[#E5C158] disabled:opacity-50 px-3 py-2.5 font-sans font-semibold text-[15px] text-[#130B1F] transition';
export const quietButton =
  'rounded-lg border border-[#3A2555] hover:border-[#D4B876] px-3 py-1.5 text-[14px] text-[#B7A9CC] transition';
export const heading = "font-['Cinzel'] font-bold text-[#E5C158]";
export const note = 'text-[14px] text-[#9A8AAE]';

// The game shell (docs/design/one-thread-18oct.md) brings its own top bar, so while it shows, the page drops the
// MYTHIOS title and its padding (useBareShell).
const BareContext = createContext<(bare: boolean) => void>(() => undefined);
export function useBareShell() {
  const setBare = useContext(BareContext);
  useEffect(() => {
    setBare(true);
    return () => setBare(false);
  }, [setBare]);
}

export function Shell({ children }: { children: ReactNode }) {
  const [bare, setBare] = useState(false);
  return (
    <BareContext.Provider value={setBare}>
      <div className="min-h-screen bg-[#130B1F] text-[#F4F1F8] font-sans">
        {/* One tree either way (only the classes and the title change), so switching never remounts the screens. */}
        <div className={bare ? 'max-w-[440px] mx-auto' : 'max-w-[440px] mx-auto px-4 py-6 space-y-4'}>
          {!bare && <h1 className={`${heading} text-[24px] text-center tracking-[3px]`}>MYTHIOS</h1>}
          {children}
        </div>
      </div>
    </BareContext.Provider>
  );
}

export function ErrorLine({ text }: { text: string | null }) {
  return text ? <p className="text-[14px] text-[#F08A8A]">{text}</p> : null;
}
