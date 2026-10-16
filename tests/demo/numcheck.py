import re, glob, os
import os, sys
S = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.environ.get('TEST_OUT', 'test-output'), 'season')
DC={1:6,2:7,3:7,4:8,5:9,6:9}; WDEF={1:22,2:23,3:24,4:24,5:25,6:25}; WATK={1:15,2:16,3:17,4:17,5:18,6:18}
problems=[]; n=0
for f in sorted(glob.glob(f'{S}/w*d*-day.txt')):
    w,d=map(int,re.match(r'w(\d)d(\d)',os.path.basename(f)).groups())
    t=open(f).read().replace('\n',' ')
    # challenge roll lines: 🎲 13 + Charm 38 (+2) − DC 7 = +8
    for m in re.finditer(r'🎲 (\d+) \+ (\w+) (\d+) \(\+(\d+)\)(?: \+ Relic \+4)? − DC (\d+) = ([+−-]?\d+)',t):
        n+=1; r,a,sc,b,dc,res=m.groups(); res=int(res.replace('−','-'))
        tier = 0 if int(sc)<=25 else 2 if int(sc)<=50 else 4 if int(sc)<=75 else 6 if int(sc)<=100 else 8
        if int(b)!=tier: problems.append(f'W{w}D{d} tier: {m.group(0)}')
        if int(r)+int(b)-int(dc)!=res: problems.append(f'W{w}D{d} sum: {m.group(0)}')
        if int(dc) not in (DC[w], DC[w]+4, DC[w]+2): problems.append(f'W{w}D{d} DC {dc}: {m.group(0)}')
    for m in re.finditer(r'🎲 (\d+) \+ WEP (\d+) − DEF (\d+) = ([+−-]?\d+)',t):
        n+=1; r,wp,df,res=m.groups()
        if int(df)!=WDEF[w]: problems.append(f'W{w}D{d} enemy DEF {df} (want {WDEF[w]})')
        if int(r)+int(wp)-int(df)!=int(res.replace('−','-')): problems.append(f'W{w}D{d} fight sum: {m.group(0)}')
    for m in re.finditer(r'🎲 (\d+) \+ ATK (\d+) − AMR (\d+) = ([+−-]?\d+)',t):
        n+=1; r,at,am,res=m.groups()
        if int(at)!=WATK[w]: problems.append(f'W{w}D{d} enemy ATK {at} (want {WATK[w]})')
        if int(r)+int(at)-int(am)!=int(res.replace('−','-')): problems.append(f'W{w}D{d} enemy sum: {m.group(0)}')
    for m in re.finditer(r'HIT \+(\d+) × 5 = (\d+)',t):
        n+=1
        if int(m.group(1))*5!=int(m.group(2)): problems.append(f'W{w}D{d} damage: {m.group(0)}')
print('checked',n,'number lines'); print('\n'.join(sorted(set(problems))) or 'no problems')
