# TeamForge

**Find people. Build teams. Ship projects.**

TeamForge is a collaboration platform for college students, developers, designers,
hackathon participants and side-project builders to find teammates, form teams around
real project requirements, and manage the work in a shared workspace.

---

## Problem

Finding the right teammate for a hackathon, class project or side project is harder
than it should be:

- You're missing a specific skill on your team and don't know who to ask.
- Teams form in the first hour of a hackathon, before you've met the right people.
- The right person is out there, just scattered across Discords, WhatsApp groups and
  campus boards you're not in.
- Team recruitment posts rarely say what's actually needed, so you message people who
  were never a fit.

## Solution

TeamForge gives developers a structured profile (skills, roles, experience, interests)
and lets teams post structured requirements (required skills, required roles, tech
stack, deadline). Discovery is filterable and searchable in both directions, and a
transparent, deterministic algorithm scores compatibility between a person and a team
so both sides know *why* they might be a fit — before anyone sends a message.

Once a request is accepted, the team gets a shared workspace: a Kanban task board,
a members list, a real-time-ish activity timeline, and notifications — everything
needed to actually ship the project, not just find the team.

---

## Features

- **Developer profiles** — skills, preferred roles, experience level, availability,
  interests, and external links (GitHub / LinkedIn / portfolio).
- **Team discovery** — search and filter by skill, role, project type, status.
- **Developer discovery** — search and filter by skill, role, experience, availability,
  interest.
- **Deterministic skill matching** — a 0–100 compatibility score with the concrete
  reasons behind it. No AI, no black box.
- **TeamForge Match** — describe a project, create it as a private team, rank existing
  developers from profile data and public TeamForge projects, then send team invitations
  through the existing Requests workflow. No external AI or matching API is used.
- **Join requests** — send, accept, reject, cancel, with duplicate-request prevention.
- **Developer connections** — send a private contact request with an optional note, accept or decline incoming requests, and manage your network without exposing email addresses.
- **Notifications** — join requests, acceptances, rejections, membership changes, task
  assignments, task status changes.
- **Team workspace** — Overview (real computed progress), Kanban task board, Members
  (with owner controls), Activity timeline, Settings.
- **Dashboard** — profile completion, my teams, pending requests, task summary,
  upcoming deadlines, recent activity. No fake numbers — everything is a live query.
- **Light and dark mode**, fully responsive from 360px to large desktop.

---

## Tech stack

| Layer          | Choice                                      |
|-----------------|----------------------------------------------|
| Frontend        | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend         | Next.js Route Handlers (`app/api/**`)        |
| Database        | MongoDB Atlas + Mongoose                     |
| Auth            | Auth.js (NextAuth) — Credentials provider, JWT sessions |
| Validation      | Zod (client and server)                      |
| Forms           | React Hook Form (auth forms) + controlled state (team/task/profile forms) |
| Icons           | Lucide React                                 |
| Animation       | Framer Motion (respects `prefers-reduced-motion` via `MotionConfig`) |
| Notifications   | Sonner (toasts)                              |
| Testing         | Vitest                                       |
| Deployment      | Vercel                                       |

---

## Architecture

```
app/
  api/                 Route handlers (auth, profile, team matching, teams, tasks, requests, contact, notifications, account)
  (public pages)        /, /about, /discover, /teams, /developers/[username], /teams/[slug], /signin, /signup
  (authenticated pages)  /dashboard, /profile, /profile/edit, /my-teams, /connections, /teams/create,
                         /teams/[slug]/{manage,workspace,tasks,members,activity,settings},
                         /requests, /team-match, /notifications, /settings, /onboarding
components/
  ui/                  Reusable primitives: Button, Input, Select, MultiSelect, Dialog,
                       ConfirmDialog, Card, Badge, Tabs, Skeleton, EmptyState, ErrorState,
                       SearchBar, FilterPanel, Pagination, Avatar
  layout/              Navbar, Footer, AppShell, Sidebar, MobileNavigation, ThemeToggle,
                       AuthProvider, ThemeProvider
  developers/          DeveloperCard, ProfileView, ProfileEditForm, DiscoverPageClient
  teams/               TeamCard, CreateTeamForm, TeamActions, TeamsPageClient,
                       CompatibilityCard, RequestsPageClient
  workspace/           WorkspaceNav, KanbanBoard, TaskCard, MembersList, TeamSettingsForm
lib/                   db.ts, auth.ts, session.ts, api.ts, notify.ts, teamAccess.ts,
                       constants.ts, utils.ts
models/                User, Team, Request (JoinRequest), ContactRequest, Notification, Task, Activity
services/              matchingService.ts, profileService.ts, teamService.ts,
                       teamHelpers.ts (pure, client-safe logic split out from teamService)
validations/           Zod schemas: auth, team, task
```

