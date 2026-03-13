# CLAUDE.md — User App

## Overview

Public-facing user application for browsing Emerging Tech updates, chatbot interaction, and bookmark management.

## Tech Stack

| Item | Version |
|------|---------|
| Next.js | 16 (App Router) |
| React | 19 |
| TypeScript | 5 (strict mode) |
| Tailwind CSS | 4 |
| UI Primitives | Radix UI |
| Component Variants | class-variance-authority (CVA) |
| Icons | Lucide React |
| Fonts | Space Grotesk (sans), DM Mono (mono) |
| Date utilities | date-fns, react-day-picker |

## Design System: Neo-Brutalism

Same design tokens as Admin App:
- **Border**: `brutal-border` → `border: 2px solid #000000`
- **Shadow**: `brutal-shadow-sm` (2px), `brutal-shadow` (4px)
- **Hover**: `brutal-hover`
- **Border radius**: 0
- **Colors**: Primary `#3B82F6`, Background `#FFFFFF`, Foreground `#000000`

## Architecture

### Directory Structure

```
app/src/
├── app/                # Pages (App Router)
│   ├── api/bff/       # BFF auth endpoints (login, logout, refresh, me, oauth)
│   ├── chat/          # Chatbot page
│   ├── bookmarks/     # Bookmark management
│   ├── signin/signup/verify-email/reset-password/
│   └── globals.css
├── components/
│   ├── ui/            # Base UI (button, input, dialog, popover, badge, calendar)
│   ├── auth/          # Auth components
│   ├── chatbot/       # Chatbot feature components
│   ├── bookmark/      # Bookmark components
│   └── emerging-tech/ # Emerging tech listing components
├── contexts/          # React Context (auth, toast)
├── lib/               # API clients, utilities, auth-fetch
└── types/             # TypeScript type definitions
```

### Naming Conventions

- **Files**: kebab-case (`chat-input.tsx`)
- **Components**: PascalCase (`ChatInput`)
- **Types**: PascalCase in singular domain files (`chatbot.ts`, `bookmark.ts`)
- **API modules**: `{domain}-api.ts` (`chatbot-api.ts`, `bookmark-api.ts`)

### Key Patterns

- **Auth**: BFF pattern with HttpOnly cookies. Supports email/password + Google OAuth.
- **API calls**: `authFetch()` wrapper with automatic 401 refresh.
- **State**: React Context API only (AuthContext, ToastContext).
- **Components**: `"use client"` for interactive components. Functional + hooks.
- **Styling**: Tailwind utility-first + `cn()` helper. CVA for variant components.

## Development

```bash
cd app
npm install
npm run dev    # http://localhost:3000
```

API Gateway proxy: `next.config.ts` rewrites `/api/*` → `http://localhost:8081`
