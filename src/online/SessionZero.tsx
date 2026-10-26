// Session Zero (Core Rules §7). A player has one character per series (Fake Guru, 16 Oct): the first time, they name it
// and choose; in a later party of the same series, their character is shown and kept. Saved when [READY] is tapped.
import { useState } from 'react';
import { supabase, plainError, MAX_PLAYER_NAME, type MemberRow } from './supabaseClient';
import {
  ATTRIBUTES,
  CLASSES,
  SZ_CHOOSE,
  SZ_NAME,
  SZ_NAME_NOTE,
  SZ_PREMISE,
  SZ_QUESTIONS,
  SZ_QUESTIONS_NOTE,
  SZ_SECOND,
  START_ARMOR,
  START_CLASS_ATTR,
  START_OTHER_ATTR,
  START_SECOND_ATTR,
  START_WEAPON,
  type AttributeName,
  seriesTitle,
} from './onlineText';
import { ATTRIBUTE_META } from '../data/mythiosRulesData';
import { card, ErrorLine, goldButton, heading, input, note, quietButton } from './ui';

export interface SeriesCharacter {
  name: string;
  class: string | null;
  second_attr: string | null;
  birthplace: string | null;
  grandparent_name: string | null;
}

const CLASS_DETAILS: Record<string, { role: string; weapon: string; icon: string }> = {
  Warrior: { role: 'Frontline vanguard & stalwart defender', weapon: 'Greatsword', icon: '⚔️' },
  Artificer: { role: 'Machinist, lockbreaker & relic scholar', weapon: 'Heavy Maul', icon: '⚒️' },
  Sage: { role: 'Seeker scholar & decipherer of ancient lore', weapon: 'Runed Staff', icon: '📜' },
  Trickster: { role: 'Silver tongue, negotiator & scout', weapon: 'Stiletto', icon: '🎭' },
  Assassin: { role: 'Shadow walker & lethal ambush striker', weapon: 'Dual Daggers', icon: '🗡️' },
  Archer: { role: 'Long-range marksman & patient tracker', weapon: 'Longbow', icon: '🏹' },
};

// Suggestions only (24 Oct): no place, person or object from the story, so nobody is born in the story's villages or
// names its people as their own (docs/design/rule-breaking-words-24oct.md, rows 1 to 4).
const SUGGESTED_BIRTHPLACES = ['Oldford', 'Thornby', 'Brackwater', 'Kettlecross'];
const SUGGESTED_HERITAGE = ['Grandmother Wenna', 'Grandfather Aldric', 'Grandmother Hesk', 'Grandfather Tam'];

