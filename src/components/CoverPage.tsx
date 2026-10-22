import React from 'react';
import { useBareShell } from '../online/ui';

export interface CoverPageProps {
  onGatherFriends: () => void;
  onSignIn: () => void;
}

/**
 * The Cover Page (Piece C7): One screen (no scrolling at iPhone 13 mini size).
 * Displays trailer-like exciting MYTHIOS presentation and the featured dark fantasy series.
 */
export const CoverPage: React.FC<CoverPageProps> = ({ onGatherFriends, onSignIn }) => {
  useBareShell();

  return (
    <div
      className="w-full max-w-[420px] mx-auto h-[100dvh] max-h-[100dvh] flex flex-col justify-between p-4.5 bg-gradient-to-b from-[#140A24] via-[#0D0618] to-[#07020E] text-[#F4F1F8] select-none box-border relative overflow-hidden"
      data-cover-page
    >
      {/* Ambient background atmosphere glow */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-[#E5C158]/10 blur-[90px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-28 right-0 w-72 h-72 rounded-full bg-[#7E42D9]/15 blur-[80px]"
        aria-hidden="true"
      />

      {/* Top Header & Trailer-Like Teaser */}
      <header className="space-y-1.5 text-center pt-1.5 relative z-10">
        <div className="flex items-center justify-center gap-2 text-[10.5px] font-['Cinzel'] font-bold tracking-[2.5px] text-[#D4B876]/80 uppercase">
          <span className="w-5 h-[1px] bg-[#D4B876]/40" />
          <span>EMBARK ON AN ADVENTURE</span>
          <span className="w-5 h-[1px] bg-[#D4B876]/40" />
        </div>
        <h1 className="font-['Cinzel'] font-black text-[36px] tracking-[4px] text-transparent bg-clip-text bg-gradient-to-b from-[#FFF2B8] via-[#E5C158] to-[#B38C26] uppercase drop-shadow-[0_2px_12px_rgba(229,193,88,0.35)] leading-none py-1">
          MYTHIOS
        </h1>
        <p className="font-['Cormorant_Garamond',serif] italic text-[17.5px] leading-[1.3] text-[#E0D8ED] max-w-[320px] mx-auto">
          A story told a little each day to you and your friends.
        </p>
        <p className="font-sans text-[12.5px] text-[#A695C2] max-w-[290px] mx-auto leading-tight">
          One party. 10 minutes a day. A living dark fantasy told directly to your group.
        </p>
      </header>

      {/* Featured Series Hero Stone Card */}
      <section
        className="rounded-2xl bg-gradient-to-b from-[#1C112E]/95 via-[#160D25]/95 to-[#10071C]/98 border border-[#D4B876]/35 p-4 space-y-2.5 shadow-[0_12px_36px_rgba(0,0,0,0.65)] relative z-10 my-auto"
        data-featured-series
      >
        <div className="flex items-center justify-between">
          <span className="font-['Cinzel'] font-bold text-[11px] tracking-[2px] text-[#E5C158] uppercase flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#E5C158] animate-pulse" />
            FEATURED SERIES
          </span>
          <span className="text-[11px] font-['Cinzel'] font-semibold tracking-[1px] text-[#A695C2]">
            Season 1
          </span>
        </div>

        <div className="space-y-1">
          <h2 className="font-['Cinzel'] font-bold text-[21px] tracking-[0.5px] text-[#FDFBFE] leading-[1.2]">
            TALES OF THE DARK MOON
          </h2>
          <p className="font-['Cormorant_Garamond',serif] italic text-[16.5px] leading-[1.35] text-[#F0E8C8]">
            “In the hill villages, children are going missing, and nobody is looking for them.”
          </p>
        </div>

        <p className="font-sans text-[13px] leading-[1.4] text-[#C4B7D9]">
          Unravel an ancient ritual across thirty-six days of exploration, dice challenges, and campfire revelations.
        </p>

        {/* Clean Metadata Strip (Anti-slop, unboxed with separators) */}
        <div className="flex items-center justify-between pt-1 border-t border-[#3A2555]/60 text-[12px] font-['Cinzel'] font-semibold text-[#C39BF5]">
          <span>6 weeks</span>
          <span aria-hidden="true" className="text-[#5E4585]">·</span>
          <span>2 to 6 friends</span>
          <span aria-hidden="true" className="text-[#5E4585]">·</span>
          <span>Daily chapters</span>
        </div>
      </section>

      {/* Actions Section */}
      <footer className="space-y-2.5 pb-1 relative z-10">
        <button
          type="button"
          data-button-gather
          onClick={onGatherFriends}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#D4B876] via-[#F2D68C] to-[#C7A356] hover:brightness-110 active:scale-[0.985] text-[#160B24] font-['Cinzel'] font-bold text-[16px] tracking-[1.5px] uppercase transition shadow-[0_4px_20px_rgba(212,184,118,0.35)] flex items-center justify-center gap-2"
        >
          <span>Gather your friends</span>
          <span aria-hidden="true">→</span>
        </button>
        <button
          type="button"
          data-button-signin
          onClick={onSignIn}
          className="w-full py-2 px-3 text-[14.5px] text-[#A695C2] hover:text-[#F4F1F8] font-sans transition text-center underline decoration-[#5E4585] underline-offset-4"
        >
          Already playing? Sign in
        </button>
      </footer>
    </div>
  );
};

export default CoverPage;
