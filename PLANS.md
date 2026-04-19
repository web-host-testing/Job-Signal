# Job Radar Implementation Plan

## Purpose
This document is the living implementation plan for Job Radar.

It should stay current as the product evolves. When a phase is completed, update this file to reflect:
- what shipped
- what changed from the original plan
- what remains
- any new risks, decisions, or constraints

---

## Product Goals

Job Radar is a personal job-triage web app for one primary user in Toronto.

Its purpose is to help Matte quickly identify warehouse and kitchen jobs that are most worth pursuing, especially roles that are:
- likely to offer 30+ hours per week
- within 1 hour by public transit
- easier to get hired for
- legitimate enough to trust
- a realistic fit for his actual experience
- aligned with the specific kinds of jobs he wants searched
- discoverable from the platforms and source sites he actually wants included

The product should feel like a professional job platform first, not a decorative dashboard.

### Core product outcomes
- Reduce time spent sorting through low-quality listings
- Highlight the strongest opportunities quickly
- Separate new opportunities from actively tracked jobs
- Keep preferences and resume variants easy to manage
- Support intelligent triage with trustworthy signals
- Let the user define custom job-search intent, not just broad lanes
- Let the user control which job platforms and source sites are searched
- Support exact commute-origin selection for better routing and scoring
- Eventually support real source ingestion, scoring, and relevant notifications

### UX direction
The interface should follow a clean job-board hierarchy similar to Indeed:
- title
- company
- location / commute
- pay
- hours
- a small number of clear signals

Design should feel calm, premium, and professional.
Avoid excessive badge clutter, random accent colors, and dashboard-like decoration.

---

## Current State

### Repository state
The current repository is a Vite + React + TypeScript app using Mantine.

Existing major surfaces:
- New Jobs feed
- My Jobs page
- Settings page
- Job Detail page

Existing technical foundations:
- client-side routing
- local state stores
- mock job data
- Resume Library
- Mantine theme setup
- mobile and desktop layouts

### Current behavior already aligned with the product
- Feed exists and supports lane-based browsing
- Quick Win filter exists
- high-frequency feed controls stay visible instead of being hidden in dropdowns
- Saving from the feed exists
- Saved jobs leave the New Jobs feed
- My Jobs has Saved and Applied tabs
- Resume Library exists in Settings
- Job detail already presents summary/analysis before raw listing
- Applied state visually overrides saved

### Recent shipped UI/UX decisions
- Feed controls were simplified around direct-use controls:
  - lanes
  - Quick Win
  - sort
  - filters
- Job Detail hero now uses one primary recommendation signal instead of multiple overlapping badges
- Job Detail recommendation uses four action-oriented tiers:
  - `Top Pick`
  - `Strong Pick`
  - `Worth a Look`
  - `Low Priority`
- recommendation appears as a bookmark-style badge above the title with a short visible reason beside it
- missing pay is demoted; only real pay may be promoted above the title
- Job Detail primary action model now supports:
  - one primary apply CTA
  - one secondary menu for alternate apply sources
  - source logos only when available
- redundant duplicate source/posting actions were removed when URLs are the same
- Job Detail analysis was consolidated into:
  - Hours
  - Transit
  - Fit
  - a separate balanced Outlook / Employer Risk block
- Transit now uses a small inline `Route in Maps` button instead of a detached icon button
- Fit card copy was shortened to a direct verdict plus checklist, without a redundant explanatory paragraph
- feed and My Jobs cards now use the same recommendation language as Job Detail, shown as a top bookmark-style badge
- selected-card styling was separated from opportunity/recommendation styling so navigation state does not look like a score

### Current gaps
- UI system is inconsistent
- layout patterns are duplicated
- typography and spacing hierarchy are uneven
- action styles and badge usage are inconsistent
- desktop Settings does not yet fully match the desired full-width treatment
- users cannot yet define custom job-search profiles
- users cannot yet control which job platforms/sources are searched
- commute origin is still text-only and does not support exact place selection
- data is still mock-driven
- there is no ingestion pipeline
- there is no normalized backend data model
- the intelligence/scoring engine is still mock-data driven and not yet backed by normalized live data
- commute is not real
- notifications are not real

### Current product-model mismatch to fix
The current status model still includes states that do not belong in the main workflow:
- `ignored`
- `removed`

Planned visible workflow should be simplified to:
- `new`
- `saved`
- `applied`

