// Session Zero, once per friend per party (Core Rules §7). The choices are saved by the server when [READY] is tapped.
import { useState } from 'react';
import { supabase, plainError, type MemberRow } from './supabaseClient';
import {
  ATTRIBUTES,
  CLASSES,
  SZ_CHOOSE,
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
} from './onlineText';
import { card, ErrorLine, goldButton, heading, input, note, quietButton } from './ui';

const optionButton = (selected: boolean) =>
  `w-full text-left rounded-xl border px-3 py-2.5 transition ${
    selected ? 'border-[#D4B876] bg-[#2E1B42]' : 'border-[#3A2555] bg-[#130B1F] hover:border-[#7E68B8]'
  }`;

export default function SessionZero({
  partyId,
  userId,
  members,
  onDone,
}: {
  partyId: string;
  userId: string;
  members: MemberRow[];
  onDone: () => void;
}) {
  const [step, setStep] = useState(1);
  const [className, setClassName] = useState<string | null>(null);
  const [second, setSecond] = useState<AttributeName | null>(null);
  const [birthplace, setBirthplace] = useState('');
  const [grandparent, setGrandparent] = useState('');
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

  if (step === 1) {
    return (
      <div className={card}>
        <h2 className={`${heading} text-[18px]`}>Tales of the Dark Moon.</h2>
        {SZ_PREMISE.map((line) => (
          <p key={line} className="text-[15px] leading-relaxed">
            {line}
          </p>
        ))}
        <button className={goldButton} onClick={() => setStep(2)}>
          BEGIN
        </button>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className={card}>
        <p className="text-[15px]">{SZ_CHOOSE}</p>
        {CLASSES.map((c) => {
          const friend = takenBy(c.name);
          return (
            <button key={c.name} className={optionButton(className === c.name)} onClick={() => setClassName(c.name)}>
              <div className={`${heading} text-[15px]`}>{c.name}</div>
              <div className="text-[14px] text-[#F4F1F8]">{c.line}</div>
              <div className="text-[12.5px] text-[#B7A9CC] mt-1">
                {friend
                  ? `${friend} is already a ${c.name}. You can be one too. The road will ask for all six.`
                  : `Your best Attribute is ${c.attribute}. The road will ask for all six.`}
              </div>
            </button>
          );
        })}
        <button className={goldButton} disabled={!chosen} onClick={() => setStep(3)}>
          GO ON
        </button>
      </div>
    );
  }

  if (step === 3 && chosen) {
    return (
      <div className={card}>
        <p className="text-[15px]">{SZ_SECOND}</p>
        <div className="grid grid-cols-2 gap-2">
          {ATTRIBUTES.filter((a) => a !== chosen.attribute).map((a) => (
            <button key={a} className={optionButton(second === a)} onClick={() => setSecond(a)}>
              <span className="text-[15px]">{a}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button className={quietButton} onClick={() => setStep(2)}>
            Back
          </button>
          <button className={goldButton} disabled={!second} onClick={() => setStep(4)}>
            GO ON
          </button>
        </div>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className={card}>
        <label className="block text-[15px]">{SZ_QUESTIONS[0]}</label>
        <input className={input} maxLength={40} value={birthplace} onChange={(e) => setBirthplace(e.target.value)} />
        <label className="block text-[15px]">{SZ_QUESTIONS[1]}</label>
        <input className={input} maxLength={40} value={grandparent} onChange={(e) => setGrandparent(e.target.value)} />
        <p className={`${note} italic`}>{SZ_QUESTIONS_NOTE}</p>
        <div className="flex gap-2">
          <button className={quietButton} onClick={() => setStep(3)}>
            Back
          </button>
          <button className={goldButton} onClick={() => setStep(5)}>
            GO ON
          </button>
        </div>
      </div>
    );
  }

  if (step === 5 && chosen && second) {
    const others = ATTRIBUTES.filter((a) => a !== chosen.attribute && a !== second);
    return (
      <div className={card}>
        <div className="rounded-xl border border-[#D4B876]/60 bg-[#130B1F] p-4 space-y-1.5 font-mono text-[14px]">
          <div className={`${heading} text-[12px] tracking-[1px]`}>YOUR CHARACTER</div>
          <div className={`${heading} text-[18px]`}>{chosen.name}</div>
          <div className="pt-1">
            {chosen.attribute} {START_CLASS_ATTR} · {second} {START_SECOND_ATTR}
          </div>
          <div>{others.map((a) => `${a} ${START_OTHER_ATTR}`).join(' · ')}</div>
          <div className="text-[#B7A9CC]">All Novice (+0 on a Challenge)</div>
          <div className="pt-1">
            Weapon {START_WEAPON} (Level 1) · Armor {START_ARMOR} (Level 1)
          </div>
          <div>HP 100</div>
          <div>Gold 0</div>
        </div>
        <ErrorLine text={error} />
        <div className="flex gap-2">
          <button className={quietButton} onClick={() => setStep(4)}>
            Back
          </button>
          <button className={goldButton} disabled={busy} onClick={ready}>
            READY
          </button>
        </div>
      </div>
    );
  }

  return null;
}
