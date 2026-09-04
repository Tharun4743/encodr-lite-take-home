# Encodr Lite — Intern Take-Home

Thanks for taking the time on this. **Encodr Lite** is a small media-transcoding dashboard: a
signed-in user creates an encode **job** from a media URL, presses **Start encode**, watches the
progress update live, and sees the output files when it finishes.

The full brief — the six tasks, what we look for, and the ground rules — is in **`BRIEF.md`**.
**Read that first.** This file is just how to run things, and it's where you write up your work when
you're done.

## Run it

### Windows Quick Start
Simply double-click `run.bat` or run in terminal:
```cmd
run.bat
```

### Manual Command Line
```bash
npm install
npm run dev          # http://localhost:3000
npm run test:run     # tests (24 unit and component tests)
npm run typecheck    # tsc --noEmit
npm run build        # production build
```

Requires **Node 20+** (`.nvmrc` says 20).

**Demo login:** `demo@encodr.dev` / `password123`

On a fresh checkout, sign-in works and the app loads, but the jobs list shows an error and the two
main screens are placeholders. That's expected — `GET /api/jobs` returns a 501 until you write it.
Search the project for `TODO(candidate)` to find everything that's yours; there are six.

Nothing here needs a database. State lives in memory, so restarting the dev server wipes your jobs.
That's fine — don't work around it.

## Where things are

```
app/
  signin/page.tsx              working sign-in — your example of RHF + Zod
  (app)/layout.tsx             route guard for everything signed-in
  (app)/jobs/page.tsx          TASK 4 — the create-job form
  (app)/jobs/[id]/page.tsx     TASK 5 — run controls, progress, results
  api/auth/login/route.ts      provided
  api/jobs/route.ts            TASK 2 — list + create
  api/jobs/[id]/route.ts       provided — your example route handler
  api/runs/route.ts            provided — starts a run
  api/runs/[id]/route.ts       provided — the endpoint you'll poll
lib/
  types.ts                     the data model + the run TIMELINE. Read this first.
  schemas.ts                   TASK 1 — source-URL validation
  server/auth.ts               provided — token signing
  server/http.ts               provided — json / error / withAuth / validationError
  server/store.ts              TASK 3 — computeRun()
  client/api.ts                provided — the fetch wrapper
  client/auth-context.tsx      provided
  client/hooks.ts              worked React Query examples + two TODOs
  client/use-run-polling.ts    TASK 5 — the polling hook
components/                    provided — StatusBadge, ProgressBar
__tests__/                     TASK 6 — your tests go here
```

## A suggested first hour

If you're not sure where to start:

1. `npm install && npm run dev`, sign in, look around. The jobs list will show an error — good, that's
   your first task.
2. Read `lib/types.ts` top to bottom. It's short and it's the whole data model.
3. Read `app/api/jobs/[id]/route.ts` — a complete route handler — then write Task 2 in the same style
   and check it with the curl commands in the file.
4. The list page lights up. Now do Task 1, then Task 3 (tests first).

## Useful to know

- `https://cdn.example.com/videos/corrupt.mp4` is rigged to **fail** partway through its run. Use it
  to build the error path.
- A run takes about **12 seconds** from start to finish, so you won't be waiting around.
- Run timings are constants in `TIMELINE` (`lib/types.ts`). Use them instead of typing numbers, so
  your tests and ours agree.
- `computeRun` takes `now` as an argument on purpose — you can test the 8-second mark without
  waiting eight seconds.

---

# Your write-up

### What's working

All six tasks specified in `BRIEF.md` are complete, strictly typed, and covered by automated tests:

1. **Task 1 — Source-URL Validation (`lib/schemas.ts`)**:
   - `sourceUrlSchema` validates that inputs are valid URLs using `new URL()`, restricted strictly to `http:` and `https:` protocols, and contain a non-empty pathname.
   - Specific user-friendly error messages are provided for empty inputs, malformed URLs, unsupported protocols, and bare hostnames without paths.
2. **Task 2 — Jobs API Handlers (`app/api/jobs/route.ts`)**:
   - Authenticated `GET /api/jobs` returns the list of jobs ordered by creation date with derived statuses.
   - Authenticated `POST /api/jobs` safely validates the payload with `createJobSchema` and returns `422` with structured `fieldErrors` on validation failure, or `201` with the created job on success.
3. **Task 3 — Run State Machine (`lib/server/store.ts` → `computeRun()`)**:
   - Implemented as a pure deterministic function of elapsed time `now - startedAt` according to `TIMELINE` constants.
   - Accurately transitions through `QUEUED` (0–2s), `DOWNLOADING` (2–6s), `TRANSCODING` (6–12s), and `COMPLETED` (12s+), returning output renditions via `makeResult()`.
   - Special corrupt URL handling: immediately transitions to `FAILED` at $\ge$8000ms with frozen progress percentage and descriptive error.
