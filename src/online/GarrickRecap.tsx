// Garrick's Recap online (migration 0072; Core Rules §11 "The end of a season"): every line he said on the road, and
// what it meant. The server hands it over only once the party's Gathering 6 has ended; until then nothing shows.
// Laid out as in the demo's finale card (StoryAndPartyTabs.tsx).
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { ScriptButton, ScriptText, fillScriptTokens } from '../components/ChapterScriptParts';
import { card, heading } from './ui';

type Recap = { week: number; entries: { when: string; line: string; meaning: string }[] }[];

export default function GarrickRecap({ partyId, friends, partySize }: { partyId: string; friends: string[]; partySize: number }) {
  const [recap, setRecap] = useState<Recap | null>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    supabase.rpc('my_garrick_recap', { p_party: partyId }).then(({ data }) => setRecap((data as Recap) ?? null));
  }, [partyId]);
  if (!recap) return null;
  const fill = (t: string) => fillScriptTokens(t, { friends, partySize });
  return (
    <div className={card} data-garrick-recap>
      <h3 className={`${heading} text-[15px]`}>Garrick's Recap</h3>
      <p className="text-[14px]">Every line he ever said to you on the road, to read again.</p>
      <ScriptButton label={open ? "Close Garrick's Recap" : "Read Garrick's Recap"} onClick={() => setOpen((v) => !v)} />
      {open && (
        <div className="border-t border-[#3A2555] pt-3 space-y-4">
          {recap.map((w) => (
            <div key={w.week} className="space-y-2.5">
              <div className="font-['Cinzel'] font-bold text-[11px] tracking-[1px] uppercase text-[#D4B876]">Week {w.week}</div>
              {w.entries.map((e, ei) => (
                <div key={ei} className="pl-3 border-l-2 border-[#D4B876]/45 space-y-1">
                  {e.when && <div className="font-sans text-[11.5px] text-[#B7A9CC]">{fill(e.when)}</div>}
                  <ScriptText text={fill(e.line)} className="font-['Cormorant_Garamond',serif] text-[16px] text-[#F4E8C1] leading-[1.4]" />
                  <ScriptText text={fill(e.meaning)} className="font-sans text-[13.5px] text-[#E6E0F0] leading-[1.42]" />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
