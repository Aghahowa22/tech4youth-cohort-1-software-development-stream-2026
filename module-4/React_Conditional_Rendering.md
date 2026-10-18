# React Conditional Rendering: Dynamically Displaying UI Based on State and Conditions

**Session length:** 6 hours, project-based
**Prior lessons covered:** Components, `useState`, `useEffect` (Tailwind CSS and TypeScript assumed)
**Stack:** Vite + React + TypeScript (`react-ts` template), Tailwind CSS, functional components and hooks only
**Project thread:** **TaskPilot**, a small task dashboard that learners extend section by section

> **Assumptions.** (1) Learners have completed the three prior lessons, so `useState` and `useEffect` are used without re-teaching. (2) They know Tailwind utility classes, so styling is not explained, only *conditionally applied*. (3) `.map()` with the `key` prop appears in examples because lists are unavoidable in a dashboard. It gets a one-line placeholder and belongs to the **Lists and Keys** lesson. (4) Data comes from the free JSONPlaceholder API so every example runs with no backend.

> **Not covered here (belongs to later lessons):** custom hooks, Context, `useReducer`, React Router, Error Boundaries, `Suspense`, and data-fetching libraries such as TanStack Query. Each is named once where it naturally comes up.

---

## 1. Learning Objectives

By the end of this session, learners will be able to:

1. **Explain** why React derives UI from state and props, and contrast that with imperatively showing and hiding DOM nodes.
2. **Build** conditional UI using `if`/early return, the ternary operator, and `&&`, and **choose** the right one for a given situation.
3. **Model** an async request with a typed `loading | error | success` state and **render** each case plus an empty state.
4. **Implement** conditionally styled elements, view switching (tabs, role-based UI), toggles (modals, disclosures), and conditional form feedback in the TaskPilot project.
5. **Debug** the common conditional-rendering bugs (the stray `0`, hooks after an early return, stale view after a role change, lost state on unmount) and **refactor** nested ternaries into readable components.

---

## 2. Prerequisite Check

Learners must already be able to:

- Create typed function components and pass props (`interface Props`, destructuring).
- Use `useState` with TypeScript (`useState<Role>("viewer")`) and update state from event handlers.
- Use `useEffect` with a dependency array and a **cleanup function**.
- Use `fetch` with `async/await` or `.then()`, and narrow TypeScript union types.
- Apply Tailwind utility classes in `className`.

**Where this fits:** Conditional rendering is the first lesson where state *changes what the screen shows*. It sits right after `useState`/`useEffect` and before lists, forms, and routing, all of which depend on it.

---

## 3. Section Breakdown

### 3.1 UI as a Function of State

**Explanation**
**Conditional rendering** means a component returns *different JSX depending on its inputs* (props and state). There is no special React syntax for it. You use ordinary JavaScript: `if`, `?:`, `&&`. React re-runs the component when state changes, and whatever JSX you return *this time* becomes the screen.

**Why it matters**
Nearly every real screen has branches: logged in or out, loading or loaded, empty or full, admin or viewer, modal open or closed. If you can't branch cleanly, components turn into tangled, buggy messes.

**Mental model**
In vanilla JS you hold a reference to a node and mutate it (*imperative*). In React you describe the screen for the current data and React makes the DOM match (*declarative*). Think "what should this look like right now?", never "what do I change?".

```ts
// Vanilla JS: you manage visibility by hand
const badge = document.querySelector<HTMLElement>("#admin-badge")!;
if (isAdmin) badge.classList.remove("hidden");
else badge.classList.add("hidden");
```

```tsx
// src/components/AdminBadge.tsx: you describe the result
interface AdminBadgeProps {
  isAdmin: boolean;
}

export default function AdminBadge({ isAdmin }: AdminBadgeProps) {
  return isAdmin ? (
    <span className="rounded bg-indigo-600 px-2 py-0.5 text-xs text-white">Admin</span>
  ) : null;
}
```

Line by line:
- `isAdmin` arrives as a prop. The component never looks up or mutates a DOM node.
- Returning `null` is the official way to render *nothing*.
- There is no "hide" step. When `isAdmin` becomes `false`, the badge simply isn't in the output, so React removes it.

**Common beginner mistakes**
- **Mistake:** Reaching for `document.querySelector` or `classList` inside a component to show or hide something.
  **Symptom:** It works once, then React's next render overwrites or ignores the change; the UI and state disagree.
  **Fix:** Put the fact in state/props and let the JSX depend on it.
- **Mistake:** Storing a value in state that could be computed from other state (e.g. `hasTasks` next to `tasks`).
  **Symptom:** The two drift out of sync (tasks added, `hasTasks` still `false`).
  **Fix:** Compute it during render: `const hasTasks = tasks.length > 0;`.

**Try it (3 min)**
Write `Greeting({ name }: { name?: string })` that returns `<p>Hello, {name}</p>` when `name` exists and `<p>Hello, guest</p>` otherwise. Render it twice, with and without the prop.

---

### 3.2 Project Setup: TaskPilot Starter

**Explanation**
We scaffold the project and add a mock **role** (`viewer` or `admin`) so later sections have something to branch on. The role is a stand-in for real authentication, which is a later lesson.

```bash
npm create vite@latest taskpilot -- --template react-ts
cd taskpilot
npm install
npm install tailwindcss @tailwindcss/vite
npm run dev
```

> **Version note:** The Tailwind setup (the `@tailwindcss/vite` plugin and a single `@import "tailwindcss";` in the CSS entry file) is the Tailwind v4 approach. Vite and React major versions also move; check the current Vite docs for the exact scaffold output and the Tailwind docs for the Vite plugin step before teaching live.

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

```css
/* src/index.css */
@import "tailwindcss";
```

```ts
// src/types.ts: shared types used throughout the lesson
export interface Todo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}

export type Role = "viewer" | "admin";

export type AsyncState<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: T };
```

```tsx
// src/App.tsx: starter
import { useState } from "react";
import type { Role } from "./types";

export default function App() {
  const [role, setRole] = useState<Role>("viewer");

  return (
    <div className="mx-auto max-w-2xl p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">TaskPilot</h1>
        <button
          className="rounded bg-slate-800 px-3 py-1 text-white"
          onClick={() => setRole((r) => (r === "viewer" ? "admin" : "viewer"))}
        >
          Role: {role}
        </button>
      </header>
    </div>
  );
}
```

Line by line:
- `AsyncState<T>` is a **discriminated union**: the `status` field decides which other fields exist. It is the backbone of section 3.6.
- `setRole((r) => ...)` uses the functional update form so the toggle never reads stale state.

**Why it matters**
Putting shared types in one file and modelling "which situation are we in?" as one typed value is how production codebases keep conditional logic honest.

**Mental model**
`AsyncState<T>` is a TypeScript `enum`-like switch you already know: one `status` tag, and TypeScript only lets you touch `data` when the tag says `success`.

**Common beginner mistakes**
- **Mistake:** Tailwind classes have no effect.
  **Symptom:** Unstyled page.
  **Fix:** Confirm the plugin is in `vite.config.ts`, `index.css` has the import, and `main.tsx` imports `./index.css`.
