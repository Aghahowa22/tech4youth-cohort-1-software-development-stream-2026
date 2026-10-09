# Lesson B (Project): Build *ShopLite* with Forms, zod, Context, and TanStack Query

> **Prerequisite:** Lesson A (`lesson-a-forms-state-concepts.md`). Every file needed for the project is given in full here, so this lesson can be followed on its own; the explanations behind the hooks, Context, and zod live in Lesson A. **Time:** about 135 minutes, taught live in "I do → we do → you do" cycles.

## 1. What we're building

**ShopLite** is a small shop with:

- **Login** and **Registration** pages: controlled forms validated with zod, submitted through a TanStack Query mutation.
- A **home page** with a header menu, hero section, and a **product list** with debounced search.
- A **product details page** (`/products/:id`).
- Signed-in state in **Context**, persisted with `useLocalStorage`.
- Products read from a local JSON file through TanStack Query (the file stands in for a real API).

**Learning objectives (project-level).** By the end, learners will be able to: build validated login/registration forms; refactor shared logic into custom hooks; share auth state through Context; and fetch, cache, and display server data with loading/error states.

## 2. Starter project (assumed contents)

You will prepare the starter yourself; this lesson assumes it contains the following. Adjust if yours differs.

```bash
pnpm create vite@latest shoplite --template react-ts
cd shoplite
pnpm install
pnpm add react-router zod @tanstack/react-query
pnpm add tailwindcss @tailwindcss/vite
pnpm dev
```

- Vite `react-ts` scaffold, default demo code removed (`App.tsx` renders an empty `<div />`).
- Tailwind wired in: `tailwindcss()` in `vite.config.ts` plugins, and `@import "tailwindcss";` as the first line of `src/index.css`.
- `public/products.json` (shape below) and a placeholder `src/types.ts`.
- Empty folders: `src/components`, `src/pages`, `src/hooks`, `src/context`, `src/lib`.

> **Version note.** Tailwind v4 uses the `@tailwindcss/vite` plugin and a single CSS import (no `tailwind.config.js` by default); v3 setup differs. React Router v7 imports from `"react-router"` (v6 used `"react-router-dom"`). `create vite` prompts may vary slightly by Vite version. Verify all three before the session.

### Why pnpm? (2-minute explanation for learners)

- **pnpm** is a package manager, an alternative to npm with the same commands (`pnpm add`, `pnpm install`, `pnpm dev`).
- It keeps **one global content-addressable store** and links packages into each project, so the same package version is stored once on disk, and installs are usually faster.
- Its `node_modules` is **strict**: a project can only import packages it declared in `package.json`, which prevents "it works because another package happened to install it" bugs.
- Switching is low-risk: `package.json` is the same, and the lockfile is `pnpm-lock.yaml` (commit it).

### Data and types

```json
// public/products.json
[
  { "id": 1, "title": "Ceramic Mug", "price": 14.5, "category": "Kitchen", "image": "https://picsum.photos/seed/mug/400/300", "description": "A sturdy 350 ml mug that survives the dishwasher." },
  { "id": 2, "title": "Canvas Cap", "price": 19, "category": "Apparel", "image": "https://picsum.photos/seed/cap/400/300", "description": "Adjustable cap with a stitched logo." },
  { "id": 3, "title": "Desk Lamp", "price": 42.99, "category": "Home", "image": "https://picsum.photos/seed/lamp/400/300", "description": "Warm LED lamp with a dimmer." }
]
```

```ts
// src/types.ts
export interface Product {
  id: number;
  title: string;
  price: number;
  category: string;
  image: string;
  description: string;
}

export interface User {
  email: string;
  name: string;
}
```

### Target file map

```
src/
  main.tsx                 providers
  App.tsx                  routes + layout
  types.ts
  lib/        api.ts  schemas.ts  zodErrors.ts
  hooks/      useDebouncedValue.ts  useLocalStorage.ts  useProducts.ts
  context/    auth-context.ts  AuthProvider.tsx  useAuth.ts
  components/ Header.tsx  Hero.tsx  ProductCard.tsx  ProductList.tsx  FormField.tsx
  pages/      HomePage.tsx  ProductPage.tsx  LoginPage.tsx  RegisterPage.tsx
```

---

## 3. Build steps

Each step ends with a **checkpoint**: learners should not continue until it passes.

