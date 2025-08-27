# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project: mcheyne-web (Next.js 15, TypeScript, Tailwind, next-intl)

Common commands
- Install dependencies
  ```bash path=null start=null
  npm install
  ```
- Run the dev server (default: http://localhost:3000)
  ```bash path=null start=null
  npm run dev
  ```
  Localized routes live under /[locale]. Open http://localhost:3000/en (default) or http://localhost:3000/es.
- Build production assets
  ```bash path=null start=null
  npm run build
  ```
- Start the production server
  ```bash path=null start=null
  npm start
  ```
- Lint the project
  ```bash path=null start=null
  npm run lint
  ```
  Apply automatic fixes:
  ```bash path=null start=null
  npx next lint --fix
  ```
- Tests: none configured (no test runner or scripts present).

High-level architecture and structure
- App Router with per-locale segment
  - Source: app/[locale]/
  - app/[locale]/layout.tsx is the root layout for each locale. It loads global CSS and wraps the page with client providers for i18n.
    - It awaits the route params to get the locale, dynamically imports messages from messages/{locale}.json, and renders <ClientProviders locale messages>.
  - app/[locale]/page.tsx renders the main UI inside a PlanProvider context. Composition:
    - <Header /> → title/subtitle (localized)
    - <Onboarding /> → initial settings for self-paced mode / importing progress
    - <ReadingSelection /> → today’s passages (toggle read state)
    - <DateNavigation /> → step across days relative to today
    - <SettingsDialog /> → self-paced toggle, start date, reset

- Internationalization (next-intl)
  - Messages are stored in messages/en.json and messages/es.json.
  - app/[locale]/messages.ts provides next-intl’s getRequestConfig, importing the correct file based on the locale.
  - ClientProviders uses NextIntlClientProvider to expose translations to client components.
  - ReadingSelection localizes book names via useTranslations('books'), falling back to the raw key when a translation is absent (using defaultMessage).

- State model: reading plan and persistence
  - src/context/PlanProvider.tsx is a client-only context that centralizes all reading-plan state and actions. It persists to localStorage using stable keys.
    - startDate: the canonical start date for the plan; persisted. Changing it can auto-mark prior selections as complete.
    - isSelfPaced: when true, “today” is computed as the first selection where all passages are not yet read; otherwise it is date-driven.
    - passages: a sparse map of read passages keyed by v2Key(desc, id) → boolean; persisted.
    - onboarded: controls whether to show the onboarding card; persisted.
    - selections: derived from RAW_PLAN_DATA with special leap-day handling (see below).
    - indexForToday: computed via indexForDateFromStartDate when date-driven; or first incomplete selection when self-paced.
    - getSelection / hasRead / toggleRead: accessors and mutators used by UI components.
  - Leap day support: buildSelectionsWithLeap(startDate) injects a synthetic selection with isLeap=true on Feb 29 when it occurs within the plan window. ReadingSelection shows a special card for this day.
  - Key helpers in src/lib/planConstants.ts:
    - RAW_PLAN_DATA: the full sequence of daily passages.
    - indexForDateFromStartDate(date, startDate, total): translates a calendar date into a selection index (with wrap-around).
    - splitPassage(desc): splits a passage description into {book, chapter} for localization and display.
    - v2Key(desc, id): stable key for storing read-state per passage in localStorage.

- UI and styling
  - Tailwind CSS with CSS variables for theme tokens.
    - Global styles in app/globals.css define HSL CSS variables for colors and set base Tailwind layers.
    - tailwind.config.ts scans ./app and ./src; extends color tokens and radii; uses defaultTheme fonts.
  - Lightweight UI primitives in src/components/ui (Button, Card, Dialog, Switch) built with class-variance-authority and Tailwind.
  - Iconography via lucide-react (e.g., BookOpen in Header).

- TypeScript and module resolution
  - Strict TS config with noEmit, JSX preserve, and Next plugin.
  - Path aliases (see tsconfig.json):
    - @/components/* → src/components/*
    - @/context/* → src/context/*
    - @/lib/* → src/lib/*
    - @/ui/* → src/components/ui/*
    - @/messages/* → messages/*

Important notes from README
- Default locale is English under /en; Spanish under /es.
- State persists to localStorage; clearing site data resets the plan.
- Leap day handling: a special “leap” entry is inserted when Feb 29 occurs relative to the start date.
- Book name localization: UI strings are localized; book names fall back to their keys unless provided in messages files.

