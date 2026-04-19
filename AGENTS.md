# AGENTS.md

## Source of truth
When instructions conflict, use this order:
1. Direct user request in chat
2. AGENTS.md
3. PLANS.md
4. Existing code patterns and repo structure
5. Older product notes or reference docs

## Project overview
- Project: Job Radar
- Purpose: A personal job-triage web app that helps one primary user in Toronto quickly identify warehouse and kitchen jobs worth pursuing.
- Main screens:
  - New Jobs
  - My Jobs
  - Settings
  - Job Detail
- UX direction:
  - Feels like a professional job platform first
  - Not a decorative dashboard
  - Calm, premium, readable hierarchy
  - Avoid flashy styling, badge clutter, and invented patterns

## Current stack
- Frontend: React 19 + TypeScript + Vite
- UI: Mantine
- Routing: react-router-dom
- Styling utilities exist, but prefer Mantine patterns first
- Package manager: npm

## Important commands
- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Preview build: `npm run preview`
- Clean build output: `npm run clean`
- Type check: `npm run lint`

## Important working assumptions
- Main app code is likely in `src/`
- This is currently a frontend-first app
- Backend-related packages exist, but do not introduce backend architecture changes unless asked

## Product rules that must stay true
- Keep the main workflow simple:
  - `new`
  - `saved`
  - `applied`
- `applied` overrides `saved` in the UI
- Quick Win is a smart filter, not a separate lane
- Saved jobs leave the New Jobs feed
- Summary and analysis should come before raw listing details
- The app should feel closer to Indeed-style job browsing than a dashboard

## Do
- Read the relevant existing code before changing anything
- Match existing patterns, naming, spacing, and structure
- Use Mantine patterns first before inventing custom UI solutions
- Keep visual hierarchy clear and conventional
- Keep changes small and scoped to the request
- Preserve the product direction and existing workflow rules
- Handle errors clearly and avoid silent failures
- For straightforward tasks, make the smallest safe assumption and state it
- For larger tasks, follow `PLANS.md` before coding

## Planning rule
- For small UI or copy tasks, make the smallest safe change and state assumptions briefly
- For non-trivial tasks, review relevant code first, then follow PLANS.md before coding
- If PLANS.md is missing or outdated, propose a short plan in chat before coding

## Ask first before changing
- Global style system
- Shared layout patterns
- Filtering logic
- Recommendation / scoring logic
- Major information hierarchy on core screens
- Dependency installation
- Backend architecture
- Data model shape
- File deletion or large refactors

## Change scope
- Edit the fewest files possible
- Prefer targeted edits over refactors
- Do not rename, move, or delete files unless asked
- Preserve working behavior unless the request explicitly changes it

## Do not
- Do not commit, push, deploy, or force-push unless explicitly asked
- Do not install new dependencies without asking
- Do not rewrite working code without a clear reason
- Do not add flashy dashboard styling
- Do not invent new spacing, type, or component patterns when existing ones can be reused
- Do not change core workflow behavior outside the request
- Do not hardcode secrets, API keys, or credentials
- Do not weaken checks just to make the app appear to work

## Verification
- After changes, do the narrowest relevant check first
- For most UI changes:
  - run `npm run lint`
  - run `npm run build`
  - open the app and click through the main screens
- Manual check should focus on:
  - New Jobs
  - My Jobs
  - Settings
  - Job Detail
- If a change affects filtering, saved/applied behavior, or hierarchy, call that out clearly in the final summary

## Final summary expectations
After changes, report:
- files changed
- what changed
- what was verified
- any assumptions or risks

## Testing
- There is currently no dedicated automated test script
- Do not claim tests were run unless they actually exist and were run
- Use:
  - `npm run lint` for TypeScript checking
  - `npm run build` for build verification
  - manual click-through of the main screens for product verification
- If adding real automated tests later, update this file with the exact command

## Definition of done
- Requested task is completed
- No unrelated files were changed
- Type check passes
- Build passes
- Main screens still open and function after manual review
- Visual changes remain consistent with the app’s professional job-platform direction
- Any assumptions, tradeoffs, or open issues are clearly stated

## Collaboration workflow
- For non-trivial tasks, first inspect the relevant files, code paths, and constraints before making changes.
- Then propose a short plan before implementation.
- Clearly distinguish:
  - Exploration mode: testing ideas, learning constraints, disposable experiments
  - Execution mode: implementing stable changes intended to keep
- For larger or risky tasks, wait for alignment on the plan before coding.
- Ask at most 1 clarifying question only if truly blocked.
- Otherwise proceed with the safest reasonable assumption and state it.
- Prefer targeted edits over broad rewrites.

## Planning rules
- Use `PLANS.md` for large, multi-step, ambiguous, or high-risk work.
- For those tasks, do not start implementation immediately.
- First:
  - inspect the relevant code and files
  - identify what must be preserved
  - propose a short implementation plan
  - call out risks, assumptions, and open questions
- Only implement after the plan is clear.
- Update `PLANS.md` when major scope, risks, or phase status changes.
- Do not silently drift from the approved product direction in `PLANS.md`.

## Response style
- Be concise and clear.
- Use plain English.
- For non-trivial tasks, structure responses as:
  - Objective
  - Recommended approach
  - Plan
  - Risks / blind spots
  - Deliverable
- After implementation, summarize:
  - what changed
  - what was checked
  - any open issues, tradeoffs, or assumptions