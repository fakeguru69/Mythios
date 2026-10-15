# Plan: real multiplayer (15 Oct 2026)

Fake Guru: "start planning real multiplayer: yes". **Decided 15 Oct: 1 yes, 2 yes, 3 yes, 4 later, 5 yes, 6 yes** (web app; Supabase; Google and email sign-in first, Apple at launch; the group-chat test later; Week 1 for 2–4 friends first; terms "13 and over").

It builds on canon: Core Rules §1 (where the game is played) and §12a (rules for the builder), `mythios-build-notes.md` §6–§8 (the states, the smallest thing worth building, the build order), and `review-accounts-and-invites.md`.

## Where we are

Today the game is a **one-phone demo**:
- The save lives on the phone (the browser's own storage).
- Most dice roll on the phone.
- The other friends are sample friends who act on their own.
- Garrick's free AI chat runs only in the workbench.

Real multiplayer means four things change:
1. Each friend has **their own account and phone**, and the party's state lives on a **server** that every phone reads from.
2. **The server rolls every die and keeps the clock** (canon §12a): a day opens at 5:00am on the party's clock.
3. The **party chat, the fire and the Gathering** carry real friends' messages, picks and rolls, live.
4. Friends get **a nudge when a day opens** and before the Gathering (push notifications).

## The choices, with a recommendation

| Choice | Options | Recommendation and why |
|---|---|---|
| **How friends install it** | (a) A web app they add to their home screen. (b) App Store and Play Store apps. | **(a) Web app first.** One build for every phone, no store review, and updates reach everyone at once. Push notifications work on Android, and on iPhone once added to the home screen (iOS 16.4 and later). Store apps can come later from the same code. |
| **The server** | (a) Supabase: database, sign-in, live updates, server functions. (b) Firebase (Google). (c) Our own Express server, as now. | **(a) Supabase.** It has every sign-in canon asks for (Google, Apple, email and password), live updates for the party chat and the Gathering, and server functions for dice and the clock. It is a standard database, so records are easy to check. A Supabase connection is already available in this workspace. (c) would mean building all of that by hand. |
| **Garrick's AI** | Keep Gemini (as now), or switch. | **Keep Gemini for now**, called only from the server, with the stored-lines router first (canon §12a). It is only small talk; the story never waits on it. |
| **Notifications** | Web push, email, both. | **Web push, with email as a fallback** for friends who turn push off. |

## What gets built, in order

This follows the build order in `mythios-build-notes.md` §7. The first goal is canon's **"smallest thing worth building"**: Week 1 only, two to four friends, on their own phones.

1. **Accounts and the party.**
   - Sign-in by Google, Apple, or email and password.
   - The host makes and names the party; the invite link asks to join; the host approves each friend.
   - Session Zero runs once per friend.
   - The party clock: time zone locked, a day opens at 5:00am.
   - The invite page, leaving, removing, a new host and deleting an account follow `review-accounts-and-invites.md`, which is already worded.
2. **The save moves to the server.** Gold, gear, Relics, Attributes, the Record, fragment words and finished days are saved the moment they change, each change applied once only (canon §12a). The sample friends go.
3. **The server rolls every die.** Challenges, [PRESS ON], fights, Fan Out leads, the Approach, [LOOK CLOSER] and the United Effort. (Today only three of these use the server.)
4. **The party chat and the fire with real friends.**
   - Result lines ("Mei passed today's Challenge.").
   - Fragment words: one per friend until the day ends, each posting a line.
   - The board with each friend's real find, pins and readings (pin before you see the others').
   - The riddle with 3 tries each, and the week board.
5. **The Gathering live.**
   - Lobby, then a single start; "first tap counts" for shared buttons.
   - The Battle in step; the United Effort with real turns; Match with each friend's own pick, including the 100g "everyone right" rate; Ask.
   - Recaps for absent friends.

   This is canon's riskiest stage.
6. **Notifications.** "Your chapter is ready" when the day opens, the Gathering poll on Day 4 and the time pinned on Day 5, and a reminder before it starts.
7. **A real playtest: Week 1 with real friends** (for example Fake Guru, Mei, Dev and Arjun). This answers canon's three questions: do friends open it six days running, does the live Gathering work on real phones, do the rolls and gold feel fair.
8. **Then Weeks 2 to 6,** which are already written and play in the demo.

Also turned on with multiplayer (agreed earlier):
- the Record's party-lead crowns and the "Lifeline" badge;
- the Campfire test controls and the day picker move behind `?dev=1`.

## Three cheap tests before the big build (canon §7)

1. **Garrick:** run 200 typed questions through his router and check every answer against his rules.
2. **The live Gathering on real phones:** four people on ordinary connections play one Gathering with stored text.
3. **Do people come back daily?** Run Week 1 in an ordinary group chat, with one person posting MYTHIOS's stored text by hand.

Test 3 needs no code. It could start this week and tell us the most.

## Rough running costs (estimates, to check before signing up)

| Item | Cost |
|---|---|
| Supabase | Free for testing; about US$25 a month for a public launch. |
| Hosting the web app | Free to low at this size (Vercel, Netlify or Supabase). |
| Gemini (Garrick's small talk) | Low: stored lines answer most questions; capped turns. |
| A web address | About US$15 a year. |
| **Sign in with Apple** | Needs an **Apple Developer account, US$99 a year**, even for a web app. If that is not wanted yet, start with Google and email, and add Apple later. |

## Terms and privacy (needed before anyone outside the team plays)

- **What we store about players:** account email, names, character names, chat messages, and the two Session Zero answers (birthplace and a grandparent's name). Those last two are personal details, so the privacy policy must say why they are kept and who sees them (only the player's own party).
- **AI processing:** Garrick's small-talk messages go to Google's Gemini. The policy must say so.
- **Age:** canon has no age check (decided 3 Oct). Laws and app stores still expect the terms to state a minimum age (commonly 13). **Recommendation:** keep no age check in the app, and state "13 and over" in the terms.
- **Deleting an account** deletes the player's data, and their character stays in the story as a name only (canon §12a). The policy must describe this.
- **Reporting:** canon's press-and-hold [REPORT] reaches the makers. Someone has to read the reports.
- Both documents should be **checked by a lawyer** in the country of launch (Singapore: the PDPA). We can draft them in plain English first.

## Decisions for Fake Guru

1. Web app first, store apps later?
2. Supabase as the server?
3. Start with Google and email sign-in, and add Apple (US$99 a year) at launch?
4. Run cheap test 3 (Week 1 by hand in a group chat) now, while the build starts?
5. Build to the "smallest thing worth building" first: Week 1, 2–4 friends?
6. Terms: "13 and over", with no age check in the app?