Rules:
- applied overrides saved in the UI
- save happens from the feed
- Saved contains unapplied saved jobs only
- Applied contains jobs marked applied
- Quick Win is a smart filter, not a separate lane
- summary and analysis come before the raw listing

---

## Target Product Shape

### New Jobs
- feed of new jobs worth checking
- warehouse and kitchen lanes
- Quick Win smart filter
- save from feed
- saved jobs leave the New Jobs feed

### My Jobs
- two tabs: Saved and Applied
- Saved contains unapplied saved jobs only
- Applied contains jobs marked applied
- no card-level action clutter

### Settings
- full-width settings page on desktop
- store commute origin
- store exact commute place data
- store max transit
- store minimum hours
- store availability
- store certifications
- manage custom job-search profiles with AI-assisted related titles and keywords
- manage preferred job platforms and source links
- choose exact commute origin using Google place search with fallback text entry
- manage Resume Library:
  - Kitchen CV
  - Warehouse CV
  - General / Quick Win CV

### Job Detail
- top action bar:
  - Mark applied
  - Save
- primary metadata:
  - title
  - employer
  - location
  - posted time
- key facts row:
  - pay
  - hours/week
  - transit
  - relevant status like Gap
- balanced analysis cards:
  - Requirements
  - Commute
  - Hire Chance & Risk
  - Hours Reality Check
- original posting link
- share action
- Google Maps route link
- AI Resume Tailoring section with CV selection and Copy CV Prompt Pack

---

## Implementation Defaults

These defaults are approved unless intentionally changed later.

### Architecture
- keep the existing Vite frontend
- add a small Node + TypeScript backend in the same repository
- design for single-user use now, but keep the data model ready for future multi-user SaaS expansion
- use a normalized data model instead of source-specific frontend shapes

### Source ingestion strategy
- use one adapter per source
- start with the most stable and easiest sources first
- prefer official/public endpoints where possible
- use HTML extraction only where necessary
- treat Job Bank as an early priority source

### Notification strategy
- start with in-app alerts
- add browser push later only after relevance and deduplication are trustworthy

### Intelligence strategy
- use deterministic rule-first scoring
- keep AI/LLM support optional and secondary
- explanations should be concise, practical, and trustworthy

---

## Phased Roadmap

## Phase 1: Cleanup And Stabilization

### Goals
- simplify the product model
- remove prototype-only workflow paths
- establish a consistent UI system
- reduce styling fragmentation
- make current screens feel coherent without changing core product behavior
- create a clean foundation for later backend integration

### Main work
- simplify visible job state to `new`, `saved`, and `applied`
- remove ignore/removed from the main product flow
- centralize theme tokens for spacing, typography, surfaces, borders, and signals
- reduce mixed use of Mantine, Tailwind utilities, and ad hoc inline styling
- standardize shared page shell patterns
- standardize shared card, header, metadata-row, and tag patterns
- make Settings full-width on desktop as part of the shell cleanup
- keep route behavior stable while making layout structure more consistent

### Likely areas affected
- app shell and layout
- shared UI components
- page containers
- job state store
- preferences store
- theme and CSS foundations

### Dependencies
- none

### Main risks
- refactoring visuals without enough restraint
- unintentional behavior changes during layout cleanup
- preserving prototype quirks instead of simplifying them

### Exit criteria
- all core routes still work
- status behavior matches the target workflow
- feed, My Jobs, Settings, and detail page use a more consistent hierarchy
- UI feels closer to a professional job board than a prototype dashboard
- build and lint remain clean

---

## Phase 2: UI Hierarchy And Detail-Page Rebuild

### Goals
- rebuild the information hierarchy to match the product brief
- make the app feel like a job platform first
- reduce visual noise and badge clutter
- make Job Detail the strongest, clearest screen in the product
- turn Settings into the source of truth for search intent, source preferences, and exact commute origin

### Main work
- redesign feed cards around:
  - title
  - company
  - location / commute
  - pay
  - hours
  - minimal high-value signals
- ensure My Jobs uses the same hierarchy but without card-level action clutter
- rebuild Job Detail with:
  - top action bar
  - clearer metadata hierarchy
  - key facts row
  - balanced analysis sections
  - posting/share/maps actions
  - AI Resume Tailoring section
- keep summary and analysis ahead of raw listing
- tune the visual system toward calm premium styling
- keep Quick Win as a filter and signal, not a separate lane
- add a Search Preferences Foundation in Settings:
  - customizable job-search profiles
  - user-managed job source list
  - exact Google place search for commute origin with text fallback
- extend `PreferencesState` with:
  - job-search profiles
  - job sources
  - exact place fields for commute origin