**Server/client boundary.** All Mongoose models and DB access live in server-only
modules. `services/teamHelpers.ts` was deliberately split out from
`services/teamService.ts` so that pure logic (ownership/membership checks, open-position
math) can be imported from client components without pulling Mongoose into the browser
bundle. This was caught during development by an actual build-size regression on
`/teams` (145 kB → 2 kB after the fix) — see the commit history / build logs for the
real before/after.

**Authorization** is always re-derived on the server from the session (`getServerSession`)
and the database — never from a client-supplied `userId`, `teamId` ownership flag, or
role. Every mutating API route re-fetches the resource and checks ownership/membership
before acting.

## TeamForge Match

`/team-match` uses `services/teamMatchService.ts` and the centralized settings in
`services/teamMatchConfig.ts`. Submitting requirements creates a private Team using the
existing Team model, stores matching preferences there, then returns at most 10 ranked
profiles. Results can be reloaded from the private team page. Candidate queries use the
indexed `User.skills` and `User.preferredRoles` fields, plus a bounded text search over
public team history. User results contain only public profile fields; private team names
and details are never returned or used in project relevance scoring.

Requirements are normalized through one alias map (`JS` → `JavaScript`, `ReactJS` →
`React`, `Node` → `Node.js`, `ML` → `Machine Learning`, `Mongo` → `MongoDB`). Known
skills in the project name and description are extracted deterministically. Direct
role matches score fully; otherwise a centralized role-to-skill map scores overlap.
Project relevance uses the best public project overlap: keyword coverage (65%), matching
skills (25%), and project type (10%) when provided. Experience compares a profile's
stated level with the requested minimum and uses public team participation and
completion counts. Availability compares the existing profile status with the optional
minimum.

The default weights are centralized and configurable:

| Factor | Weight |
| --- | ---: |
| Required skill overlap | 45% |
| Required role fit | 20% |
| Public project relevance | 15% |
| Experience | 10% |
| Availability | 10% |

Each factor is shown separately with a deterministic explanation. When experience or
availability data is missing, its weight is omitted and the other weights are
renormalized. `POST /api/team-match` creates the private team and returns the matches;
`GET /api/team-match?teamId=...` recalculates them for its owner after a refresh. Neither
endpoint calls an LLM, embeddings service, paid API, or any external matching service,
and neither needs an AI API key.

Result cards invite people through `POST /api/teams/[id]/invitations`. Invitations are
stored in the existing JoinRequest collection and use the Requests page for accept,
decline, status tracking, and cancellation. Accepting an invitation adds the user to
the existing Team membership list. Private team pages and API responses are available
only to members and people with a pending invitation.

---

## Database schema

Availability is optional. The previous profile schema defaulted missing values to
`Available`; `availabilityConfirmed` prevents those legacy defaults from being counted
or displayed. A user can confirm or clear availability in profile settings. Older
unconfirmed values are treated as missing data until the user confirms them.

- **User** — name, username (unique), email (unique), passwordHash (never selected by
  default), avatar, headline, bio, location, college, graduationYear, experienceLevel,
  availability (used only when explicitly confirmed), availabilityConfirmed, skills[], preferredRoles[], interests[], githubUrl, linkedinUrl,
  portfolioUrl, timestamps. Indexes: username, email (unique), skills, preferredRoles,
  text index on name/headline/bio.
