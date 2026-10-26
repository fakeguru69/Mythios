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
      className="w-full max-w-[420px] mx-auto h-[100dvh] max-h-[100dvh] flex flex-col justify-between gap-3 p-4.5 bg-gradient-to-b from-[#140A24] via-[#0D0618] to-[#07020E] text-[#F4F1F8] select-none box-border relative overflow-hidden"
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
      {/* The brand lockup (26 Oct, Fake Guru: "the top part is quite ugly"): the crescent from the app icon, the wordmark,
          and the tagline set small between two rules, the way a title page sets it. */}
      <header className="text-center pt-5 [@media(max-height:700px)]:pt-1 relative z-10" data-cover-brand>
        <svg viewBox="0 0 64 64" className="w-12 h-12 [@media(max-height:700px)]:w-9 [@media(max-height:700px)]:h-9 mx-auto drop-shadow-[0_0_14px_rgba(229,193,88,0.45)]" aria-hidden="true">
          <defs>
            <linearGradient id="cover-moon" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFF2B8" />
              <stop offset="55%" stopColor="#E5C158" />
              <stop offset="100%" stopColor="#B38C26" />
            </linearGradient>
          </defs>
          <path d="M40 6a26 26 0 1 0 18 44A22 22 0 0 1 40 6z" fill="url(#cover-moon)" />
        </svg>
        <h1 className="mt-2 font-['Cinzel'] font-black text-[38px] [@media(max-height:700px)]:text-[32px] tracking-[6px] pl-[6px] text-transparent bg-clip-text bg-gradient-to-b from-[#FFF2B8] via-[#E5C158] to-[#B38C26] uppercase leading-none">
          Mythios
        </h1>
        <div className="mt-3 flex items-center justify-center gap-2.5">
          <span className="h-px w-6 shrink-0 bg-gradient-to-r from-transparent to-[#D4B876]/60" />
          <span className="whitespace-nowrap font-['Cinzel'] font-bold text-[11.5px] tracking-[1.6px] uppercase text-[#D4B876]">The adventure is in the story</span>
          <span className="h-px w-6 shrink-0 bg-gradient-to-l from-transparent to-[#D4B876]/60" />
        </div>
      </header>

      {/* The night sky the story begins under: a few faint stars, and the welcome in the storybook serif. */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-2" data-cover-welcome>
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {[
            [12, 18, 2], [26, 62, 1.5], [44, 12, 1.5], [70, 30, 2], [86, 58, 1.5], [58, 78, 1], [18, 84, 1], [92, 14, 1],
          ].map(([x, y, s], i) => (
            <span
              key={i}
              className="absolute rounded-full bg-[#F4ECD0]"
              style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, opacity: 0.35 + (i % 3) * 0.15 }}
            />
          ))}
        </div>
        <p className="font-['Cormorant_Garamond',serif] italic text-[21px] [@media(max-height:700px)]:text-[18px] leading-[1.35] text-[#ECE4F6] text-center text-balance max-w-[310px]">
          Embark on a mysterious journey with your fellow adventurers, one chapter at a time.
        </p>
      </div>

      {/* Featured Series Hero Stone Card */}
      <section
        className="rounded-2xl bg-gradient-to-b from-[#1C112E]/95 via-[#160D25]/95 to-[#10071C]/98 border border-[#D4B876]/35 p-4 space-y-2.5 shadow-[0_12px_36px_rgba(0,0,0,0.65)] relative z-10"
        data-featured-series
      >
        <div className="flex items-center justify-between">
          <span className="font-['Cinzel'] font-bold text-[12px] tracking-[2px] text-[#E5C158] uppercase flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#E5C158] animate-pulse" />
            Featured series
          </span>
          <span className="text-[14px] font-sans text-[#A695C2]">Season 1</span>
        </div>

        <div className="space-y-1">
          <h2 className="font-['Cinzel'] font-bold text-[21px] tracking-[0.5px] text-[#E5C158] leading-[1.2]">
            TALES OF THE DARK MOON
          </h2>
          <p className="font-['Cormorant_Garamond',serif] italic text-[16.5px] leading-[1.35] text-[#F0E8C8]">
            “In the hill villages, children are going missing, and nobody is looking for them.”
          </p>
        </div>

        <p className="font-sans text-[14px] leading-[1.45] text-[#C4B7D9] [@media(max-height:700px)]:hidden">
          Follow the trail across six weeks of daily chapters, dice and nights around the fire, and meet your friends once a week to see it through together.
        </p>

        {/* Clean Metadata Strip (Anti-slop, unboxed with separators) */}
        <div className="flex items-center justify-between pt-1 border-t border-[#3A2555]/60 text-[14px] font-sans text-[#C39BF5]">
          <span>6 weeks</span>
          <span aria-hidden="true" className="text-[#5E4585]">·</span>
          <span>2–6 players</span>
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
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#D4B876] via-[#F2D68C] to-[#C7A356] hover:brightness-110 active:scale-[0.985] text-[#160B24] font-sans font-semibold text-[17px] transition shadow-[0_4px_20px_rgba(212,184,118,0.35)] flex items-center justify-center gap-2"
        >
          <span>GATHER YOUR FRIENDS</span>
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
