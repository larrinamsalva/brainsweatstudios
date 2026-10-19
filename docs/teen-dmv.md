# Teen DMV Practice

Open **Teen DMV Practice** from the sidebar or home-page invitation (`#/driving`).

The section has 120 original short-story questions in 12 chapters. Every question
has three choices, a best answer, an explanation, and an official source link.
The chapters cover permits and teen restrictions; signs and signals; right-of-way;
lanes and turns; speed and space; sharing the road; parking; weather and visibility;
distraction and impairment; emergencies; insurance and paperwork; and consequences.

Learners can choose any chapter or individual story, review their missed answers,
or try a 24-story mixed set with two questions from every chapter. Mixed-set
explanations appear after the set is complete. No timer is imposed. The score is
a BrainSweat practice result, not a DMV result or qualification.

## Scope and sources

The content addresses **California passenger-vehicle driving**, including rules
specific to minors. It does not claim to state every driving law or apply in other
states. Original stories were checked against official sources on **2026-10-19**:

- [California Driver's Handbook](https://www.dmv.ca.gov/portal/handbook/california-driver-handbook/), with section links alongside the relevant answers.
- [California Highway Patrol teen-driver guidance](https://www.chp.ca.gov/programs-services/programs/youth-programs-and-services/start-smart-driving-smart-to-stay-safe).
- [2026 uniform bail and penalty schedule posted by Alameda Superior Court](https://www.alameda.courts.ca.gov/system/files/forms-and-filings/2026-judicial-council-statewide-uniform-bail-and-penalty-schedule.pdf).
- [California Courts traffic self-help](https://selfhelp.courts.ca.gov/traffic) and [ability-to-pay guidance](https://selfhelp.courts.ca.gov/traffic/ask-lower-fine).

Fine cards distinguish a scheduled **base fine**, that specific table's
**illustrated total**, points and other consequences. These are dated examples,
not universal quotes for a ticket. Local fees, priors, offense subdivisions,
enhanced zones and case facts can change amounts. For example, the independent
2026 Lassen and Yolo schedules have different illustrated totals; the app uses
the linked Alameda-posted table consistently. Statutory first/subsequent phone
and belt provisions are distinguished from the first-offense examples.

When updating laws, review the handbook, the actual Vehicle Code provisions and
the current court schedule together. Update `drivingReviewed`, the user-facing
date, the explanation and the source link. Do not silently substitute a county's
total for a statewide base fine or mix the ordinary and enhanced-zone rows.

## Progress and access

`SaveData.driving` stores the current set, answer choices and per-story attempts.
It uses the existing anonymous profile, export/import, reset and storage-warning
mechanisms. Older backups without this optional historical field receive fresh
driving progress. Imported identifiers, choices, order and response consistency
are checked before replacing a save. Driving study does not alter game mission
scores, XP, badges or the existing 37-world catalogue.

The experience supports keyboard and touch, the existing read-aloud toolbar,
high-contrast settings, and the production offline shell. Legal stories currently
use English. Students should use the current official handbook and qualified
instruction for actual driving.

## 3D objects

Native mesh models include cars with round wheels, hubs, glazing, mirrors and
lamps; octagonal STOP signs with modeled lettering; signal lamps; crosswalks;
curbs; railway tracks and a barrier; cones; a cyclist; pedestrians; trees; and
neighborhood objects. Twelve scene variants accompany the stories. Orbit and
zoom use the existing WebGL2 renderer, with a projected vector fallback. The
same detailed road vehicles also improve Driving Route and CDL Logistics.

## Verification

- `tests/driving.test.ts`: curriculum completeness, balanced mixed sets, grading,
  review, import compatibility/validation and bounded finite geometry.
- `tests/e2e/driving.spec.ts`: home entry, sources, answer feedback, a complete
  mixed set, refresh restoration, profile/backup separation, mobile accessibility,
  camera/fallback controls and production offline use.
- The Pages build's existing advanced-browser gate includes the new browser file.
- `scripts/verify-live.mjs` checks the new section, a sourced stop-sign question,
  its fine card and refresh restoration, then continues the existing live checks.
