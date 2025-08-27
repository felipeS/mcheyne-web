# mcheyne-web (Next.js)

Commands
- Install deps: npm install
- Run dev server: npm run dev
- Build: npm run build
- Start (prod): npm start

Locales
- Default: /en (English)
- Spanish: /es

Notes
- State persists to localStorage. Clearing site data resets the plan.
- Leap day handling: a special "leap" entry is inserted when Feb 29 occurs relative to the start date.
- Book name localization: UI strings are localized; book names fall back to their keys unless provided in messages files.

