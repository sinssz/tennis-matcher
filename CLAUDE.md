# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tennis Matcher is a web application for small tennis clubs (10-20 participants) to automatically generate fair doubles matches with intelligent pairing algorithms. The core value is the weighted greedy algorithm that balances skill levels, gender composition, game count fairness, and partner/opponent diversity.

## Development Commands

```bash
pnpm dev          # Start Next.js development server
pnpm build        # Production build
pnpm lint         # ESLint + Prettier
pnpm test         # Run Vitest unit tests
pnpm test:e2e     # Run Playwright E2E tests
pnpm db:push      # Push Prisma schema to database
pnpm db:generate  # Generate Prisma client
pnpm db:seed      # Seed database with sample data
```

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **State**: TanStack Query (server state), React Hook Form (forms)
- **Validation**: Zod (shared between frontend/backend)
- **Database**: PostgreSQL (Supabase) + Prisma ORM
- **Testing**: Vitest (unit), Playwright (E2E)
- **Deploy**: Vercel

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # REST API routes
│   │   ├── players/       # Player CRUD
│   │   ├── events/        # Event CRUD + generate-round
│   │   ├── matches/       # Match score updates
│   │   └── stats/         # Statistics endpoints
│   └── (pages)/           # UI pages (players, events, stats)
├── algorithm/             # Match generation engine (core business logic)
│   ├── scoring.ts         # 5 weighted scoring functions
│   ├── generator.ts       # Round/match generation
│   └── types.ts           # Algorithm-specific types
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── common/            # Shared components
│   └── features/          # Feature-specific components
├── hooks/                 # Custom React hooks
├── lib/                   # Prisma client, Zod schemas, utilities
├── services/              # API service layer
└── types/                 # Shared TypeScript types
```

## Match Generation Algorithm

The algorithm uses weighted greedy selection with these scoring weights:
- **Level Balance (30%)**: Match players of similar skill (A/B/C/D)
- **Gender Balance (25%)**: Prefer same-gender doubles
- **Game Count Fairness (25%)**: Prioritize players with fewer games
- **Opponent Diversity (10%)**: Minimize repeat opponents
- **Partner Diversity (10%)**: Encourage different partner combinations

Hard constraints:
- No player plays 2 matches in same round
- Valid team composition (2 for doubles, 1 for singles)

Algorithm complexity: O(C(n,4) × 3) - completes in milliseconds for 10-20 players.

## Database Schema

Core entities: Player → EventParticipant ↔ Event → Match → MatchPlayer

Enums:
- Gender: MALE, FEMALE
- Level: A, B, C, D
- EventStatus: DRAFT, ACTIVE, COMPLETED
- MatchType: SINGLES, DOUBLES
- MatchStatus: SCHEDULED, IN_PROGRESS, COMPLETED

## API Endpoints

- `GET/POST /api/players` - List/create players
- `GET/PUT/DELETE /api/players/:id` - Player CRUD
- `GET/POST /api/events` - List/create events
- `POST /api/events/:id/participants` - Add participants
- `POST /api/events/:id/generate-round` - Generate next round matches
- `PUT /api/matches/:id/score` - Record match result
- `GET /api/stats/players` - Player statistics

## Coding Guidelines

### Type Safety

- All code must be written in TypeScript
- Avoid `any` type; use `unknown` with type guards when necessary
- Use generics for reusable, type-safe components/functions
- Explicitly type API responses, props, and state

```typescript
// ❌ Bad
const data: any = await fetchData();

// ✅ Good
interface UserData {
  id: string;
  name: string;
}
const data = await fetchData<UserData>();
```

### Separation of Concerns

- Follow Single Responsibility Principle
- Extract business logic to custom hooks or utility functions
- Components should focus on UI rendering
- Separate API calls into service layer

### React Patterns

- Use functional components and hooks only (no class components)
- Apply `useCallback`/`useMemo` only when performance issues are confirmed
- Abstract reusable logic into custom hooks
- Use Compound Components pattern for flexible component APIs

### State Management

- **Server state**: TanStack Query with appropriate `staleTime` and `gcTime`
- **Client state**: `useState`, `useReducer`, or Context API
- **Form state**: React Hook Form with Zod validation

### Next.js Patterns

- Use App Router (not Pages Router)
- Default to Server Components; use `'use client'` only when interaction/state needed
- Perform data fetching on server when possible
- Utilize dynamic routing, layouts, and error boundaries

### Naming Conventions

- **Components**: PascalCase (`UserProfile`, `MatchCard`)
- **Functions/Variables**: camelCase (`getUserData`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRY_COUNT`)
- **Types/Interfaces**: PascalCase (`Player`, `ApiResponse<T>`)
- **Files**:
  - Components: PascalCase (`UserProfile.tsx`)
  - Utilities/Hooks: camelCase (`useUser.ts`, `formatDate.ts`)

### Error Handling

- Implement explicit error handling
- Use Error Boundaries for runtime errors
- Handle specific error types in try-catch blocks

```typescript
try {
  const data = await fetchData();
  return data;
} catch (error) {
  if (error instanceof NetworkError) {
    throw new UserFacingError('Please check your network connection');
  }
  throw error;
}
```

### Performance

- Optimize only when necessary (no premature optimization)
- Use React DevTools Profiler to identify actual issues
- Use Next.js Image component for image optimization
- Apply code splitting with `next/dynamic`

### Testing Strategy

- **Unit tests**: Utility functions, custom hooks, algorithm logic
- **Integration tests**: Components + data fetching
- **E2E tests**: Critical user flows
- Follow Testing Library principle: "Test as the user sees it"

### Accessibility

- Use semantic HTML
- Add appropriate ARIA attributes
- Support keyboard navigation
- Ensure color contrast and focus indicators

## Project-Specific Notes

- Mobile-first responsive design required
- No authentication needed (club internal use)
- Algorithm unit tests are critical - test various player combinations
- Zod schemas shared between frontend forms and API validation
