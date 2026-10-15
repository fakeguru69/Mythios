// Shared look for the online screens: the game's night palette and Cinzel headings.
import type { ReactNode } from 'react';

export const card = 'rounded-2xl bg-[#1E1232] border border-[#3A2555] p-4 space-y-3';
export const input =
  'w-full rounded-lg bg-[#130B1F] border border-[#3A2555] px-3 py-2 text-[15px] text-[#F4F1F8] placeholder-[#8B7A9E] focus:outline-none focus:border-[#D4B876]';
export const goldButton =
  'w-full rounded-lg bg-[#D4B876] hover:bg-[#E5C158] disabled:opacity-50 px-3 py-2.5 font-[Cinzel] font-bold text-[13px] text-[#130B1F] transition';
export const quietButton =
  'rounded-lg border border-[#3A2555] hover:border-[#D4B876] px-3 py-1.5 text-[13px] text-[#B7A9CC] transition';
export const heading = "font-['Cinzel'] font-bold text-[#E5C158]";
export const note = 'text-[13px] text-[#8B7A9E]';

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#130B1F] text-[#F4F1F8] font-sans">
      <div className="max-w-[440px] mx-auto px-4 py-6 space-y-4">
        <h1 className={`${heading} text-[22px] text-center`}>Tales of the Dark Moon</h1>
        {children}
      </div>
    </div>
  );
}

export function ErrorLine({ text }: { text: string | null }) {
  return text ? <p className="text-[13px] text-[#F08A8A]">{text}</p> : null;
}