- **Mistake:** `.tsx` import errors after renaming files.
  **Symptom:** `Cannot find module './components/X'`.
  **Fix:** Check the file name casing and path exactly (case-sensitive on many systems).

**Try it (3 min)**
Run the app, click the role button, and confirm the label flips. Add a `<p>` that shows "You can edit tasks" only when `role === "admin"` (use a ternary or `&&`; you'll learn the trade-offs next).

---

### 3.3 `if` Statements and Early Returns

**Explanation**
Because a component is a function, you can use a plain `if` *before* the `return`. An **early return** (also called a **guard clause**) exits the component immediately with different JSX. It's ideal when the whole component's output changes, not just a fragment inside it.

```tsx
// src/components/EmptyState.tsx
interface EmptyStateProps {
  message: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="rounded border border-dashed p-8 text-center text-slate-500">
      {message}
    </div>
  );
}
```

```tsx
// src/components/AdminPanel.tsx
import type { Role } from "../types";

interface AdminPanelProps {
  role: Role;
}

export default function AdminPanel({ role }: AdminPanelProps) {
  if (role !== "admin") {
    return null; // guard clause: viewers get nothing
  }

  return (
    <section className="rounded bg-indigo-50 p-4">
      <h2 className="font-semibold">Admin tools</h2>
      <p className="text-sm text-slate-600">Only admins see this panel.</p>
    </section>
  );
}
```

Line by line:
- The guard handles the "not allowed" case first and exits, so the rest of the function reads as the main path with no nesting.
- `return null` renders nothing.

**Why it matters**
Early returns keep components flat and readable. Real components check "no data," "not allowed," or "still loading" before the main layout, and reviewers expect to see that shape.

**Mental model**
It's the same guard-clause style you'd use in a regular function: `if (!user) return;` at the top, then the happy path below.

**Common beginner mistakes**
- **Mistake:** Putting an early return *above* a hook call.
  **Error message:** `React has detected a change in the order of Hooks called` or `Rendered fewer hooks than expected`.
  **Fix:** Call all hooks at the top of the component *first*; place early returns after them. Hooks must run in the same order on every render.
- **Mistake:** Writing `if` *inside* JSX braces: `{ if (x) { ... } }`.
  **Error message:** `Unexpected token` (a syntax error).
  **Fix:** JSX braces hold *expressions*, and `if` is a statement. Use an early return, a ternary, or `&&`.

```tsx
// WRONG: hook after early return
function Broken({ role }: { role: string }) {
  if (role !== "admin") return null;
  const [open, setOpen] = useState(false); // hooks order breaks when role changes
  return <button onClick={() => setOpen(!open)}>{String(open)}</button>;
}
```

**Try it (4 min)**
Add `<AdminPanel role={role} />` to `App.tsx`. Flip the role button and watch the panel appear and disappear. Then deliberately add a `useState` *after* the early return in `AdminPanel`, flip the role, and read the error.

**Project step: Milestone 1 (about 15 min)**
Render `<AdminPanel />` in `App.tsx`. Create `EmptyState.tsx` for later use.

---

### 3.4 The Ternary Operator

**Explanation**
The **ternary operator** (`condition ? a : b`) is an *expression* that picks one of two values, so it works *inside* JSX braces where `if` can't. Use it when you want one of two alternatives in the middle of markup.

```tsx
// src/components/StatusLabel.tsx
interface StatusLabelProps {
  completed: boolean;
}

export default function StatusLabel({ completed }: StatusLabelProps) {
  return (
    <span className="text-sm">
      {completed ? "✅ Done" : "🕓 Open"}
    </span>
  );
}
```

```tsx
// Choosing between two components
{isLoggedIn ? <Dashboard /> : <LoginForm />}
```

**Why it matters**
Two-way choices are everywhere: Save or Saving…, Show or Hide, Edit mode or read mode. The ternary keeps both branches visible side by side.

**Mental model**
It's the JavaScript ternary you already use for variables (`const label = done ? "Done" : "Open"`), just placed inside JSX braces.

**Common beginner mistakes**
- **Mistake:** Nesting ternaries three levels deep.
  **Symptom:** Code nobody can read; easy to misplace a `:`.
  **Fix:** Extract a small component, use early returns, or use a lookup object (3.8, 3.11).
- **Mistake:** Forgetting the `else` side: `{done ? <Badge /> }`.
  **Error message:** `Expected ':'`.
  **Fix:** A ternary always needs both sides. Use `: null`, or use `&&` (next section) when there is no else.
- **Mistake:** Using a ternary when the condition is "is this value empty?" and the value can be `0` or `""`.
  **Symptom:** Wrong branch chosen.
  **Fix:** Write the condition explicitly (`count > 0`, `text !== ""`).

**Try it (3 min)**
Make a `SaveButton({ isSaving }: { isSaving: boolean })` showing "Saving…" (and `disabled`) when `isSaving`, otherwise "Save". Use a ternary for both the text and the `disabled` value.

**Project step: Milestone 2 (about 10 min)**
Create `StatusLabel.tsx` and keep it for the task list in 3.6.

---

### 3.5 Short-Circuit `&&` and What React Renders

**Explanation**
`a && b` evaluates to `a` if `a` is falsy, otherwise to `b`. In JSX that means `{condition && <X />}` renders `<X />` *only when `condition` is truthy*. Use it when there is **no else branch**.

React renders `null`, `undefined`, `true`, and `false` as **nothing**. Everything else (strings, numbers including `0`) is rendered as text. That last rule causes the most famous conditional-rendering bug.

```tsx
// src/components/TaskCounter.tsx
interface TaskCounterProps {
  openCount: number;
}

export default function TaskCounter({ openCount }: TaskCounterProps) {
  return (
    <p className="text-sm text-slate-600">
      Tasks
      {openCount > 0 && (
        <span className="ml-2 rounded-full bg-amber-500 px-2 text-xs text-white">
          {openCount} open
        </span>
      )}
    </p>
  );
}
```

Line by line:
- `openCount > 0` is a real boolean, so when false React renders nothing.
- If we had written `{openCount && <span>…</span>}`, then `openCount === 0` would make the expression `0`, and React would print a literal `0` on screen.

```tsx
// The classic bug
{items.length && <List items={items} />}   // shows "0" when empty
// Fixes
{items.length > 0 && <List items={items} />}
{!!items.length && <List items={items} />}
```

**Why it matters**
`&&` is the most common conditional pattern in production code, and the stray `0` is one of the most common visible bugs.

**Mental model**
In plain JS, `0 && "x"` is `0`, not `false`. JSX doesn't change that. It just prints whatever the expression produced.

**Common beginner mistakes**
- **Mistake:** `{count && <Badge />}` with `count = 0`.
  **Symptom:** A literal `0` appears on the page.
  **Fix:** Compare to produce a boolean (`count > 0`).
- **Mistake:** Using `&&` when you actually need an else.
  **Symptom:** Nothing shows in the other case, and you add a second `&&` with the negated condition.
  **Fix:** If both sides matter, use a ternary.
- **Mistake:** Putting `{null}` in a spot and being surprised it adds no space.
  **Symptom:** Layout gaps behave differently than expected.
  **Fix:** Remember that nothing is rendered, so any spacing must come from the layout classes, not from the missing element.

**Try it (4 min)**
Add `<TaskCounter openCount={0} />` to `App.tsx`, then change to `3`. Then deliberately rewrite the condition as `openCount && …`, set the value to `0`, and watch the `0` appear.

**Project step: Milestone 3 (about 20 min)**
Add `TaskCounter` to the header area with a hard-coded number for now; it will be wired to real data in 3.6.

**Which one do I use? Quick decision guide**

| Situation | Use |
|---|---|
| Whole component should change or bail out | `if` + early return |
| Pick one of two outputs inside JSX | `condition ? A : B` |
| Show something or nothing | `condition && <X />` |
| Three or more outcomes | `switch`, early returns, or a lookup object |

---

### 3.6 Async UI: Loading, Error, Empty, and Success

**Explanation**
Any screen that fetches data is in one of **four** situations: still **loading**, **failed** (error), loaded but **empty**, or loaded with **data** (success). Beginners often handle only the last one, so users see a blank screen or a crash. We model the request with the `AsyncState<Todo[]>` type from 3.2 and render each case on purpose.

```tsx
// src/components/TodoBoard.tsx
import { useEffect, useState } from "react";
import type { AsyncState, Todo } from "../types";
import EmptyState from "./EmptyState";
import StatusLabel from "./StatusLabel";

const URL = "https://jsonplaceholder.typicode.com/todos?_limit=10";

export default function TodoBoard() {
  const [state, setState] = useState<AsyncState<Todo[]>>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetch(URL, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.json() as Promise<Todo[]>;
      })
      .then((data) => setState({ status: "success", data }))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Something went wrong",
        });
      });

    return () => controller.abort();
  }, [reloadKey]);

  const retry = () => {
    setState({ status: "loading" });
    setReloadKey((k) => k + 1);
  };

  switch (state.status) {
    case "loading":
      return <p className="animate-pulse text-slate-500">Loading tasks…</p>;

    case "error":
      return (
        <div role="alert" className="rounded border border-red-300 bg-red-50 p-4">
          <p className="text-red-700">{state.message}</p>
          <button className="mt-2 rounded bg-red-600 px-3 py-1 text-white" onClick={retry}>
            Retry
          </button>
        </div>
      );

    case "success":
      if (state.data.length === 0) {
        return <EmptyState message="No tasks yet." />;
      }
      return (
        <ul className="space-y-2">
          {state.data.map((todo) => (
            <li key={todo.id} className="flex justify-between rounded border bg-white p-3">
              <span>{todo.title}</span>
              <StatusLabel completed={todo.completed} />
            </li>
          ))}
        </ul>
      );
  }
}
```

> **Placeholder (later lesson: Lists and Keys):** `.map()` turns an array into a list of elements, and `key` gives each item a stable identity so React can track it. Use `todo.id` and don't worry about the details yet.

Line by line:
- `useState<AsyncState<Todo[]>>({ status: "loading" })` starts in the loading case, so the first render never shows missing data.
- `AbortController` plus the cleanup `return () => controller.abort()` cancels an in-flight request if the component unmounts. The `AbortError` check keeps that expected cancellation from showing as an error.
- `!res.ok` matters: `fetch` only rejects on *network* failure. A 404 or 500 resolves normally, so you must throw yourself.
- `switch (state.status)` lets TypeScript **narrow** the union: inside `case "error"` it knows `state.message` exists, and inside `case "success"` it knows `state.data` exists. Accessing `state.data` in `"loading"` is a compile error.
- The **empty** case is *inside* `success`: the request worked, there's just nothing to show.
- `retry` sets `"loading"` *before* bumping `reloadKey`, which re-runs the effect. We reset to loading in the handler, not inside the effect.

> **Version note:** In development, React's `<StrictMode>` (included in the Vite template) deliberately mounts, unmounts, and re-mounts components once, so this effect runs **twice**, and you'll see two requests. That's expected and is why the cleanup matters. Newer `eslint-plugin-react-hooks` versions may also warn about calling `setState` synchronously inside an effect; the pattern above avoids that. Verify both against the versions you install.

**Why it matters**
Users judge an app mostly by what it does when things *aren't* perfect: slow networks, server errors, no results. Showing nothing, or crashing on `undefined`, is the most common beginner production bug.

**Mental model**
Vanilla version: you'd write `spinner.hidden = false`, then later `spinner.hidden = true; list.hidden = false;`, easy to forget one. Here, `state` is the **single source of truth** and exactly one branch renders; it is impossible to show the spinner and the list together.

**Common beginner mistakes**
- **Mistake:** Using separate booleans (`isLoading`, `hasError`, `data`) instead of one status.
  **Symptom:** Impossible combinations (loading *and* error); forgotten resets.
  **Fix:** One `status` field, as in `AsyncState`.
- **Mistake:** Rendering `data.map(...)` while `data` is still `null`/`undefined`.
  **Error message:** `Cannot read properties of undefined (reading 'map')`.
  **Fix:** Render the loading case first and only touch data in the success branch.
- **Mistake:** Treating a 404/500 as success because `fetch` didn't reject.
  **Symptom:** Error pages parsed as JSON and weird crashes, or an empty list with no explanation.
  **Fix:** Check `res.ok` and throw.
- **Mistake:** Showing "No tasks" while still loading.
  **Symptom:** A brief flash of the empty message before data arrives.
  **Fix:** Loading is a separate case checked first.
- **Mistake:** No cleanup for the request.
  **Symptom:** In dev, duplicate requests; in apps, a warning-free but wasteful or out-of-order update.
  **Fix:** `AbortController` cleanup, as above.

**Try it (5 min)**
Change `URL` to `https://jsonplaceholder.typicode.com/todos-broken` and confirm the error UI with Retry appears. Then open DevTools, throttle the network to "Slow 3G", and watch the loading state. Finally, change the URL to `…/todos?_limit=0` and confirm the empty message.

**Project step: Milestone 4 (about 35 min)**
Create `TodoBoard.tsx`, render it in `App.tsx`, and make all four states work. Then compute `openCount` inside the board and display it (hint: you'll need to move the counter or lift the data; discuss the trade-off, but keep the counter inside `TodoBoard` for now).

> **Placeholder (later lessons):** Repeating this fetch logic in every component is a clear sign you want a **custom hook** (lesson: Custom Hooks). Libraries like TanStack Query also give you `isLoading`/`isError` for free (lesson: Data Fetching). Loading UI can also be handled declaratively with `Suspense` and error UI with **Error Boundaries** (lesson: Advanced Rendering). Don't use them today.

---

### 3.7 Conditional Styling and Attributes

**Explanation**
Conditional rendering isn't only "show or hide." You'll often keep an element but change how it *looks* or *behaves*: different Tailwind classes, a `disabled` button, an `aria-*` attribute. The condition goes into the prop value instead of around the element.

```tsx
// src/components/TodoItem.tsx
import type { Todo } from "../types";

interface TodoItemProps {
  todo: Todo;
  isAdmin: boolean;
  onDelete: (id: number) => void;
}

export default function TodoItem({ todo, isAdmin, onDelete }: TodoItemProps) {
  const containerClasses = [
    "flex items-center justify-between rounded border p-3",
    todo.completed ? "border-green-300 bg-green-50" : "border-slate-200 bg-white",
  ].join(" ");

  return (
    <li className={containerClasses}>
      <span className={todo.completed ? "text-slate-400 line-through" : "text-slate-900"}>
        {todo.title}
      </span>

      <div className="flex items-center gap-2">
        {todo.completed && (
          <span className="rounded bg-green-600 px-2 text-xs text-white">Done</span>
        )}
        {isAdmin && (
          <button
            className="text-sm text-red-600 hover:underline"
            onClick={() => onDelete(todo.id)}
          >
            Delete
          </button>
        )}
      </div>
    </li>
  );
}
```

Line by line:
- `containerClasses` builds a class string from an array: fixed classes plus one chosen by the condition. It keeps JSX readable.
- Each Tailwind class appears as a **complete literal string** in the source.
- `isAdmin && <button>` is both a style *and* a permission decision (see the warning in 3.8).

```tsx
// Other conditional attributes
<button disabled={isSaving} aria-busy={isSaving} className={isSaving ? "opacity-50" : ""}>
```

**Why it matters**
Visual feedback (completed, selected, error, disabled) is most of what makes a UI feel responsive. This is also where Tailwind has its main gotcha.

**Mental model**
In vanilla JS you'd call `el.classList.toggle("done", item.completed)`. In React the class list is just a value computed from props, so there's nothing to toggle later.

**Common beginner mistakes**
- **Mistake:** Building class names dynamically, like `` `bg-${color}-500` ``.
  **Symptom:** The element has no styling in the browser even though the class name looks right in DevTools.
  **Fix:** Tailwind scans source files for *complete* class strings. Write `color === "red" ? "bg-red-500" : "bg-green-500"` so both full names exist in the code.
- **Mistake:** Leaving a trailing `undefined` in a class string: `` `p-2 ${cond && "bg-red-500"}` ``.
  **Symptom:** The literal word `false` or `undefined` ends up inside the class attribute.
  **Fix:** Use a ternary with `""`, or the array + `.join(" ")` approach.
- **Mistake:** Forgetting `disabled` doesn't dim the button by itself.
  **Symptom:** A button that is disabled but looks clickable.
  **Fix:** Add conditional styling, or Tailwind's `disabled:` variant.

> **Optional tool:** libraries like `clsx` make class lists neater, but the array + `.join(" ")` approach needs no installs.

**Try it (4 min)**
Add a conditional border color to a `TodoItem`: red when the title is longer than 40 characters, slate otherwise. Use complete class names.

**Project step: Milestone 5 (about 20 min)**
Replace the inline `<li>` in `TodoBoard` with `<TodoItem />`. For now pass `isAdmin={false}` and an empty `onDelete`; they're wired in 3.8 and 3.9.

---

### 3.8 Switching Views: Filters, Tabs, and Role-Based UI

**Explanation**
Some conditions pick one *whole view* out of several: a filter (All / Open / Done), or app-level tabs (Tasks / Team / Settings). The cleanest pattern is to store a small typed value (`"all" | "open" | "done"`) in state and **derive** what to show from it. When there are more than two or three views, use a **lookup object** instead of a chain of ternaries.

First, filtering with a derived list and a message per case:

```tsx
// src/components/TodoBoard.tsx (excerpt: success branch after adding filters)
type Filter = "all" | "open" | "done";

const EMPTY_MESSAGES: Record<Filter, string> = {
  all: "No tasks yet.",
  open: "Nothing left to do. Nice work!",
  done: "No completed tasks yet.",
};

// inside the component, alongside the other hooks:
const [filter, setFilter] = useState<Filter>("all");

// inside the success case:
const visible = state.data.filter((t) =>
  filter === "all" ? true : filter === "done" ? t.completed : !t.completed
);

if (visible.length === 0) {
  return <EmptyState message={EMPTY_MESSAGES[filter]} />;
}
```

Because `filter` is derived into `visible`, we never store a second copy of the list.

> **Note:** the filter buttons must stay visible even when `visible` is empty. When you move the early `return <EmptyState />` into the success branch, make sure the tab buttons render *above* the switch (in a wrapper), otherwise the user gets stuck on an empty filter. Learners should hit this and fix it during the project step.

Now role-aware, app-level tabs using a lookup of components:

```tsx
// src/App.tsx
import { useState, type ComponentType } from "react";
import type { Role } from "./types";
import TodoBoard from "./components/TodoBoard";

type Tab = "tasks" | "team" | "settings";

function TeamPanel() {
  return <p>Team members go here.</p>;
}
function SettingsPanel() {
  return <p>Admin-only settings go here.</p>;
}

const VIEWS: Record<Tab, ComponentType<{ role: Role }>> = {
  tasks: TodoBoard,
  team: TeamPanel,
  settings: SettingsPanel,
};

const TABS_BY_ROLE: Record<Role, Tab[]> = {
  viewer: ["tasks", "team"],
  admin: ["tasks", "team", "settings"],
};

export default function App() {
  const [role, setRole] = useState<Role>("viewer");
  const [tab, setTab] = useState<Tab>("tasks");

  const allowedTabs = TABS_BY_ROLE[role];
  const activeTab: Tab = allowedTabs.includes(tab) ? tab : "tasks";
  const ActiveView = VIEWS[activeTab];

  return (
    <div className="mx-auto max-w-2xl p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">TaskPilot</h1>
        <button
          className="rounded bg-slate-800 px-3 py-1 text-white"
          onClick={() => setRole((r) => (r === "viewer" ? "admin" : "viewer"))}
        >
          Role: {role}
        </button>
      </header>

      <nav className="mt-4 flex gap-2">
        {allowedTabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              t === activeTab
                ? "rounded bg-indigo-600 px-3 py-1 text-white"
                : "rounded bg-slate-200 px-3 py-1"
            }
          >
            {t}
          </button>
        ))}
      </nav>

      <main className="mt-4">
        <ActiveView role={role} />
      </main>
    </div>
  );
}
```

(Give `TodoBoard` a `{ role }: { role: Role }` prop; `TeamPanel` and `SettingsPanel` simply ignore extra props, which TypeScript permits for functions with fewer parameters.)

Line by line:
- `Record<Tab, ...>` is a TypeScript object type keyed by the `Tab` union. If you add a tab and forget a view, the compiler errors. That's the safety a `switch` or ternary chain lacks.
- `VIEWS[activeTab]` selects a *component*, and `<ActiveView />` renders it. Capitalized variable name = component, same rule as always.
- `TABS_BY_ROLE` is data, not logic. Adding a role or tab is a one-line change.
- `activeTab` is **derived**: if the stored `tab` isn't allowed for the current role (an admin on `settings` switches to viewer), we fall back to `"tasks"` instead of showing a view the viewer shouldn't see.

> **Important warning:** hiding UI based on `role` is a **usability** feature, not **security**. Anyone can open DevTools and change client state. Real permission checks must happen on the server. Say this out loud to learners.

**Why it matters**
Dashboards, wizards, settings pages, and permission-based screens all rely on "one of N views." A lookup object scales cleanly and is easy to read and review.

**Mental model**
In vanilla JS you'd have a `showView(name)` function that hides every section and un-hides one. In React, the selected view is just `VIEWS[activeTab]`, and the unselected ones don't exist.

**Common beginner mistakes**
- **Mistake:** Storing `activeTab` and *also* checking the role elsewhere, so they disagree.
  **Symptom:** A viewer sees the Settings view after toggling role.
  **Fix:** Derive the effective tab from `tab` + `role` during render, as above.
- **Mistake:** A long `if / else if` or ternary chain for views.
  **Symptom:** Hard to read, hard to extend.
  **Fix:** A `Record` lookup (or `switch` for a few cases).
- **Mistake:** Writing `VIEWS[activeTab]()` (calling the component like a function) or `<VIEWS[activeTab] />`.
  **Error message:** `Invalid hook call` later, or a JSX syntax error.
  **Fix:** Assign to a capitalized variable first: `const ActiveView = VIEWS[activeTab];`.
- **Mistake:** Putting the filter buttons inside the branch that disappears when the list is empty.
  **Symptom:** The user is stuck in an empty filter with no way back.
  **Fix:** Render navigation controls outside the conditional content.

**Try it (5 min)**
Add `"audit"` to the `Tab` type *without* adding it to `VIEWS`. Read the TypeScript error, then add the missing view.

**Project step: Milestone 6 (about 30 min)**
Add the All/Open/Done filter to `TodoBoard` (with per-filter empty messages) and the role-aware tabs to `App`. Pass `isAdmin={role === "admin"}` to `TodoItem` and give `TodoBoard` an `onDelete` that removes a task from state (use the functional `setState` form so it keeps the `"success"` shape). Confirm Delete buttons appear only for admins.

---

### 3.9 Toggles: Modals, Disclosures, and Mount vs. Hide

**Explanation**
A **toggle** is a boolean (or `null`-able object) in state that controls whether a chunk of UI exists: a dropdown, an accordion, a confirm dialog. There are two ways to hide something:

1. **Unmount it:** `{open && <Panel />}`. The component is removed, and its internal state is destroyed.
2. **Hide it with CSS:** `<Panel className={open ? "" : "hidden"} />`. The component stays mounted and keeps its state.

Pick deliberately. Most of the time, unmounting is right; CSS hiding is useful when you need to preserve state (a half-typed form, a scroll position) or avoid a costly re-mount.

```tsx
// src/components/ConfirmDialog.tsx
import { useEffect } from "react";

interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        className="w-80 rounded bg-white p-4 shadow"
        onClick={(e) => e.stopPropagation()}
      >
        <p>{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button className="rounded bg-slate-200 px-3 py-1" onClick={onCancel}>Cancel</button>
          <button className="rounded bg-red-600 px-3 py-1 text-white" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}
```

```tsx
// src/components/TodoBoard.tsx (excerpt)
const [pendingDelete, setPendingDelete] = useState<Todo | null>(null);

// in the JSX returned by the success branch:
<TodoItem todo={todo} isAdmin={role === "admin"} onDelete={() => setPendingDelete(todo)} />

{pendingDelete && (
  <ConfirmDialog
    message={`Delete "${pendingDelete.title}"?`}
    onCancel={() => setPendingDelete(null)}
    onConfirm={() => {
      handleDelete(pendingDelete.id);
      setPendingDelete(null);
    }}
  />
)}
```

Line by line:
- `pendingDelete` is `Todo | null`. `null` means "no dialog," and the object means "dialog open *for this task*." One value encodes both the open state and the data, so there is no separate `isOpen` flag to forget to reset.
- `{pendingDelete && <ConfirmDialog … />}` is safe with `&&` because an object or `null` can never print as text.
- The `useEffect` adds the Escape-key listener only while the dialog is **mounted**, and the cleanup removes it. Conditional mounting gives the effect the correct lifetime for free.
- `e.stopPropagation()` stops clicks inside the dialog from reaching the backdrop's `onClick`, which would close it.

A disclosure (show/hide details) is the same idea:

```tsx
const [open, setOpen] = useState(false);
// ...
<button onClick={() => setOpen((o) => !o)} aria-expanded={open}>Details</button>
{open && <p className="text-sm text-slate-600">Task ID: {todo.id}</p>}
```

**State preservation demo (do this live):** put an `<input>` inside a panel toggled with `{open && …}`, type something, close and reopen: the text is gone (unmounted). Switch to the CSS `hidden` approach and the text survives.

> **Placeholder (later lesson: Lists and Keys):** React decides "same component or new one?" by its *position and type* in the tree. Giving a component a different `key` forces a fresh instance with reset state. You'll see why in that lesson; for now, just know it is the tool for "reset this form when the selected item changes."

**Why it matters**
Modals, menus, drawers, and accordions are in nearly every product. Understanding *when state is destroyed* explains a whole family of "why did my input clear?" bugs.

**Mental model**
Unmounting is like closing a browser tab: everything in it is gone. Hiding with CSS is like switching to another tab: it's still there, just not visible. In vanilla JS you'd always do the second one (`element.hidden = true`) without thinking, and React makes the first one the default.

**Common beginner mistakes**
- **Mistake:** Keeping the dialog data in *two* states (`isOpen` and `selectedTodo`).
  **Symptom:** Dialog opens with the previous task's text, or closes but leaves stale data.
  **Fix:** One `Todo | null` state.
- **Mistake:** Adding an event listener in an effect without cleanup.
  **Symptom:** Handlers pile up; Escape triggers multiple times or runs after the dialog is gone.
  **Fix:** Always return a cleanup function that removes the listener.
- **Mistake:** Unmounting a form and expecting its fields to remember values.
  **Symptom:** Typed text vanishes when the panel closes.
  **Fix:** Lift the state to a parent that stays mounted, or hide with CSS.
- **Mistake:** Making a dialog close on *any* click inside it.
  **Symptom:** Clicking the Cancel/Delete buttons works but clicking text also closes it.
  **Fix:** `stopPropagation()` on the dialog container.

**Try it (5 min)**
Add a "Details" disclosure to `TodoItem` that reveals the task's `userId`. Add `aria-expanded` to the button.

**Project step: Milestone 7 (about 35 min)**
Add the `ConfirmDialog` flow for deleting tasks (admin only). Make Escape and backdrop-click cancel it. Then do the state-preservation demo in a scratch component and compare the two approaches.

---

### 3.10 Conditional Feedback in Forms

**Explanation**
Forms are a stream of conditions: show an error only after the user has tried, disable submit while invalid or sending, show extra fields only for certain roles. Inputs are **controlled**: their value lives in state, so validation messages are simply derived from that state during render.

```tsx
// src/components/AddTaskForm.tsx
import { useState, type FormEvent } from "react";
import type { Role } from "../types";

interface AddTaskFormProps {
  role: Role;
  onAdd: (title: string) => void;
}

export default function AddTaskForm({ role, onAdd }: AddTaskFormProps) {
  const [title, setTitle] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const trimmed = title.trim();
  const error =
    trimmed.length === 0 ? "Title is required." :
    trimmed.length < 3 ? "Title must be at least 3 characters." :
    null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    if (error) return;
    onAdd(trimmed);
    setTitle("");
    setSubmitted(false);
  };

  const showError = submitted && error !== null;

  return (
    <form onSubmit={handleSubmit} className="mb-4 space-y-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New task…"
        aria-invalid={showError}
        className={
          showError
            ? "w-full rounded border border-red-500 p-2"
            : "w-full rounded border border-slate-300 p-2"
        }
      />

      {showError && <p className="text-sm text-red-600">{error}</p>}

      {role === "admin" && (
        <p className="text-xs text-slate-500">Admins can add tasks for the whole team.</p>
      )}

      <button
        type="submit"
        disabled={submitted && error !== null}
        className="rounded bg-indigo-600 px-3 py-1 text-white disabled:opacity-50"
      >
        Add task
      </button>
    </form>
  );
}
```

```tsx
// src/components/TodoBoard.tsx (excerpt)
const handleAdd = (title: string) =>
  setState((prev) =>
    prev.status === "success"
      ? {
          status: "success",
          data: [{ id: Date.now(), userId: 1, title, completed: false }, ...prev.data],
        }
      : prev
  );
```

Line by line:
- `error` is **derived** from `title` on every render. We don't store it, so it can't go stale.
- `submitted` gates *when* the error is shown, so users aren't scolded for an empty field before they've tried.
- `showError` combines two conditions once, then reuses it for the border, `aria-invalid`, and the message.
- `onAdd` is only called when `error` is `null`; the parent decides what "add" means.
- `Date.now()` is just a quick unique ID for this exercise; a server would assign real IDs.

**Why it matters**
Good form feedback is the difference between a usable and a frustrating product. The "derive, don't store" rule keeps validation reliable.

**Mental model**
In vanilla JS you'd write `errorEl.textContent = "..."` in the submit handler and remember to clear it later. In React the message is a *function of the current input*, so "clearing it" is automatic: it disappears the moment the input becomes valid.

**Common beginner mistakes**
- **Mistake:** Storing `error` in state and updating it in `onChange` and `onSubmit` separately.
  **Symptom:** Error stays visible after the input is fixed, or shows a stale message.
  **Fix:** Derive it from the current value.
- **Mistake:** Disabling submit from the first render when the field is empty, with no explanation.
  **Symptom:** Users can't tell why the button is dead.
  **Fix:** Keep the button enabled and show a message on submit, or show a hint next to the disabled button.
- **Mistake:** Forgetting `e.preventDefault()`.
  **Symptom:** The page reloads on submit and state is lost.
  **Fix:** Call it first in the handler.
- **Mistake:** Showing the error for every keystroke from the start.
  **Symptom:** "Title is required" flashes red the instant the form loads.
  **Fix:** Gate display behind `submitted` (or a per-field `touched` flag).

**Try it (5 min)**
Add a character counter below the input that turns red (conditional class) once the title exceeds 60 characters, and make that also an error.

**Project step: Milestone 8 (about 30 min)**
Add `AddTaskForm` above the list in `TodoBoard` (it should only render in the `"success"` state, not while loading or in an error), with working validation, and confirm a newly added task appears at the top.

---

### 3.11 Refactoring Conditional Logic

**Explanation**
Conditional logic starts clean and gets messy as requirements grow. Four refactors keep it readable:

1. **Replace nested ternaries with early returns or components.**
2. **Replace a chain of conditions with a lookup object** (3.8).
3. **Extract the branch into a named component**, so the parent reads like a sentence.
4. **Compute derived values into named variables** above the `return`.

```tsx
// Before: nested ternary: hard to read
return (
  <div>
    {state.status === "loading" ? (
      <Spinner />
    ) : state.status === "error" ? (
      <ErrorBox message={state.message} />
    ) : state.data.length === 0 ? (
      <EmptyState message="No tasks." />
    ) : (
      <TodoList todos={state.data} />
    )}
  </div>
);
```

```tsx
// After: each case has a name and a place
function TodoContent({ state }: { state: AsyncState<Todo[]> }) {
  if (state.status === "loading") return <Spinner />;
  if (state.status === "error") return <ErrorBox message={state.message} />;
  if (state.data.length === 0) return <EmptyState message="No tasks." />;
  return <TodoList todos={state.data} />;
}

// parent
return (
  <div>
    <TodoContent state={state} />
  </div>
);
```

Line by line:
- Each `if` handles one situation and returns, so you read top to bottom and the last line is the happy path.
- TypeScript still narrows: after the `loading` and `error` guards, `state.data` is known to exist.
- The parent no longer cares about the branching.

Another useful habit is **optional chaining** and **nullish coalescing** for missing data:

```tsx
<p>{user?.name ?? "Anonymous"}</p>
```

`?.` stops if `user` is `null`/`undefined`, and `??` supplies a fallback only for `null`/`undefined` (unlike `||`, it does not replace `0` or `""`).

**Why it matters**
Code is read far more often than written. Teams review hundreds of conditional branches, and flat, named branches prevent bugs.

**Mental model**
Treat each branch like a function in plain TypeScript: if a function grows too many nested `if`s, you split it. Components are the same.

**Common beginner mistakes**
- **Mistake:** Passing a pile of booleans (`isLoading`, `isError`, `isEmpty`) down to a "smart" child.
  **Symptom:** Conflicting flags and confusing props.
  **Fix:** Pass the single `state` value, or decide in the parent and render the right component.
- **Mistake:** Using `||` for fallbacks on numbers or strings.
  **Symptom:** `0` or an empty string gets replaced by the default.
  **Fix:** Use `??`.
- **Mistake:** Over-extracting: a component for every ternary.
  **Symptom:** Files full of tiny one-line components.
  **Fix:** Extract when a branch has meaning, repeats, or grows past a few lines.

**Try it (5 min)**
Take the *Before* snippet above, rewrite it using early returns in a `TodoContent` component, and verify TypeScript still lets you access `state.message` and `state.data` in the right places.

**Project step: Milestone 9 (about 25 min)**
Refactor `TodoBoard`: pull the loading/error/empty/success handling into `TodoContent`, and extract `Spinner` and `ErrorBox` components. Behavior must not change.

---

## 4. How the Sub-Sections Connect

**Dependency order (each step builds on the previous):**

```
3.1 UI = f(state)           [the idea]
   │
3.2 Project setup + types   [gives a place to practice; defines AsyncState]
   │
3.3 if / early return ──┐
3.4 ternary ────────────┼─ the three basic tools (3.5 completes the set)
3.5 && and render rules ┘
   │
3.6 Async states (loading/error/empty/success)   uses 3.3 (guards), 3.4, 3.5,
   │                                              plus AsyncState from 3.2
3.7 Conditional styling/attributes                uses 3.4 on props instead of JSX
   │
3.8 Views: filters, tabs, role-based              uses 3.3-3.5 at larger scale; derived values
   │
3.9 Toggles: modals, disclosures, mount vs hide   uses 3.5 (&&) + useEffect cleanup
   │
3.10 Forms: conditional feedback                  uses 3.4/3.5 + derived values (3.8)
   │
3.11 Refactoring                                   applies 3.3 to clean up everything above
```

**Hierarchy:** Section 3.1 is the *concept*. Sections 3.3-3.5 are the *tools*. Sections 3.6-3.10 are *applications* of those tools in one project. Section 3.11 is *quality* (making it maintainable).

**The project thread:** TaskPilot grows in nine milestones, so every concept lands in the same codebase, and learners finish with something portfolio-worthy.

**Suggested live-teaching flow (6 hours = 360 min):**

| Clock | Min | Section | Mode |
|---|---|---|---|
| 0:00-0:15 | 15 | 3.1 UI as a function of state | Talk and a 2-minute vanilla vs React demo; no coding |
| 0:15-0:30 | 15 | 3.2 Setup | Everyone scaffolds, adds Tailwind, pastes types and starter `App` |
| 0:30-0:55 | 25 | 3.3 if / early return | Demo `AdminPanel`; learners code Milestone 1; trigger the hooks-order error on purpose |
| 0:55-1:15 | 20 | 3.4 ternary | Demo `StatusLabel`; learners code Milestone 2 |
| 1:15-1:40 | 25 | 3.5 `&&` | Demo the `0` bug live; learners code Milestone 3; show the decision table |
| 1:40-1:50 | 10 | Break | |
| 1:50-2:40 | 50 | 3.6 Async states | Live-code the fetch with learners; throttle the network; learners code Milestone 4 (the core milestone) |
| 2:40-3:00 | 20 | 3.7 Conditional styling | Demo `TodoItem`; show the Tailwind dynamic-class bug; Milestone 5 |
| 3:00-3:15 | 15 | Lunch / longer break | |
| 3:15-3:45 | 30 | 3.8 Views and roles | Demo the lookup object; do the "stale tab" bug; learners code Milestone 6; say the security warning aloud |
| 3:45-4:20 | 35 | 3.9 Toggles and modals | Demo the mount-vs-hide input test; learners code Milestone 7 |
| 4:20-4:50 | 30 | 3.10 Forms | Demo derived validation; learners code Milestone 8 |
| 4:50-5:15 | 25 | 3.11 Refactoring | Walk the before/after; learners code Milestone 9 |
| 5:15-5:45 | 30 | Knowledge check + applied exercise | Learners work solo on the **UserDirectory** exercise (Section 6, Part B) |
| 5:45-6:00 | 15 | Review and recap | Review the answer key, recap the summary, preview the next lesson |

Trim rule if running long: shorten 3.7 and 3.10 demos first, since learners can finish those milestones as homework.

---

## 5. Key Terms Glossary

*(in order of first appearance)*

- **Conditional rendering**: returning different JSX depending on props or state.
- **Imperative**: manually telling the DOM each step (find, change, show, hide).
- **Declarative**: describing what the UI should look like and letting React update the DOM.
- **`null` render**: returning `null` from a component to show nothing.
- **Discriminated union**: a TypeScript union where a shared field (like `status`) tells you which variant you have.
- **Guard clause / early return**: an `if` at the top of a function that exits early for a special case.
- **Rules of Hooks**: hooks must be called at the top level, in the same order, on every render.
- **Ternary operator**: `condition ? a : b`, an expression that picks one of two values.
- **Short-circuit (`&&`)**: `a && b` yields `a` if falsy, otherwise `b`; used for "render this or nothing."
- **Falsy / truthy**: values treated as false (`0`, `""`, `null`, `undefined`, `false`, `NaN`) or true in a condition.
- **Loading / error / empty / success**: the four states of any data-driven screen.
- **`AbortController`**: a browser API to cancel an in-flight `fetch`.
- **Type narrowing**: TypeScript refining a union to one specific variant after a check.
- **Derived state**: a value computed from existing state during render rather than stored.
- **Lookup object (`Record`)**: an object mapping keys to values or components, used instead of long conditional chains.
- **Mount / unmount**: React adding a component to the tree / removing it (and destroying its state).
- **Controlled input**: a form field whose value is held in React state.
- **Optional chaining (`?.`)**: safely reading a property that might be `null` or `undefined`.
- **Nullish coalescing (`??`)**: use the right-hand value only when the left is `null` or `undefined`.

---

## 6. Knowledge Check

### Part A: Questions

**Q1 (Recall).** Name the three basic ways to do conditional rendering in JSX and give one situation where each is the best fit.

**Q2 (Predict the output).** What appears on screen?

```tsx
function Inbox({ unread }: { unread: number }) {
  return <p>Inbox {unread && <span>({unread} new)</span>}</p>;
}

// <Inbox unread={0} />
```

**Q3 (Spot the bug).** This component sometimes crashes with a hooks error. Why, and how do you fix it?

```tsx
function Profile({ user }: { user: { name: string } | null }) {
  if (!user) return <p>Please sign in.</p>;
  const [editing, setEditing] = useState(false);
  return <button onClick={() => setEditing(!editing)}>{user.name}</button>;
}
```

**Q4 (Spot the bug).** The badge never turns red, even though `status` is `"overdue"`. Why?

```tsx
const color = status === "overdue" ? "red" : "green";
return <span className={`bg-${color}-500 px-2 text-white`}>{status}</span>;
```

**Q5 (Predict the output).** A user opens the confirm dialog, then the parent sets `pendingDelete` to `null`. What happens to the dialog's `useEffect` keydown listener, and why?

```tsx
{pendingDelete && <ConfirmDialog /* … */ />}
```

### Part B: Applied mini-exercise: UserDirectory

**Goal:** Build a small directory that shows all four async states, a search filter with an empty-results message, and an expandable details row.

**Starter code:**

```tsx
// src/types.ts (add)
export interface User {
  id: number;
  name: string;
  email: string;
  company: { name: string };
}

// src/components/UserDirectory.tsx
import { useEffect, useState } from "react";
import type { AsyncState, User } from "../types";

const USERS_URL = "https://jsonplaceholder.typicode.com/users";

export default function UserDirectory() {
  const [state, setState] = useState<AsyncState<User[]>>({ status: "loading" });
  const [query, setQuery] = useState("");

  // TODO 1: fetch USERS_URL in useEffect, with cleanup and res.ok handling
  // TODO 2: render loading, error (with Retry), empty, and success
  // TODO 3: filter users by name using `query` (derive it, don't store it)
  // TODO 4: show "No users match "…"" when the search finds nothing
  // TODO 5: each user row has a Details button that toggles email + company

  return <div className="p-4">{/* TODO */}</div>;
}
```

**Requirements:**
1. Model the request with `AsyncState<User[]>` and render each case with a `switch` or early returns.
2. A failed request shows an error message and a working **Retry** button.
3. The search input filters by name (case-insensitive) and stays visible even when there are no matches.
4. When the filter matches nothing, show `No users match "<query>"` (not the generic empty message).
5. Each row has a **Details** toggle that reveals email and company, using one piece of state per row's open/closed status (the simplest approach is a small `UserRow` component with its own `useState`).
6. Use no `&&` with a number on the left side.

**Acceptance criteria:**
- Throttling the network shows the loading state; breaking the URL shows the error state with a working Retry.
- Typing `xyz` shows the "no match" message and the input stays usable.
- No stray `0`, `false`, or `undefined` is ever visible on screen.
- TypeScript compiles with no errors, and no `any` is used.
- Opening one user's details doesn't open any other row.

---

## 7. Summary Recap

- **UI is a function of state.** You describe what the screen should be for the current data; React updates the DOM. Never show or hide nodes by hand.
- **Choose the simplest tool:** `if`/early return for whole-component changes, `?:` for two-way choices inside JSX, `&&` for show-or-nothing, and a lookup object for many views.
- **Always handle loading, error, empty, and success.** Model them as one typed `status` value so impossible combinations can't exist.
- **Derive, don't duplicate.** Filters, validation errors, and counts should be computed from state during render, never stored separately.
- **Know what unmounting destroys.** `{open && <X />}` throws away state; hiding with CSS keeps it. Effects with cleanup are tied to mount time.
- **Keep branches readable.** Prefer early returns, named components, and `??`/`?.` over nested ternaries, and remember that hiding UI is not security.

---

## 8. Next Lesson Bridge

This lesson leaned on `.map()` and `key` without fully explaining them, and TaskPilot repeats its fetch logic in more than one place. The next lessons build directly on that: **Lists and Keys** explains rendering collections correctly and why `key` controls state identity (the reason unmounting reset the input in 3.9), and **Custom Hooks** extracts the `AsyncState` fetch pattern into a reusable `useFetch`, which sets up data-fetching libraries and routing after that.

---

## Instructor Answer Key

**Q1.**
- **`if` / early return**: when the *whole component* should render something different or nothing (e.g. `AdminPanel` returning `null` for non-admins, a loading screen).
- **Ternary `?:`**: when you must pick **one of two** outputs inside JSX (e.g. "Saving…" vs "Save").
- **`&&`**: when you want to show something **or nothing**, with no else branch (e.g. a "Done" badge).
(A lookup object or `switch` is a good fourth answer for three or more outcomes.)

**Q2.** It renders `Inbox 0`. `unread` is `0`, so `0 && <span>…</span>` evaluates to `0`, and React prints the number `0`. Fix: `{unread > 0 && <span>({unread} new)</span>}`.

**Q3.** `useState` is called *after* an early return, so on renders where `user` is `null` the hook doesn't run, and the number of hooks changes between renders. This causes `Rendered fewer hooks than expected` or `React has detected a change in the order of Hooks`. Fix: call `const [editing, setEditing] = useState(false);` *before* the early return.

**Q4.** Tailwind finds classes by scanning the source for **complete** class strings. `` `bg-${color}-500` `` never appears as a full string like `bg-red-500`, so that CSS is never generated. Fix: `const colorClass = status === "overdue" ? "bg-red-500" : "bg-green-500";` and use `className={`${colorClass} px-2 text-white`}`.

**Q5.** When `pendingDelete` becomes `null`, `<ConfirmDialog />` is **unmounted**. React runs the effect's **cleanup** function, which calls `document.removeEventListener("keydown", onKeyDown)`, so the listener is removed. (Without that cleanup, the Escape listener would remain attached after the dialog closed.)

### Model solution: UserDirectory

```tsx
// src/components/UserDirectory.tsx
import { useEffect, useState } from "react";
import type { AsyncState, User } from "../types";

const USERS_URL = "https://jsonplaceholder.typicode.com/users";

function UserRow({ user }: { user: User }) {
  const [open, setOpen] = useState(false);

  return (
    <li className="rounded border bg-white p-3">
      <div className="flex items-center justify-between">
        <span className="font-medium">{user.name}</span>
        <button
          className="text-sm text-indigo-600 hover:underline"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Hide" : "Details"}
        </button>
      </div>
      {open && (
        <p className="mt-2 text-sm text-slate-600">
          {user.email} · {user.company.name}
        </p>
      )}
    </li>
  );
}

export default function UserDirectory() {
  const [state, setState] = useState<AsyncState<User[]>>({ status: "loading" });
  const [query, setQuery] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetch(USERS_URL, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.json() as Promise<User[]>;
      })
      .then((data) => setState({ status: "success", data }))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Something went wrong",
        });
      });

    return () => controller.abort();
  }, [reloadKey]);

  const retry = () => {
    setState({ status: "loading" });
    setReloadKey((k) => k + 1);
  };

  let content;
  if (state.status === "loading") {
    content = <p className="animate-pulse text-slate-500">Loading users…</p>;
  } else if (state.status === "error") {
    content = (
      <div role="alert" className="rounded border border-red-300 bg-red-50 p-4">
        <p className="text-red-700">{state.message}</p>
        <button className="mt-2 rounded bg-red-600 px-3 py-1 text-white" onClick={retry}>
          Retry
        </button>
      </div>
    );
  } else if (state.data.length === 0) {
    content = <p className="text-slate-500">No users available.</p>;
  } else {
    const q = query.trim().toLowerCase();
    const visible = state.data.filter((u) => u.name.toLowerCase().includes(q));

    content =
      visible.length === 0 ? (
        <p className="text-slate-500">No users match "{query}"</p>
      ) : (
        <ul className="space-y-2">
          {visible.map((u) => (
            <UserRow key={u.id} user={u} />
          ))}
        </ul>
      );
  }

  return (
    <div className="p-4">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name…"
        className="mb-4 w-full rounded border border-slate-300 p-2"
      />
      {content}
    </div>
  );
}
```

**Why this solution is structured this way (talking points):**
- The search input is rendered *outside* the conditional `content`, so it never disappears when results are empty.
- `visible` is derived inside the success branch, with no second list in state.
- Each row owns its own `open` state in `UserRow`, so opening one row doesn't affect others.
- No `&&` is used with a numeric left operand. `open &&` is a boolean, and the length checks use `=== 0`.
- Loading and error are handled before any access to `state.data`, and TypeScript narrows each branch.

> **Version note for the instructor:** verify the `react-ts` template's current `tsconfig` strictness and the installed React/Vite/Tailwind versions before class. The code above uses only stable APIs (`useState`, `useEffect`, `fetch`, `AbortController`) and should work across current React versions, but template defaults and lint rules do change.