- migrate older stored preferences safely into the expanded model
- build CRUD UI for:
  - job-search profiles
  - job sources
- add AI-assisted settings flows that are suggest-only:
  - generate related titles and keywords from a user description
  - suggest relevant source sites for a selected profile
- require explicit user review/save for all AI-generated titles, keywords, and sources

### Likely areas affected
- feed page
- My Jobs page
- Settings page shell
- Job Detail page
- job card component
- shared metadata and section components

### Dependencies
- Phase 1 theme/system cleanup
- simplified status model

### Main risks
- overdesigning beyond the job-board target
- introducing too many custom visual treatments again
- rebuilding detail around mock data assumptions that later conflict with live data

### Exit criteria
- feed cards are cleaner and easier to scan
- My Jobs has clearer separation between Saved and Applied
- desktop Settings feels intentionally full-width
- detail page matches the target product structure closely
- desktop and mobile behavior remain coherent

---

## Phase 3: Source Ingestion And Normalization

### Goals
- replace mock data with real listings
- ingest jobs from multiple target sources
- normalize source-specific job data into one shared model
- keep user-specific state separate from source job data

### Initial target sources
- Job Bank
- Randstad
- Adecco
- Express
- Aerotek

### Later sources
- Manpower
- Instawork

### Main work
- add a small backend service layer
- add persistent storage for jobs, source metadata, refresh history, and user state
- define a normalized job schema that supports:
  - source
  - source URL
  - external source ID
  - title
  - employer
  - location
  - pay facts
  - hours facts
  - raw source snapshot reference
  - timestamps
  - transit estimate placeholder
  - analysis outputs
  - matching job-search profile IDs
  - search/query provenance where useful
- build one adapter per source
- add refresh orchestration and deduplication
- use saved job sources to constrain or prioritize ingestion scope
- use job-search profiles to drive title matching, keyword matching, and source targeting
- respect enabled/disabled user source preferences during ingestion
- replace frontend mock-data usage with API-backed data loading
- preserve Saved and Applied as user state layered on top of source jobs

### Dependencies
- Phase 1 cleanup
- stable frontend data contracts from Phase 2

### Main risks
- brittle source extraction
- duplicate listings across sources
- inconsistent pay/hours/location data
- schema drift caused by source-specific quirks
- legal or technical instability in scraping/fetching approaches

### Exit criteria
- at least one live source fully integrated end-to-end
- normalized jobs render in the existing product surfaces
- deduplication works on repeated refreshes
- saved/applied state still behaves correctly with live data
- mock data is no longer required for normal app use

---

## Phase 4: Intelligence Layer

### Goals
- make Job Radar meaningfully smart, not just a source aggregator
- generate useful, trustworthy signals that reflect Matte's actual goals
- support better filtering, ranking, and decision-making

### Main scoring areas
- Quick Win scoring
- fit/gap extraction
- realistic hours estimation
- hire chance
- company reputation / employer risk
- repost / ghost-job signals

### Main work
- define structured analysis outputs and confidence levels
- build rule-first scoring based on:
  - commute constraints
  - hours target
  - availability
  - certifications
  - lane fit
  - job-search profile alignment
  - source signals
  - posting history
- add AI-assisted expansion of job-search profiles:
  - related titles
  - synonyms
  - matching keywords
  - avoid keywords
- make fit/scoring profile-aware:
  - stronger fit when titles/skills align with a chosen profile
  - weaker fit when only broad lane overlap exists
- make recommendation and explanation source-aware:
  - prioritize preferred sources
  - use source type in explanation and confidence
- store scoring explanations in a concise, user-readable way
- surface the highest-value signals in feed cards
- surface fuller explanations in Job Detail
- use historical source observations to strengthen repost and ghost-job signals
- keep any AI assistance optional and behind a clear interface

### Dependencies
- live normalized data from Phase 3
- stable user preferences
- stable job identity and refresh history

### Main risks
- opaque scoring
- noisy or weak explanations
- overclaiming certainty
- relying on LLM output before deterministic scoring is trustworthy
- inaccurate hours/risk inference without enough historical data

### Exit criteria
- Quick Win meaningfully improves ranking/filtering
- fit/gap signals reflect real candidate strengths and missing requirements
- explanations are concise and believable
- scoring behavior is deterministic and testable
- intelligence outputs improve the usefulness of both feed and detail

---

## Phase 5: Notifications

### Goals
- keep Job Radar useful between manual sessions
- notify when genuinely relevant new jobs appear
- avoid spam and duplicate alerts

