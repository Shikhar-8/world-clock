# Current Time Clock - Standing Project Rules

These rules apply to every change made to this project. They are a permanent addendum to the tokenization (CSS) and logic-centralization (JS) rules already established.

## 1. No New Dependencies Without Explicit Approval
Do not add any new npm package, library, or external script — including "small" or "zero-dependency-claiming" ones — without asking first and stating: what it's for, its approximate size/weight, and whether a native browser API could do the same job without it. This project has a hard 0.5s load budget; every dependency is a risk to that budget and must be justified before it's added, not reviewed after the fact.

## 2. Define Constants Once, Not Inline
Any fixed value used in logic — timezone identifiers, storage/localStorage key names, breakpoint pixel values, API endpoints, default city, default theme — must be defined once as a named constant in a single shared location (e.g., `src/lib/constants.ts`), never typed directly inline wherever it's used. Same principle as design tokens, applied to logic instead of styling. If the same "magic string" or number appears in more than one file, that is a sign it should already be a constant.

## 3. Handle Failure States Explicitly, Never Silently
Every function that can fail — a city not found, a timezone lookup returning nothing, a network/API call timing out — must have a defined, intentional failure behavior, not just an unhandled error or a blank/broken UI. Before writing a function that fetches or looks up data, state in a one-line comment what happens if it fails. If a failure state requires a UI treatment we haven't designed yet (an error message, a fallback), flag it and ask rather than inventing one silently.

## 4. Comment the "Why," Not Just the "What," for Non-Obvious Decisions
Beyond the existing rule that every `/lib` function needs a one-line input/output comment: if you make a decision that isn't obvious from the code itself (e.g., "using a debounce here because typing fast was causing duplicate lookups," or "this value is hardcoded because the API doesn't provide it"), add a short comment explaining why. The goal is that a future agent — or a less experienced one — can understand your reasoning without needing you to still be in the conversation.

## 5. When Uncertain, Say So Plainly — Do Not Project False Confidence
If you cannot verify something (rendering is broken, a tool failed, you're not fully sure a fix addresses the root cause), state that plainly and first, in plain language, before anything else in your response. Do not use confident technical language ("mathematically frozen," "guaranteed," "exact match") to describe something you have not actually tested. A correct "I'm not sure, here's what I'd need to check" is always preferred over an incorrect "this is fixed." This project has lost significant time to claims that were stated confidently and turned out to be wrong.

## 6. Keep Files Single-Purpose — Split Before They Sprawl
Each file in `/lib` or `/ui` should do one job (e.g., `time.ts` handles time math only, not also city matching). If a file starts accumulating functions that aren't clearly related to its original purpose, stop and propose splitting it into a new file rather than continuing to add to it. As a rough guide: if you're unsure whether a new function belongs in an existing file, that uncertainty is itself a signal to ask rather than default to "just add it here for now."

## 7. No Scope Expansion Without Separate Approval
Every response should clearly separate "what I changed because you asked" from "what I noticed and am proposing separately." These must never be implemented in the same pass.
