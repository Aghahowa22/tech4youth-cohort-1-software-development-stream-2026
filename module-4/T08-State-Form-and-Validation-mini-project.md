# Lesson A (Concepts): Controlled Forms, Validation, Cleanup, Custom Hooks, and Local vs Server State

> **Assumptions (read first).** This is the concepts-only half of a 4-hour, project-based session. Lesson A (about 90 min, including the knowledge check) is taught first; after a 15-minute break, **Lesson B** (`lesson-b-shoplite-project.md`, about 135 min) applies everything by building the *ShopLite* app. Prior lessons: components, `useState`, `useEffect`. I also assume learners know basic routing (`Link`, `useParams`), because Lesson B needs it; if not, add a 5-minute primer. Stack: latest stable React, Vite `react-ts` template, **pnpm**, zod, TanStack Query. Anything version-sensitive is flagged **Version note**; please verify these against current docs before teaching.

---

## 1. Learning objectives

By the end, learners will be able to:

1. **Build** a typed, controlled form in React and **refactor** state updates so they are immutable, with state owned by the right component.
2. **Validate** form data with a zod schema, infer TypeScript types from it, and render per-field error messages.
3. **Write** `useEffect` hooks that clean up after themselves, and **extract** reusable logic into typed custom hooks.
4. **Explain** the difference between local (client) state and server state, and **share** client state across components with Context.
5. **Fetch and cache** server data with TanStack Query and **debug** loading, error, and stale-data problems.

## 2. Prerequisite check

Learners must already be able to:

- Write a function component that returns JSX and accepts typed props.
- Use `useState` (including the functional update form `setX(prev => ...)`) and explain that a state change triggers a re-render.
- Use `useEffect` with a dependency array and explain when it runs.
- Use ES6+ features: destructuring, spread, `map`/`filter`/`find`, `async/await`, `fetch`.
- Read basic TypeScript: interfaces, union types, simple generics (`Array<T>`).

**Where this fits:** Lesson 1-3 taught *how React renders and stores state*. This lesson teaches *how real apps handle user input and data*, which is the bridge to routing-heavy, multi-page apps and eventually frameworks.

---

## 3. Section breakdown

Suggested timing: 3.1 (10 min) · 3.2 (10) · 3.3 (15) · 3.4 (10) · 3.5 (10) · 3.6 (10) · 3.7 (15) · Knowledge check (10).

### 3.1 Controlled inputs and form state

**Explanation.** A **controlled input** is a form element whose displayed value comes from React state, not from the DOM. You pass `value={state}` and an `onChange` that updates that state. The DOM then always shows what React says. An **uncontrolled input** keeps its own value in the DOM and you read it later (for example with a `ref`).

**Why it matters.** Almost every app has forms: login, search, checkout. Controlled inputs let you validate while typing, disable buttons, format values, and reset forms, all by changing state.

**Mental model.** Vanilla JS: `const v = input.value` when you need it (the DOM is the source of truth). React: the state is the source of truth and the input is just a *view* of it. Think of a spreadsheet cell showing a formula result: you change the data, not the display.

**Code example**

```tsx
// src/components/NameForm.tsx
import { useState, type ChangeEvent, type FormEvent } from "react";

export function NameForm() {
  const [name, setName] = useState("");                       // 1

  function handleChange(e: ChangeEvent<HTMLInputElement>) {   // 2
    setName(e.target.value);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {      // 3
    e.preventDefault();
    console.log("Submitted:", name);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="name">Name</label>
      <input id="name" value={name} onChange={handleChange} /> {/* 4 */}
      <p>Hello, {name || "stranger"}!</p>                      {/* 5 */}
      <button type="submit">Save</button>
    </form>
  );
}
```

1. State starts as `""` (a string, never `undefined`), which keeps the input controlled from the first render.
2. React's typed event: `ChangeEvent<HTMLInputElement>` gives `e.target.value` the right type.
3. `FormEvent<HTMLFormElement>` for submit; `preventDefault()` stops the browser's full-page reload.
4. `value` + `onChange` always travel together.
5. Because `name` is state, any part of the UI can use it instantly with no DOM querying.

For several fields, keep one object and use the input's `name` attribute:

```tsx
const [values, setValues] = useState({ email: "", password: "" });

function handleChange(e: ChangeEvent<HTMLInputElement>) {
  const { name, value } = e.target;
  setValues((prev) => ({ ...prev, [name]: value })); // computed key + spread
}
```

(For checkboxes, use `checked` and `e.target.checked`.)