- **Team** — name, slug (unique), projectTitle, description, ownerId, members[]
  (embedded `{ userId, role, joinedAt }` subdocuments — the owner is *not* duplicated
  into this array), requiredRoles[], requiredSkills[], techStack[], teamSize,
  projectType, status, visibility, deadline, optional matchingPreferences, timestamps. A `pre('save')` hook rejects
  duplicate memberships. Indexes: slug (unique), status+visibility, requiredSkills,
  requiredRoles, members.userId, ownerId+visibility, members.userId+visibility, text index on name/projectTitle/description.
- **JoinRequest** — senderId, teamId, message, status (pending/accepted/rejected/
  cancelled), kind (`join` or `invitation`), optional inviter and assigned role. A partial unique index on `{senderId, teamId}` where
  `status: "pending"` prevents duplicate pending requests at the database level, not
  just in application code.
- **ContactRequest** — senderId, recipientId, optional message, status, timestamps. A canonical participant-pair key and partial unique index prevent duplicate pending requests in either direction.
- **Notification** — userId, type, message, relatedEntity `{kind, id}`, isRead,
  createdAt. Compound index on `{userId, isRead, createdAt}`.
- **Task** — teamId, title, description, status (To Do/In Progress/Review/Done),
  priority (Low/Medium/High), assignee, createdBy, dueDate, timestamps.
- **Activity** — teamId, actorId, action, entityType, entityId, metadata, createdAt.
  Indexed on `{teamId, createdAt}` for fast timeline queries.

---

## Matching algorithm

Implemented in `services/matchingService.ts`, covered by unit tests in
`services/__tests__/matchingService.test.ts`. This is **not AI** — no LLM or ML model
is involved. It's a transparent, auditable weighted formula:

| Factor                  | Weight |
|--------------------------|--------|
| Skill overlap             | 45%   |
| Role compatibility        | 25%   |
| Interest overlap          | 15%   |
| Availability              | 15%   |