4. **Task 4 — Create-Job Form (`app/(app)/jobs/page.tsx`, `lib/client/hooks.ts`)**:
   - Form built using React Hook Form + `@hookform/resolvers/zod` with instant inline field validation.
   - Uses `useCreateJob` mutation to POST data and automatically invalidates the `jobs` query cache on success without page reload.
   - Maps server 422 `fieldErrors` back onto matching form fields using `setError`.
5. **Task 5 — Live Progress & Job Detail Screen (`lib/client/use-run-polling.ts`, `app/(app)/jobs/[id]/page.tsx`)**:
   - `useRunPolling` polls `/api/runs/:id` every 1000ms with strict cleanup on component unmount and `runId` changes. Polling stops automatically upon reaching `COMPLETED` or `FAILED`.
   - Clean state machine on detail screen modeling mutually exclusive states: `idle`, `running`, `failed`, and `completed`.
   - Displays live progress bar, active stage badge, human-readable activity log, corrupt failure banner with retry action, and output renditions table.
6. **Task 6 — Test Suite (`__tests__/`)**:
   - 24 automated tests passing across `compute-run.test.ts`, `schemas.test.ts`, `jobs-api.test.ts`, and `create-job-form.test.tsx`.

---

### How to see the failure path

1. Navigate to the Jobs page (`/jobs`).
2. In the **New encode job** form, enter:
   - **Source URL:** `https://cdn.example.com/videos/corrupt.mp4`
   - **Title (optional):** `Corrupt Sample Video`
3. Click **Create encode job**. The job will appear in the list with `NEW` status.
4. Click into the newly created job to view its detail page (`/jobs/[id]`).
5. Click **Start encode**.
6. The job will progress through `QUEUED` and `DOWNLOADING`, enter `TRANSCODING` at 6s, and fail precisely at 8s.
7. The UI transitions into the **FAILED** state displaying:
   - A red failure alert banner with error message: `"Corrupt input stream: moov atom not found in MP4 container"`.
   - A red `ProgressBar` frozen at 67%.
   - Sequential activity log entries leading up to the failure.
   - A **Retry encode** button that starts a fresh run when clicked.

---

### Decisions and assumptions

- **Detail Page State Modeling:** Rather than managing multiple independent booleans (`isRunning`, `isFailed`, `isCompleted`) that could drift into conflicting states, the detail page derives one explicit state (`idle` | `running` | `failed` | `completed`) based on `run?.stage` and fallback `job.status`.
- **Polling Cleanup Strategy:** `useRunPolling` addresses both cleanup vectors:
  1. `clearInterval(intervalId)` immediately halts future timer ticks on unmount or `runId` switch.
  2. A `cancelled` boolean guard checks before every state dispatch, discarding in-flight HTTP responses so unmounted components are never mutated.
- **Log Deduplication:** Because polling queries the server every 1 second while stages take multiple seconds, identical consecutive status messages are deduplicated so the activity log reflects distinct milestone transitions.
- **Form Error Mapping:** Both client-side Zod validation and server 422 `fieldErrors` are mapped to the same React Hook Form field keys (`sourceUrl`, `title`), ensuring unified UI error presentation regardless of where the rejection originated.

---

### What was hardest

The most nuanced part was ensuring that `useRunPolling` handles all asynchronous edge cases cleanly:
- When navigating away mid-run, an in-flight `fetch()` could resolve after unmount; using the `cancelled` flag inside the effect's closure prevented React memory leak warnings.
- Stabilizing the `onFinished` callback using `useRef` ensured that consumer re-renders do not trigger unnecessary teardowns and restarts of the polling interval.

---

### What I'd do next

1. **Visibility API Integration:** Pause polling intervals when the user switches browser tabs (`document.visibilityState === "hidden"`) and resume on return to conserve network bandwidth.
2. **Smooth Progress Interpolation:** Add client-side animation/interpolation to smoothly animate the progress bar between the 1-second polling intervals.
3. **Relative Timestamps:** Add relative time formatting (e.g. "created 3 minutes ago") to the job list items.
4. **Accessibility (a11y) Pass:** Add `aria-live="polite"` status announcements for screen readers when run stages change.

---

### Time spent

Approximately **3.5 focused hours** across schema validation, route handlers, state machine logic, polling & UI implementation, comprehensive test suite writing, and documentation.

