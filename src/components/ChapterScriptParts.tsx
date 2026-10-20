import React from 'react';
import { AttributeName } from '../data/mythiosRulesData';
import { applySmallPartyLines } from '../data/smallPartyLines';

// Display pieces for the weekday chapter as canon writes it (docs/canon/episode-*.md).

const NUMBER_WORDS = ['none', 'one', 'two', 'three', 'four', 'five', 'six', 'seven'];

export interface ScriptTokens {
  /** The friends after the player, in party order (canon's Mei, Dev, Jo). */
  friends: string[];
  partySize: number;
  /** The player's personal stake line (W1D2), built from their Session Zero answers; empty when both were skipped. */
  stake?: string;
}

/** The player's line beside their name on Meira's list (approved 15 Oct). Empty when both answers were skipped. */
export function personalStakeLine(birthplace?: string, grandparent?: string): string {
  const b = (birthplace || '').trim();
  const g = (grandparent || '').trim();
  if (b && g) return `Beside yours, in the same neat hand: ${b}, and a second name, ${g}.`;
  if (b) return `Beside yours, in the same neat hand: ${b}.`;
  if (g) return `Beside yours, in the same neat hand, a second name: ${g}.`;
  return '';
}

/** Fills canon's stand-ins: {F1} {F2} {F3} with friends' names, {N} and {N-1} with the party size in words. */
export function fillScriptTokens(text: string, t: ScriptTokens): string {
  const word = (n: number) => NUMBER_WORDS[n] ?? String(n);
  const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);
  // A number word that opens a sentence takes a capital ("**Four names.** Yours is one of them.").
  const atStart = /(^|[.!?]\s+|\*\*|\n)\{(N-1|N)\}/g;
  // {STAKE} stands alone as a paragraph; with no stake the whole paragraph goes.
  const withStake = t.stake
    ? text.replace(/\{STAKE\}/g, t.stake)
    : text.replace(/\n\n\{STAKE\}(?=\n|$)/g, '').replace(/\{STAKE\}\n\n/g, '').replace(/\{STAKE\}/g, '');
  return applySmallPartyLines(withStake, t.friends.length)
    .replace(atStart, (_, pre, tok) => pre + cap(word(tok === 'N' ? t.partySize : t.partySize - 1)))
    .replace(/\{N-1\}/g, word(t.partySize - 1))
    .replace(/\{N\}/g, word(t.partySize))
    // Canon writes for three friends. Lines naming more friends than a small party has get their short
    // version first (smallPartyLines.ts); any other stand-in goes round the friends again.
    .replace(/\{F([123])\}/g, (_, i) =>
      t.friends.length ? t.friends[(Number(i) - 1) % t.friends.length] : 'a friend'
    );
}

/**
 * A choice whose buttons each name one friend in turn ("POST {F1}", "POST {F2}", "POST {F3}"; W5D6) picks a
 * friend. It shows one button per friend actually in the party, and from the pick on that friend takes the {F1}
 * place, so the lines after it name the friend picked (canon: "The player chooses who keeps watch").
 */
export function isFriendChoice(labels: string[]): boolean {
  const rest = (l: string, i: number) => l.split(`{F${i + 1}}`).join('');
  return labels.length > 1 && labels.every((l, i) => l.includes(`{F${i + 1}}`) && rest(l, i) === rest(labels[0], 0));
}

export function friendChoiceLabels(labels: string[], friends: string[]): string[] {
  return (friends.length ? friends : ['a friend']).map((name) => labels[0].split('{F1}').join(name));
}

/** The friends in order with the picked one first, so {F1} names them. */
export function friendsWithPicked(friends: string[], pick: number | undefined): string[] {
  if (pick === undefined || pick < 0 || pick >= friends.length) return friends;
  return [friends[pick], ...friends.filter((_, j) => j !== pick)];
}

