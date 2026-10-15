import React, { useState } from 'react';
import {
  AttributeName,
  ATTRIBUTE_META,
  CLASS_META,
  ClassName,
  getTierInfo,
  RECORD_STATS_META,
  BADGES_META,
  GEAR_TABLE,
} from '../data/mythiosRulesData';

interface RecordTabViewProps {
  characterName: string;
  characterClass: ClassName;
  secondAttr: AttributeName;
  partyName: string;
  currentWeek: number;
  attributes: Record<AttributeName, number>;
  weaponLevel: number;
  armorLevel: number;
  stats: Record<string, number>;
  earnedBadgeIds: string[];
}

export const RecordTabView: React.FC<RecordTabViewProps> = ({
  characterName,
  characterClass,
  secondAttr,
  partyName,
  attributes,
  weaponLevel,
  armorLevel,
  stats,
  earnedBadgeIds,
}) => {
  // #31: Both explainers are null (hidden) by default so the 4x3 grids stay clean!
  const [selectedStatKey, setSelectedStatKey] = useState<string | null>(null);
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const classMeta = CLASS_META[characterClass];
  const primaryAttr = classMeta.attribute;
  const allAttrs: AttributeName[] = ['Might', 'Craft', 'Intellect', 'Charm', 'Agility', 'Aim'];

  const selectedStat = RECORD_STATS_META.find((s) => s.key === selectedStatKey) || null;
  const selectedBadge = BADGES_META.find((b) => b.id === selectedBadgeId) || null;

  const displayCharName = (characterName || 'Jennifer').slice(0, 16);
  const displayPartyName = (partyName || 'The Iron Lantern').slice(0, 20);

  // Class Emblem SVG inside the 76px Gold-Ringed Collector Medallion (#25)
  const renderClassEmblem = (cls: ClassName) => {
    switch (cls) {
      case 'Warrior':
        return '⚔️';
      case 'Artificer':
        return '⚒️';
      case 'Sage':
        return '📖';
      case 'Trickster':
        return '🎭';
      case 'Assassin':
        return '🗡️';
      case 'Archer':
        return '🏹';
      default:
        return '🛡️';
    }
  };

  const renderBadgeIcon = (type: string, active: boolean) => {
    const stroke = active ? '#E6CC8C' : '#8F80B2';
    switch (type) {
      case 'sunrise':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
            <path d="M12 2v4M4.93 10.93l2.83 2.83M2 18h20M19.07 10.93l-2.83 2.83M8 18a4 4 0 0 1 8 0" />
          </svg>
        );
      case 'calendar':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        );
      case 'road':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
            <path d="M4 19L10 5M20 19L14 5M12 6v2M12 11v2M12 16v2" />
          </svg>
        );
      case 'sword':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
            <path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4" />
          </svg>
        );
      case 'gift':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
            <rect x="3" y="8" width="18" height="4" rx="1" />
            <path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
          </svg>
        );
      case 'lifeline':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        );
      case 'users':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
            <circle cx="9" cy="7" r="4" />
            <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.85" />
          </svg>
        );
      case 'moon':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        );
      case 'd20':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
            <polygon points="12 2 21 7 21 17 12 22 3 17 3 7 12 2" />
            <path d="M12 2v20M3 7l18 10M21 7L3 17" />
          </svg>
        );
      case 'flame':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
          </svg>
        );
      case 'chain':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        );
      default:
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        );
    }
  };

  const earnedBadgesCount = BADGES_META.filter(
    (b) => b.earned || earnedBadgeIds.includes(b.id)
  ).length;

  return (
    <div className="flex-1 overflow-y-auto px-3.5 py-3.5 space-y-4 bg-[#0D0714] text-[#F4F1F8]">
      {/* =====================================================================
          SECTION 1 — HERO COLLECTOR CARD BANNER & COLORED ATTRIBUTE BARS (#25, #26)
         ===================================================================== */}
      <div className="rounded-2xl bg-[#1E1232] border border-[#7E68B8] overflow-hidden shadow-xl">
        {/* #25: Collector Banner Header with 72px Gold-Ringed Class Emblem & Non-Truncated Identity */}
        <div className="p-4 bg-gradient-to-r from-[#2E1B42] via-[#261539] to-[#1E1232] border-b border-[#3A2555] flex items-center gap-3.5">
          <div className="w-[70px] h-[70px] rounded-full bg-[#130B1F] border-2 border-[#D4B876] shadow-inner flex items-center justify-center text-[30px] shrink-0">
            {renderClassEmblem(characterClass)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-['Cinzel'] font-bold text-[22px] text-[#D4B876] tracking-wide truncate">
                {displayCharName.toUpperCase()}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#130B1F] border border-[#6FD39A]/50 font-['Cinzel'] font-bold text-[11px] text-[#6FD39A] whitespace-nowrap shrink-0">
                🔥 {stats.bestStreak || 6}D
              </span>
            </div>

            <div className="font-['Cinzel'] font-bold text-[13.5px] text-[#F4F1F8] tracking-[1.2px] uppercase mt-0.5">
              {characterClass}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-1 text-[12px] font-sans">
              <span
                className="font-semibold"
                style={{ color: ATTRIBUTE_META[primaryAttr].color }}
              >
                ★ {primaryAttr}
              </span>
              <span className="text-[#8B7A9E]">·</span>
              <span
                className="font-semibold"
                style={{ color: ATTRIBUTE_META[secondAttr].color }}
              >
                ★ {secondAttr}
              </span>
              <span className="text-[#8B7A9E]">·</span>
              <span className="text-[#B7A9CC] truncate">{displayPartyName}</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 space-y-3.5">
          {/* #26: 2-Column Attribute Cards with Colored Progress Bars */}
          <div className="grid grid-cols-2 gap-2">
            {allAttrs.map((attr) => {
              const val = attributes[attr];
              const tier = getTierInfo(val);
              const meta = ATTRIBUTE_META[attr];
              const isFocus = attr === primaryAttr || attr === secondAttr;

              return (
                <div
                  key={attr}
                  className={`p-3 rounded-xl bg-[#2A1B40] border transition ${
                    isFocus ? 'border-[#D4B876]/60' : 'border-[#3A2555]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="font-['Cinzel'] font-bold text-[12.5px] tracking-[0.6px]"
                      style={{ color: meta.color }}
                    >
                      {attr.toUpperCase()} {isFocus ? '★' : ''}
                    </span>
                    <span className="font-['Cinzel'] font-bold text-[15px] text-[#D4B876]">
                      +{tier.bonus}
                    </span>
                  </div>

                  {/* Colored Progress Bar (#26) */}
                  <div className="w-full h-2 bg-[#130B1F] rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.max(10, tier.pctInTier)}%`,
                        backgroundColor: meta.color,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[12px] font-sans text-[#B7A9CC] mt-1.5">
                    <span>{tier.name}</span>
                    <span className="font-semibold text-[#F4F1F8]">{val} pts</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2 Raised Gear Tiles with 5 Level Pips (#26) */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-xl bg-[#2A1B40] border border-[#3A2555] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-['Cinzel'] font-bold text-[12.5px] text-[#F4F1F8] truncate">
                  ⚔️ {classMeta.weapon}
                </span>
                <span className="font-['Cinzel'] font-bold text-[12.5px] text-[#D4B876]">
                  ATK {GEAR_TABLE[weaponLevel].weapon}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-sans text-[#B7A9CC]">
                  Lv. {weaponLevel} of 5
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((pip) => (
                    <span
                      key={pip}
                      className={`w-2 h-2 rounded-full ${
                        pip <= weaponLevel ? 'bg-[#D4B876]' : 'bg-[#130B1F]'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#2A1B40] border border-[#3A2555] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-['Cinzel'] font-bold text-[12.5px] text-[#F4F1F8] truncate">
                  🛡️ {classMeta.armor}
                </span>
                <span className="font-['Cinzel'] font-bold text-[12.5px] text-[#D4B876]">
                  ARM {GEAR_TABLE[armorLevel].armor}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-sans text-[#B7A9CC]">
                  Lv. {armorLevel} of 5
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((pip) => (
                    <span
                      key={pip}
                      className={`w-2 h-2 rounded-full ${
                        pip <= armorLevel ? 'bg-[#D4B876]' : 'bg-[#130B1F]'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          SECTION 2 — THE RECORD (Joined #2A1B40 12-Stat Slab with Gold Crowns 👑
          #28, #30 and Explainer Hidden Until Tapped #31)
          (Note: Party Strip #27 removed so this is purely your Hero Stats Card)
         ===================================================================== */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="font-['Cinzel'] font-bold text-[12px] tracking-[1.3px] text-[#D4B876] uppercase">
            THE RECORD · 12 MILESTONES
          </span>
          <span className="text-[12px] font-sans text-[#B7A9CC]">
            👑 = Party Lead · Tap cell
          </span>
        </div>

        {/* Joined Ruled Slab (#2A1B40 with #44305F hairlines) */}
        <div className="rounded-2xl bg-[#2A1B40] border border-[#7E68B8]/60 overflow-hidden shadow-lg grid grid-cols-4">
          {RECORD_STATS_META.map((stat, idx) => {
            const val = stats[stat.key] ?? 0;
            const isSelected = selectedStatKey === stat.key;
            const isPartyLead = val >= stat.leadNextVal;
            const colIdx = idx % 4;
            const rowIdx = Math.floor(idx / 4);

            return (
              <button
                key={stat.key}
                onClick={() =>
                  setSelectedStatKey(isSelected ? null : stat.key)
                }
                className={`p-2.5 text-center transition flex flex-col items-center justify-center min-h-[76px] relative ${
                  isSelected ? 'bg-[#382653]' : 'hover:bg-[#382653]/60'
                } ${colIdx < 3 ? 'border-r border-[#44305F]' : ''} ${
                  rowIdx < 2 ? 'border-b border-[#44305F]' : ''
                }`}
              >
                <div className="flex items-center justify-center gap-0.5">
                  {isPartyLead && (
                    <span className="text-[11px] leading-none" title="Party Leader">
                      👑
                    </span>
                  )}
                  <span
                    className={`font-['Cinzel'] font-bold text-[20px] leading-none ${
                      isPartyLead ? 'text-[#D4B876]' : 'text-[#F4F1F8]'
                    }`}
                  >
                    {val}
                  </span>
                </div>
                <div className="text-[11.5px] font-sans text-[#B7A9CC] leading-[1.15] mt-1.5 font-medium">
                  <div className="whitespace-nowrap">{stat.labelLines[0]}</div>
                  <div className="whitespace-nowrap">{stat.labelLines[1]}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* #31: Tap-to-Explain Callout ONLY appears when a stat cell is tapped */}
        {selectedStat && (
          <div className="p-3.5 rounded-xl bg-[#130B1F] border border-[#B7A9CC] flex items-start justify-between gap-2 shadow-md">
            <div className="min-w-0">
              <div className="font-['Cinzel'] font-bold text-[13px] text-[#D4B876]">
                {selectedStat.fullTitle} ({stats[selectedStat.key] ?? 0})
              </div>
              <p className="font-sans text-[14.5px] text-[#F4F1F8] mt-0.5 leading-snug">
                {selectedStat.explainer}
              </p>
              <div className="text-[12.5px] font-sans text-[#6FD39A] font-semibold mt-1">
                {(stats[selectedStat.key] ?? 0) >= selectedStat.leadNextVal
                  ? '👑 You lead the party!'
                  : `Party Lead: ${selectedStat.leadFriend} (${selectedStat.leadNextVal})`}
              </div>
            </div>
            <button
              onClick={() => setSelectedStatKey(null)}
              className="text-xs text-[#B7A9CC] hover:text-[#F4F1F8] px-1"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* =====================================================================
          SECTION 3 — 12 BADGES (Round 36px Gold Medallions vs Dashed Slots #34)
         ===================================================================== */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="font-['Cinzel'] font-bold text-[12px] tracking-[1.3px] text-[#D4B876] uppercase">
            BADGES · {earnedBadgesCount}/12 EARNED
          </span>
          <span className="text-[12px] font-sans text-[#B7A9CC]">
            Tap medal to inspect
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {BADGES_META.map((b) => {
            const isEarned = b.earned || earnedBadgeIds.includes(b.id);
            const isSelected = selectedBadgeId === b.id;

            return (
              <button
                key={b.id}
                onClick={() =>
                  setSelectedBadgeId(isSelected ? null : b.id)
                }
                className={`p-2.5 rounded-xl flex flex-col items-center justify-center min-h-[88px] transition ${
                  isSelected
                    ? 'bg-[#382653] border-2 border-[#D4B876]'
                    : isEarned
                    ? 'bg-[#2A1B40] border border-[#D4B876]/50 shadow-sm'
                    : 'bg-[#1E1232]/70 border border-dashed border-[#4A3068]'
                }`}
              >
                {/* #34: 36px Round Gold Medal for Earned vs Dark Dashed Circle for Locked */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center mb-1.5 ${
                    isEarned
                      ? 'bg-[#D4B876]/20 border-[1.5px] border-[#D4B876]'
                      : 'bg-[#130B1F] border border-dashed border-[#4A3068]'
                  }`}
                >
                  {renderBadgeIcon(b.iconType, isEarned)}
                </div>

                <div
                  className={`text-[11.5px] font-sans leading-[1.15] text-center font-medium ${
                    isEarned ? 'text-[#F4F1F8]' : 'text-[#9C8DB5]'
                  }`}
                >
                  <div className="whitespace-nowrap">{b.labelLines[0]}</div>
                  {b.labelLines[1] && (
                    <div className="whitespace-nowrap">{b.labelLines[1]}</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Tap-to-Explain Badge Callout (Hidden until tapped) */}
        {selectedBadge && (
          <div className="p-3.5 rounded-xl bg-[#130B1F] border border-[#B7A9CC] flex items-start justify-between gap-2 shadow-md">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Cinzel'] font-bold text-[13px] text-[#D4B876]">
                  {selectedBadge.title}
                </span>
                <span
                  className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded ${
                    selectedBadge.earned || earnedBadgeIds.includes(selectedBadge.id)
                      ? 'bg-[#6FD39A]/20 text-[#6FD39A]'
                      : 'bg-[#2A1B40] text-[#B7A9CC]'
                  }`}
                >
                  {selectedBadge.earned || earnedBadgeIds.includes(selectedBadge.id)
                    ? '✓ Earned'
                    : 'Locked'}
                </span>
              </div>
              <p className="font-sans text-[14.5px] text-[#F4F1F8] mt-1 leading-snug">
                {selectedBadge.requirement}
              </p>
              <p className="font-sans text-[12.5px] text-[#B7A9CC] mt-0.5">
                {selectedBadge.progressText}
              </p>
            </div>
            <button
              onClick={() => setSelectedBadgeId(null)}
              className="text-xs text-[#B7A9CC] hover:text-[#F4F1F8] px-1"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* SHARE RECORD BUTTON */}
      <button
        onClick={() => {
          setShowShareModal(true);
          setShareCopied(false);
        }}
        className="w-full py-3 rounded-xl bg-[#D4B876]/22 hover:bg-[#D4B876]/32 border border-[#D4B876] text-[#F4F1F8] font-['Cinzel'] font-bold text-[13px] tracking-[1px] uppercase shadow-md transition"
      >
        SHARE HERO RECORD CARD
      </button>

      {/* SHAREABLE COLLECTOR CARD MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-[350px] rounded-2xl bg-[#1E1232] border-2 border-[#D4B876] p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-[#3A2555] pb-3.5">
              <div className="w-14 h-14 rounded-full bg-[#130B1F] border-2 border-[#D4B876] flex items-center justify-center text-[24px] shrink-0">
                {renderClassEmblem(characterClass)}
              </div>
              <div className="min-w-0">
                <div className="font-['Cinzel'] text-[10.5px] tracking-[2px] text-[#D4B876] uppercase">
                  TALES OF THE DARK MOON
                </div>
                <div className="font-['Cinzel'] font-bold text-[20px] text-[#F4F1F8] truncate">
                  {displayCharName} · {characterClass}
                </div>
                <div className="text-[13px] font-sans text-[#B7A9CC] truncate">
                  {displayPartyName}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-[#2A1B40] border border-[#D4B876]/40">
                <div className="font-['Cinzel'] font-bold text-[18px] text-[#D4B876]">
                  🔥 {stats.bestStreak || 6}
                </div>
                <div className="text-[11.5px] font-sans text-[#B7A9CC] mt-0.5">
                  Best Streak
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#2A1B40] border border-[#D4B876]/40">
                <div className="font-['Cinzel'] font-bold text-[18px] text-[#D4B876]">
                  👑 {stats.fragmentsSolved || 6}
                </div>
                <div className="text-[11.5px] font-sans text-[#B7A9CC] mt-0.5">
                  Solved
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#2A1B40] border border-[#D4B876]/40">
                <div className="font-['Cinzel'] font-bold text-[18px] text-[#D4B876]">
                  ⚔️ {stats.enemiesDefeated || 4}
                </div>
                <div className="text-[11.5px] font-sans text-[#B7A9CC] mt-0.5">
                  Felled
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const shareText = `MYTHIOS · ${displayCharName} (${characterClass})\nParty: ${displayPartyName}\n🔥 ${stats.bestStreak || 6}d Streak · 👑 ${stats.fragmentsSolved || 6} Fragments Solved · ⚔️ ${stats.enemiesDefeated || 4} Enemies Felled`;
                  navigator.clipboard?.writeText(shareText);
                  setShareCopied(true);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#D4B876]/25 border border-[#D4B876] text-[#F4F1F8] font-['Cinzel'] font-bold text-[12px] uppercase tracking-[1px]"
              >
                {shareCopied ? 'COPIED ✓' : 'COPY SNAPSHOT'}
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2.5 rounded-xl bg-[#130B1F] border border-[#3A2555] text-[#B7A9CC] hover:text-[#F4F1F8] font-['Cinzel'] font-bold text-[12px] uppercase"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
