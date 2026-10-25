# Tales of the Dark Moon --- Play-and-Score Audit

**Date:** 2026-10-25\
**Repository reviewed:** `fakeguru69/mythios`\
**Method:** Read-mode audit of generated playthrough documentation and
gameplay-rhythm measurements, not a live app playtest.\
**Progress:** Stages 0--2 recorded. Future stages should be appended to
this same file.

## Scope and confidence

-   The playthrough describes a party of 2--6 real players; the sample
    narrative uses four characters.
-   Rhythm measurements come from `docs/playthrough/gameplay-rhythm.md`
    and describe the documented main path, not every branch.
-   Restricted reveal/canon documents and earlier audits have not been
    inspected.
-   The app was not run; live rolls, Supabase state and mobile UI
    behaviour were not tested.
-   Scores are qualitative judgements, not live-test results. UX is
    `n/a (read mode)`.

## Stage 0 --- Setup

-   Mode: read-mode audit; GitHub repository files accessible.
-   Live playtest: not performed.
-   Game files changed: none.
-   Restricted reveal/canon files and previous audits: left unopened.

## Stage 1 --- Week 1: The Forest Road

### Scores

  Day                                 Story   Mechanics   Campfire / Gathering   Overall
  --------------------------------- ------- ----------- ---------------------- ---------
  Day 1 --- The Forest Road             8.5         7.5                    6.5       7.5
  Day 2 --- The Hollow Wake Inn         8.5         7.5                    8.0       8.0
  Day 3 --- The Widow's Tooth           8.5         7.5                    8.0       8.0
  Day 4 --- Fenmark                     8.5         7.5                    8.0       8.0
  Day 5 --- The Old Charcoal Camp       9.0         7.5                    8.5       8.5
  Day 6 --- The Ford                    9.0         8.0                    8.5       8.5
  Day 7 --- The Mine Gathering          8.5         7.5                    8.5       8.0

**Weekly UX:** `n/a (read mode)`.

### Day-by-day notes

-   **Day 1:** Broken wagon, silent armed stranger and tampered cargo
    box establish danger quickly. "He was at this before you ever saw
    him" reframes the encounter as deliberate. The opening is strong,
    but the first fire has limited multiplayer value.
-   **Day 2:** Names on the list and Meira's notebook turn the incident
    into a wider mystery. Garrick's extra cup is a restrained recurring
    detail. Fail-forward handling protects the plot, but may reduce the
    perceived consequence of failure.
-   **Day 3:** The burned rubbing recurs at the Widow's Tooth; the
    carved horse adds a human trace. The choice can affect who strikes
    first. Verify clue combinations with small parties and varied lead
    choices.
-   **Day 4:** Fenmark's fear and Tamsin's counting song make the case
    personal. Choices reveal different details, though branches often
    converge on the same broad account.
-   **Day 5:** The horse and distinctive knife connect the current case
    to an older disappearance. The date mismatch changes interpretation
    rather than merely repeating evidence.
-   **Day 6:** The river becomes an investigative obstacle. Six Seeker
    Fragments assemble into a map, materially advancing the plot.
    Optional evidence must not be essential to understanding the
    Gathering.
-   **Day 7:** The party rescues Tamsin and finds four children's names.
    "This was never about you" is an effective reversal. The Gathering
    combines a group vote, Approach roll, simultaneous fights, private
    Notice and a United Effort to rescue Dev.

### Week 1 continuity ledger

  -----------------------------------------------------------------------
  Thread                  Payoff by the Gathering Assessment
  ----------------------- ----------------------- -----------------------
  Party names on a list   Broader children        Good open season hook.
                          mystery emerges;        
                          party's role remains    
                          unknown.                

  Burned rubbing /        Matches the Widow's     Strong continuity.
  recurring mark          Tooth and the empty     
                          place in the mine.      

  Meira's notebook        Connects party to       Strong investigative
                          disappearances.         spine.

  Carved wooden horse     Links to an older       Strong payoff.
                          disappearance.          

  Curved black-handled    Connects current and    Strong payoff.
  knife                   older cases.            

  Six Seeker Fragments    Assemble into a map to  Strong structural
                          the mine.               payoff.

  Garrick's extra cup     Still unexplained by    Track as an open
                          first Gathering.        thread.
  -----------------------------------------------------------------------