**Common beginner mistakes**

| Mistake                                                           | Symptom                                                                      | Fix                                                          |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `value={x}` with no `onChange`                                    | Console warning about a `value` prop without `onChange`; typing does nothing | Add `onChange` (or use `defaultValue` for uncontrolled)      |
| `onChange={setName(e.target.value)}` (calling instead of passing) | "Too many re-renders"                                                        | Pass a function: `onChange={(e) => setName(e.target.value)}` |
| `useState()` or `useState(undefined)` for text                    | Warning: changing an uncontrolled input to controlled                        | Initialise with `""`                                         |
| Forgetting `e.preventDefault()`                                   | Page reloads on submit, state lost                                           | Call it first in the submit handler                          |

**Try it (3 min).** Add an `email` field to `NameForm` using the single-object pattern. Show a live character count of the name below the input.

---

### 3.2 State ownership and immutable updates

**Explanation.** **State ownership** means deciding which component holds a piece of state. The rule: put state in the *closest common parent* of every component that needs it, and pass it down as props plus callbacks to change it (**lifting state up**). **Derived state** is anything you can compute from existing state (totals, filtered lists); compute it during render instead of storing it. **Immutable update** means never changing an object or array in place; you create a new copy so React can see that something changed.

**Why it matters.** Duplicated state drifts out of sync (the classic "cart badge says 2, cart says 3" bug). Mutated state causes UI that silently does not update.

**Mental model.** Vanilla JS: you mutate `cart.push(item)` and then update the DOM yourself. React compares the *old reference* to the *new reference*. Same reference means "nothing changed", so no re-render. Think of state as a printed receipt: to change it you print a new one.

**Code example**

```tsx
// src/components/CartDemo.tsx
import { useState } from "react";

interface CartItem {
  id: number;
  title: string;
  qty: number;
}

function AddButton({ label, onAdd }: { label: string; onAdd: () => void }) {
  return <button onClick={onAdd}>Add {label}</button>;
}

export function CartDemo() {
  const [cart, setCart] = useState<CartItem[]>([]);           // owner of the state

  function add(id: number, title: string) {
    setCart((prev) =>
      prev.some((i) => i.id === id)
        ? prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)) // new object for the changed row
        : [...prev, { id, title, qty: 1 }]                              // new array with an extra item
    );
  }

  const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);    // derived, not stored

  return (
    <div>
      <AddButton label="Mug" onAdd={() => add(1, "Mug")} />
      <AddButton label="Cap" onAdd={() => add(2, "Cap")} />
      <p>Items in cart: {totalQty}</p>
      <ul>
        {cart.map((i) => (
          <li key={i.id}>{i.title} × {i.qty}</li>
        ))}
      </ul>
    </div>
  );
}
```

- `CartDemo` owns `cart`; `AddButton` only receives a label and a callback (data down, events up).
- `setCart(prev => ...)` is the functional form, which is safe when updates happen quickly in succession.
- `map` + spread replaces one item; `[...prev, x]` appends; `filter` removes. None change `prev`.
- `totalQty` is computed every render. There is no second `useState` for it.

Cheat sheet: add `[...arr, x]` · remove `arr.filter(...)` · update `arr.map(...)` · update field `{ ...obj, field: v }`.

**Common beginner mistakes**

| Mistake                          | Symptom                                                                      | Fix                                         |
| -------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------- |
| `cart.push(x); setCart(cart)`    | Click does nothing visible (same reference)                                  | `setCart(prev => [...prev, x])`             |
| `user.name = "A"; setUser(user)` | UI not updating                                                              | `setUser(prev => ({ ...prev, name: "A" }))` |
| Storing `total` in its own state | Total out of date after items change                                         | Compute from `cart` during render           |
| Missing/unstable `key` in lists  | Warning "Each child in a list should have a unique key" or wrong rows update | Use a stable id, not the array index        |

**Try it (4 min).** Add a "Remove" button per cart row using `filter`. Then add a `qty` decrement that removes the row when it reaches 0.

---

### 3.3 Validating forms with zod

**Explanation.** **Validation** checks that data has the right shape and rules before using it. **zod** is a TypeScript-first library where you write a **schema** (a description of valid data) once and get both runtime checking and a static TypeScript type via `z.infer`. `schema.safeParse(data)` returns `{ success: true, data }` or `{ success: false, error }` and never throws.

**Why it matters.** TypeScript types disappear at runtime. A user can type anything into an input, and an API can return anything. zod bridges "what TypeScript believes" and "what really arrived". The same schema can validate the form now and the API response later.