export default function SessionZero({
  partyId,
  userId,
  seriesId,
  startName,
  character,
  members,
  onDone,
}: {
  partyId: string;
  userId: string;
  seriesId: string;
  startName: string;
  character: SeriesCharacter | null;
  members: MemberRow[];
  onDone: () => void;
}) {
  const kept = !!character?.class; // a character already made in this series
  const [step, setStep] = useState(1);
  const [name, setName] = useState(character?.name ?? startName);
  const [className, setClassName] = useState<string | null>(character?.class ?? null);
  const [second, setSecond] = useState<AttributeName | null>((character?.second_attr as AttributeName | null) ?? null);
  const [birthplace, setBirthplace] = useState(character?.birthplace ?? '');
  const [grandparent, setGrandparent] = useState(character?.grandparent_name ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chosen = CLASSES.find((c) => c.name === className) || null;
  // Friends already in this party who chose a class, for "Mei is already a Sage." (§7 step 2).
  const takenBy = (cls: string) =>
    members.find((m) => m.user_id !== userId && m.status === 'approved' && m.class === cls)?.character_name;

  const ready = async () => {
    if (!chosen || !second) return;
    setBusy(true);
    setError(null);
    const { error: e } = await supabase.rpc('finish_session_zero', {
      p_party: partyId,
      p_class: chosen.name,
      p_second_attr: second,
      p_birthplace: birthplace,
      p_grandparent_name: grandparent,
    });
    setBusy(false);
    if (e) setError(plainError(e.message));
    else onDone();
  };

  // Step 1: The Calling & Season Premise
  if (step === 1) {
    return (
      <div className={`${card} space-y-4 border border-[#D4B876]/35 bg-gradient-to-b from-[#1C112E] to-[#0E061A] shadow-2xl`}>
        <div className="space-y-1">
          <div className="text-[12px] font-['Cinzel'] font-bold tracking-[2px] text-[#E5C158] uppercase">
            SESSION ZERO · CHARACTER CREATION
          </div>
          <h2 className={`${heading} text-[22px] font-['Cinzel'] text-[#FDFBFE]`}>
            {seriesTitle(seriesId)}.
          </h2>
        </div>

        <div className="space-y-3 pt-1 border-t border-[#3A2555]/80">
          {SZ_PREMISE.map((line, i) => (
            <p
              key={line}
              className={i === 0 ? "font-['Cormorant_Garamond',serif] italic text-[18px] text-[#F0E8C8] leading-[1.4]" : "text-[15px] leading-relaxed text-[#D9D1E6]"}
            >
              {line}
            </p>
          ))}
          <p className="text-[14px] leading-relaxed text-[#A695C2] italic">
            Before your company steps onto the road, choose who you will be. Six callings, and one shared campfire.
          </p>
        </div>

        <button className={goldButton} onClick={() => setStep(kept ? 5 : 15)}>
          BEGIN
        </button>
      </div>
    );
  }

  // Step 15: Your Name on the Ledger
  if (step === 15) {
    return (
      <div className={`${card} space-y-4 border border-[#5E4585]/60 bg-gradient-to-b from-[#1A1028] to-[#0E071A]`}>
        <div className="space-y-1">
          <div className="text-[12px] font-['Cinzel'] font-bold tracking-[2px] text-[#E5C158] uppercase">
            STEP 1 · THE LEDGER
          </div>
          <label className="block text-[17px] font-['Cinzel'] font-bold text-[#F4F1F8]">{SZ_NAME}</label>
        </div>

        <input
          className={`${input} text-[17px] tracking-wide text-[#FDFBFE] bg-[#120822] border-[#5E4585] focus:border-[#E5C158]`}
          maxLength={MAX_PLAYER_NAME}
          value={name}
          placeholder="Enter character name..."
          onChange={(e) => setName(e.target.value)}
        />
        <p className={`${note} italic text-[#B7A9CC]`}>{SZ_NAME_NOTE}</p>

        <div className="pt-2">
          <div className="text-[14px] font-['Cinzel'] font-semibold text-[#8F82A6] mb-1.5 uppercase tracking-[1px]">
            Or choose a hill folk name:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['Ren', 'Vael', 'Bran', 'Sira', 'Edda', 'Tobin'].map((suggested) => (
              <button
                key={suggested}
                type="button"
                className="px-2.5 py-1 rounded-lg bg-[#241738] hover:bg-[#342250] text-[#D9D1E6] text-[14px] font-sans border border-[#432A66] transition"
                onClick={() => setName(suggested)}
              >
                {suggested}
              </button>
            ))}
          </div>
        </div>

        <ErrorLine text={error} />
        <button
          className={goldButton}
          disabled={!name.trim() || busy}
          onClick={async () => {
            setBusy(true);
            setError(null);
            const { error: e } = await supabase.rpc('rename_character', { p_series: seriesId, p_name: name.trim() });
            setBusy(false);
            if (e) setError(plainError(e.message));
            else setStep(2);
          }}
        >
          GO ON
        </button>
      </div>
    );
  }

  // Step 2: The Six Classes
  if (step === 2) {
    return (
      <div className={`${card} space-y-4 border border-[#5E4585]/60 bg-gradient-to-b from-[#1A1028] to-[#0E071A]`}>
        <div className="space-y-1">
          <div className="text-[12px] font-['Cinzel'] font-bold tracking-[2px] text-[#E5C158] uppercase">
            STEP 2 · YOUR CALLING
          </div>
          <p className="text-[17px] font-['Cinzel'] font-bold text-[#FDFBFE]">{SZ_CHOOSE}</p>
        </div>

        <div className="space-y-2.5">
          {CLASSES.map((c) => {
            const friend = takenBy(c.name);
            const isSelected = className === c.name;
            const meta = ATTRIBUTE_META[c.attribute];
            const details = CLASS_DETAILS[c.name];
            return (
              <button
                key={c.name}
                type="button"
                className={`w-full text-left rounded-xl border p-3.5 transition flex flex-col gap-1.5 ${
                  isSelected
                    ? 'border-[#E5C158] bg-[#2E1B46] shadow-[0_0_16px_rgba(229,193,88,0.2)]'
                    : 'border-[#3A2555] bg-[#140B22] hover:border-[#6B4E99]'
                }`}
                onClick={() => setClassName(c.name)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[18px]" aria-hidden="true">{details?.icon}</span>
                    <span className="font-['Cinzel'] font-bold text-[16px] text-[#FDFBFE]">{c.name}</span>
                  </div>
                  <span
                    className="text-[14px] font-['Cinzel'] font-bold px-2 py-0.5 rounded border"
                    style={{ color: meta?.color, borderColor: meta?.color ? `${meta.color}55` : '#5E4585', backgroundColor: meta?.bgTint || '#2B1E3D' }}
                  >
                    {c.attribute} 14
                  </span>
                </div>

                <div className="font-['Cormorant_Garamond',serif] italic text-[15.5px] leading-snug text-[#EAD8B8]">
                  “{c.line}”
                </div>

                <div className="text-[14px] text-[#B7A9CC] flex items-center justify-between pt-0.5">
                  <span>{details?.role}</span>
                  <span className="text-[#8F82A6]">{details?.weapon}</span>
                </div>

                {friend && (
                  <div className="text-[14px] text-[#F0A552] italic pt-1 border-t border-[#3A2555]/60">
                    {friend} is already a {c.name}. You can be one too. The road will ask for all six.
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <button className={goldButton} disabled={!chosen} onClick={() => setStep(3)}>
          GO ON
        </button>
      </div>
    );
  }

  // Step 3: Second Strength (Affinity)
  if (step === 3 && chosen) {
    return (
      <div className={`${card} space-y-4 border border-[#5E4585]/60 bg-gradient-to-b from-[#1A1028] to-[#0E071A]`}>
        <div className="space-y-1">
          <div className="text-[12px] font-['Cinzel'] font-bold tracking-[2px] text-[#E5C158] uppercase">
            STEP 3 · YOUR SECOND STRENGTH
          </div>
          <p className="text-[17px] font-['Cinzel'] font-bold text-[#FDFBFE]">{SZ_SECOND}</p>
          <p className="text-[14px] text-[#B7A9CC]">
            Your class leads with <span className="font-semibold text-[#E5C158]">{chosen.attribute}</span>, at 14. Your second strength starts at 12.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {ATTRIBUTES.filter((a) => a !== chosen.attribute).map((a) => {
            const isSelected = second === a;
            const meta = ATTRIBUTE_META[a];
            return (
              <button
                key={a}
                type="button"
                className={`w-full text-left rounded-xl border p-3 transition flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-[#E5C158] bg-[#2E1B46] shadow-[0_0_12px_rgba(229,193,88,0.2)]'
                    : 'border-[#3A2555] bg-[#140B22] hover:border-[#6B4E99]'
                }`}
                onClick={() => setSecond(a)}
              >
                <div>
                  <div className="font-['Cinzel'] font-bold text-[15px]" style={{ color: meta?.color || '#FDFBFE' }}>
                    {a}
                  </div>
                  <div className="text-[14px] text-[#B7A9CC]">{meta?.desc || 'Attribute strength'}</div>
                </div>
                <span className="text-[14px] font-mono font-semibold text-[#E5C158] shrink-0">
                  12 · Novice
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 pt-1">
          <button className={quietButton} onClick={() => setStep(2)}>
            ‹ Back
          </button>
          <button className={goldButton} disabled={!second} onClick={() => setStep(4)}>
            GO ON
          </button>
        </div>
      </div>
    );
  }

  // Step 4: Lineage & Memory
  if (step === 4) {
    return (
      <div className={`${card} space-y-4 border border-[#5E4585]/60 bg-gradient-to-b from-[#1A1028] to-[#0E071A]`}>
        <div className="space-y-1">
          <div className="text-[12px] font-['Cinzel'] font-bold tracking-[2px] text-[#E5C158] uppercase">
            STEP 4 · LINEAGE & MEMORY
          </div>
          <h3 className="text-[17px] font-['Cinzel'] font-bold text-[#FDFBFE]">Where your road begins.</h3>
        </div>

        <div className="space-y-2">
          <label className="block text-[14.5px] font-semibold text-[#D9D1E6]">{SZ_QUESTIONS[0]}</label>
          <input
            className={input}
            maxLength={40}
            value={birthplace}
            placeholder="e.g. Thornby"
            onChange={(e) => setBirthplace(e.target.value)}
          />
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {SUGGESTED_BIRTHPLACES.map((place) => (
              <button
                key={place}
                type="button"
                className="px-2 py-0.5 rounded text-[14px] bg-[#241738] text-[#B7A9CC] hover:text-[#FDFBFE] hover:bg-[#342250] border border-[#3A2555] transition"
                onClick={() => setBirthplace(place)}
              >
                {place}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <label className="block text-[14.5px] font-semibold text-[#D9D1E6]">{SZ_QUESTIONS[1]}</label>
          <input
            className={input}
            maxLength={40}
            value={grandparent}
            placeholder="e.g. Grandmother Wenna"
            onChange={(e) => setGrandparent(e.target.value)}
          />
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {SUGGESTED_HERITAGE.map((item) => (
              <button
                key={item}
                type="button"
                className="px-2 py-0.5 rounded text-[14px] bg-[#241738] text-[#B7A9CC] hover:text-[#FDFBFE] hover:bg-[#342250] border border-[#3A2555] transition"
                onClick={() => setGrandparent(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <p className={`${note} italic text-[#A695C2]`}>{SZ_QUESTIONS_NOTE}</p>

        <div className="flex gap-2 pt-1">
          <button className={quietButton} onClick={() => setStep(3)}>
            ‹ Back
          </button>
          <button className={goldButton} onClick={() => setStep(5)}>
            GO ON
          </button>
        </div>
      </div>
    );
  }

  // Step 5: Character Sheet Revelation (Hero Collector Parchment)
  if (step === 5 && chosen && second) {
    const others = ATTRIBUTES.filter((a) => a !== chosen.attribute && a !== second);
    return (
      <div className={`${card} space-y-4 border border-[#D4B876]/50 bg-gradient-to-b from-[#1C122C] to-[#0D0518] shadow-2xl`}>
        <div className="space-y-1 text-center pb-1">
          <div className="text-[12px] font-['Cinzel'] font-bold tracking-[2px] text-[#E5C158] uppercase">
            SESSION ZERO · DONE
          </div>
          <h3 className="font-['Cinzel'] font-bold text-[22px] tracking-[1.5px] text-[#FDFBFE] uppercase">
            YOUR CHARACTER
          </h3>
        </div>

        <div className="rounded-2xl border border-[#D4B876]/45 bg-[#140A22] p-4 space-y-3 relative overflow-hidden">
          <div className="flex items-start justify-between gap-2 border-b border-[#3A2555]/80 pb-2.5">
            <div>
              <div className="font-['Cinzel'] font-bold text-[20px] text-[#FFF4CC]">{name}</div>
              <div className="text-[14.5px] font-semibold text-[#C39BF5] flex items-center gap-1.5">
                <span>{chosen.name}</span>
                <span className="text-[#5E4585]">·</span>
                <span className="text-[#B7A9CC] font-normal">{seriesTitle(seriesId)}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[12px] font-['Cinzel'] font-bold tracking-[1px] px-2 py-0.5 rounded bg-[#E5C158]/15 border border-[#E5C158]/40 text-[#E5C158] uppercase">
                Ready for Day 1
              </span>
            </div>
          </div>

          {/* Primary & Secondary Strength Bars */}
          <div className="space-y-2">
            <div className="text-[12px] font-['Cinzel'] font-bold tracking-[1px] text-[#8F82A6] uppercase">
              Core Attributes
            </div>
            <div className="grid grid-cols-2 gap-2 text-[14px]">
              <div className="rounded-lg p-2 bg-[#211336] border border-[#5E4585]/60 flex items-center justify-between">
                <span className="font-semibold" style={{ color: ATTRIBUTE_META[chosen.attribute]?.color }}>
                  {chosen.attribute} (Class)
                </span>
                <span className="font-mono font-bold text-[#E5C158]">{START_CLASS_ATTR} · Novice</span>
              </div>
              <div className="rounded-lg p-2 bg-[#211336] border border-[#5E4585]/60 flex items-center justify-between">
                <span className="font-semibold" style={{ color: ATTRIBUTE_META[second]?.color }}>
                  {second} (Second)
                </span>
                <span className="font-mono font-bold text-[#E5C158]">{START_SECOND_ATTR} · Novice</span>
              </div>
            </div>

            <div className="text-[14px] text-[#B7A9CC] pt-1 flex flex-wrap gap-x-3 gap-y-1">
              {others.map((a) => (
                <span key={a}>
                  <span className="text-[#8F82A6]">{a}:</span> {START_OTHER_ATTR}
                </span>
              ))}
            </div>
          </div>

          {/* Equipment & Combat Status */}
          <div className="pt-2 border-t border-[#3A2555]/60 flex items-center justify-between text-[14px] text-[#B7A9CC]">
            <span>Weapon {START_WEAPON} (Lv. 1)</span>
            <span aria-hidden="true" className="text-[#5E4585]">·</span>
            <span>Armour {START_ARMOR} (Lv. 1)</span>
            <span aria-hidden="true" className="text-[#5E4585]">·</span>
            <span>100 HP</span>
            <span aria-hidden="true" className="text-[#5E4585]">·</span>
            <span>0 Gold</span>
          </div>

          {(birthplace || grandparent) && (
            <div className="pt-2 border-t border-[#3A2555]/60 text-[14px] font-['Cormorant_Garamond',serif] italic text-[#E0D8ED]">
              “{birthplace ? `Out of ${birthplace}` : 'Out of the hill country'}{grandparent ? `, with ${grandparent} in mind.` : '.'}”
            </div>
          )}
        </div>

        <ErrorLine text={error} />
        <div className="flex gap-2 pt-1">
          <button className={quietButton} onClick={() => setStep(kept ? 1 : 4)}>
            ‹ Back
          </button>
          <button className={goldButton} disabled={busy} onClick={ready}>
            READY
          </button>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className={card}>
      <p className="text-[15px]">{SZ_CHOOSE}</p>
      <button className={goldButton} onClick={() => setStep(2)}>
        GO ON
      </button>
    </div>
  );
}