### Main work
- add periodic refresh scheduling
- define what qualifies as a relevant new job
- persist "seen" vs "new" vs "notified" state
- add in-app notifications or alert center
- add preference controls for alert thresholds if needed
- leave browser push for a later pass after in-app notifications are proven

### Dependencies
- ingestion pipeline
- normalized job persistence
- stable scoring logic
- refresh history and deduplication

### Main risks
- alert fatigue
- duplicate notifications
- low-quality "relevant" matches
- race conditions between refresh, scoring, and notification generation

### Exit criteria
- refresh runs automatically
- relevant new jobs generate in-app alerts
- repeated refreshes do not re-notify the same listings
- notifications are sparse and high-signal enough to trust

---

## Recommended Order Of Work

### Do first
1. Phase 1: Cleanup And Stabilization
2. Phase 2: UI Hierarchy And Detail-Page Rebuild

Reason:
The current app still has prototype-level inconsistency. Shipping ingestion or scoring before the UI system and product model are stable would create extra churn.

### Do next
3. Phase 3: Source Ingestion And Normalization

Reason:
Once the frontend structure is stable, real data can be integrated against clearer contracts.

### Do after that
4. Phase 4: Intelligence Layer

Reason:
Scoring will be much stronger once real jobs, normalization, and source history exist.

### Do last
5. Phase 5: Notifications

Reason:
Notifications depend on stable ingestion, relevance scoring, and deduplication.

### Explicitly wait on
- browser push
- email digests
- extra sources beyond the first few adapters
- heavy AI-first scoring
- public multi-user product work

---

## Cross-Phase Risks

### Product risks
- building too much intelligence before the data foundation is trustworthy
- overcomplicating a product that should stay fast and readable
- letting the UI drift back toward decorative dashboard patterns

### Technical risks
- tight coupling between source adapters and frontend assumptions
- poor job deduplication across sources
- mixing user state with source job state
- weak shared contracts between frontend and backend
- brittle transit and employer-risk logic if rushed

### Delivery risks
- trying to build too many sources at once
- doing major UI cleanup and backend introduction at the same time
- taking on notifications before relevance quality is high enough

---

## Testing Checklist

This checklist should grow with the product.

### Baseline app checks
- app loads successfully
- core routes work
- desktop and mobile layouts both function
- lint passes
- build passes

### Workflow checks
- saving from feed removes a job from New Jobs
- saved jobs appear only in Saved until marked applied
- applied jobs appear in Applied
- applied overrides saved in the UI
- My Jobs cards stay free of extra action clutter
- Quick Win behaves as a smart filter, not a lane

### Settings checks
- preferences persist correctly
- old preferences migrate safely into the expanded settings model
- Resume Library is editable and stable
- desktop Settings uses the intended full-width treatment
- commute, hours, availability, and certifications are stored correctly
- users can add, edit, remove, and enable/disable job-search profiles
- AI-generated titles/keywords require explicit user review and save
- users can add, edit, remove, and enable/disable job sources
- AI-suggested sources require explicit user approval before saving
- Google place selection stores exact place data
- text fallback for commute origin still works if Google place search is unavailable

### Job Detail checks
- top action bar works
- metadata hierarchy is clear
- key facts row is present
- analysis cards are balanced and readable
- share action works
- original posting link works
- Google Maps route link works
- AI Resume Tailoring section works
- summary and analysis appear before raw listing

### Ingestion checks
- source adapters fetch and normalize correctly
- duplicates are not created on repeat refresh
- canonical source URL and source ID are stored
- live jobs appear correctly in the feed
- saved/applied state remains stable across refreshes

### Intelligence checks
- Quick Win scoring is deterministic
- fit/gap logic matches obvious cases
- hours estimation handles common cases sensibly
- hire chance and employer risk remain explainable
- repost signals use stored history correctly

### Notification checks
- new relevant jobs generate alerts
- repeated refreshes do not duplicate alerts
- low-quality jobs do not generate noisy alerts
- alert state is persisted correctly

---

## Living Document Rules

Update this file whenever one of these changes:
- product goals
- workflow rules
- implementation order
- source priorities
- architecture choices
- risks
- test strategy

When a phase begins:
- add implementation notes
- add decisions made during execution
- record any scope cuts

When a phase ends:
- mark what shipped
- note deviations from plan
- update the next phase accordingly

This file should stay short enough to be useful, but detailed enough that another engineer or agent can understand the roadmap quickly.