**Mental model.** In vanilla JS you wrote `if (!email.includes("@")) ...` by hand for each rule. A schema is the same checks written declaratively in one place, and the TS type is generated from it so they never drift apart.

**Code example**

```bash
pnpm add zod
```

```ts
// src/lib/schemas.ts
import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type SignupValues = z.infer<typeof signupSchema>; // { name: string; email: string; password: string }
```

```ts
// src/lib/zodErrors.ts
import type { z } from "zod";

/** Turn zod issues into { fieldName: firstMessage } */
export function zodErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!result[key]) result[key] = issue.message; // keep the first message per field
  }
  return result;
}
```

```tsx
// src/components/SignupForm.tsx
import { useState, type ChangeEvent, type FormEvent } from "react";
import { signupSchema, type SignupValues } from "../lib/schemas";
import { zodErrors } from "../lib/zodErrors";

const initialValues: SignupValues = { name: "", email: "", password: "" };

export function SignupForm() {
  const [values, setValues] = useState<SignupValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));        // clear this field's error while typing
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = signupSchema.safeParse(values);          // 1
    if (!result.success) {
      setErrors(zodErrors(result.error));                   // 2
      return;
    }
    console.log("Valid data:", result.data);                // 3: typed as SignupValues
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <input name="name" placeholder="Name" value={values.name} onChange={handleChange} />
      {errors.name && <p role="alert">{errors.name}</p>}
      <input name="email" placeholder="Email" value={values.email} onChange={handleChange} />
      {errors.email && <p role="alert">{errors.email}</p>}
      <input name="password" type="password" placeholder="Password" value={values.password} onChange={handleChange} />
      {errors.password && <p role="alert">{errors.password}</p>}
      <button type="submit">Sign up</button>
    </form>
  );
}
```

1. `safeParse` checks every rule at once and collects all issues.
2. We convert issues to a simple `{ field: message }` object that is easy to render.
3. After the `success` check, TypeScript narrows `result.data` to the validated type.
- `noValidate` turns off the browser's built-in validation bubbles so zod is the single source of truth.
- A rule across fields (for example "passwords match") uses `.refine(fn, { path: ["confirmPassword"], ... })` on the object schema. Lesson B uses this.

> **Version note (zod 4).** Top-level `z.email()` and the `error` option on `.refine` are zod 4 style. In zod 3 it was `z.string().email("msg")` and `{ message: "..." }`. The `zodErrors` helper reads `error.issues`, which works in both versions. Confirm the installed major version with `pnpm list zod`.

**Common beginner mistakes**

| Mistake                                                | Symptom                                  | Fix                                         |
| ------------------------------------------------------ | ---------------------------------------- | ------------------------------------------- |
| Using `.parse()` in a submit handler without try/catch | Unhandled `ZodError` crashes the handler | Use `safeParse`                             |
| Hand-writing the TS type next to the schema            | Type and schema drift apart              | `z.infer<typeof schema>`                    |
| Validating only on the server/never on the client      | Poor UX                                  | Validate on submit (and optionally on blur) |
| Showing errors before the user has typed anything      | Red text on first load                   | Only set errors after submit/blur           |

**Try it (5 min).** Add `confirmPassword` to the schema with a `.refine` that checks it equals `password`, and show the error under the confirm field.

---

### 3.4 Effects and cleanup

**Explanation.** An effect can start something that continues after it runs: a timer, an event listener, a network request, a subscription. The function you **return** from `useEffect` is the **cleanup function**. React runs it before the effect re-runs and when the component unmounts (is removed from the screen).

**Why it matters.** Without cleanup you get leaks (listeners stacking up), stale timers firing after a component is gone, and **race conditions** (an old slow request overwriting a newer result).

**Mental model.** Vanilla JS: whenever you wrote `addEventListener` or `setTimeout`, you owed a matching `removeEventListener`/`clearTimeout`. Cleanup is where React lets you pay that debt automatically each time the effect's inputs change.

**Code example**

```tsx
// src/components/EscapeToClose.tsx
import { useEffect } from "react";

export function EscapeToClose({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);        // setup
    return () => window.removeEventListener("keydown", onKey); // cleanup
  }, [onClose]);

  return <div role="dialog">Press Esc to close</div>;
}
```

Cancelling a request that is no longer wanted:

```tsx
// src/components/ProductTitle.tsx
import { useEffect, useState } from "react";

interface Product { id: number; title: string }

export function ProductTitle({ id }: { id: number }) {
  const [title, setTitle] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();         // 1
    fetch("/products.json", { signal: controller.signal })
      .then((r) => r.json())
      .then((list: Product[]) => setTitle(list.find((p) => p.id === id)?.title ?? "Not found"))
      .catch((err) => {
        if (err.name !== "AbortError") console.error(err); // 2
      });
    return () => controller.abort();                  // 3
  }, [id]);

  return <h2>{title ?? "Loading…"}</h2>;
}
```

1. `AbortController` is the browser's standard way to cancel a `fetch`.
2. Aborting rejects the promise with an `AbortError`; that is expected, not a bug.
3. When `id` changes (or the component unmounts), the previous request is cancelled so it cannot overwrite newer data.

**StrictMode.** In development, `<StrictMode>` (already in `main.tsx`) mounts, unmounts, and re-mounts each component once, so an effect runs **setup → cleanup → setup**. This is intentional: it exposes missing cleanup. It does not happen in production builds.

Notice how much boilerplate even this tiny fetch needs (no error state, no caching). Section 3.7 returns to that.

**Common beginner mistakes**

| Mistake                                              | Symptom                                                                        | Fix                                                        |
| ---------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| "My effect runs twice!"                              | Duplicate logs/requests in dev                                                 | Expected from StrictMode; make the effect safe via cleanup |
| No cleanup for `setInterval`/listeners               | Memory leak; handlers pile up; timers firing forever                           | Return a cleanup function                                  |
| Missing dependency (`[]` but uses `id`)              | Stale data after `id` changes; lint warning from `react-hooks/exhaustive-deps` | List every reactive value used                             |
| Using `async` directly: `useEffect(async () => ...)` | Warning: effect must not return anything besides a function                    | Define and call an inner async function, or use `.then`    |

**Try it (3 min).** Add a `console.log("setup")` and `console.log("cleanup")` to `EscapeToClose`'s effect. Predict the dev console output, then run it.

---

### 3.5 Custom hooks

**Explanation.** A **custom hook** is a function whose name starts with `use` and that calls other hooks. It lets you reuse *stateful logic* (not UI) across components. Each component that calls the hook gets its own separate state.

**Why it matters.** Components stay small and focused, and logic like debouncing, persistence, or media queries gets written and tested once.

**Mental model.** In vanilla JS you extract a helper function like `debounce(fn)`. A custom hook is that idea for logic that needs React state and effects. The "rules of hooks" exist because React tracks hooks by *call order*: call them only at the top level of components or other hooks (never inside `if`, loops, or nested functions).

**Code example**

```ts
// src/hooks/useDebouncedValue.ts
import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);   // each new keystroke cancels the previous timer
  }, [value, delayMs]);

  return debounced;
}
```

```ts
// src/hooks/useLocalStorage.ts
import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {            // lazy initialiser: runs once
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;                                  // corrupt JSON or storage blocked
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or unavailable: ignore */
    }
  }, [key, value]);

  return [value, setValue] as const;                        // tuple, like useState
}
```

```tsx
// src/components/SearchBox.tsx
import { useState } from "react";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useLocalStorage } from "../hooks/useLocalStorage";

export function SearchBox() {
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 400);
  const [theme, setTheme] = useLocalStorage<"light" | "dark">("theme", "light");

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" />
      <p>Typed: {query} | Settled: {debounced}</p>
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>Theme: {theme}</button>
    </div>
  );
}
```

- Generics (`<T>`) make one hook work for any value type with full type safety.
- `as const` makes the return a fixed tuple `[T, Dispatch<...>]` instead of `(T | Dispatch)[]`.
- `useState(() => ...)` (lazy initial state) avoids reading storage on every render.

**Common beginner mistakes**

| Mistake                                        | Symptom                                                      | Fix                                                             |
| ---------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------- |
| Hook name without `use` prefix                 | Lint error: hooks called in a non-hook function              | Rename to `useThing`                                            |
| Calling a hook conditionally                   | Error: "Rendered more hooks than during the previous render" | Call hooks unconditionally at the top; put the condition inside |
| Expecting two components to *share* hook state | Each has independent state                                   | Shared state needs lifting up or Context (next section)         |
| Returning an array without `as const`          | TS error when destructuring                                  | Add `as const` or an explicit tuple type                        |

**Try it (4 min).** Use `useLocalStorage` for the `name` field in `NameForm` so it survives a page refresh.

---

### 3.6 Sharing client state with Context

