import React from 'react';
import { AttributeName, ATTRIBUTE_META } from '../data/mythiosRulesData';

// Display pieces for the weekday chapter as canon writes it (docs/canon/episode-*.md).

const NUMBER_WORDS = ['none', 'one', 'two', 'three', 'four', 'five', 'six', 'seven'];

export interface ScriptTokens {
  /** The friends after the player, in party order (canon's Mei, Dev, Jo). */
  friends: string[];
  partySize: number;
}

/** Fills canon's stand-ins: {F1} {F2} {F3} with friends' names, {N} and {N-1} with the party size in words. */
export function fillScriptTokens(text: string, t: ScriptTokens): string {
  const word = (n: number) => NUMBER_WORDS[n] ?? String(n);
  const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);
  // A number word that opens a sentence takes a capital ("**Four names.** Yours is one of them.").
  const atStart = /(^|[.!?]\s+|\*\*|\n)\{(N-1|N)\}/g;
  return text
    .replace(atStart, (_, pre, tok) => pre + cap(word(tok === 'N' ? t.partySize : t.partySize - 1)))
    .replace(/\{N-1\}/g, word(t.partySize - 1))
    .replace(/\{N\}/g, word(t.partySize))
    .replace(/\{F([123])\}/g, (_, i) => t.friends[Number(i) - 1] ?? 'a friend');
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
    {text.split(/\n\s*\n/).map((para, pi) => (
      <p
        key={pi}
        className={className ?? 'font-sans text-[15px] text-[#F4F1F8] leading-[1.45]'}
      >
        {para.split('\n').map((line, li, arr) => (
          <React.Fragment key={li}>
            {renderInline(line, `${pi}-${li}`)}
            {li < arr.length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>
    ))}
  </>
);

/** MYTHIOS narration (style guide: a gold rule down the left, no bubble). */
export const NarrationBlock: React.FC<{ text: string; pull?: boolean }> = ({ text, pull }) => (
  <div
    className={`pl-3 border-l-2 space-y-2 ${
      pull ? 'border-[#D4B876] py-1' : 'border-[#D4B876]/45'
    }`}
  >
    <ScriptText
      text={text}
      className={
        pull
          ? "font-['Cormorant_Garamond',serif] italic text-[17px] text-[#F4E8C1] leading-[1.4]"
          : 'font-sans text-[15px] text-[#F4F1F8] leading-[1.45]'
      }
    />
  </div>
);

/** The player's tap, echoed as a small gold chip on the right. */
export const TapEcho: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex justify-end">
    <span className="px-2.5 py-1 rounded-full bg-[#4A3B24] border border-[#E5C77B]/70 font-['Cinzel'] font-bold text-[11px] tracking-[0.6px] text-[#F3D88B] uppercase">
      {label}
    </span>
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

/** Canon: the player sees the line for their highest Attribute; from Adept (51) upward, the second sentence too. */
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
  const adept = (attributes[best] || 0) >= 51;
  return { attr: best, text: adept && entry.second ? `${entry.first} ${entry.second}` : entry.first };
}

export const NoticeBlock: React.FC<{ attr: AttributeName; text: string }> = ({ attr, text }) => (
  <div className="rounded-xl bg-[#130B1F] border border-[#3A2555] px-3 py-2 space-y-1">
    <div
      className="font-['Cinzel'] font-bold text-[10.5px] tracking-[1px] uppercase"
      style={{ color: ATTRIBUTE_META[attr]?.color || '#D4B876' }}
    >
      What you notice · {attr}
    </div>
    <ScriptText text={text} className="font-sans text-[14.5px] text-[#E6E0F0] leading-[1.42]" />
  </div>
);
