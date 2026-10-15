// Reads docs/canon/episode-*.md and returns Days 1-6 of each week as a list of raw blocks.
const fs = require('fs');
const path = require('path');
const CANON = path.join(__dirname, '..', 'docs', 'canon');
const FILES = ['episode-1-the-list.md','episode-2-the-wind-stone.md','episode-3-the-fire-stone.md','episode-4-the-water-stone.md','episode-5-the-kings-stone.md','episode-6-the-finale.md'];

function rawBlocks(lines) {
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (/^\*\*Designer's notes\*\*/.test(l)) break;
    if (l.trim() === '' || l.trim() === '---') { i++; continue; }
    if (l.startsWith('>')) {
      const q = [];
      while (i < lines.length && lines[i].startsWith('>')) { q.push(lines[i].replace(/^> ?/, '')); i++; }
      blocks.push({ t: 'quote', lines: q });
      continue;
    }
    const bold = l.match(/^\*\*([^*]+)\*\*\s*(.*)$/);
    if (bold) { blocks.push({ t: 'head', text: bold[1].trim(), extra: bold[2].trim() }); i++; continue; }
    if (/^`\[/.test(l.trim())) {
      blocks.push({ t: 'buttons', labels: [...l.matchAll(/`\[([^\]]+)\]`/g)].map((m) => m[1]) });
      i++; continue;
    }
    if (/^\*[^*]/.test(l)) { blocks.push({ t: 'label', text: l.trim() }); i++; continue; }
    blocks.push({ t: 'other', text: l }); i++;
  }
  return blocks;
}

function parseAll() {
  const days = [];
  FILES.forEach((f, wi) => {
    const lines = fs.readFileSync(path.join(CANON, f), 'utf8').split('\n');
    const starts = [];
    lines.forEach((l, n) => { const m = l.match(/^## Day ([1-6])\.\s*(.*)$/); if (m) starts.push({ n, day: +m[1], title: m[2].trim() }); });
    starts.forEach((s, k) => {
      let end = lines.findIndex((l, n) => n > s.n && /^## /.test(l));
      if (end < 0) end = lines.length;
      days.push({ week: wi + 1, day: s.day, title: s.title, line: s.n + 1, blocks: rawBlocks(lines.slice(s.n + 1, end)) });
    });
  });
  return days;
}
module.exports = { parseAll };
if (require.main === module) {
  const days = parseAll();
  console.log(days.length, 'days');
  for (const d of days) {
    console.log(`W${d.week}D${d.day} ${d.title}: ` + d.blocks.map((b) => b.t === 'quote' ? 'Q' : b.t === 'buttons' ? `[${b.labels.join('|')}]` : b.t === 'head' ? `#${b.text}` : b.t === 'label' ? `(${b.text.slice(1, 25)})` : `?${b.text.slice(0, 20)}`).join(' '));
  }
}