### Step 1: Providers and routing (10 min)

**Concept link:** Lesson A 3.5/3.6/3.7 (hooks and providers). First create the shared support files below (full code, no need to look back at Lesson A), then the providers and routes.

```ts
// src/hooks/useLocalStorage.ts
import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue; // corrupt JSON or storage blocked
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or unavailable: ignore */
    }
  }, [key, value]);

  return [value, setValue] as const;
}
```

```ts
// src/hooks/useDebouncedValue.ts
import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id); // each new keystroke cancels the previous timer
  }, [value, delayMs]);

  return debounced;
}
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

> **Version note.** `<AuthContext value={value}>` is the React 19 provider syntax. On React 18 use `<AuthContext.Provider value={value}>`.

Now the providers and routes:

```tsx
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { AuthProvider } from "./context/AuthProvider";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
```

```tsx
// src/App.tsx
import { Route, Routes } from "react-router";
import { Header } from "./components/Header";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { ProductPage } from "./pages/ProductPage";
import { RegisterPage } from "./pages/RegisterPage";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products/:id" element={<ProductPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
    </div>
  );
}
```

Provider order matters only in that anything calling `useAuth` or `useQuery` must be *inside* its provider. `AuthProvider` doesn't need the router, but pages that use both do.

**Checkpoint:** the app compiles once the pages/components exist (create temporary stubs such as `export const HomePage = () => <p>Home</p>;` if needed to keep moving).

---

### Step 2: Header and Hero (10 min)

```tsx
// src/components/Header.tsx
import { Link, NavLink } from "react-router";
import { useAuth } from "../context/useAuth";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold">ShopLite</Link>
        <div className="flex items-center gap-4 text-sm">
          <NavLink to="/" className="hover:underline">Home</NavLink>
          {user ? (
            <>
              <span>Hi, {user.name}</span>
              <button onClick={logout} className="rounded bg-slate-900 px-3 py-1 text-white">Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">Log in</Link>
              <Link to="/register" className="rounded bg-indigo-600 px-3 py-1 text-white">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
```

```tsx
// src/components/Hero.tsx
export function Hero() {
  return (
    <section className="rounded-xl bg-indigo-600 px-8 py-12 text-white">
      <h1 className="text-3xl font-bold">Everyday things, simply made.</h1>
      <p className="mt-2 max-w-xl text-indigo-100">Browse our small collection of mugs, caps, and lamps.</p>
    </section>
  );
}
```

- `Header` is a *consumer* of auth state: the ternary renders different UI from the same state (the "describe UI from state" idea).
- `NavLink` vs `Link`: `NavLink` knows if it's the active route (for styling).

**Checkpoint:** header shows "Log in" and "Register" links.

---

### Step 3: Server state: products list (25 min)

**Concept link:** Lesson A 3.7.

```ts
// src/lib/api.ts
import type { Product, User } from "../types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchProducts(signal?: AbortSignal): Promise<Product[]> {
  const res = await fetch("/products.json", { signal });
  if (!res.ok) throw new Error(`Failed to load products (${res.status})`);
  return res.json();
}

export async function fetchProduct(id: number, signal?: AbortSignal): Promise<Product> {
  const products = await fetchProducts(signal);
  const product = products.find((p) => p.id === id);
  if (!product) throw new Error("Product not found");
  return product;
}

// Fake auth endpoints: pretend these call a server.
export async function loginRequest(email: string, password: string): Promise<User> {
  await delay(600);
  if (password !== "password123") throw new Error("Invalid email or password");
  return { email, name: email.split("@")[0] };
}

export async function registerRequest(values: { name: string; email: string }): Promise<User> {
  await delay(600);
  return { email: values.email, name: values.name };
}
```

```ts
// src/hooks/useProducts.ts
import { useQuery } from "@tanstack/react-query";
import { fetchProduct, fetchProducts } from "../lib/api";

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: ({ signal }) => fetchProducts(signal),
    staleTime: 60_000,
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: ["products", id],          // id is part of the key
    queryFn: ({ signal }) => fetchProduct(id, signal),
    enabled: Number.isFinite(id),        // skip if the URL param isn't a number
  });
}
```

```tsx
// src/components/ProductCard.tsx
import { Link } from "react-router";
import type { Product } from "../types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="block rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <img src={product.image} alt={product.title} className="h-40 w-full rounded object-cover" />
      <h3 className="mt-3 font-semibold">{product.title}</h3>
      <p className="text-sm text-slate-500">{product.category}</p>
      <p className="mt-1 font-medium">${product.price.toFixed(2)}</p>
    </Link>
  );
}
```

```tsx
// src/components/ProductList.tsx
import { useProducts } from "../hooks/useProducts";
import { ProductCard } from "./ProductCard";

