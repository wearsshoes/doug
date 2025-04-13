# Vite + React Template Knowledge

## Project Overview
A minimal React + TypeScript starter template using Vite for fast development and building.

## Verifying changes
After every change, run:
```bash
npm run lint && npm run typecheck
```
This will check for lint issues and type errors.

## Theming
The app uses system color scheme preferences:
- Uses CSS `prefers-color-scheme` media query
- Properly declares `color-scheme: light dark` support to browsers
- Colors defined as CSS variables for consistency
- No manual override, follows system settings