### Week 1 risks

1.  Campfire clue combinations may depend on specific cards being
    present; test parties of 2--6 and different lead selections.
2.  The prose describes four guards while rules assign one enemy per
    player and support parties of 2--6. Check actual enemy scaling and
    narrative count.
3.  Failed challenges should remain consequential without making later
    deductions unsupported.
4.  Optional discoveries should remain useful.
5.  UX cannot be assessed in read mode.

**Week 1 judgement: 8.1/10 --- promising narrative design;
implementation and small-party checks remain necessary.**

## Stage 2 --- Week 2: The Wind Stone

### Rhythm measurements

  -----------------------------------------------------------------------
  Day          Chapter words           Taps        Longest      Estimated
                                                   reading        chapter
                                                   stretch   reading time
  ----------- -------------- -------------- -------------- --------------
  Day 1 ---              864              5      373 words        4.1 min
  The Mill                                                 
  Road                                                     

  Day 2 ---              542              4      178 words        2.6 min
  The Mill                                                 

  Day 3 ---              591              8      283 words        3.3 min
  Upriver                                                  

  Day 4 ---              549              3      347 words        2.6 min
  What the                                                 
  Hillside                                                 
  Hides                                                    

  Day 5 ---              513              6      290 words        2.8 min
  The                                                      
  Hillside by                                              
  Night                                                    

  Day 6 ---              533              4      263 words        2.6 min
  The Other                                                
  Way In                                                   
  -----------------------------------------------------------------------

The Week 2 Gathering is measured at 2,309 story words and about 10
minutes of reading, with 7 taps to move on, one group decision, three
rolls plus the Battle, two Match interactions, four Ask questions and
one table question. Conversation time is additional.

### Scores

  Day                                   Story   Mechanics   Campfire / Gathering   Overall
  ----------------------------------- ------- ----------- ---------------------- ---------
  Day 1 --- The Mill Road                 8.0         7.5                    8.5       8.0
  Day 2 --- The Mill                      8.5         8.0                    8.5       8.5
  Day 3 --- Upriver                       8.5         7.5                    8.5       8.2
  Day 4 --- What the Hillside Hides       8.0         7.5                    8.0       7.8
  Day 5 --- The Hillside by Night         8.5         7.5                    8.5       8.2
  Day 6 --- The Other Way In              9.0         8.0                    8.5       8.5
  Day 7 --- The Old Room Gathering        9.0         7.5                    8.5       8.3

**Weekly UX:** `n/a (read mode)`.

### Day-by-day notes

-   **Day 1 --- The Mill Road:** Tamsin's testimony gives a specific
    target: "The mill boy next." Corin's name and the cart's route make
    the threat feel organised. "The steady horse" plus "past the gate"
    supports the inference that the mill was selected in advance.
-   **Day 2 --- The Mill:** The miller's wife confirms that Corin was
    taken by name and birth night. Latch, lane and wheel-footing
    investigations produce distinct evidence, and the mark beneath the
    wheel connects to the rubbing.
-   **Day 3 --- Upriver:** Tracks stop where there is no ford. Reading
    exposed wheel marks or following a concealed thorn path has a
    consequence: the exposed route makes the next challenge harder
    because someone saw the party. The old lock opening to the player's
    bare hand raises a new mystery.
-   **Day 4 --- What the Hillside Hides:** The shaft and chanting reveal
    that Corin is alive but held by a group preparing something. Failure
    gives a partial view while preserving the core fact. The documented
    longest reading stretch is 347 words, with only three taps; test
    this on a phone.
-   **Day 5 --- The Hillside by Night:** Meira's margin says the person
    at the centre of the fragments has been erased from records. The
    scout's black circle and the hidden/destroyed carved stones build a
    strong contrast between erasure and preservation.
-   **Day 6 --- The Other Way In:** The sixth fragment maps to an older
    room beneath the hill. "One line" plus "Sifted by hand" suggests the
    captors are searching for a specific object, not merely trying to
    reach Corin.