export function ProductList() {
  const { data, isPending, isError, error } = useProducts();

  if (isPending) return <p>Loading products…</p>;
  if (isError) return <p role="alert" className="text-red-600">{error.message}</p>;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
```

```tsx
// src/pages/HomePage.tsx
import { Hero } from "../components/Hero";
import { ProductList } from "../components/ProductList";

export function HomePage() {
  return (
    <div className="space-y-8">
      <Hero />
      <section>
        <h2 className="mb-4 text-xl font-semibold">Products</h2>
        <ProductList />
      </section>
    </div>
  );
}
```

**Live demo moments:** (1) in DevTools, set Network to *Slow 4G* to see the loading text; (2) temporarily rename the JSON file to see the error branch (this works because `api.ts` checks `res.ok`).

**Checkpoint:** three product cards render; navigating away and back doesn't show "Loading" again within 60 seconds (cache).

---

### Step 4: Debounced search (10 min)

**Concept link:** Lesson A 3.1, 3.4, 3.5. `useDebouncedValue` was created in Step 1; now use it by updating `ProductList`:

```tsx
// src/components/ProductList.tsx (updated)
import { useState } from "react";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useProducts } from "../hooks/useProducts";
import { ProductCard } from "./ProductCard";

export function ProductList() {
  const [search, setSearch] = useState("");                       // local state
  const debouncedSearch = useDebouncedValue(search, 300);
  const { data, isPending, isError, error } = useProducts();      // server state

  const searchBox = (
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search products…"
      className="mb-4 w-full rounded border px-3 py-2"
    />
  );

  if (isPending) return <>{searchBox}<p>Loading products…</p></>;
  if (isError) return <p role="alert" className="text-red-600">{error.message}</p>;

  const term = debouncedSearch.trim().toLowerCase();
  const visible = data.filter((p) => p.title.toLowerCase().includes(term)); // derived, not stored

  return (
    <>
      {searchBox}
      {visible.length === 0 ? (
        <p className="text-slate-500">No products match “{debouncedSearch}”.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </>
  );
}
```

- Two kinds of state side by side: `search` (local, owned by this component) and `data` (server, owned by the query cache).
- `visible` is **derived**: no `useState`, no `useEffect`.
- Hooks are all called before the early returns (rules of hooks).

**Checkpoint:** typing "mug" filters after a short pause. Clearing the box restores all products.

---

### Step 5: Product details page (15 min)

```tsx
// src/pages/ProductPage.tsx
import { Link, useParams } from "react-router";
import { useProduct } from "../hooks/useProducts";

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isPending, isError, error } = useProduct(Number(id));

  if (isPending) return <p>Loading…</p>;
  if (isError) {
    return (
      <div>
        <p role="alert" className="text-red-600">{error.message}</p>
        <Link to="/" className="text-indigo-600 underline">Back to products</Link>
      </div>
    );
  }

  return (
    <article className="grid gap-8 md:grid-cols-2">
      <img src={product.image} alt={product.title} className="w-full rounded-lg object-cover" />
      <div>
        <Link to="/" className="text-sm text-indigo-600 underline">← Back</Link>
        <h1 className="mt-2 text-3xl font-bold">{product.title}</h1>
        <p className="text-slate-500">{product.category}</p>
        <p className="mt-4 text-2xl font-semibold">${product.price.toFixed(2)}</p>
        <p className="mt-4">{product.description}</p>
      </div>
    </article>
  );
}
```

**Teaching points:** URL params are always strings, so `Number(id)`. The `queryKey` `["products", id]` means each product has its own cache entry. Visit `/products/999` to see the error branch.

> **Caution on `enabled`.** If `id` isn't numeric, the query is disabled and stays `isPending` forever in v5 (no data, never fetched). For production code you'd handle that case explicitly; for this lesson, mention it and move on.

**Checkpoint:** clicking a card opens details; the browser Back button returns to the list.

---

### Step 6: Login form (30 min)

**Concept link:** Lesson A 3.1-3.3, 3.6, 3.7 (mutation).

```ts
// src/lib/schemas.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z.email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"],              // attach the error to this field
  });
