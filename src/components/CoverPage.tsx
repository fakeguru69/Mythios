import React from 'react';
import { useBareShell } from '../online/ui';

export interface CoverPageProps {
  onGatherFriends: () => void;
  onSignIn: () => void;
}

/**
 * The Cover Page (Piece C7): One screen (no scrolling at iPhone 13 mini size).
 * Displays MYTHIOS branding, a single tagline line, the canon featured series premise and metadata,
 * and two primary action buttons: "Gather your friends" and "Already playing? Sign in".
 */
export const CoverPage: React.FC<CoverPageProps> = ({ onGatherFriends, onSignIn }) => {
  useBareShell();

  return (
    <div
      className="w-full max-w-[420px] mx-auto min-h-[100dvh] h-full flex flex-col justify-between p-5 bg-[#0C0814] text-[#F4F1F8] select-none box-border"
      data-cover-page
    >
      {/* Top Header & Tagline */}
      <div className="space-y-2 text-center pt-2">
        <h1 className="font-['Cinzel'] font-bold text-[34px] tracking-[3px] text-[#E5C158] uppercase drop-shadow-md">
          MYTHIOS
        </h1>
        <p className="font-sans text-[16px] leading-[1.4] text-[#C3B8D9] max-w-[300px] mx-auto">
          A story told a little each day to you and your friends.
        </p>
      </div>

      {/* Featured Series Card */}
      <div
        className="rounded-2xl bg-[#180F26] border border-[#483366] p-4.5 space-y-3 shadow-xl my-auto"
        data-featured-series
      >
        <div className="font-['Cinzel'] font-bold text-[14px] tracking-[1.5px] text-[#E5C158] uppercase">
          FEATURED SERIES
        </div>
        <div className="space-y-1.5">
          <h2 className="font-['Cinzel'] font-bold text-[22px] tracking-[0.5px] text-[#F4F1F8] leading-[1.25]">
            TALES OF THE DARK MOON
          </h2>
          <p className="font-sans text-[16px] leading-[1.45] text-[#D0C8E0]">
            In the hill villages, children are going missing, and nobody is looking for them.
          </p>
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap gap-2 pt-1 text-[14px] font-['Cinzel'] font-bold tracking-[0.5px]">
          <span className="px-2.5 py-1 rounded-md bg-[#2B1E3D] border border-[#5E4585] text-[#C39BF5]">
            Season 1
          </span>
          <span className="px-2.5 py-1 rounded-md bg-[#2B1E3D] border border-[#5E4585] text-[#C39BF5]">
            6 weeks
          </span>
          <span className="px-2.5 py-1 rounded-md bg-[#2B1E3D] border border-[#5E4585] text-[#C39BF5]">
            3 to 6 friends
          </span>
        </div>
      </div>

      {/* Actions Section */}
      <div className="space-y-3 pb-2">
        <button
          type="button"
          data-button-gather
          onClick={onGatherFriends}
          className="w-full py-3.5 px-4 rounded-xl bg-[#D4B876]/22 hover:bg-[#D4B876]/32 active:bg-[#D4B876]/40 border border-[#D4B876] text-[#F4F1F8] font-['Cinzel'] font-bold text-[16px] tracking-[1px] uppercase transition shadow-lg"
        >
          Gather your friends
        </button>
        <button
          type="button"
          data-button-signin
          onClick={onSignIn}
          className="w-full py-2 px-4 text-[16px] text-[#A998C2] hover:text-[#F4F1F8] font-sans transition text-center underline"
        >
          Already playing? Sign in
        </button>
      </div>
    </div>
  );
};

export default CoverPage;
