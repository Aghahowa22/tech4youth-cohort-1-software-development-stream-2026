# React Components and Interface Design

---

## 1. Learning Objectives

By the end of this lesson, learners will be able to:

1. **Explain** why React uses a component-based, declarative model instead of direct DOM manipulation, and describe the trade-off in their own words.
2. **Build** functional components in `.tsx` files that return JSX, including correctly typed props using TypeScript interfaces.
3. **Compose** multiple components into a UI tree, including passing the `children` prop to build reusable wrapper components.
4. **Debug** the most common JSX and props errors a beginner hits (missing keys, untyped props, invalid JSX structure) by reading the TypeScript/React error message and fixing it.
5. **Refactor** a single monolithic chunk of markup into a small set of well-named, single-responsibility components.

---

## 2. Prerequisite Check

Before this lesson, learners must already be comfortable with:

- **ES6+ JavaScript**: arrow functions, destructuring, array methods (`map`, `filter`), object spread, ES modules (`import`/`export`), `async/await`.
- **DOM manipulation basics**: `document.querySelector`, `element.textContent`, `addEventListener` — not because we'll use these in React, but because we'll contrast React's approach against them.
- **Basic TypeScript**: primitive types, `interface` and `type`, optional properties (`?`), and a rough sense of generics (e.g., `Array<string>` or `useState<number>` even if they've never used `useState`).
- **HTML/CSS fundamentals**: semantic tags, class attributes, basic layout.

**Where this fits:** This is lesson 1 of the React path. It establishes component thinking, JSX, and props — the vocabulary every later lesson (state, events, effects, forms, routing) depends on. Nothing here depends on anything else; everything after depends on this.

---

## 3. Section Breakdown

### 3.1 From the DOM to Components

**Explanation**
In vanilla JavaScript, you build a UI by **imperatively** telling the browser what to do, step by step: find an element, change its text, append a child, toggle a class. React flips this around. You **declare** what the UI should look like for a given set of data, and React figures out how to make the actual DOM match that description. This is called a **declarative** approach, as opposed to the **imperative** approach you already know.

A **component** is the basic building block of a React UI: a JavaScript (here, TypeScript) function that returns a description of what should appear on screen. React calls this description **JSX**, covered in 3.3.

**Why it matters**
Real UIs are not static — they re-render constantly as data changes (a cart updates, a form is typed into, a list is filtered). Keeping imperative DOM updates in sync by hand becomes unmanageable past a small page. Components let you describe "what the UI looks like for this data" once, and let React handle the updating. Nearly every production front-end you'll touch professionally is organized this way, whether in React, Vue, or Svelte.

**Mental model**
In vanilla JS, you're a contractor renovating a house one nail at a time: find the wall, remove the old picture, hang the new one. In React, you're an architect handing over a blueprint: "here's what the living room should look like given these inputs," and a builder (React) works out the actual nail-by-nail changes. You stop thinking "how do I change the DOM" and start thinking "what does the UI look like right now, given my data."

Concretely:

```ts
// Vanilla JS: imperative — you perform the steps
const heading = document.querySelector("#greeting");
heading!.textContent = `Hello, ${userName}`;
```

```tsx
// React: declarative — you describe the result
function Greeting({ userName }: { userName: string }) {
  return <h1>Hello, {userName}</h1>;
}
```

The vanilla version says *how* to change the heading. The React version says *what* the heading should be — React takes care of the "how."

**Common beginner mistakes**
- **Mistake:** Trying to manually update the DOM inside a React component (e.g., calling `document.querySelector` inside a component to change text).
  **Symptom:** The change happens once, then gets silently overwritten the next time React re-renders, or React logs a warning about DOM nodes it doesn't recognize.
  **Fix:** Stop reaching for the DOM. Express the change as something the component *returns* based on its inputs — you'll have the tools for this (props, then state) by the end of the next lesson.
- **Mistake:** Assuming React re-runs your whole program top to bottom like a script.
  **Symptom:** Confusion about "when does this function run again?"
  **Fix:** Understand that a component function re-runs (re-renders) only when its inputs (props, or later, state) change — not on a timer, not constantly.

**Try it (2 minutes)**
Without writing any code, write one sentence describing a UI element from an app you use daily (e.g., a "like" button) the *imperative* way ("when clicked, find the icon and change its color") and the same element the *declarative* way ("the icon is red when liked is true, otherwise gray").

---

### 3.2 Project Setup with Vite and TypeScript

**Explanation**
**Vite** (pronounced "veet") is a build tool: it runs a local development server with instant updates and bundles your code for production. We scaffold a new project with the `react-ts` template, which pre-configures React, TypeScript, and sensible defaults.

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
npm run dev
```

> **Version note:** Command syntax and default folder contents can change between Vite major versions. Confirm the exact flags and generated file structure against the Vite docs for the version installed when teaching this live, as `npm create vite@latest` always pulls the current version.

The generated structure you'll care about today:

```
my-app/
├── index.html
├── src/
│   ├── main.tsx       # entry point: mounts <App /> into the DOM
│   ├── App.tsx         # the root component
│   └── components/     # you will create this folder for your own components
├── package.json
└── tsconfig.json
```

`src/main.tsx` is the one place where React actually touches the real DOM — everything else is components describing UI to React.

```tsx
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- `createRoot(...)` is the one spot where React attaches to a real DOM node (`#root`, defined in `index.html`).
- `<StrictMode>` is a development-only helper that highlights potential problems; it renders nothing itself. (Don't dwell on this — it's not today's topic.)
- `<App />` is JSX syntax for "render the `App` component here." JSX is explained next.

**Why it matters**
Nearly every professional React codebase learners will join is scaffolded by a build tool like Vite (or similar). Knowing where the real DOM mount point is, versus where component code lives, prevents a very common confusion: "where does React actually touch the page?"

**Mental model**
`index.html` and `main.tsx` are the stage and the one spot where the curtain opens into the real world. Everything inside `App.tsx` and beyond is the play itself — components describing what should appear, without ever touching the stage directly.

**Common beginner mistakes**
- **Mistake:** Editing `index.html` directly to add content.
  **Symptom:** Changes don't reflect app state and get overwritten by confusion later; content added this way is outside React's control entirely.
  **Fix:** All visible content goes inside components (`App.tsx` and below), not `index.html`.
- **Mistake:** Not having the dev server running, then wondering why changes don't appear in the browser.
  **Symptom:** Browser shows stale content or a blank page.
  **Fix:** Confirm `npm run dev` is running and watch the terminal for compile errors.

**Try it (3 minutes)**
Scaffold the project with the command above, run `npm run dev`, open the printed local URL, and change the text inside the `<h1>` in `App.tsx`. Confirm the browser updates without a manual refresh (this live-reload behavior is called **Hot Module Replacement**, or **HMR**).

---

### 3.3 JSX Syntax Rules

**Explanation**
**JSX** (JavaScript XML) is a syntax extension that lets you write HTML-like markup directly inside TypeScript/JavaScript. It is not a string and not HTML — it's syntax that gets compiled into regular function calls that build up a description of UI. You don't need to know the compiled output to use it, but you do need to know its rules, because they differ from HTML in a few specific ways.

Key rules:

1. **One root element.** A component must return a single element (or use a `<>...</>` **Fragment**, a wrapper that renders nothing extra, to group siblings without adding a real DOM node).
2. **Every tag must close.** `<img />` and `<br />`, not `<img>` or `<br>`.
3. **`className`, not `class`.** `class` is a reserved word in JavaScript, so JSX uses `className`.
4. **Curly braces `{}` embed JavaScript expressions.** Anything inside `{}` is evaluated as a JS/TS expression, not a statement — so `{if (x) {...}}` is invalid, but `{x ? "yes" : "no"}` is fine.
5. **Attributes use camelCase.** `onclick` becomes `onClick`, `tabindex` becomes `tabIndex`.

```tsx
// src/App.tsx
function App() {
  const projectName = "Dashboard";
  const isBeta = true;

  return (
    <>
      <h1 className="title">{projectName}</h1>
      {isBeta && <span className="badge">Beta</span>}
    </>
  );
}

export default App;
```

Line-by-line:
- `<>...</>` — a Fragment; we have two sibling elements (`h1` and the conditional `span`) and JSX requires one root, so we group them without adding an extra wrapper `<div>`.
- `{projectName}` — embeds the string variable directly into the markup.
- `{isBeta && <span>...}` — a common JSX pattern: `&&` short-circuits, so the `<span>` only renders when `isBeta` is `true`. If `isBeta` were `false`, nothing renders (not even the text "false" — covered in the mistakes below).

**Why it matters**
JSX is what you'll read and write in every single React file, in every React codebase. Getting its rules into muscle memory now (closing tags, `className`, one root) removes an entire category of early error messages so learners can focus on logic, not syntax, in later lessons.

**Mental model**
Think of JSX as HTML with JavaScript's rules, not the browser's rules — because it's not actually interpreted by the browser as HTML at all; it's compiled into JavaScript. When in doubt, ask "would this be valid inside a JavaScript expression?" rather than "would this be valid HTML?"

**Common beginner mistakes**
- **Mistake:** Returning two sibling elements without a wrapper.
  **Error message:** `JSX element 'App' has no corresponding closing tag` or `Adjacent JSX elements must be wrapped in an enclosing tag`.
  **Fix:** Wrap siblings in `<>...</>` or a `<div>`.
- **Mistake:** Writing `class="title"` out of HTML habit.
  **Symptom:** TypeScript/React warns `Invalid DOM property 'class'. Did you mean 'className'?`, and styling doesn't apply (React quietly doesn't apply the invalid attribute as CSS).
  **Fix:** Use `className`.
- **Mistake:** Rendering `{count && <Badge />}` when `count` is `0`.
  **Symptom:** The literal number `0` appears on the page instead of nothing, because `0` is falsy but still a renderable value in JSX.
  **Fix:** Use an explicit boolean: `{count > 0 && <Badge />}`.

**Try it (3 minutes)**
Take this broken snippet and fix the three JSX errors in it:

```tsx
function Card() {
  return (
    <div class="card">
    <h2>Title</h2>
    <p>Body</p>
  );
}
```

(Missing closing `</div>`, `class` should be `className`, and — bonus if they catch it — indentation doesn't affect correctness, so that's a red herring, not a bug.)

---

### 3.4 Your First Component

**Explanation**
A React **component** (using function components, the only kind used in modern React) is just a TypeScript function that:
- starts with a **capital letter** (this is how React tells components apart from regular HTML tags like `div`),
- returns JSX,
- is exported so other files can use it.

```tsx
// src/components/Greeting.tsx
function Greeting() {
  return <h1>Hello there!</h1>;
}

export default Greeting;
```

To use it elsewhere:

```tsx
// src/App.tsx
import Greeting from "./components/Greeting";

function App() {
  return <Greeting />;
}

export default App;
```

`<Greeting />` is JSX syntax for "run the `Greeting` function and put its returned JSX here." This is exactly analogous to calling `Greeting()` — React just gives you tag-shaped syntax for it.

**Why it matters**
Every piece of UI you'll ever build in React — a button, a navbar, an entire page — is this same shape: a function that returns JSX. There is no special "component" keyword or class to learn; it's ordinary TypeScript functions following one naming convention (capitalized) and one contract (return JSX).

**Mental model**
Compare to a function you already know: `function formatCurrency(amount: number): string`. A component is the same idea — `function Greeting(): JSX.Element` — just returning markup instead of a formatted string. If learners can write a TypeScript function, they can write a component.

**Common beginner mistakes**
- **Mistake:** Naming a component with a lowercase first letter, e.g. `function greeting()`.
  **Symptom:** `<greeting />` is treated as an unknown HTML tag, not a component — it either renders literally as `<greeting>` in the DOM or TypeScript flags it as not recognized.
  **Fix:** Capitalize component names: `Greeting`, not `greeting`.
- **Mistake:** Forgetting to `export` the component, or forgetting to `import` it where it's used.
  **Error message:** `Cannot find name 'Greeting'` or an import error pointing at the file path.
  **Fix:** Check both ends: `export default Greeting;` in the source file, `import Greeting from "./components/Greeting";` where it's used.
- **Mistake:** Calling the component like a regular function, `Greeting()`, instead of using JSX, `<Greeting />`.
  **Symptom:** It may appear to work for very simple cases but breaks React's internal tracking (especially once hooks are introduced next lesson), producing confusing bugs later.
  **Fix:** Always render components with JSX tag syntax, never by calling the function directly.

**Try it (3 minutes)**
Create `src/components/Welcome.tsx` with a component that returns a `<p>` with your name in it, then render `<Welcome />` inside `App.tsx`.

---

### 3.5 Props and TypeScript Typing

**Explanation**
**Props** ("properties") are how a parent component passes data into a child component — the React equivalent of function arguments. Unlike regular function arguments, props always arrive as a single object, and you **type that object** with a TypeScript `interface` (or `type`).

```tsx
// src/components/Greeting.tsx
interface GreetingProps {
  userName: string;
  isOnline?: boolean; // optional — "?" means this prop may be omitted
}

function Greeting({ userName, isOnline = false }: GreetingProps) {
  return (
    <p>
      Hello, {userName}! {isOnline ? "🟢 Online" : "⚪ Offline"}
    </p>
  );
}

export default Greeting;
```

```tsx
// src/App.tsx
import Greeting from "./components/Greeting";

function App() {
  return (
    <>
      <Greeting userName="Amara" isOnline={true} />
      <Greeting userName="Tunde" />
    </>
  );
}

export default App;
```

Line-by-line on `Greeting`:
- `interface GreetingProps` — defines the shape of the single object this component accepts, exactly like typing any other function parameter.
- `{ userName, isOnline = false }: GreetingProps` — this is TypeScript's destructuring syntax, pulling `userName` and `isOnline` out of the props object directly in the parameter list, with a default value for `isOnline` if it's not passed.
- `isOnline?: boolean` — the `?` makes it optional; this is exactly the same optional-property syntax learners already know from typing other interfaces.
- `userName="Amara"` — in JSX, string props can be passed with plain quotes; any non-string value (`true`, a number, an object, a variable) must be wrapped in `{}`, e.g. `isOnline={true}`.

**Why it matters**
Props are how data flows through a React application — from a parent down to however many children need it. Typing them is what lets TypeScript catch an entire class of bugs (wrong prop name, wrong type, missing required prop) at compile time, before the app even runs, instead of as a runtime surprise.

**Mental model**
Props are function parameters with extra syntax. If learners already write `function formatPrice(amount: number, currency: string): string`, then:

```tsx
function PriceTag({ amount, currency }: { amount: number; currency: string }) {
  return <span>{currency}{amount}</span>;
}
```

...is the same function, just returning JSX and receiving its arguments as one destructured object instead of separate parameters. The "one object" part is a React/JSX convention, not a TypeScript requirement — it's what lets you write `<PriceTag amount={10} currency="$" />` with named, order-independent attributes, similar to how HTML attributes work.

**Common beginner mistakes**
- **Mistake:** Treating props as separate function arguments instead of one destructured object.
  **Symptom:** `function Greeting(userName: string)` instead of `function Greeting({ userName }: GreetingProps)`.
  **Error message:** TypeScript errors on the call site, or `userName` ends up being the entire props *object*, not the string, producing `[object Object]` in the rendered output.
  **Fix:** Always destructure a single typed props object.
- **Mistake:** Trying to pass a non-string value without curly braces, e.g. `isOnline="true"`.
  **Symptom:** TypeScript error (`Type 'string' is not assignable to type 'boolean'`), because `"true"` the string is not `true` the boolean.
  **Fix:** Wrap non-string values in `{}`: `isOnline={true}`.
- **Mistake:** Mutating a prop inside the child component, e.g. `userName = userName.toUpperCase()` as an assignment.
  **Symptom:** A console warning, or unpredictable behavior, because props are meant to be **read-only** from the child's perspective — they flow one direction, parent to child.
  **Fix:** Derive a new value instead of reassigning: `const displayName = userName.toUpperCase();`.

**Try it (5 minutes)**
Build a `ProductCard` component that accepts typed props `name: string`, `price: number`, and an optional `onSale?: boolean`, and renders them. Render two `<ProductCard />` instances in `App.tsx` with different values, one omitting `onSale`.

---

### 3.6 Composing Components: Building a UI Tree

**Explanation**
**Composition** means building complex UIs by nesting smaller components inside larger ones — the same way you'd nest HTML elements, but now each nested piece can be its own typed, reusable component. A special prop, **`children`**, lets a component render whatever was placed between its opening and closing tags, without that component needing to know in advance what it will contain.

```tsx
// src/components/Card.tsx
import type { ReactNode } from "react";

interface CardProps {
  title: string;
  children: ReactNode; // "anything React can render": text, elements, more components
}

function Card({ title, children }: CardProps) {
  return (
    <section className="card">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export default Card;
```

```tsx
// src/App.tsx
import Card from "./components/Card";
import Greeting from "./components/Greeting";

function App() {
  return (
    <Card title="Welcome panel">
      <Greeting userName="Amara" />
      <p>Glad you're here.</p>
    </Card>
  );
}

export default App;
```

Line-by-line:
- `children: ReactNode` — `ReactNode` is React's built-in type meaning "anything that's valid to render": a string, a number, JSX, an array of JSX, or `null`. It's the type you reach for whenever a prop's whole job is "render whatever is passed in."
- `{children}` — inserts whatever was nested between `<Card>` and `</Card>` at the call site.
- In `App.tsx`, `<Greeting userName="Amara" />` and `<p>Glad you're here.</p>` become the value of `Card`'s `children` prop — `Card` never needed to know it would contain a `Greeting` and a paragraph.

**Why it matters**
This is how real interfaces get built: not as one giant component with a mountain of markup, but as a **tree** of focused components — a `Page` containing a `Header`, a `Sidebar`, and a `Card`, each of which may contain more components. `children` is specifically what makes generic wrapper components (modals, cards, layout containers) possible, because the wrapper doesn't need to hard-code what goes inside it.

**Mental model**
Compare to nested HTML you already know:

```html
<section class="card">
  <h2>Welcome panel</h2>
  <p>Glad you're here.</p>
</section>
```

`children` is React's version of "whatever's between the opening and closing tag" — except now the outer tag is a custom, reusable, typed component instead of a fixed HTML element.

**Common beginner mistakes**
- **Mistake:** Forgetting to render `{children}` inside the wrapper component.
  **Symptom:** Everything nested inside `<Card>...</Card>` silently disappears from the page — no error, just missing content.
  **Fix:** Make sure the component explicitly places `{children}` somewhere in its returned JSX.
- **Mistake:** Typing `children` as `string` or forgetting to type it at all.
  **Error message:** TypeScript complains when anything other than plain text (like a nested component) is passed as children.
  **Fix:** Type it as `ReactNode`, imported with `import type { ReactNode } from "react";`.
- **Mistake:** Over-nesting too early — building one 200-line component instead of splitting it.
  **Symptom:** Hard to read, hard to reuse, hard to test any one piece in isolation.
  **Fix:** This is exactly what section 3.7 addresses next.

**Try it (5 minutes)**
Build a `Panel` component that accepts a `title: string` and `children: ReactNode`, rendering the title in an `<h3>` followed by the children. Nest two different child elements inside two separate `<Panel>` usages in `App.tsx`.

---

### 3.7 Designing Good Component Interfaces

**Explanation**
Now that learners can build and nest components, the design question becomes: **where do you draw the lines between components?** A few concrete principles:

- **Single responsibility.** Each component should describe one coherent piece of UI. If you're struggling to name a component without using "and," it's probably two components (`UserAvatarAndName` → split into `UserAvatar` and `UserName`).
- **Props are a component's public interface.** Exactly like a well-designed TypeScript function signature, a component's props should be the *minimum* data it needs, clearly typed, with sensible optional values — not "pass the entire app's data down and let the component pick what it needs."
- **Favor composition over configuration.** Instead of one `Card` component with ten boolean props (`showHeader`, `showFooter`, `showIcon`...), prefer a `Card` that accepts `children`, and compose the variations by nesting different content — as shown in 3.6.
- **Lift repeated markup into a component as soon as you copy-paste it twice.** This mirrors the "don't repeat yourself" instinct learners already have from functions in plain TypeScript.

```tsx
// Before: one large, hard-to-reuse block directly in App.tsx
function App() {
  return (
    <div>
      <div className="card">
        <h2>Order #1024</h2>
        <p>Status: Shipped</p>
      </div>
      <div className="card">
        <h2>Order #1025</h2>
        <p>Status: Processing</p>
      </div>
    </div>
  );
}
```

```tsx
// After: pulled into a reusable, typed component
// src/components/OrderCard.tsx
interface OrderCardProps {
  orderNumber: number;
  status: string;
}

function OrderCard({ orderNumber, status }: OrderCardProps) {
  return (
    <div className="card">
      <h2>Order #{orderNumber}</h2>
      <p>Status: {status}</p>
    </div>
  );
}

export default OrderCard;
```

```tsx
// src/App.tsx
import OrderCard from "./components/OrderCard";

function App() {
  return (
    <div>
      <OrderCard orderNumber={1024} status="Shipped" />
      <OrderCard orderNumber={1025} status="Processing" />
    </div>
  );
}

export default App;
```

> **Forward reference:** Right now, `OrderCard` is given a fixed, hand-written list of orders. In a real app this list would usually come from an array of data, rendered with `.map()` — and each rendered item would need a special `key` prop. That pattern (rendering lists with `.map()` and `key`) is covered in the next lesson, alongside state.

**Why it matters**
This is the actual day-to-day skill of a React developer: not just knowing JSX syntax, but deciding how to decompose a design into a maintainable component tree. Poorly scoped components (too large, too many unrelated props) are the single biggest source of "this codebase is hard to work in" complaints on real teams.

**Mental model**
This is the same discipline learners already apply when they decide whether a chunk of logic belongs in its own TypeScript function versus staying inline — "does this do one clear thing, and would I want to reuse or test it on its own?" Components are functions; the same design instincts apply.

**Common beginner mistakes**
- **Mistake:** Passing far more props than a component actually uses, "just in case."
  **Symptom:** The component's interface balloons, and it becomes unclear what it actually depends on.
  **Fix:** Only accept the props the component actually reads. If it needs more later, add them then.
- **Mistake:** Splitting too early or too finely, creating a `TitleText` component that's just an `<h2>{title}</h2>` used in exactly one place.
  **Symptom:** More files to navigate with no real reuse or clarity benefit.
  **Fix:** Split when there's duplication, a clear independent responsibility, or a reuse need — not by default.
- **Mistake:** Hard-coding data (like the two orders above) directly into JSX instead of treating it as data that should be passed in as props.
  **Symptom:** Adding a third order means editing the component's code instead of just adding data.
  **Fix:** Keep the component generic (`OrderCard` taking props) and keep the specific data at the call site — setting up naturally for the next lesson's `.map()` pattern.

**Try it (5 minutes)**
Take the two hard-coded `ProductCard` usages from section 3.5's exercise and decide: should `ProductCard` take any additional props to avoid duplication, or is it already well-scoped? Write one sentence justifying the answer.

---

## 4. How the Sub-Sections Connect

**Sequence and dependencies** (strictly linear — each section needs the one before it):

```
3.1 From DOM to Components  (mental model only, no code dependency)
        │
        ▼
3.2 Project Setup            (gives learners a place to write code)
        │
        ▼
3.3 JSX Syntax Rules          (the language every component is written in)
        │
        ▼
3.4 Your First Component      (JSX + the function/export/import contract)
        │
        ▼
3.5 Props and TS Typing       (depends on 3.4 — can't type props without a component)
        │
        ▼
3.6 Composition & children    (depends on 3.5 — children is just a special typed prop)
        │
        ▼
3.7 Designing Good Interfaces (depends on everything above — it's a design
                                discussion applied to the tools just learned)
```

There is no branching or optional ordering here — this is a straight line, which matches a 90-minute single-pass session. Nothing in a later section can be taught before the one above it.

**Suggested live-teaching flow:**

| Time | Section | Mode |
|---|---|---|
| 0:00–0:10 | 3.1 From DOM to Components | Discuss/demo only — no coding yet. Show the vanilla JS vs. JSX comparison side by side. |
| 0:10–0:20 | 3.2 Project Setup | Live scaffold together; everyone runs `npm create vite@latest`. Learners code along. |
| 0:20–0:35 | 3.3 JSX Syntax Rules | Demo the rules one at a time in `App.tsx`; learners fix the broken `Card` snippet themselves. |
| 0:35–0:50 | 3.4 Your First Component | Demo creating `Greeting.tsx` from scratch; learners build `Welcome.tsx` solo. |
| 0:50–1:10 | 3.5 Props and TS Typing | Demo `Greeting` with typed props; learners build `ProductCard` solo (biggest exercise — budget the most time here). |
| 1:10–1:25 | 3.6 Composition & children | Demo `Card` + `children`; learners build `Panel` solo. |
| 1:25–1:35 | 3.7 Designing Good Interfaces | Discussion-led, using the `OrderCard` before/after as the worked example; short group critique of the `ProductCard` exercise. |
| 1:35–1:30(wrap) | Knowledge check | Run the recall/predict/spot-the-bug questions live as a quick poll or paired discussion. |

(Timing totals to 90 minutes including a short buffer; trim discussion time in 3.1 or 3.7 first if running long, since those are the least code-dependent.)

---

## 5. Key Terms Glossary

*(in order of first appearance)*

- **Declarative**: describing what the UI should look like for given data, and letting a tool (React) handle how to achieve it.
- **Imperative**: directly issuing step-by-step instructions to change something (e.g., manual DOM updates).
- **Component**: a function that returns a description of UI (JSX); the basic building block of a React app.
- **JSX**: a syntax extension that lets you write HTML-like markup inside TypeScript/JavaScript files.
- **Vite**: a front-end build tool that runs a dev server and bundles code for production.
- **HMR (Hot Module Replacement)**: the dev server feature that updates the running app in the browser without a full page reload.
- **Fragment (`<>...</>`)**: a JSX wrapper that groups sibling elements without adding an extra DOM node.
- **`className`**: the JSX equivalent of HTML's `class` attribute.
- **Props**: the data a parent component passes into a child component, received as a single typed object.
- **Optional property (`?`)**: a TypeScript syntax marking a prop as not required, usually paired with a default value.
- **`children`**: a special prop containing whatever was nested between a component's opening and closing tags.
- **`ReactNode`**: the TypeScript type meaning "anything React can render."
- **Composition**: building complex UIs by nesting smaller, focused components inside larger ones.
- **Single responsibility**: the design principle that each component should represent one coherent, nameable piece of UI.

---

## 6. Knowledge Check

### Part A: Recall, predict-the-output, spot-the-bug

**Q1 (Recall).** What are the two required characteristics of a valid React function component? (Hint: one is about naming, one is about what it returns.)

**Q2 (Predict the output).** Given:
```tsx
function Badge({ label, urgent }: { label: string; urgent?: boolean }) {
  return <span>{urgent && label}</span>;
}

// Rendered as:
<Badge label="New" />
```
What appears on the page? Why?

**Q3 (Spot the bug).**
```tsx
interface AvatarProps {
  name: string;
}

function avatar({ name }: AvatarProps) {
  return <img alt={name} />;
}
```
What's wrong, and what will happen when someone tries to render `<avatar name="Amara" />`?

**Q4 (Predict the output).**
```tsx
function Price({ amount }: { amount: number }) {
  return <p>${amount}</p>;
}

<Price amount="20" />
```
What happens here, and at what point does the problem get caught?

**Q5 (Spot the bug).**
```tsx
function Wrapper({ children }: { children: ReactNode }) {
  return <div className="wrapper"></div>;
}
```
Why will content nested inside `<Wrapper>...</Wrapper>` never appear?

### Part B: Applied mini-exercise

**Starter code:**
```tsx
// src/components/ProfileCard.tsx
// TODO: implement this component

// src/App.tsx
function App() {
  return (
    <div>
      {/* TODO: render two ProfileCard instances here */}
    </div>
  );
}

export default App;
```

**Requirements:**
1. Create `src/components/ProfileCard.tsx` exporting a `ProfileCard` component.
2. It must accept typed props: `name: string`, `role: string`, and an optional `isLead?: boolean` (default `false`).
3. It must render the `name` and `role`, and render the text "Team Lead" only when `isLead` is `true`.
4. It must accept `children` (`ReactNode`) and render them below the role, for arbitrary extra content (e.g., a short bio).
5. Render two `<ProfileCard>` instances in `App.tsx`: one with `isLead` true and a nested `<p>` bio, one without.

**Acceptance criteria:**
- No TypeScript errors.
- Both cards render in the browser with correct, distinct content.
- "Team Lead" appears for exactly one of the two cards.
- Nested children content appears inside the card that includes it.

---

## 7. Summary Recap

- React uses a **declarative, component-based** model: you describe what the UI should look like for given data, instead of issuing step-by-step DOM instructions.
- Every component is a **capitalized TypeScript function that returns JSX** — no new syntax category to learn, just a naming and return-type convention layered on functions you already know how to write.
- **JSX has its own rules** (one root element, `className`, self-closing tags, `{}` for embedded expressions) that differ from raw HTML and are worth memorizing early.
- **Props are typed, read-only function parameters** passed as a single object — TypeScript interfaces catch missing or mistyped props before the app even runs.
- **`children`** is what makes generic, reusable wrapper components possible, by letting a parent decide what content a component renders without the component needing to hard-code it.
- Good component design follows the same instincts as good function design: **single responsibility, minimal typed interface, and splitting only when there's real duplication or a clear independent concern.**

---

## 8. Next Lesson Bridge

This lesson deliberately stopped short of making anything interactive — every component so far renders fixed or passed-in data and never changes on its own. The next lesson introduces **state** (`useState`) and **events** (`onClick`, `onChange`, and friends), which is what lets a component's own JSX change over time in response to user interaction, not just in response to new props from a parent. It will also introduce rendering lists of data with `.map()` and the `key` prop — directly building on the `OrderCard` and `ProfileCard` components built in this lesson's exercises, which were deliberately left using hard-coded, repeated JSX instead of a data array.

---

## Instructor Answer Key

**Q1.** A valid function component must (1) start with a **capital letter** so React/JSX can distinguish it from a built-in HTML tag, and (2) **return JSX** (or `null`).

**Q2.** Nothing visible appears — `urgent` is `undefined` (not passed, and no default given), so `urgent && label` short-circuits to `undefined`, and React renders nothing for `undefined`. (This is different from the earlier `0 && ...` trap in section 3.3, which *does* render — worth drawing that contrast.)

**Q3.** The component is named `avatar` with a lowercase first letter. JSX will treat `<avatar />` as an unknown built-in HTML tag, not as a reference to the component — so instead of the custom component rendering, it's either ignored, rendered as a literal unrecognized tag, or (depending on tooling) flagged as a type error because `avatar` was never imported/recognized as a component in that context. The fix is renaming the function (and its export/import) to `Avatar`.

**Q4.** `amount="20"` passes the **string** `"20"`, but `amount` is typed as `number`. TypeScript catches this **at compile time** (in the editor and when building), before the code ever runs in the browser — it will not silently coerce the string to a number. The fix is `amount={20}`.

**Q5.** The component accepts `children` as a prop but never actually renders `{children}` anywhere inside its returned JSX — it returns an empty `<div>`. Any content nested between `<Wrapper>` and `</Wrapper>` is received by the component but simply never placed into the output. The fix is adding `{children}` inside the `<div>`.

**Model solution for Part B:**

```tsx
// src/components/ProfileCard.tsx
import type { ReactNode } from "react";

interface ProfileCardProps {
  name: string;
  role: string;
  isLead?: boolean;
  children?: ReactNode;
}

function ProfileCard({ name, role, isLead = false, children }: ProfileCardProps) {
  return (
    <div className="profile-card">
      <h2>{name}</h2>
      <p>{role}</p>
      {isLead && <p className="badge">Team Lead</p>}
      {children}
    </div>
  );
}

export default ProfileCard;
```

```tsx
// src/App.tsx
import ProfileCard from "./components/ProfileCard";

function App() {
  return (
    <div>
      <ProfileCard name="Amara Chukwu" role="Frontend Engineer" isLead>
        <p>Joined the team in 2023, focuses on design systems.</p>
      </ProfileCard>
      <ProfileCard name="Tunde Bello" role="Backend Engineer" />
    </div>
  );
}

export default App;
```

Note `isLead` with no value in JSX (`isLead` alone, not `isLead={true}`) — this is JSX shorthand meaning "pass `true`," valid specifically for boolean props.