Skill/role/interest overlap is computed as *(matched required items) / (total required
items)*, case-insensitively; a team with no stated requirement for a category scores
full marks on it rather than penalizing the person. Availability contributes on a fixed
scale (Available = 100%, Limited = 50%, Not available = 0%). When availability is
unconfirmed or missing, that factor is omitted and the other weights are renormalized.
The final score is rounded to an integer 0–100 and always shown with the specific
reasons behind it (e.g. "Matches
3 of 4 required skills", "Frontend Developer role requested"). The UI explicitly frames
this as a compatibility signal based on structured data — not a judgment of a person's
ability or worth.

---

## Screenshots

Not included in this deliverable. Generating real screenshots requires a running
instance connected to a live MongoDB database with actual data in it — this build
environment has no database credentials and no browser to capture from. Once you run
the app locally against your own MongoDB Atlas cluster (see below), you can add
screenshots here.

---

## Installation

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

See `.env.example`:

```
MONGODB_URI=      # your MongoDB Atlas connection string
AUTH_SECRET=      # random secret — generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
```

## Local development

```bash
npm run dev      # start the dev server
npm run lint      # ESLint
npm run test      # run the Vitest suite
npm run seed      # populate a LOCAL/dev database with sample data (see below)
npm run build     # production build (also runs TypeScript's full type check)
```

### Seeding

`scripts/seed.ts` is a development-only script, kept out of the production request
path entirely — production pages always query MongoDB directly and render real empty
states when there's no data, never hardcoded numbers. The seed script refuses to run
unless `MONGODB_URI` looks like a local database, or `SEED_ALLOW_REMOTE=1` is set
explicitly, as a safety rail against accidentally wiping a shared/production database.

## Testing

```bash
npm run test
```

45 unit tests cover:
- Team compatibility and TeamForge Match — normalization, requirement extraction, skill
  and role overlap, project relevance, experience and availability scoring, weight
  renormalization, deterministic ranking, validation, and empty candidate sets.
- API invitation integration — authorization, reuse of the JoinRequest model,
  notification, and accepting an invitation into a team.
- Profile completion scoring (`profileService.test.ts`) — monotonicity, upper bound,
  and that having one vs. three external links doesn't double-count.
- Pure team helpers (`teamHelpers.test.ts`) — ownership, membership, and open-position
  math including the "never negative" edge case.

## Deployment

1. Push this repository to GitHub.
2. Import it into Vercel.
3. Set `MONGODB_URI`, `AUTH_SECRET`, and `NEXTAUTH_URL` (your production URL) as
   environment variables in the Vercel project settings.
4. Deploy. Vercel runs `npm run build`, which includes a full TypeScript check.

---

## Security

Server-side authorization is enforced on every mutating route by re-deriving the
current user from `getServerSession` and re-fetching the target resource from the
database — client-supplied IDs are used only to *look up* a resource, never to assert
identity or permission.

Specifically checked during development:
- **Authentication** — credentials are verified server-side with bcrypt; passwords are
  hashed with a cost factor of 12 and the `passwordHash` field is `select: false` in
  the schema, so it is never returned by a normal query, let alone to the client.
- **Session handling** — JWT-based sessions via NextAuth; middleware protects every
  authenticated route server-side (see `middleware.ts`), not just client-side redirects.
- **Team ownership / membership permissions** — every team-mutating route
  (`PATCH`/`DELETE /api/teams/[id]`, task routes, member routes, settings) checks
  `isTeamOwner` / `isTeamMember` against the database before acting.
- **Request permissions** — accepting/rejecting a join request is restricted to the
  team owner; cancelling is restricted to the original sender; both are checked
  server-side, not inferred from the request body.
- **Mass assignment** — every write route validates the request body with a Zod schema
  before use. Zod's default `.parse()` behavior strips unrecognized keys, so a client
  can't smuggle in `{ role: "admin" }` or `{ ownerId: "..." }` on a profile/team update.
- **IDOR** — resources are always fetched by ID and then checked against the session
  user, never trusted as already-authorized because an ID was provided.
- **Output handling** — API error responses never include stack traces, raw Mongoose/
  MongoDB error objects, or internal details; see `lib/api.ts::handleApiError`, which
  normalizes duplicate-key errors, Zod errors, and unknown errors into safe messages.
- **Open redirects** — every `redirect()` call in the app targets a hardcoded internal
  path; no redirect target is ever taken from user input.
- **Duplicate prevention** — a partial unique database index (not just application
  logic) prevents duplicate pending join requests; a `pre('save')` hook rejects
  duplicate team memberships.
- **Contact privacy** — public developer and contact APIs return an explicit profile-field allowlist. Contact request ownership is re-derived from the authenticated session, and private email fields are never returned.

This review was done by the same engineer who wrote the code, in the same session — it
is not a substitute for an independent security audit before handling real user data
in production.

---

## Future improvements

- Dialogs currently close on `Escape` and move focus into themselves on open, but do
  not implement a full keyboard focus trap (Tab can still theoretically reach elements
  behind the modal). Worth adding a small focus-trap utility.
- No password reset flow — the spec explicitly said to only build a "Forgot password"
  UI if the full backend recovery is implemented, and email delivery was out of scope
  for this environment, so it was left out rather than shipped as a non-functional page.
- No rate limiting on `/api/auth/register` or the credentials login — worth adding
  before handling real traffic.
- Notification preferences (per-type opt-out) are not implemented; the Settings →
  Notifications tab is intentionally informational rather than backed by fake toggles
  that wouldn't persist to a real schema.
- Task board uses explicit status controls rather than drag-and-drop, per the brief's
  own guidance to prefer reliability over an unreliable DnD implementation.
- No automated end-to-end (browser) tests — only unit tests for business logic. E2E
  coverage (Playwright) would be a natural next step.
