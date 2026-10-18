// "Last night the fire called it: …" at the top of a new day (docs/design/one-thread-18oct.md, phase B: the party's
// call at dawn moves from the fire to the morning). Read from the casebook (casebook; fire_call), by name, never counts.
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { asClause } from './OnlineCampfire';

type Reading = 'A' | 'B' | 'NEITHER';
interface Night {
  day: number;
  forkA: string | null;
  forkB: string | null;
  call: { reading: Reading | null; split: boolean; backers: Partial<Record<Reading, string[]>> } | null;
}

const nameList = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

export default function LastNight({ partyId, week, day }: { partyId: string; week: number; day: number }) {
  const [line, setLine] = useState<string | null>(null);
  useEffect(() => {
    setLine(null);
    const prevWeek = day > 1 ? week : week - 1;
    const prevDay = day > 1 ? day - 1 : 6;
    if (prevWeek < 1) return;
    supabase.rpc('casebook', { p_party: partyId, p_week: prevWeek }).then(({ data }) => {
      const night = ((data as { nights?: Night[] } | null)?.nights ?? []).find((n) => n.day === prevDay);
      const c = night?.call;
      if (!night || !c) return;
      const text = (r: Reading) => (r === 'A' ? night.forkA ?? '' : r === 'B' ? night.forkB ?? '' : 'Neither.');
      const by = (r: Reading) => c.backers?.[r] ?? [];
      const all: Reading[] = ['A', 'B', 'NEITHER'];
      if (c.reading) {
        const out = all.filter((r) => r !== c.reading).flatMap(by);
        setLine(
          `Last night the fire called it: ${asClause(text(c.reading)).replace(/\.$/, '')}. ${nameList(by(c.reading))} said so${
            out.length ? `; ${nameList(out)} held out` : ''
          }.`
        );
      } else if (c.split) {
        setLine(
          `Last night the fire was split. ${all
            .filter((r) => by(r).length)
            .map((r) => `${nameList(by(r))}: ${asClause(text(r)).replace(/\.$/, '')}`)
            .join('; ')}.`
        );
      }
    });
  }, [partyId, week, day]);
  if (!line) return null;
  return (
    <div className="rounded-2xl bg-[#16233A] border border-[#3E5C8A] px-3 py-2.5 space-y-1" data-last-call>
      <div className="font-['Cinzel'] font-bold text-[12px] text-[#9CC2F0] tracking-[1px]">LAST NIGHT</div>
      <p className="text-[16px] text-[#F4F1F8] leading-[1.4]">{line}</p>
    </div>
  );
}