**Explanation.** **Context** lets a component make a value available to any component below it without passing props through every level (avoiding **prop drilling**). You create a context, wrap part of the tree in a **provider** that supplies the value, and read it with `useContext` in descendants. Use it for state that is genuinely app-wide and changes rarely: the signed-in user, theme, locale.

**Why it matters.** The header needs to know who is signed in, and so do the login page and a protected route. Passing `user` through five layers of components is noisy and fragile.

**Mental model.** Vanilla JS: a module-level variable or a global store that anything can import, except React knows to re-render subscribers when it changes, and the value is scoped to a subtree. Think of a radio broadcast: the provider transmits, any component tuned in via the hook receives.

**Code example** (three small files; this split also keeps Vite's Fast Refresh happy, since files should export either components or non-components)

```ts
// src/types.ts
export interface User {
  email: string;
  name: string;
}
```

```ts
// src/context/auth-context.ts
import { createContext } from "react";
import type { User } from "../types";

export interface AuthContextValue {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null); // null = "no provider above"
```

```tsx
// src/context/AuthProvider.tsx
import type { ReactNode } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { User } from "../types";
import { AuthContext, type AuthContextValue } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useLocalStorage<User | null>("shoplite:user", null);

  const value: AuthContextValue = {
    user,
    login: setUser,
    logout: () => setUser(null),
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}
```

```ts
// src/context/useAuth.ts
import { useContext } from "react";
import { AuthContext } from "./auth-context";

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>"); // fail loudly and clearly
  return ctx;
}
```

```tsx
// src/components/UserBadge.tsx (any descendant)
import { useAuth } from "../context/useAuth";

export function UserBadge() {
  const { user, logout } = useAuth();
  return user ? <button onClick={logout}>Log out {user.name}</button> : <span>Guest</span>;
}
```

- The context default is `null` and `useAuth` throws if it is still `null`. That turns a confusing "cannot read property of null" into a clear message.
- Persisting `user` through `useLocalStorage` reuses the hook from 3.5.
- Every consumer re-renders when `value` changes, so keep context for slow-changing, app-wide data.

> **Version note (React 19).** `<AuthContext value={...}>` works as the provider in React 19. In React 18 you must write `<AuthContext.Provider value={...}>`. React 19 also adds `use(AuthContext)`; this lesson sticks to `useContext`, which works everywhere.

**Common beginner mistakes**

| Mistake                                       | Symptom                                                                                              | Fix                                                                |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Component used outside the provider           | Thrown "useAuth must be used inside <AuthProvider>" (or `undefined`/`null` errors without the guard) | Wrap the app in `main.tsx`                                         |
| Putting *everything* in Context               | Whole app re-renders on each keystroke                                                               | Keep fast-changing form state local; Context for global, slow data |
| Mutating the context value                    | Consumers don't update                                                                               | Update via state setters in the provider                           |
| Exporting component + hook from the same file | Fast Refresh/lint warning (`react-refresh/only-export-components`)                                   | Split files as above                                               |

**Try it (4 min).** Add `<AuthProvider>` in `main.tsx`, render `<UserBadge />`, and call `login({ email: "a@b.com", name: "Ada" })` from a temporary button. Refresh the page: the user should persist.

---

### 3.7 Local state vs server state, and TanStack Query

**Explanation.**

- **Local (client) state**: data your app owns and the browser holds: input text, whether a menu is open, the signed-in user object you keep. It is synchronous and always up to date.
- **Server state**: a *copy* of data that lives elsewhere (a database behind an API). It is asynchronous, can be **stale** (out of date) at any moment, is shared by many users, and can fail.

Server state needs extra work: loading and error states, caching, de-duplicating identical requests, refetching, cancellation. **TanStack Query** (React Query) is a library that manages all of that. You describe *what* to fetch with a **query key** and a **query function**, and it handles the rest.

**Why it matters.** Hand-rolling `useEffect` + `fetch` + `useState` for loading, error, race conditions, and caching is where most beginner apps become fragile. Real projects almost always use a server-state library.

**Mental model.** Vanilla JS: you wrote `fetch(...)`, stuffed the result in a global variable, and maybe cached it by hand. TanStack Query is a smart cache sitting between components and the network, *keyed* by `queryKey`. Two components asking for `["products"]` share one request and one cache entry.

**Code example**

```bash
pnpm add @tanstack/react-query
```

```tsx
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";

const queryClient = new QueryClient();                       // owns the cache

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>               {/* a context provider, like AuthProvider */}
      <App />
    </QueryClientProvider>
  </StrictMode>
);
```

```ts
// src/lib/api.ts
import type { Product } from "../types";

export async function fetchProducts(signal?: AbortSignal): Promise<Product[]> {
  const res = await fetch("/products.json", { signal });     // file in /public simulates an API
  if (!res.ok) throw new Error(`Failed to load products (${res.status})`); // fetch does NOT throw on 404/500
  return res.json();
}
```

```tsx
// src/components/ProductNames.tsx
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "../lib/api";

export function ProductNames() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["products"],                                  // 1: cache identity
    queryFn: ({ signal }) => fetchProducts(signal),          // 2: how to get it (auto-cancel supported)
    staleTime: 60_000,                                       // 3: treat data as fresh for 60 s
  });

  if (isPending) return <p>Loading…</p>;
  if (isError) return <p role="alert">{error.message}</p>;

  return (
    <ul>
      {data.map((p) => (
        <li key={p.id}>{p.title}</li>
      ))}
    </ul>
  );
}
```

1. The **query key** is an array that uniquely identifies the data. Include every variable the query depends on: `["products", id]`.
2. The **query function** must return a promise and must *throw* on failure.
3. **`staleTime`** is how long cached data counts as fresh (default 0, so it refetches on window focus and on new mounts). After that it is shown immediately but refetched in the background.

After the early returns, TypeScript knows `data` is `Product[]`.

A **mutation** is a write (login, create, delete). `useMutation` wraps it and gives `mutate`, `isPending`, `error`:

```tsx
const mutation = useMutation({
  mutationFn: (values: LoginValues) => loginRequest(values.email, values.password),
  onSuccess: (user) => login(user),
});
// mutation.mutate(validValues); mutation.isPending; mutation.error?.message
```

**Local vs server state decision guide**

| Question                | Local state (`useState`/Context)                    | Server state (TanStack Query) |
| ----------------------- | --------------------------------------------------- | ----------------------------- |
| Who owns the truth?     | The browser/app                                     | A server/database             |
| Can it be stale?        | No                                                  | Yes                           |
| Needs loading/error UI? | No                                                  | Yes                           |
| Example                 | Search text, open menu, form values, signed-in user | Product list, product details |

Rule of thumb: **never copy server data into `useState`**. Read it from the query and derive what you need.

> **Version note (TanStack Query v5).** v5 uses `isPending` (v4 used `isLoading` for "no data yet"), `gcTime` (formerly `cacheTime`), and only the object form `useQuery({ queryKey, queryFn })`. The `signal` property is passed in the `queryFn` context. Verify against the current docs for your installed version.

**Common beginner mistakes**

| Mistake                                          | Symptom                                                  | Fix                                   |
| ------------------------------------------------ | -------------------------------------------------------- | ------------------------------------- |
| `queryKey: ["product"]` while fetching by `id`   | Every product page shows the first product's data        | Include variables: `["products", id]` |
| `queryFn` that doesn't throw on bad responses    | `isError` never true; broken data shown                  | Check `res.ok` and throw              |
| Copying `data` into `useState`                   | UI doesn't update after refetch                          | Use `data` directly or derive         |
| Rendering `data.map` before checking `isPending` | `Cannot read properties of undefined (reading 'map')`    | Handle `isPending`/`isError` first    |
| Forgetting `QueryClientProvider`                 | "No QueryClient set, use QueryClientProvider to set one" | Wrap the app (as in `main.tsx`)       |

**Try it (5 min).** Render `ProductNames` in two different components on the same page and open the Network tab. Confirm only one request goes out. Then change `staleTime` to `0` and switch tabs to see a background refetch.

---

## 4. How the sub-sections connect

**Dependency chain** (each step depends on the one before):

1. **3.1 Controlled inputs**: the foundation: *state drives the UI*.
2. **3.2 State ownership + immutability**: how to organise and update that state correctly.
3. **3.3 zod validation**: checks the values held in 3.1/3.2's state before they're used.
4. **3.4 Effects + cleanup**: handles anything that runs *outside* rendering (timers, listeners, requests).
5. **3.5 Custom hooks**: packages 3.1-3.4's patterns for reuse (debounce, persistence).
6. **3.6 Context**: shares client state (built with 3.5's `useLocalStorage`) across the tree.
7. **3.7 Server state + TanStack Query**: replaces the hand-written effect/fetch from 3.4 with a purpose-built tool; also reuses the provider idea from 3.6.

**Hierarchy:** *Client state* branch: 3.1 → 3.2 → 3.3 (forms) and 3.6 (global). *Side-effects* branch: 3.4 → 3.5 (hooks) → 3.7 (server state). The two branches meet in Lesson B, where login forms (client) call a mutation (server).

**Suggested live-teaching flow**

| Time  | Activity                                                                           | Mode                                                |
| ----- | ---------------------------------------------------------------------------------- | --------------------------------------------------- |
| 0-10  | 3.1: live-code `NameForm`; show `value` without `onChange` warning                 | Demo, then *Try it*                                 |
| 10-20 | 3.2: demo mutation bug (`push`) vs fix; build `CartDemo`                           | Demo, then *Try it*                                 |
| 20-35 | 3.3: build schema, then the form, together; show error rendering                   | Live code; learners do *Try it* (`confirmPassword`) |
| 35-45 | 3.4: show StrictMode "setup, cleanup, setup"; demo race with a slow `fetch`        | Demo; learners predict logs                         |
| 45-55 | 3.5: extract the debounce logic into a hook                                        | Live refactor; short *Try it*                       |
| 55-65 | 3.6: build the 3 context files; show the provider error                            | Demo; learners wire `UserBadge`                     |
| 65-80 | 3.7: contrast with 3.4's hand-written fetch; show `ProductNames`; mutation preview | Demo; learners do *Try it*                          |
| 80-90 | Knowledge check                                                                    | Individual, then go over answers                    |

*Diagram hint:* a left-to-right flow of 3.1 to 3.7 with two colored lanes (client state, side-effects/server) merging at the end.

---

## 5. Key terms glossary (order of first appearance)

- **Controlled input**: form element whose value is supplied by React state via `value` + `onChange`.
- **Uncontrolled input**: form element that keeps its own value in the DOM.
- **Lifting state up**: moving state to the closest common parent so multiple components can share it.
- **Derived state**: a value computed from existing state during render, never stored separately.
- **Immutable update**: producing a new object/array instead of changing the existing one.
- **Prop drilling**: passing props through components that don't use them just to reach a deep descendant.
- **Schema (zod)**: a declarative description of valid data that validates at runtime and infers a TS type.
- **`safeParse`**: zod method that returns a success/failure result instead of throwing.
- **`z.infer`**: extracts the TypeScript type from a zod schema.
- **Side effect**: work that reaches outside rendering (network, timers, DOM listeners, storage).
- **Cleanup function**: the function returned from `useEffect`, run before re-running the effect and on unmount.
- **Unmount**: removal of a component from the screen.
- **Race condition**: when results arrive out of order and an old result overwrites a newer one.
- **StrictMode**: a dev-only wrapper that re-runs effects to expose missing cleanup.
- **Custom hook**: a `use`-prefixed function that reuses stateful logic by calling other hooks.
- **Debounce**: wait until input stops changing for a delay before acting on it.
- **Context / Provider**: React's mechanism to supply a value to a whole subtree, and the component that supplies it.
- **Client (local) state**: data the app itself owns, always current.
- **Server state**: a remote copy of data that is async, shared, and can go stale.
- **Stale**: cached data that may no longer match the server.
- **Query key**: array identifying a piece of server data in the cache.
- **Query function**: function that fetches the data for a query key and throws on failure.
- **Mutation**: a write operation to the server (create, update, delete, login).

---

## 6. Knowledge check

Answer without running the code first. (10 min; answers are in the **Instructor answer key** below.)

**Q1 (recall).** In a *controlled* input, where is the source of truth for what's displayed, and which two props are required to make it work?

**Q2 (predict).** What happens when a user types into this input, and what appears in the console?

```tsx
const [email, setEmail] = useState("");
return <input value={email} />;
```

**Q3 (predict the output).** In development with `<StrictMode>`, what does the console show when `Probe` mounts?

```tsx
function Probe() {
  useEffect(() => {
    console.log("setup");
    return () => console.log("cleanup");
  }, []);
  return null;
}
```

**Q4 (spot the bug).** Clicking "Add" doesn't update the list. Why, and how do you fix it?

```tsx
const [items, setItems] = useState<string[]>([]);
function add(x: string) {
  items.push(x);
  setItems(items);
}
```

**Q5 (spot the bug).** On `/products/2` the page keeps showing product 1 after navigating from `/products/1`. Why?

```tsx
const { id } = useParams();
const { data } = useQuery({
  queryKey: ["product"],
  queryFn: () => fetchProduct(Number(id)),
});
```

### Applied mini-exercise: Newsletter signup (15 min)

**Starter**

```tsx
// src/components/NewsletterForm.tsx
export function NewsletterForm() {
  return (
    <form>
      <input name="name" placeholder="Name" />
      <input name="email" placeholder="Email" />
      <button type="submit">Subscribe</button>
    </form>
  );
}
```

**Requirements**

1. Make both inputs controlled using one typed state object.
2. Create `src/lib/newsletterSchema.ts` with a zod schema: `name` (trimmed, at least 2 characters) and `email` (valid email). Export the inferred type.
3. On submit, validate with `safeParse`. If invalid, show the first error message under each failing field.
4. Editing a field clears *that field's* error.
5. On success, show `Thanks, <name>!` and reset the form.

**Acceptance criteria**

- Submitting an empty form shows both errors and shows no success message.
- Typing in "Name" removes only the name error; the email error stays.
- Submitting `Ada` / `ada@example.com` shows `Thanks, Ada!` and empties both inputs.
- No `any` types; no state is mutated; `pnpm build` passes type checking.

---

## 7. Summary recap

1. **State is the source of truth** for controlled inputs; the DOM just displays it.
2. **Own state in the closest common parent**, derive what you can, and always update **immutably**.
3. **zod schemas** validate at runtime and give you the TypeScript type for free; use `safeParse` and render per-field errors.
4. **Effects that start something must clean up**: listeners, timers, and requests (StrictMode will remind you).
5. **Custom hooks** reuse stateful logic; **Context** shares slow-changing client state like the signed-in user.
6. **Server state is not local state**: use **TanStack Query** (keys, `isPending`/`isError`, `staleTime`) instead of hand-written fetch effects.

## 8. Next lesson bridge

You now have every building block: typed forms, validation, safe effects, reusable hooks, shared context, and a cache for server data. In **Lesson B** (right after the break) you'll wire these together into *ShopLite*: login and registration forms, an auth context, a debounced product search, and product list and detail pages powered by TanStack Query. After that, you'll be ready to look at performance, testing, and framework-level data loading.

---

# Instructor answer key

**Q1.** The **React state** variable is the source of truth. The two props are `value` and `onChange`.

**Q2.** The input appears frozen: React re-renders it with `email` (still `""`) after each keystroke, so typed characters don't show. The console shows a warning that a `value` prop was provided without an `onChange` handler (the field is read-only). Fix: add `onChange={(e) => setEmail(e.target.value)}`.

**Q3.** In dev with StrictMode: `setup`, `cleanup`, `setup`. In production: just `setup`.

**Q4.** `push` mutates the existing array, and `setItems(items)` passes the *same reference*, so React sees no change and skips the re-render. Fix: `setItems((prev) => [...prev, x]);`

**Q5.** The `queryKey` doesn't include `id`, so both products share one cache entry (`["product"]`) and the cached product 1 is served for product 2. Fix: `queryKey: ["products", id]` (or `["product", id]`).

**Mini-exercise: model solution**

```ts
// src/lib/newsletterSchema.ts
import { z } from "zod";

export const newsletterSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.email("Enter a valid email address"),
});

export type NewsletterValues = z.infer<typeof newsletterSchema>;
```

```tsx
// src/components/NewsletterForm.tsx
import { useState, type ChangeEvent, type FormEvent } from "react";
import { newsletterSchema, type NewsletterValues } from "../lib/newsletterSchema";
import { zodErrors } from "../lib/zodErrors";

const initialValues: NewsletterValues = { name: "", email: "" };

export function NewsletterForm() {
  const [values, setValues] = useState<NewsletterValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [thanksName, setThanksName] = useState<string | null>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // clears only this field's error
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setThanksName(null);
    const result = newsletterSchema.safeParse(values);
    if (!result.success) {
      setErrors(zodErrors(result.error));
      return;
    }
    setErrors({});
    setThanksName(result.data.name);   // trimmed name from the parsed data
    setValues(initialValues);          // reset
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <input name="name" placeholder="Name" value={values.name} onChange={handleChange} />
      {errors.name && <p role="alert">{errors.name}</p>}
      <input name="email" placeholder="Email" value={values.email} onChange={handleChange} />
      {errors.email && <p role="alert">{errors.email}</p>}
      <button type="submit">Subscribe</button>
      {thanksName && <p>Thanks, {thanksName}!</p>}
    </form>
  );
}
```

**Common marking notes:** accept `useState` per field if the learner meets all acceptance criteria, but nudge toward the single typed object. Watch for `setErrors({})` placed *before* validation (it would hide still-invalid fields), and for string-trimming done by hand instead of via the schema.