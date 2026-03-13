# CLAUDE.md — Admin App

## Overview

Internal admin application for managing Emerging Tech data, AI Agent execution, and user accounts.

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
| Markdown | react-markdown + remark-gfm |

## Design System: Neo-Brutalism

- **Border**: `brutal-border` → `border: 2px solid #000000`
- **Shadow**: `brutal-shadow` (4px), `brutal-shadow-sm` (2px), `brutal-shadow-lg` (6px)
- **Hover**: `brutal-hover` → transform + shadow transition
- **Border radius**: 0 (sharp edges everywhere)
- **Colors**: Primary `#3B82F6`, Background `#FFFFFF`, Foreground `#000000`, Secondary `#F5F5F5`, Accent `#DBEAFE`

## Architecture

### Directory Structure

```
admin/src/
├── app/                # Pages (App Router)
│   ├── api/bff/       # BFF auth endpoints (login, logout, refresh, me)
│   ├── agent/         # Agent execution page
│   ├── accounts/      # Account management
│   └── signin/        # Login page
├── components/
│   ├── ui/            # Base UI (button, input, badge, dialog, toast)
│   ├── auth/          # Auth components
│   ├── admin/         # Admin domain components
│   └── agent/         # Agent feature components
├── contexts/          # React Context (auth, toast)
├── lib/               # API clients, utilities, auth-fetch
└── types/             # TypeScript type definitions
```

### Naming Conventions

- **Files**: kebab-case (`agent-message-bubble.tsx`)
- **Components**: PascalCase (`AgentMessageBubble`)
- **Types**: PascalCase in singular domain files (`auth.ts`, `agent.ts`)
- **API modules**: `{domain}-api.ts` (`agent-api.ts`, `admin-api.ts`)

### Key Patterns

- **Auth**: BFF pattern with HttpOnly cookies, JWT tokens never exposed to client.
- **API calls**: `authFetch()` wrapper with automatic 401 refresh and error mapping.
- **State**: React Context API only (AuthContext, ToastContext). No external state libraries.
- **Components**: `"use client"` directive for interactive components. Functional components with hooks.
- **Styling**: Tailwind utility-first + `cn()` helper (clsx + tailwind-merge). CVA for variant components.
- **Markdown rendering**: `prose-brutal` class wraps ReactMarkdown output. Custom `components` overrides for code, table, link, blockquote.

## Development

```bash
cd admin
npm install
npm run dev    # http://localhost:3001
```

API Gateway proxy: `next.config.ts` rewrites `/api/*` → `http://localhost:8081`