-   **Day 7 --- The Old Room Gathering:** The chant gives enemies extra
    defence while more than half remain standing. The United Effort has
    meaningful win/loss outcomes: success seals the tunnel and preserves
    the room; failure forces the party out, but Corin takes a separate
    ledger. The six fragments reveal a suppressed history: a king's
    blood answered the Dark Moon, an invading army vanished, and the
    king's name was erased. The children's ledger and the party's birth
    dates connect the historical ritual to the current kidnappings and
    the players themselves.

### Week 2 continuity ledger

  -----------------------------------------------------------------------
  Thread                  Development             Assessment
  ----------------------- ----------------------- -----------------------
  Corin                   Tamsin identifies the   Strong payoff from Week
                          mill boy; his mother    1.
                          confirms he was taken   
                          by name.                

  Birth-night selection   Abductor knew Corin's   Strong escalation.
                          birth night; Meira      
                          recorded party birth    
                          dates.                  

  Recurring mark          Appears beneath the     Strong continuity.
                          mill wheel and in the   
                          hill lock.              

  Old lock and fragments  Lock opens for the      Mechanically
                          player; fragments map   integrated.
                          the older room.         

  Erased historical       Meira finds records     Strong mystery engine.
  figure                  scraped clean;          
                          fragments tell another  
                          history.                

  Black circle / scout    Scout wears the symbol  Good evidence trail;
                          and signals the shaft;  track into Week 3.
                          carved stones were      
                          destroyed or hidden.    

  Children's ledger       Names, places, dates    Major reveal; "given"
                          and "given"; newest     needs later
                          page names four         explanation.
                          children.               

  Party birth dates       Each matches a night    Strong cliffhanger;
                          the moon went dark.     party is implicated.
  -----------------------------------------------------------------------

### Week 2 risks

1.  **Gathering length:** 2,309 words and about 10 minutes reading
    before discussion; test group attention and pacing.
2.  **Variable party size:** prose describes four robed figures while
    rules assign one enemy per player; verify scaling for parties of
    2--6.
3.  **Fail-forward consistency:** win/loss United Effort outcomes
    produce different physical evidence. Later scenes must not assume
    all parties have identical items.
4.  **Branch persistence:** ensure the exposed wheel-mark route's
    increased difficulty applies only to the correct branch.
5.  **Historical exposition:** "given," the erased king and birth-night
    pattern create several major questions. Week 3 should develop them
    rather than distract with unrelated mysteries.
6.  **Readability:** longest Week 2 stretches are 373 words (Day 1) and
    347 words (Day 4); test on a phone.

**Week 2 judgement: 8.3/10 --- strong escalation and a meaningful season
reveal; main risks are Gathering length, variable party-size consistency
and preserving different failure outcomes.**

## Cross-week summary (Stages 1--2)

### What is working

-   Recurring physical evidence advances the story rather than relying
    only on exposition.
-   Seeker Fragments have a double role: daily puzzle and weekly map
    that affects the Gathering.
-   Weekday failure usually preserves the core plot while changing cost,
    information or risk.
-   Campfire clue pairings ask players to infer motives and methods, not
    merely recap events.
-   Escalation is effective: apparent attack on the party →
    child-abduction mystery → historical ritual → party members' birth
    dates.

### Highest-priority checks

1.  Run Gatherings with parties of 2, 3, 4, 5 and 6.
2.  Test every branch that adds a next-day difficulty modifier or
    changes a Gathering outcome.
3.  Test clue "clicks" with minimum-size parties and different lead
    selections.
4.  Verify win/loss United Effort states lead to consistent later
    evidence.
5.  Conduct a real phone UX pass for long text stretches, tap counts,
    chat interaction and Gathering duration.

## Stage tracking

-   [x] Stage 0 --- Setup and scope
-   [x] Stage 1 --- Week 1
-   [x] Stage 2 --- Week 2
-   [ ] Stage 3 --- Week 3
-   [ ] Stage 4 --- Week 4
-   [ ] Stage 5 --- Week 5
-   [ ] Stage 6 --- Week 6
-   [ ] Stage 7 --- Restricted reveal/canon comparison (only after Stage
    6)
-   [ ] Stage 8 --- Compare with prior audits (only after Stage 7)

**Update policy:** Append each completed stage to this same report file.
Do not create a separate report per week. Keep the restricted-document
and prior-audit gates in place.