export type RegisterValues = z.infer<typeof registerSchema>;
```

> **Version note.** zod 4 syntax shown (`z.email()`, `error`). For zod 3, use `z.string().email("…")` and `message:` in `.refine`.

A reusable field component (introduce it by first copy-pasting label/input/error three times, then extracting; this shows *why* we make components):

```tsx
// src/components/FormField.tsx
import type { InputHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
}

export function FormField({ id, label, error, ...inputProps }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium">{label}</label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full rounded border px-3 py-2 ${error ? "border-red-500" : "border-slate-300"}`}
        {...inputProps}
      />
      {error && <p id={`${id}-error`} role="alert" className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
```

```tsx
// src/pages/LoginPage.tsx
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import { FormField } from "../components/FormField";
import { useAuth } from "../context/useAuth";
import { loginRequest } from "../lib/api";
import { loginSchema, type LoginValues } from "../lib/schemas";
import { zodErrors } from "../lib/zodErrors";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState<LoginValues>({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: (v: LoginValues) => loginRequest(v.email, v.password),
    onSuccess: (user) => {
      login(user);          // update Context (and localStorage)
      navigate("/");        // go home
    },
  });

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = loginSchema.safeParse(values);
    if (!result.success) {
      setErrors(zodErrors(result.error));
      return;
    }
    setErrors({});
    mutation.mutate(result.data);
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-4 text-2xl font-bold">Log in</h1>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField id="email" name="email" type="email" label="Email" autoComplete="email"
          value={values.email} onChange={handleChange} error={errors.email} />
        <FormField id="password" name="password" type="password" label="Password" autoComplete="current-password"
          value={values.password} onChange={handleChange} error={errors.password} />
        {mutation.isError && <p role="alert" className="text-sm text-red-600">{mutation.error.message}</p>}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded bg-indigo-600 py-2 text-white disabled:opacity-60"
        >
          {mutation.isPending ? "Signing in…" : "Log in"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        No account? <Link to="/register" className="text-indigo-600 underline">Register</Link>
      </p>
      <p className="mt-2 text-xs text-slate-500">Demo: any valid email with password “password123”.</p>
    </div>
  );
}
```

**Flow to narrate:** type → state (controlled) → submit → zod (client validation) → mutation (server call, `isPending`) → `onSuccess` → Context + `navigate`. Errors come from two places: **validation errors** (field-level, from zod) and **request errors** (form-level, from the mutation).

**Checkpoint:** (a) empty submit shows two field errors; (b) wrong password shows "Invalid email or password"; (c) `ada@example.com` / `password123` signs in, redirects home, header shows "Hi, ada"; (d) refreshing the page keeps you signed in; (e) "Log out" works.

---

### Step 7: Registration form (15 min, mostly "you do")

Learners build `RegisterPage.tsx` themselves from the login page, using `registerSchema`. Differences: four fields, a cross-field rule, and `registerRequest`.

```tsx
// src/pages/RegisterPage.tsx
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import { FormField } from "../components/FormField";
import { useAuth } from "../context/useAuth";
import { registerRequest } from "../lib/api";
import { registerSchema, type RegisterValues } from "../lib/schemas";
import { zodErrors } from "../lib/zodErrors";

const initialValues: RegisterValues = { name: "", email: "", password: "", confirmPassword: "" };

export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState<RegisterValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: registerRequest,
    onSuccess: (user) => {
      login(user);
      navigate("/");
    },
  });

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = registerSchema.safeParse(values);
    if (!result.success) {
      setErrors(zodErrors(result.error));
      return;
    }
    setErrors({});
    mutation.mutate({ name: result.data.name, email: result.data.email }); // never send confirmPassword
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-4 text-2xl font-bold">Create an account</h1>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField id="name" name="name" label="Name" autoComplete="name"
          value={values.name} onChange={handleChange} error={errors.name} />
        <FormField id="email" name="email" type="email" label="Email" autoComplete="email"
          value={values.email} onChange={handleChange} error={errors.email} />
        <FormField id="password" name="password" type="password" label="Password" autoComplete="new-password"
          value={values.password} onChange={handleChange} error={errors.password} />
        <FormField id="confirmPassword" name="confirmPassword" type="password" label="Confirm password" autoComplete="new-password"
          value={values.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />
        {mutation.isError && <p role="alert" className="text-sm text-red-600">{mutation.error.message}</p>}
        <button type="submit" disabled={mutation.isPending}
          className="w-full rounded bg-indigo-600 py-2 text-white disabled:opacity-60">
          {mutation.isPending ? "Creating…" : "Register"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        Already registered? <Link to="/login" className="text-indigo-600 underline">Log in</Link>
      </p>
    </div>
  );
}
```

> **Note.** `registerSchema` has a `.refine`, which means it's a refined object schema; `safeParse` works the same. A refinement only runs if all the base field checks pass, so the "Passwords do not match" message may appear only after other errors are fixed. This is normal zod behavior; mention it if learners ask.

**Checkpoint:** mismatched passwords show the error under *Confirm password*; a valid form signs the user in.

---

### Step 8: Wrap-up and refactor discussion (5-10 min)

Run `pnpm build` and `pnpm lint`; fix any type errors together. Then discuss:

- Which pieces are **local state**? (form values, errors, search text)
- Which are **global client state**? (`user` in Context)
- Which are **server state**? (products via queries; login/register via mutations)
- Where did **cleanup** happen? (`useDebouncedValue` timer; TanStack Query's `signal`)

## 4. Timeline

| Step | Topic                        | Minutes              |
| ---- | ---------------------------- | -------------------- |
| 1    | Providers + routing          | 10                   |
| 2    | Header + Hero                | 10                   |
| 3    | Products with TanStack Query | 25                   |
| 4    | Debounced search             | 10                   |
| 5    | Product details              | 15                   |
| 6    | Login form                   | 30                   |
| 7    | Registration form            | 15                   |
| 8    | Build, review, discussion    | 10                   |
|      | **Total**                    | **125** (+10 buffer) |

## 5. Troubleshooting table

| Symptom                                             | Likely cause                                  | Fix                                                                          |
| --------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------- |
| `useAuth must be used inside <AuthProvider>`        | Provider missing or order wrong in `main.tsx` | Wrap `<App />` as shown in Step 1                                            |
| `No QueryClient set…`                               | Missing `QueryClientProvider`                 | Add it in `main.tsx`                                                         |
| Products 404                                        | JSON is in `src/` instead of `public/`        | Move to `public/products.json`                                               |
| Tailwind classes do nothing                         | Plugin or CSS import missing                  | Check `vite.config.ts` and the first line of `index.css`; restart dev server |
| Every product page shows product 1                  | `queryKey` lacks `id`                         | Use `["products", id]`                                                       |
| Typing in the form re-renders slowly or loses focus | Component defined inside another component    | Define components at module top level                                        |
| Fast Refresh warning in `AuthProvider` file         | Exporting hook and component together         | Keep the three-file split from Lesson A                                      |

## 6. Summary recap

1. **Local state** (forms, search text) lives in components; **global client state** (user) lives in Context; **server state** (products) lives in the TanStack Query cache.
2. **Forms** are controlled, validated with a zod schema, and errors are shown per field; request errors come from the mutation.
3. **Custom hooks** (`useDebouncedValue`, `useLocalStorage`, `useProducts`) keep components small and logic reusable.
4. **Query keys include their variables** (`["products", id]`).
5. **Derive, don't duplicate**: the filtered list is computed on render.

## 7. Stretch goals (homework)

- Redirect signed-in users away from `/login` and `/register` with `<Navigate>`.
- Add a protected `/account` route that redirects guests to `/login`.
- Add a category filter and persist the search text in the URL (`useSearchParams`).
- Pre-fill the product details query from the list cache using `initialData` or `queryClient.getQueryData`.
- Replace `products.json` with a real API (for example, a mock server) without changing any component, only `api.ts`.

## 8. Next lesson bridge

ShopLite now has a clean separation between UI, client state, and server state, which is the foundation for real-world apps. Next you can add a cart (Context + reducer), optimistic updates with mutations, testing (Vitest and Testing Library), and performance tools such as memoization and code splitting.