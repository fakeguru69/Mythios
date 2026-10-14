import sys
from g_run import *
# Fixed 5 Oct 2026 (Full Handoff Audit B11): Episode keys 2..6 (Gathering 1 has no condition; Gathering 6 splits faithful/chant and hollowed/rise)
C={2:dict(chant=1),3:dict(burn=2),4:dict(knee=3),5:dict(hollow=2,hollow_skip=True),6:dict(chant=1,hollow=2,hollow_skip=True)}
if __name__=="__main__":
    go([("FINAL (G6=100/100, conds Ep2-6)",dict(cond=C,g6_start=100,safety=False)),("FINAL no conds",dict(g6_start=100,safety=False))],n=int(sys.argv[1]))
