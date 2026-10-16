import re, glob, os, collections
import os, sys
S = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.environ.get('TEST_OUT', 'test-output'), 'season')
CHECKS = [
  ('placeholder', r'\{[A-Z0-9\-]+\}|\bundefined\b|\bNaN\b|\[object |\bnull\b'),
  ('writer note', r'\b2026\b|\b1[45] Oct\b|\[PLANT\]|Fake Guru|\bTVMen\b|\bcanon\b'),
  ('builder jargon', r'\bbranch\b|\bmsgs\b|[Pp]in-before-peek|\bNo gold\b|\bsolo\b|\blandmark\b|\bQA\b|\bdebug\b|\bTest\b|\bLLM\b|\bGemini\b|\btoken|\bverifier\b|\bAcceptance\b|\bv2\.\d|\bbearsOnFork\b|\bqaNote\b|true meaning|Deception'),
  ('old terms', r'\bObstacle\b|\bEpisode\b|\bConnect\b|\bChecks?\b(?! out)|Record Card|\bHERO\b'),
  ('weekday name', r'\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b'),
  ('banned (Garrick)', r"\b(maybe|perhaps|possibly)\b|I don't know|I've never|I've heard|I wouldn't know|I couldn't say"),
  ('secret', r'Malakor|descendant|\bheir\b'),
]
hits = collections.defaultdict(list)
for f in sorted(glob.glob(f'{S}/*.txt')):
    name = os.path.basename(f)[:-4]
    if name == 'log': continue
    lines = open(f).read().split('\n')
    for i, line in enumerate(lines):
        for label, rx in CHECKS:
            for m in re.finditer(rx, line):
                hits[(label, line.strip()[:140])].append(name)
by_label = collections.defaultdict(list)
for (label, line), files in hits.items():
    by_label[label].append((len(files), line, files))
for label, _ in CHECKS:
    rows = sorted(by_label.get(label, []), reverse=True)
    print(f'\n## {label}: {len(rows)} distinct lines')
    for n, line, files in rows[:40]:
        print(f'  [{n}x {files[0]}{"…" if n>1 else ""}] {line}')
