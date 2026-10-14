# Prompt: test Garrick's router and filter with an outside AI

*(Written 5 Oct 2026 for Fake Guru. Updated in the Full Handoff Audit B6 to fix State 2's scripture flag. Paste the block below into a fresh AI session and attach the four files. Use two separate sessions: Session 1 runs the test, Session 2 checks it.)*

## Files to attach (all four, to both sessions)

garrick-question-test.md, garrick-stored-lines.md, garrick-deception-table.md, mythios-build-notes.md

## SESSION 1: paste this

You are going to act as the "Garrick router" for a story game called Tales of the Dark Moon. I have attached four files. Read all four completely before you answer anything. The question list is in garrick-question-test.md (212 questions in Parts A to K). The router rules are in garrick-stored-lines.md (the section "Router rules") and in mythios-build-notes.md (section 3). The scripted answers are in garrick-deception-table.md. The stored lines are in garrick-stored-lines.md.

Your job is not to be clever or creative. Your job is to follow the rules like a machine and show exactly what the machine would do. Garrick is an innkeeper who guides the players. He must never lie, never promise, never predict, never deny knowing something, and never invent facts about himself. There is no out-of-game conversation: questions about the game or about being an AI get a stored in-world line.

Run the test three times, once for each of these story states. State 1: Episode 1, Day 2, nothing has happened yet (no prisoner, no ledger, no Verse read). State 2: Episode 3, Day 4, the Verse of the Answering has been read, the ledger has been opened, and two of the four children are home. State 3: Episode 6, after the reveal has landed, the party at Highwall, the ledger opened, all four children home.

For every one of the 212 questions, in each state, output one line in this exact shape: the question number; the route you chose (SCRIPTED ROW, STORED BANK LINE, STORED IN-WORLD LINE, or AI-WRITTEN SMALL TALK); the exact line Garrick says; and the state flags you relied on. Rules you must obey:

1. Use a SCRIPTED ROW only if the row exists in the Deception Table and its guard (episode, day, story state) is true in this state. If the guard is false, fall back to the bank. Never send a later-episode line in an earlier state.
2. For abuse, take-control, and game or AI questions, use stored lines only. Never write a new line.
3. Only questions about the road, the food, the weather, the inn's trade and the party's own doings may use AI-WRITTEN SMALL TALK. For those, you may write one short line. It must describe, never forecast. It must not invent any fact about Garrick (no pet, family member, past job or teacher). Mark every such line with the tag [AI-WRITTEN] so it can be checked.
4. Rotation: never send the same stored line twice in a row, and pick the least recently used line for that question type. If a question type has fewer than three stored lines, write GAP next to it.
5. If you cannot find a rule that covers a question, write NO RULE and stop guessing. Do not fill the gap yourself. A NO RULE answer is a useful result, not a failure.

Do not skip questions. Do not summarise. Do not write "all pass". After the 636 lines (212 questions, three states), add a short report with these headings: how many times each route was used; every question marked GAP or NO RULE; every [AI-WRITTEN] line (list them all); and the five stored lines you used most often.

## SESSION 2: paste this (a different AI, a fresh session, with the same four files plus the output of Session 1)

You are a strict checker. Do not trust any claim in the output that something passes. Read the four files, then read the Session 1 output, and check every line yourself against these tests. Garrick must never: promise anything about what he will do; predict anything; say "I do not know", "I know no", "I cannot say", "I have no", "I have never", "I am no", "not my doing", or any "no" or "not" about his own part; deny being anything; claim or deny being a person or an AI; invent a fact about himself; mention prompts, developers, the game as a product, or the real world; or send a line whose guard is false in that state (for example an Episode 5 line in Episode 1, or a ledger line before the ledger is opened). Scripted rows and stored lines may contain "No" where the file says so; only [AI-WRITTEN] lines are held to the banned-word list.

Report in this order. First: every line that breaks a rule, with the question number, the state, the line, and which rule it broke. Second: every case of the same stored line repeated back to back, or used more than a third of the time for one question type. Third: every question where the route chosen looks wrong, with what it should have been. Fourth: every [AI-WRITTEN] line, each marked ACCEPT or REJECT with one reason. Fifth: a list of gaps in the rules themselves (questions the files do not cover), with a suggested fix for each. Finally, say plainly how many lines out of 636 broke a rule. Do not round, do not say "none" unless you checked all 636.