/** Inline **bold** and *italic*, as canon marks them. */
function renderInline(text: string, keyBase: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      out.push(
        <strong key={`${keyBase}-b${k++}`} className="font-semibold text-[#FFFFFF]">
          {m[1]}
        </strong>
      );
    } else {
      out.push(
        <em key={`${keyBase}-i${k++}`} className="italic">
          {m[2]}
        </em>
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** One line of canon text with its **bold** and *italic*, inside other text. */
export const ScriptInline: React.FC<{ text: string }> = ({ text }) => <>{renderInline(text, 'in')}</>;

/** A canon passage: paragraphs split on blank lines; single line breaks kept. */
export const ScriptText: React.FC<{ text: string; className?: string }> = ({ text, className }) => (
  <>
    {text.split(/\n\s*\n/).map((para, pi) => {
      const isLeadIn = para.trim() === '…' || para.trim() === '...';
      return (
        <p
          key={pi}
          className={className ?? 'font-sans text-[16px] text-[#F4F1F8] leading-[1.45]'}
          {...(isLeadIn ? { 'data-lead-in': true } : {})}
        >
          {para.split('\n').map((line, li, arr) => (
            <React.Fragment key={li}>
              {renderInline(line, `${pi}-${li}`)}
              {li < arr.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      );
    })}
  </>
);

/** MYTHIOS telling the story (phase C1 voice key): 18px sans-serif, white, no italics, no side bar. */
export const NarrationBlock: React.FC<{ text: string; pull?: boolean }> = ({ text }) => {
  const isLeadIn = text.trim() === '…' || text.trim() === '...';
  return (
    <div className="space-y-2" data-mythios-story {...(isLeadIn ? { 'data-lead-in': true } : {})}>
      <ScriptText
        text={text}
        className={`font-sans text-[18px] text-[#F4F1F8] leading-[1.5] ${isLeadIn ? 'tracking-[2px]' : ''}`}
      />
    </div>
  );
};

/** How-to lines (phase C1 voice key): a small gold "HOW IT WORKS" strip. */
export const HowItWorks: React.FC<{ text: string }> = ({ text }) => (
  <div className="rounded-xl bg-[#2A2010] border border-[#D4B876]/60 px-3.5 py-2.5 space-y-1" data-how-it-works>
    <div className="font-['Cinzel'] font-bold text-[11px] tracking-[1px] uppercase text-[#E5C158]">
      HOW IT WORKS
    </div>
    <p className="font-sans text-[16px] text-[#F4E8C8] leading-[1.42]">{text}</p>
  </div>
);

/** Your own choice (phase C1 voice key): your bubble on the right. */
export const TapEcho: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex justify-end" data-choice-echo>
    <div className="max-w-[86%] rounded-[16px_16px_4px_16px] bg-[#3A2A12] border border-[#8A6E34] px-3.5 py-2 font-sans text-[16px] leading-[1.4] text-[#F4E8C8]">
      {label}
    </div>
  </div>
);

export const ScriptButton: React.FC<{ label: string; onClick: () => void; disabled?: boolean }> = ({
  label,
  onClick,
  disabled,
}) => (
  <button
    type="button"
    data-script-step
    disabled={disabled}
    onClick={onClick}
    className="w-full py-2.5 px-3 rounded-xl bg-[#D4B876]/22 hover:bg-[#D4B876]/32 border border-[#D4B876] text-[#F4F1F8] font-['Cinzel'] font-bold text-[12.5px] tracking-[0.8px] uppercase transition disabled:opacity-50"
  >
    {label}
  </button>
);

/** Canon: the player sees the line for their highest Attribute; from Apprentice (26) upward, the second sentence too
 * (was Adept, 51, until 17 Oct: daily players almost never saw it before Week 4, and it usually holds the clue). */
export function pickNoticeLine(
  lines: Partial<Record<AttributeName, { first: string; second?: string }>>,
  attributes: Record<AttributeName, number>,
  classAttr: AttributeName
): { attr: AttributeName; text: string } | null {
  const available = (Object.keys(lines) as AttributeName[]).filter((a) => lines[a]);
  if (available.length === 0) return null;
  const best = available.reduce((top, a) => {
    const diff = (attributes[a] || 0) - (attributes[top] || 0);
    if (diff > 0) return a;
    if (diff === 0 && a === classAttr) return a;
    return top;
  }, available[0]);
  const entry = lines[best]!;
  const apprentice = (attributes[best] || 0) >= 26;
  return { attr: best, text: apprentice && entry.second ? `${entry.first} ${entry.second}` : entry.first };
}

/** The Notice (phase C1 voice key): a blue card. */
export const NoticeBlock: React.FC<{ attr: AttributeName; text: string; label?: string }> = ({ attr, text, label }) => (
  <div className="rounded-xl bg-[#101C30] border border-[#3B669E] px-3.5 py-2.5 space-y-1" data-notice-card>
    <div className="font-['Cinzel'] font-bold text-[12px] tracking-[1px] uppercase text-[#7AA7FF]">
      {label ?? `What you notice · ${attr}`}
    </div>
    <ScriptText text={text} className="font-sans text-[16px] text-[#E8F1FF] leading-[1.45]" />
  </div>
);

/** First-time Notice explanation card (Piece C6): explains the notice mechanic once per player. */
export const FirstTimeNoticeInfo: React.FC<{ attr: AttributeName }> = ({ attr }) => (
  <div className="rounded-xl bg-[#142036] border border-[#2E4B75] p-3 space-y-1.5" data-first-time-notice>
    <div className="font-['Cinzel'] font-bold text-[12px] tracking-[1px] text-[#8DB4F5] uppercase">
      THE NOTICE · {attr.toUpperCase()}, YOUR BEST
    </div>
    <div className="font-sans text-[15px] text-[#CBE0FF] leading-[1.45]">
      Each day you notice one thing others may miss. Your best Attribute gives you the eye for it.
    </div>
  </div>
);

export interface NoticeRollResult {
  attr: AttributeName;
  score?: number;
  d20: number;
  bonus: number;
  total: number;
  dc: number;
  pass: boolean;
  text: string;
  noviceNote?: string | null;
}

/** The Notice Card with Roll breakdown (Piece C6). */
export const NoticeRollCard: React.FC<{
  roll: NoticeRollResult;
  showFirstTime?: boolean;
}> = ({ roll, showFirstTime }) => (
  <div className="space-y-2" data-notice-container>
    {showFirstTime && <FirstTimeNoticeInfo attr={roll.attr} />}
    <div className="rounded-xl bg-[#101C30] border border-[#3B669E] p-3.5 space-y-2 shadow-md" data-notice-card>
      <div className="flex justify-between items-center text-[12px] font-['Cinzel'] font-bold tracking-[1px] uppercase">
        <span className="text-[#7AA7FF]">WHAT YOU NOTICE · {roll.attr}</span>
        <span className={roll.pass ? 'text-[#82E6A1]' : 'text-[#E68282]'}>
          {roll.pass ? 'PASSED' : 'FAILED'} (DC {roll.dc})
        </span>
      </div>
      <div className="text-[13px] font-mono text-[#82A2E6]">
        Roll: d20 [{roll.d20}] {roll.bonus >= 0 ? `+ ${roll.bonus}` : `- ${Math.abs(roll.bonus)}`} = {roll.total} vs DC {roll.dc}
      </div>
      <ScriptText text={roll.text} className="font-sans text-[16px] text-[#E8F1FF] leading-[1.45]" />
      {roll.pass && roll.noviceNote && (
        <div className="text-[14px] italic text-[#A2C2F5] pt-1 border-t border-[#233B61]" data-novice-note>
          {roll.noviceNote}
        </div>
      )}
    </div>
  </div>
);
