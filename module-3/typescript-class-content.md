# TypeScript Foundations: Types, Functions, Generics, and Project Tooling


## Part A: The Language

### 1. What TypeScript Is (and Is Not)
TypeScript is JavaScript plus a static type system that is checked at compile time, then erased before the code runs.
It also clears up the myths that types exist at runtime or that TypeScript validates outside data.

### 2. Basic Types, Annotations, and Type Inference
Covers primitives, arrays, tuples, and the `: type` annotation, plus how the compiler infers types so you don't always write them.
It also contrasts `any` (turns checking off) with `unknown` (forces a check before use).

### 3. Object Types, Type Aliases, and Interfaces
Shows how to describe an object's shape and give it a name with `type` or `interface`.
It also introduces structural typing and how to choose between the two.

### 4. Union Types and Literal Types
A union (`|`) means "one of several types," and a literal type allows exactly one value.
Combined, they model fixed sets like `"GET" | "POST" | "PUT"`.

### 5. Narrowing
Shows how to turn "maybe A or B" into "definitely A" using `typeof`, `in`, `instanceof`, and equality checks.
It also covers discriminated unions, `never` for exhaustiveness, and why to avoid `as` and `!`.

### 6. Typed Functions
Covers annotating parameters and return types, plus optional, default, and rest parameters.
Treats a function signature as a contract between the function and its callers.

### 7. Introductory Generics
A type parameter like `<T>` acts as a variable for a type, so a function's output type can depend on its input type without resorting to `any`.
Also covers generic interfaces and constraints with `extends`.

---

## Part B: The Project

### 8. Strict Checking and `tsconfig.json`
Explains how `tsconfig.json` configures the compiler and what `strict` turns on, especially `strictNullChecks` and `noImplicitAny`.
Learners also practice reading and fixing common compiler errors.

### 9. Modules
Covers splitting code into ES modules with named and default exports, re-exports, and type-only imports.
It also explains the `.js` extension rule that applies under `nodenext`.

### 10. Linting and Formatting
Separates three tools that beginners blur together: the type checker (`tsc`), the linter (ESLint with typescript-eslint), and the formatter (Prettier).
Learners wire them into npm scripts and format-on-save.

### 11. Dependency Lockfiles
Explains how version ranges in `package.json` can drift over time, and how a committed `package-lock.json` pins every exact version.
`npm ci` then reproduces an identical install on any machine or CI server.

---

## Also in the Lesson

- **Starter project:** a scaffold that wires every Part B idea together and gives Part A code somewhere to live.
- **Knowledge check:** five short questions covering compile time vs. runtime, narrowing, generics, strict checking, and lockfiles.
- **Orders module exercise:** a hands-on build using literal unions, a discriminated union, a generic `findById`, and a type-only import.

---

## Note Before Class: TypeScript Version

The lesson's instructor note says to pin TypeScript to `~6.0`, because TypeScript 7.x does not yet work with typescript-eslint. Your current `package.json` has `"typescript": "^7.0.2"`.

This only matters once you reach Section 10 (linting). If you plan to teach it, run:

```bash
npm install -D typescript@~6.0
```

The note was written on September 30, 2026 and says to re-verify before class, so check the current status first.


**Type of document:** Content and reference pass (no slides or visual layouts yet)
**Assumed before starting:** Modern JavaScript (`let`/`const`, arrow functions, destructuring, `async`/`await`, template strings), a current Node.js LTS installed, and VS Code (or another editor with TypeScript support)

> **Instructor note on versions (checked September 30, 2026; re-verify before class, this moves fast).**
> TypeScript 6.0 (March 2026) changed several defaults, including making `strict` **on by default**. TypeScript 7.0 (July 2026, a rewrite of the compiler in Go) is also out, but it ships without a stable programmatic API until 7.1, and **typescript-eslint does not support it yet**. To keep linting working, the project setup in this guide pins TypeScript to `~6.0`. Everything in Sections 1 to 7 (the language itself) is identical in 6.x and 7.x. Only the tooling in Sections 8 to 11 is affected.

---

## Learning Objectives

By the end of this class, you will be able to:

1. **Annotate** variables, objects, and functions with TypeScript types, and **explain** when the compiler infers a type for them instead.
2. **Model** real-world data using type aliases, interfaces, union types, and literal types, and **choose** between `interface` and `type` for a given situation.
3. **Narrow** a union type safely (using `typeof`, `in`, `instanceof`, equality checks, and discriminated unions) and **write** a simple generic function or interface with a constraint.
4. **Configure** a `tsconfig.json` with strict checking, **read and fix** common compiler errors, and **organize** code into ES modules with type-only imports.
5. **Set up** a project with ESLint, Prettier, and a committed dependency lockfile, run type-check, lint, and format from npm scripts, and **reproduce** an identical install on another machine with `npm ci`.

---

## Section Breakdown

The content has two parts.

- **Part A, the language (Sections 1 to 7):** what you write inside `.ts` files.
- **Part B, the project (Sections 8 to 11):** the configuration and tooling that surround those files and keep a real project healthy.

---

### Part A: The Language

---

### Section 1: What TypeScript Is (and Is Not)

#### Explanation

**TypeScript** is JavaScript plus a **static type system**. "Static" means the checking happens by reading your source code *before* it runs, rather than while it runs. A **type** is a label that describes what kind of value something holds (a string, a number, an object with specific properties, and so on).

You write `.ts` files containing JavaScript plus type **annotations** (the `: string` parts). The TypeScript compiler (`tsc`) then does two jobs:

1. **Checks** your code and reports mistakes.
2. **Erases** the types and outputs plain JavaScript that runs in Node.js or the browser.

```
  .ts file  ──►  tsc checks types  ──►  .js file  ──►  runs in Node / browser
 (with types)    (compile time)        (no types)        (runtime)
```

Two vocabulary words you will use all class:

- **Compile time:** when TypeScript is analyzing your code (in your editor, or when you run `tsc`). Types exist here.
- **Runtime:** when the JavaScript is actually running. Types do **not** exist here.

TypeScript also uses **structural typing**: two types are compatible if they have the same *shape*, regardless of what they are called. If an object has the properties a type asks for, it fits. (This comes up again in Section 3.)

#### Why it matters in real-world practice

- Bugs like `undefined is not a function`, misspelled property names, and swapped function arguments are caught **while typing**, not after deployment.
- Your editor gains accurate autocomplete, inline documentation, and safe rename/refactor across a whole codebase.
- Types act as documentation that cannot go out of date, because the compiler enforces it. This matters most on teams and in code you revisit months later.

#### Example and analogy

```js
// JavaScript: runs, and misbehaves quietly
function total(price, qty) {
  return price * qty;
}
total("10", 3); // 30  (the string is silently coerced)
total(10);      // NaN (qty is undefined)
```

```ts
// TypeScript: the same mistakes are caught before running
function total(price: number, qty: number): number {
  return price * qty;
}
total("10", 3); // Error: Argument of type 'string' is not assignable to parameter of type 'number'.
total(10);      // Error: Expected 2 arguments, but got 1.
```

**Analogy:** TypeScript is a building inspector who reviews the blueprints before construction begins. The inspector catches a door that opens into a wall, then leaves. The finished building (your JavaScript) has no inspector inside it.

#### Common beginner mistakes and misconceptions

- **"Types exist at runtime."** They do not. You cannot write `if (x instanceof User)` when `User` is an interface, because the interface is gone after compilation.
- **"TypeScript validates data coming from outside."** It does not. `JSON.parse`, API responses, and form input are only *claimed* to have a type. Whatever you annotate is a promise you make to the compiler, not a check on the real data.
- **"TypeScript changes how JavaScript behaves."** It does not. `"10" * 3` still equals `30` in JavaScript. TypeScript only *warns* you about it.
- **"Compiler errors are noise I can silence."** Errors are the feature. The habit of reaching for `any` or `as` to make red lines disappear defeats the purpose.

---

### Section 2: Basic Types, Annotations, and Type Inference

#### Explanation

A **type annotation** is the `: type` you add after a variable or parameter name.

```ts
let username: string = "ada";
let age: number = 36;
let isAdmin: boolean = false;
```

The core **primitive types** mirror JavaScript's primitives:

| Type | Example values | Notes |
|---|---|---|
| `string` | `"hi"`, `` `hi ${name}` `` | |
| `number` | `42`, `3.14`, `NaN` | One type for integers and decimals |
| `boolean` | `true`, `false` | |
| `bigint` | `10n` | Rarely needed at first |
| `null`, `undefined` | `null`, `undefined` | Each is its own type |

Other types you meet immediately:

```ts
const scores: number[] = [90, 85, 77];        // array of numbers (also written Array<number>)
const pair: [string, number] = ["age", 36];   // tuple: fixed length, fixed type per position
```

**Type inference** means TypeScript works out a type from the value, so you do not have to write it:

```ts
let count = 0;        // inferred as number
count = "five";       // Error: Type 'string' is not assignable to type 'number'

const city = "Lagos"; // inferred as the literal type "Lagos" (a const can never change)
```

Notice the difference: `let` is inferred as the general type (`string`), while `const` is inferred as the exact value (`"Lagos"`). This idea powers literal types in Section 4.

**`any` vs `unknown`:** both mean "could be anything", but they behave oppositely.

```ts
let a: any = "hello";
a.foo.bar();            // No error. `any` switches the type checker OFF for this value.

let u: unknown = "hello";
u.toUpperCase();        // Error: 'u' is of type 'unknown'.
if (typeof u === "string") {
  u.toUpperCase();      // OK. You proved it is a string first (this is "narrowing", Section 5).
}
```

Use `unknown` when you truly do not know the type. It forces you to check before you use the value. `any` spreads silently and quietly disables checking wherever it touches.

**Rule of thumb for annotating:** annotate **function parameters** (TypeScript cannot guess them), annotate **exported function return types** for clarity, and let inference handle ordinary local variables.

#### Why it matters in real-world practice

Knowing when to annotate and when to trust inference is what separates readable TypeScript from cluttered TypeScript. Over-annotating is noisy. Under-annotating at boundaries (function parameters, exports, data from outside) lets mistakes slip in.

#### Example and analogy

**Analogy:** Annotations are labels on storage boxes. Inference is the compiler peeking inside the box and labeling it for you. You only write the label yourself when the box is empty or when others need to know what belongs in it.

```ts
const prices = [9.99, 4.5, 12];          // inferred: number[]
prices.push("free");                     // Error: 'string' is not assignable to 'number'

const user = { name: "Ada", age: 36 };   // inferred: { name: string; age: number }
user.email;                              // Error: Property 'email' does not exist
```

#### Common beginner mistakes and misconceptions

- Writing `String`, `Number`, or `Boolean` (capitalized) instead of `string`, `number`, `boolean`. The capitalized ones are JavaScript wrapper objects and are almost never what you want.
- Annotating everything, e.g. `const x: number = 5`, which adds noise with no benefit.
- Using `any` "just for now". It usually stays forever and hides bugs.
- Declaring `let x;` with no type or value. The compiler cannot know what belongs there.
- Expecting separate `int` and `float` types. TypeScript has only `number`.
- Confusing an **array** (`number[]`, any length) with a **tuple** (`[string, number]`, fixed shape).

---

### Section 3: Object Types, Type Aliases, and Interfaces

#### Explanation

Most real data is an object. You describe an object's **shape** (its property names and the type of each) in one of two ways.

**Inline object type:**

```ts
function printUser(user: { name: string; age: number }) {
  console.log(`${user.name} is ${user.age}`);
}
```

Repeating that shape everywhere gets tiresome, so you give it a name.

**Type alias** (keyword `type`):

```ts
type User = {
  name: string;
  age: number;
};
```

**Interface** (keyword `interface`):

```ts
interface User {
  name: string;
  age: number;
}
```

Both describe the same thing and are used the same way: `function printUser(user: User) { ... }`.

**Useful property modifiers:**

```ts
interface Product {
  readonly id: number;   // readonly: cannot be reassigned after creation
  title: string;
  description?: string;  // optional: may be missing; its type is string | undefined
}
```

**Extending** shapes to build on another:

```ts
interface Person { name: string }
interface Employee extends Person { employeeId: number }   // interface: use `extends`

type Animal = { species: string };
type Pet = Animal & { name: string };                      // type alias: use `&` (intersection)
```

**Interface vs. type alias**: how to choose (as a beginner):

| | `interface` | `type` |
|---|---|---|
| Describe an object shape | Yes | Yes |
| Extend another shape | `extends` | `&` |
| Describe a union (`A \| B`), a primitive alias, or a tuple | No | **Yes** |
| Can be reopened and added to elsewhere (declaration merging) | Yes | No |

A simple, widely used convention: use **`interface` for object shapes** (especially ones other code may extend or implement), and **`type` for everything else** (unions, tuples, aliases of primitives). The most important rule is to **pick a convention and be consistent** within a project.

**Structural typing in action:** compatibility is decided by shape.

```ts
interface Point { x: number; y: number }

const p = { x: 1, y: 2, label: "origin" };
const a: Point = p;                               // OK: has x and y (extra properties are fine here)
const b: Point = { x: 1, y: 2, label: "origin" }; // Error: object literal may only specify known properties
```

The second line errors because of the **excess property check**: when you write an object literal directly where a type is expected, TypeScript assumes an unknown property is probably a typo.

#### Why it matters in real-world practice

Interfaces and type aliases are how you model your domain: users, orders, API responses, component props, config objects. A well-named type is often the best documentation in a codebase, and it gives every function that touches the data consistent autocomplete and checking.

#### Example and analogy

**Analogy:** An interface is a **job description**. It lists what anyone filling the role must have (`name`, `age`). It does not care who they are or what else they can do (structural typing). Anyone who meets the listed requirements fits the role.

```ts
interface Article {
  readonly id: number;
  title: string;
  author: { name: string; email?: string };
  tags: string[];
}

const post: Article = {
  id: 1,
  title: "Hello TypeScript",
  author: { name: "Ada" },
  tags: ["intro"],
};

post.id = 2; // Error: Cannot assign to 'id' because it is a read-only property.
```

#### Common beginner mistakes and misconceptions

- **Expecting runtime enforcement.** An interface does nothing once compiled. Data from an API can still violate it.
- **Treating `description?: string` as "required but maybe undefined".** The property can be *absent entirely*. You still must handle the `undefined` case before using it.
- **Using `Object`, `{}`, or `object` as a type.** They are far looser than you expect. Describe the actual shape, or use `Record<string, unknown>` for "an object with unknown keys".
- **Worrying about `;` vs `,` between properties.** Both are allowed; let the formatter (Section 10) decide.
- **Thinking `readonly` makes data frozen at runtime.** It is a compile-time promise only.

---

### Section 4: Union Types and Literal Types

#### Explanation

A **union type** says "this value is one of several types", written with `|` (read it as "or").

```ts
let id: string | number;
id = "abc-123"; // OK
id = 42;        // OK
id = true;      // Error: 'boolean' is not assignable to 'string | number'
```

A **literal type** is a type that allows exactly one specific value.

```ts
let direction: "left";
direction = "left";   // OK
direction = "right";  // Error
```

Literal types become powerful when combined in a union. This lets you describe a fixed set of allowed values:

```ts
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;

function request(method: HttpMethod, url: string) { /* ... */ }
request("GET", "/users");    // OK
request("FETCH", "/users");  // Error: '"FETCH"' is not assignable to type 'HttpMethod'
```

Unions also work for object shapes. This is the foundation of the most useful pattern in Section 5 (discriminated unions):

```ts
type ApiResult =
  | { status: "success"; data: string[] }
  | { status: "error"; message: string };
```

A related tool is the **intersection** `&` ("and"), which combines types into one type that has *all* the properties:

```ts
type Timestamps = { createdAt: Date; updatedAt: Date };
type Post = { title: string } & Timestamps;
```

**Important rule:** with a union, you may only use members that are valid for **every** option.

```ts
function shout(value: string | number) {
  return value.toUpperCase(); // Error: Property 'toUpperCase' does not exist on type 'number'.
}
```

The fix is narrowing, the next section.

#### Why it matters in real-world practice

JavaScript is full of values that can be "this or that": a function that takes a string or an array, an API that returns data or an error, a variable that may be `null` until something loads. Unions let the type system describe that honestly. Literal-type unions replace "magic strings" and catch typos like `"pendng"` immediately.

#### Example and analogy

**Analogy:** A union is a **parking sign that says "Cars or motorcycles only."** Anything that fits either category is allowed, but the sign says nothing about which one is in the spot. Before you use the motorcycle's kickstand, you must first check it really is a motorcycle.

```ts
type OrderStatus = "pending" | "shipped" | "delivered";

function label(status: OrderStatus): string {
  return status.toUpperCase();
}
label("shipped");  // OK
label("shiped");   // Error: did you mean "shipped"? (the typo is caught immediately)
```

#### Common beginner mistakes and misconceptions

- **Expecting to call one member's methods on the whole union** without narrowing first.
- **Confusing `|` and `&`.** A union (`|`) is "either one", so you can do *less* with it. An intersection (`&`) is "both at once", so you get *more* properties.
- **Reaching for `enum`.** TypeScript has an `enum` keyword, but for beginners a union of string literals (`"a" | "b"`) is simpler, erases cleanly, and is what most modern codebases prefer.
- **Widening surprises.** `let method = "GET"` is inferred as `string`, so passing it where `HttpMethod` is required fails. Declare it as `const method = "GET"` or annotate `let method: HttpMethod = "GET"`.

---

### Section 5: Narrowing

#### Explanation

**Narrowing** is how TypeScript refines a broad type (like a union) into a more specific one, based on checks you write in ordinary JavaScript. Inside the branch where the check passed, the compiler *knows* the narrower type. These checks are called **type guards**.

Built-in narrowing tools:

```ts
// 1. typeof: for primitives
function formatId(id: string | number): string {
  if (typeof id === "string") {
    return id.toUpperCase();          // id: string
  }
  return id.toFixed(0).padStart(6, "0"); // id: number
}

// 2. Truthiness and null checks
function shoutName(name: string | null | undefined): string {
  if (!name) return "(nobody)";       // handles null, undefined, and ""
  return name.toUpperCase();          // name: string
}

// 3. Equality
function same(a: string | number, b: string | boolean) {
  if (a === b) {
    // Both must be `string` here, since it is the only type they share
    a.toUpperCase();
  }
}

// 4. `in`: does this property exist?
type Fish = { swim: () => void };
type Bird = { fly: () => void };
function move(animal: Fish | Bird) {
  if ("swim" in animal) animal.swim();  // Fish
  else animal.fly();                    // Bird
}

// 5. instanceof: for classes and built-ins
function toMessage(err: unknown): string {
  if (err instanceof Error) return err.message;  // Error
  return String(err);
}

// 6. Array.isArray
function toArray(x: string | string[]): string[] {
  return Array.isArray(x) ? x : [x];
}
```

**Discriminated unions** are the most important pattern. Give every member of a union object a shared property with a **unique literal value** (the "tag" or "discriminant"). Checking the tag narrows the whole object.

```ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;   // shape: the circle variant
    case "rectangle":
      return shape.width * shape.height;    // shape: the rectangle variant
  }
}
```

**Exhaustiveness checking with `never`:** the type `never` means "this can never happen". Assigning the leftover value to `never` makes the compiler tell you when you forget a case.

```ts
function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    default: {
      const unreachable: never = shape; // Error here if a new variant is added and not handled
      return unreachable;
    }
  }
}
```

If someone later adds `| { kind: "triangle"; ... }` to `Shape`, the `default` branch now errors, pointing at every place that needs updating.

**Custom type guards** let you package a check into a reusable function. The return type `pet is Dog` is a promise to the compiler: "if I return `true`, treat this value as a `Dog`."

```ts
interface Dog { bark(): void }
interface Cat { meow(): void }

function isDog(pet: Dog | Cat): pet is Dog {
  return "bark" in pet;
}

function speak(pet: Dog | Cat) {
  if (isDog(pet)) pet.bark();
  else pet.meow();
}
```

**Type assertions** (`as`) and the **non-null assertion** (`!`) are the opposite of narrowing: they *overrule* the compiler without checking anything.

```ts
const input = document.getElementById("name") as HTMLInputElement; // "trust me"
const len = maybeString!.length;                                     // "trust me, it's not null"
```

#### Why it matters in real-world practice

Narrowing is where unions become usable. Every "it might be `null`", "it might be an error", or "it might be one of several shapes" situation is handled by it. Discriminated unions model loading/success/error states, API results, and events, and `never` exhaustiveness makes adding a new case a compile error in every place that forgot it, rather than a production bug.

#### Example and analogy

**Analogy:** Narrowing is **checking what is actually in the package before you use it**. A label says "fragile or perishable." You open the box, find a vase, and from that moment on you handle it as a vase. A type assertion (`as`) is signing for the package without opening it.

```ts
type LoadState =
  | { state: "loading" }
  | { state: "loaded"; items: string[] }
  | { state: "failed"; error: string };

function render(s: LoadState): string {
  switch (s.state) {
    case "loading": return "Loading…";
    case "loaded":  return `${s.items.length} items`;
    case "failed":  return `Error: ${s.error}`;
  }
}
```

#### Common beginner mistakes and misconceptions

- **Using `as` to silence an error.** It does not change the real value; it just hides the problem. If you are wrong, the crash moves to runtime. Prefer a real check.
- **Truthiness traps.** `if (count)` is `false` for `0`, and `if (text)` is `false` for `""`. If `0` or empty string is a valid value, compare against `null`/`undefined` explicitly (`count !== undefined`, or use `??`).
- **`typeof null === "object"`.** This JavaScript quirk means `typeof x === "object"` does not exclude `null`.
- **Forgetting that narrowing follows control flow.** Narrowing can be lost inside callbacks or after reassignment; re-check or copy the narrowed value into a `const`.
- **Custom type guards that lie.** TypeScript trusts `x is Dog` completely. If your check is wrong, the compiler will not notice.
- **Not giving union members a shared tag.** Without a discriminant, narrowing object unions is awkward; add a `kind`/`type`/`status` literal property.

---

### Section 6: Typed Functions

#### Explanation

Functions are where most of your types will live. You annotate **parameters** (required, because the compiler cannot guess them) and optionally the **return type**.

```ts
function greet(name: string): string {
  return `Hello, ${name}!`;
}

const add = (a: number, b: number): number => a + b;
```

**Optional and default parameters:**

```ts
function greet(name: string, greeting?: string): string {
  return `${greeting ?? "Hello"}, ${name}!`; // greeting is string | undefined inside
}

function greet2(name: string, greeting = "Hello"): string {
  return `${greeting}, ${name}!`;           // default gives greeting the type string
}
```

Optional parameters must come **after** required ones.

**Rest parameters:**

```ts
function sum(...nums: number[]): number {
  return nums.reduce((total, n) => total + n, 0);
}
sum(1, 2, 3); // 6
```

**Return types:** TypeScript infers them, but writing them on functions you export makes the contract explicit and catches accidental changes.

- `void` means "returns nothing useful" (console logging, event handlers).
- If a function has a declared return type, **every code path** must return a matching value.

```ts
function parseAge(input: string): number {
  const n = Number(input);
  if (Number.isNaN(n)) {
    return null;  // Error: 'null' is not assignable to type 'number'
  }
  return n;
}
// Honest version: declare that failure is possible
function parseAge(input: string): number | null { /* ... */ }
```

**Function types** describe the shape of a function, which matters for **callbacks**:

```ts
function applyTwice(fn: (n: number) => number, value: number): number {
  return fn(fn(value));
}
applyTwice((n) => n * 2, 5);  // 20. `n` is inferred as number from the context
```

You can also name a function type:

```ts
type Formatter = (value: number, currency: string) => string;
const toMoney: Formatter = (value, currency) => `${currency}${value.toFixed(2)}`;
```

**Async functions** always return a `Promise`. The type inside `Promise<...>` is what the caller receives after `await`.

```ts
interface User { id: number; name: string }

async function fetchUser(id: number): Promise<User> {
  const res = await fetch(`https://api.example.com/users/${id}`);
  return res.json(); // Careful: res.json() returns `any`, so TypeScript trusts this blindly
}
```

*(Overloads, which are multiple signatures for one function, exist too. Learners only need to know the term for now.)*

#### Why it matters in real-world practice

A function signature is the **contract** between the code that calls it and the code inside it. Typed signatures mean a caller gets an immediate error for a wrong argument, and autocomplete shows them exactly what is expected. This is usually the single biggest day-to-day payoff of TypeScript.

#### Example and analogy

**Analogy:** A typed function is a **vending machine with labeled slots**. The slot for coins only accepts coins (parameter types), and the machine promises to hand back a snack, not a surprise (return type). You find out you inserted the wrong thing at the slot, not after the machine jams.

```ts
function createTag(label: string, color: "red" | "green" | "blue" = "blue") {
  return { label, color };
}
createTag("urgent", "red");     // OK
createTag("urgent", "purple");  // Error
createTag();                    // Error: Expected 1-2 arguments, but got 0
```

#### Common beginner mistakes and misconceptions

- **Forgetting parameter types.** With `strict` on, `function double(x)` is an error ("implicitly has an `any` type"). That error is the compiler protecting you.
- **Mixing up `void` with `undefined`.** `void` means the return value should be ignored; it is what you annotate for functions that do not return anything meaningful.
- **Trusting `await res.json()`.** It is typed `any`, so your `Promise<User>` annotation is only a promise, not a guarantee. Real-world apps validate external data at runtime (for example, with a validation library such as Zod). Plain TypeScript cannot.
- **Putting an optional parameter before a required one.** This is a syntax error.
- **Calling with extra arguments** and expecting JavaScript's forgiving behavior. TypeScript reports an error for too many *or* too few arguments.

---

### Section 7: Introductory Generics

#### Explanation

Sometimes a function works the same way for *any* type, but the result type depends on the input type. Without generics you would be forced to choose between copying the function for every type, or using `any` and losing information.

```ts
function firstAny(items: any[]): any {
  return items[0];
}
const x = firstAny([1, 2, 3]); // x is `any`. We lost the fact that it's a number.
```

A **generic** function introduces a **type parameter**, conventionally named `T` (short for "Type"), which acts like a **variable for a type**. It is written in angle brackets after the function name.

```ts
function first<T>(items: T[]): T | undefined {
  return items[0];
}

const n = first([1, 2, 3]);      // T is inferred as number  → n: number | undefined
const s = first(["a", "b"]);     // T is inferred as string  → s: string | undefined
const explicit = first<boolean>([true, false]); // you can also state T yourself (rarely needed)
```

You almost never write `<number>` at the call site. TypeScript **infers** `T` from the arguments.

**You have already used generics.** `Array<number>` is the same as `number[]`, and `Promise<User>` (Section 6) is a generic type too.

**Generic interfaces and types** let you reuse a shape with different contents:

```ts
interface ApiResponse<T> {
  data: T;
  error: string | null;
}

const userResponse: ApiResponse<{ name: string }> = { data: { name: "Ada" }, error: null };
const listResponse: ApiResponse<number[]> = { data: [1, 2, 3], error: null };
```

**Constraints** restrict what `T` may be, using `extends`. Without one, TypeScript knows nothing about `T`, so you cannot use its properties.

```ts
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

longest("hello", "hi");     // works: strings have .length
longest([1, 2, 3], [1]);    // works: arrays have .length
longest(10, 20);            // Error: number has no 'length' property
```

**Built-in generic utility types** save you from rewriting shapes. Learners should recognize these four:

```ts
interface User { id: number; name: string; email: string }

type UserPreview = Pick<User, "id" | "name">;   // only the listed keys
type UserWithoutEmail = Omit<User, "email">;     // everything except the listed keys
type UserUpdate = Partial<User>;                 // every property becomes optional
type ReadonlyUser = Readonly<User>;              // every property becomes readonly
```

(`Record<string, number>` is another common one: an object whose keys are strings and whose values are numbers.)

#### Why it matters in real-world practice

Generics are how reusable code stays type-safe. Every library you will use (array methods, `Promise`, React hooks, HTTP clients, state managers) is written with generics. Even if you write few generics yourself at first, **reading** them is essential to understanding error messages and library documentation.

#### Example and analogy

**Analogy:** A generic is a **storage container with a blank label that gets filled in when you use it**. "A box of `T`." You decide what goes in when you buy the box (`Box<Book>`, `Box<Shoes>`), and from then on the rest of the system knows exactly what comes out.

```ts
interface Stack<T> {
  push(item: T): void;
  pop(): T | undefined;
}

function createStack<T>(): Stack<T> {
  const items: T[] = [];
  return {
    push: (item) => { items.push(item); },
    pop: () => items.pop(),
  };
}

const numbers = createStack<number>();
numbers.push(1);
numbers.push("two"); // Error: 'string' is not assignable to 'number'
```

#### Common beginner mistakes and misconceptions

- **Using a generic when a union or plain type would do.** If `T` appears only once in a signature, it is probably not doing any work. Generics are for *relating* types (input type to output type).
- **Expecting `T` to exist at runtime.** Like all types, it is erased. You cannot write `new T()` or `typeof T`.
- **Forgetting constraints** and then being surprised that `T` has no properties.
- **Being intimidated by the names.** `T`, `U`, `K`, `V` are just conventions. Descriptive names (`TItem`, `TResponse`) are perfectly fine.
- **Specifying the type argument when inference would work.** Write `first([1, 2, 3])`, not `first<number>([1, 2, 3])`.

---

### Part B: The Project

---

### Section 8: Strict Checking and `tsconfig.json`

#### Explanation

The compiler is configured by a file named **`tsconfig.json`**. It tells TypeScript which files to include, how to interpret them, and how strict to be.

**Strict mode** is a single switch, `"strict": true`, that turns on a family of stronger checks. Since **TypeScript 6.0 it is on by default**, but every serious project states it explicitly so the intent is visible.

The checks inside `strict` that matter most to beginners:

| Flag | What it catches | Example |
|---|---|---|
| `strictNullChecks` | `null` and `undefined` are no longer silently allowed everywhere | `s.length` when `s: string \| null` errors |
| `noImplicitAny` | A missing type that would quietly become `any` becomes an error | `function double(x) {}` errors |
| `strictPropertyInitialization` | Class properties that are declared but never assigned | `class A { name: string }` errors |
| `strictFunctionTypes` | Unsafe function-type substitutions in callbacks | (advanced) |
| `useUnknownInCatchVariables` | `catch (e)` gives `e` the type `unknown`, not `any` | you must narrow with `instanceof Error` |

The most valuable of these is **`strictNullChecks`**, which removes the single largest source of JavaScript crashes: "Cannot read properties of null/undefined".

```ts
function getLength(s: string | null): number {
  return s.length;            // Error: 's' is possibly 'null'.
}

function getLength(s: string | null): number {
  return s === null ? 0 : s.length; // OK: narrowed
}
```

**Recommended extra flag (not included in `strict`):** `noUncheckedIndexedAccess`. It makes reading `array[i]` or `record[key]` return `T | undefined`, because an index may not exist.

```ts
const colors = ["red", "green"];
const c = colors[5];
c.toUpperCase(); // Error with the flag on: 'c' is possibly 'undefined'
```

**A solid starter `tsconfig.json` for a Node project** (used in the project setup at the end of Part B):

```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "nodenext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "rootDir": "src",
    "outDir": "dist",
    "types": ["node"]
  },
  "include": ["src"]
}
```

What the less obvious lines do:

- `module: "nodenext"` makes TypeScript follow Node's real ES module rules (Section 9).
- `verbatimModuleSyntax` forces you to mark type-only imports with `type`, so imports behave exactly as written (Section 9).
- `skipLibCheck` skips type-checking of declaration (`.d.ts`) files, including the ones shipped inside `node_modules`. That is faster and avoids errors in code you do not own (your own `.ts` files are still fully checked).
- `types: ["node"]` is needed because, since TypeScript 6.0, `@types/*` packages are **no longer all loaded automatically**. List the ones you want. (Install them with `npm install -D @types/node`.)

**Type-check without producing files:** `npx tsc --noEmit`.

**Reading error messages.** The text is long, but the first line usually tells you everything:

| Code | Message starts with | Usually means |
|---|---|---|
| TS2322 | `Type 'X' is not assignable to type 'Y'` | You assigned the wrong kind of value |
| TS2345 | `Argument of type 'X' is not assignable to parameter...` | You passed the wrong thing to a function |
| TS2339 | `Property 'p' does not exist on type 'T'` | A typo, or you need to narrow first |
| TS7006 | `Parameter 'x' implicitly has an 'any' type` | Add a parameter type |
| TS18047 | `'x' is possibly 'null'` | Add a null check |
| TS2304 | `Cannot find name 'x'` | Missing import, or a missing `types` entry |

**Escape hatches, and the right one to use:** when you genuinely must suppress an error, use `// @ts-expect-error` with a comment explaining why. Unlike `// @ts-ignore`, it **errors when the problem is fixed**, so stale suppressions get cleaned up automatically.

#### Why it matters in real-world practice

Strict mode is the difference between TypeScript that catches bugs and TypeScript that only decorates JavaScript. Enabling it on day one of a project is easy. Turning it on later in a large codebase is painful. Teams and employers generally expect `strict: true`.

#### Example and analogy

**Analogy:** Strict mode is a **seatbelt and airbag system**. You can drive without them and mostly arrive, but the crashes you do have are far worse. Turning them off "because the beeping is annoying" is the wrong response to the beeping.

```ts
// With strict off, all of this "works"; with strict on, each line reports a real risk
function describe(user) {                 // TS7006: implicit any
  return user.profile.name.toUpperCase(); // would crash if profile is missing
}
```

#### Common beginner mistakes and misconceptions

- **Setting `"strict": false` to make errors go away.** This hides bugs without fixing them. Fix the code instead.
- **Sprinkling `// @ts-ignore`** or `as any` until the file is green.
- **Editor and command line disagree.** The editor reads the nearest `tsconfig.json`. If `tsc` reports something the editor does not (or vice versa), check which config each is using, and whether the file is covered by `include`.
- **Believing strict mode slows you down.** It frontloads small fixes in exchange for many fewer runtime surprises.
- **Forgetting that `strict` does not include everything.** `noUncheckedIndexedAccess` is opt-in, which is why the starter config adds it.

---

### Section 9: Modules

#### Explanation

A **module** is a file that can share code with other files. In modern TypeScript and JavaScript, a file is a module when it contains a top-level `import` or `export`. The system is called **ES modules** (ESM).

```ts
// src/math.ts
export function add(a: number, b: number): number {
  return a + b;
}

export interface Point {
  x: number;
  y: number;
}
```

```ts
// src/main.ts
import { add, type Point } from "./math.js";

const origin: Point = { x: 0, y: 0 };
console.log(add(origin.x, 5));
```

Key ideas:

- **Named exports** (`export function add`) are imported with braces and the same name. **Default exports** (`export default`) are imported without braces and can be renamed by the importer. A good habit: **prefer named exports**. They are easier to search for and refactor.
- **Type-only imports:** `import type { Point } from "./math.js"` (or `import { add, type Point }`) says "this import is only for type checking." It is erased completely in the output. With `verbatimModuleSyntax` on, TypeScript *requires* this when you import something that is only a type.
- **Re-exports:** `export { add } from "./math.js"` or `export * from "./math.js"` let an `index.ts` gather several modules into one entry point.
- **Types can be exported too.** Exporting your `interface`s and `type`s from a shared file is how a whole project agrees on its data shapes.

**File extensions under `nodenext`.** When TypeScript is set to follow Node's real ESM rules (`"module": "nodenext"` together with `"type": "module"` in `package.json`), relative imports **must include a file extension**, and you write **`.js`** even though the file on disk is `.ts`. TypeScript does not rewrite your import paths; it assumes you are writing the path as it will exist after compilation. (Tools like `tsx`, used in the class project, understand this convention. TypeScript also offers `rewriteRelativeImportExtensions` if you prefer writing `.ts` in imports.)

```ts
import { add } from "./math";     // Error under nodenext: needs an extension
import { add } from "./math.js";  // Correct
```

**Packages and their types.** Many npm packages ship their own types. Others rely on a community type package from DefinitelyTyped, named `@types/<package>` (for example, `@types/node` for Node's built-in APIs like `process` and `fs`). Install those as **dev dependencies**.

**`package.json` needs `"type": "module"`** so Node treats your `.js` output as ES modules.

#### Why it matters in real-world practice

No application lives in one file. Modules give you clear boundaries: each file exposes a small public surface and hides the rest. Types that cross those boundaries are what keep a large codebase consistent. Getting the module settings right also prevents the most confusing category of beginner errors ("Cannot find module" or "require is not defined").

#### Example and analogy

**Analogy:** A module is a **room with a labeled door**. `export` is deciding which items to put in the doorway for others; `import` is walking to a specific door and taking only what you need. A `type` import is taking a *blueprint* out of the room rather than a physical object, and it disappears when the building is finished.

```ts
// src/orders.ts
export type OrderStatus = "pending" | "shipped" | "delivered";

export interface Order {
  id: number;
  status: OrderStatus;
}

export function isFinished(order: Order): boolean {
  return order.status === "delivered";
}
```

```ts
// src/main.ts
import { isFinished, type Order } from "./orders.js";

const order: Order = { id: 1, status: "shipped" };
console.log(isFinished(order)); // false
```

#### Common beginner mistakes and misconceptions

- **Forgetting the `.js` extension** in relative imports under `nodenext`, or being confused that it says `.js` when the file is `.ts`.
- **Mixing module systems.** Using `require()` and `module.exports` (CommonJS) in a project that is set up for ES modules.
- **Importing a type as a value.** With `verbatimModuleSyntax`, `import { Point }` errors if `Point` is only a type. Use `type`.
- **Mismatching default and named exports**, e.g. `import add from` when the module uses `export function add`.
- **Circular imports** (A imports B, B imports A). They can cause values to be `undefined` at startup; restructure shared code into a third file.
- **Trying to import a package and getting "Cannot find name" or "Could not find a declaration file".** Install the matching `@types/...` package, and list it under `types` if it provides globals.

---

### Section 10: Linting and Formatting

#### Explanation

Three different tools keep code healthy, and beginners often blur them together. Each answers a different question.

| Tool | Question it answers | Example finding |
|---|---|---|
| **Type checker** (`tsc`) | "Do the types line up?" | Passing a `string` where a `number` is required |
| **Linter** (ESLint + typescript-eslint) | "Is this code likely to be buggy or against good practice?" | Unused variable, use of `any`, a suppressed error with no explanation |
| **Formatter** (Prettier) | "Is the code laid out consistently?" | Quote style, indentation, line wrapping, trailing commas |

A **linter** analyzes your code for likely bugs and risky patterns, and it can enforce team rules. **ESLint** is the standard JavaScript linter; the **typescript-eslint** project teaches it to understand TypeScript. A **formatter** rewrites your code's appearance automatically so nobody ever debates style. **Prettier** is the most widely used one.

**Minimal ESLint setup** (file `eslint.config.js`, using ESLint's current "flat config" format):

```js
import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  { ignores: ["dist/"] },            // never lint build output
  eslint.configs.recommended,        // core JavaScript rules
  tseslint.configs.recommended,      // TypeScript rules
);
```

Things the `recommended` set flags that matter for this class: explicit `any`, unused variables, and `@ts-ignore`-style comments used without an explanation.

**Prettier setup** (file `.prettierrc.json`):

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all"
}
```

The defaults are already reasonable. The point is not which style, but that **one tool decides, for everyone, automatically**.

**npm scripts** make all of this one command each (full `package.json` in the starter project below):

```
npm run typecheck     # tsc --noEmit
npm run lint          # eslint .
npm run format        # prettier --write .   (rewrites files)
npm run format:check  # prettier --check .   (fails if any file needs formatting; used in CI)
```

**Editor integration** is where this pays off: install the ESLint and Prettier VS Code extensions and enable format-on-save, so problems appear and get fixed as you type. In `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

**A step further (mention only):** typescript-eslint also offers *type-aware* rules (for example, catching a promise you forgot to `await`) via `tseslint.configs.recommendedTypeChecked` plus a small `parserOptions` block. They are slower but catch deeper bugs, so they make a good follow-up lesson.

**Version caution for this class:** typescript-eslint currently supports TypeScript versions below 6.1, and it does not yet work with TypeScript 7 (see the instructor note at the top). That is why the starter project pins `typescript@~6.0`. When TypeScript 7.1 and a matching typescript-eslint release arrive, this restriction should lift.

#### Why it matters in real-world practice

On a team, these tools end style arguments, catch a whole class of mistakes the type checker does not, and keep pull requests focused on logic rather than spacing. Running them automatically (on save, before commit, and in continuous integration) means problems are found in seconds instead of in code review.

#### Example and analogy

**Analogy:** `tsc` is the **grammar check** (is this a valid sentence?). The linter is the **editor's margin notes** ("this paragraph is confusing; you never used this character"). The formatter is the **print shop's layout engine**: it sets margins and fonts so every document looks the same, no matter who wrote it.

```ts
// Linter findings (typescript-eslint recommended):
function handle(data: any) {           // no-explicit-any
  const unused = 5;                    // no-unused-vars
  // @ts-ignore                        // ban-ts-comment: give a reason, or use @ts-expect-error
  return data.value;
}
```

#### Common beginner mistakes and misconceptions

- **Using ESLint to do formatting**, or Prettier to catch bugs. Prettier never finds bugs; ESLint's recommended rules are not about layout. (With the standard `recommended` sets there is no conflict between them. A compatibility package, `eslint-config-prettier`, is only needed if you later add style-related lint rules.)
- **Turning rules off globally because they are "annoying".** A rule that fires often is usually pointing at a real pattern. Fix the code, or discuss changing the rule with the team.
- **Adding `// eslint-disable` everywhere** without a reason. Suppress one line, and say why.
- **Only running checks locally.** If CI does not run them too, they get skipped under deadline pressure.
- **Linting build output** (`dist/`). Ignore generated folders.
- **Confusing red squiggles:** type errors (from TypeScript) and lint warnings (from ESLint) appear in the same editor but come from different tools and are fixed differently.

---

### Section 11: Dependency Lockfiles

#### Explanation

Modern projects depend on other people's code through a **package manager**. This class uses **npm** (Node Package Manager, installed with Node.js). Your `package.json` lists your project's **dependencies**, the packages it needs.

- **`dependencies`**: needed when your app runs.
- **`devDependencies`**: needed only while developing (TypeScript, ESLint, Prettier, `@types/*`, test tools). Install them with `npm install -D <package>`.

`package.json` records **version ranges** using **semantic versioning** ("semver"), where a version is `MAJOR.MINOR.PATCH`:

| You write | Meaning | Allows |
|---|---|---|
| `"6.0.3"` | Exactly this version | only 6.0.3 |
| `"~6.0.3"` | Patch updates only | 6.0.3 up to (not including) 6.1.0 |
| `"^6.0.3"` | Compatible updates | 6.0.3 up to (not including) 7.0.0 |

The problem: ranges mean that running `npm install` today and six months from now can install **different versions**, so two developers (or your laptop and the server) can silently end up with different code.

A **lockfile** (`package-lock.json` for npm) solves this. It records the **exact version of every package installed**, including dependencies of dependencies ("transitive" dependencies), plus a checksum for each. Anyone who installs from the lockfile gets an identical dependency tree.

Two commands that matter:

| Command | What it does | Use it |
|---|---|---|
| `npm install` | Installs based on `package.json`, and **updates** the lockfile when needed | When you add or upgrade a package |
| `npm ci` | Deletes `node_modules` and installs **exactly what the lockfile says**; fails if `package.json` and the lockfile disagree | On a fresh clone, in CI, and on deployment servers |

Rules of the road:

- **Commit** the lockfile to Git. **Do not** commit `node_modules`. (Put `node_modules` and `dist` in `.gitignore`.)
- **Do not edit** the lockfile by hand.
- **Use one package manager per project.** Other tools have their own lockfiles (`pnpm-lock.yaml`, `yarn.lock`, `bun.lock`). The idea is identical.
- **Upgrade deliberately:** `npm outdated` shows what is behind; `npm audit` reports known security problems; tools like Dependabot or Renovate can open upgrade pull requests.

#### Why it matters in real-world practice

Lockfiles are what make "works on my machine" also work on your teammate's machine, in CI, and in production. They make builds reproducible, make bugs reproducible (you can get the exact versions a user had), and protect you from a surprise update silently breaking your build or pulling in a compromised release.

#### Example and analogy

**Analogy:** `package.json` is a **recipe that says "some flour, some butter."** The lockfile is the **shopping receipt**: this exact brand, this exact batch, every ingredient including what went into the store-bought sauce. Follow the receipt and you get the same cake every time.

A fragment of what a lockfile entry looks like (you never write this yourself):

```json
"node_modules/typescript": {
  "version": "6.0.3",
  "resolved": "https://registry.npmjs.org/typescript/-/typescript-6.0.3.tgz",
  "integrity": "sha512-…"
}
```

#### Common beginner mistakes and misconceptions

- **Adding `package-lock.json` to `.gitignore`**, which throws away the whole benefit.
- **Deleting the lockfile or `node_modules` to "fix" a problem** and then not noticing that dozens of dependencies silently changed version.
- **Using `npm install` in CI** instead of `npm ci`, which can produce a different tree than the one you tested.
- **Mixing package managers**, leaving two lockfiles that disagree.
- **Resolving a lockfile merge conflict by picking a side at random.** Resolve `package.json` first, then run `npm install` to regenerate the lockfile.
- **Believing `^` is "safe forever".** Minor and patch updates usually are fine, but without a lockfile you are trusting strangers' release discipline on every install.
- **Putting build-only tools under `dependencies`.** TypeScript, ESLint, and Prettier belong in `devDependencies`.

---

### Putting It All Together: Starter Project

This is the scaffold learners build once and reuse for every exercise in the course. It wires up every Part B idea and gives Part A code somewhere to live.

**1. Create the project and install the tools:**

```bash
mkdir ts-class && cd ts-class
git init
npm init -y
npm pkg set type=module
npm install -D typescript@~6.0 @types/node tsx
npm install -D eslint @eslint/js typescript-eslint
npm install -D prettier
mkdir src
```

**2. `package.json` scripts** (merge into the generated file):

```json
{
  "scripts": {
    "dev": "tsx watch src/main.ts",
    "build": "tsc",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "check": "npm run typecheck && npm run lint && npm run format:check"
  }
}
```

**3. Add the files** shown earlier: `tsconfig.json` (Section 8), `eslint.config.js` and `.prettierrc.json` (Section 10), and `.vscode/settings.json` (Section 10). Create `.gitignore` and `.prettierignore`:

```
# .gitignore
node_modules
dist

# .prettierignore
dist
```

**4. Try it:** write `src/main.ts`, run `npm run dev`, then run `npm run check`. Commit **everything including `package-lock.json`**.

**5. Prove reproducibility:** clone the repo into a new folder and run `npm ci && npm run check`. It should pass with identical results.

> Note: `tsx` is a small runner that executes `.ts` files directly for fast development. Recent Node.js versions can also run TypeScript files natively by stripping types, but that does no type checking, which is why the `typecheck` script still matters.

---

## How the Sections Connect

*(Written so it can be converted into a diagram later: nodes, edges, and a hierarchy.)*

### The big idea that links everything

Describe the possibilities honestly (Sections 2 to 4), prove which possibility you actually have (Section 5), package that logic into reusable contracts (Sections 6 and 7), and let automated tools enforce all of it for the whole team (Sections 8 to 11).

### Hierarchy

```
TypeScript Foundations
├── Part A: The Language
│   ├── S1  Mental model (types are compile-time only)
│   ├── Building blocks
│   │   ├── S2  Basic types + inference
│   │   ├── S3  Object types (type alias / interface)
│   │   └── S4  Unions + literal types
│   ├── Using them safely
│   │   └── S5  Narrowing (+ discriminated unions, never)
│   └── Applying them
│       ├── S6  Typed functions
│       └── S7  Generics
└── Part B: The Project
    ├── Configuration
    │   ├── S8  strict + tsconfig
    │   └── S9  Modules
    └── Quality and reproducibility
        ├── S10 Linting + formatting
        └── S11 Lockfiles
```

### Dependencies (arrow means "is needed before")

- **S1 → everything.** Without "types vanish at runtime", learners misread every later section.
- **S2 → S3.** Object types are made of basic types.
- **S3 → S4.** Unions combine types, and the most useful unions are unions of object shapes.
- **S4 → S5.** Narrowing exists *because* unions exist: it resolves "A or B" into "definitely A".
- **S5 → S6.** Function bodies constantly need narrowing to use union-typed parameters.
- **S3 + S6 → S7.** Generics abstract over the interfaces and functions learners already know.
- **S8 influences S2 to S7.** It is a *setting*, not a step. `strictNullChecks` is what makes `T | null` unions (S4) and narrowing (S5) necessary. `noImplicitAny` is what makes parameter annotations (S6) mandatory.
- **S3 + S8 → S9.** Modules export the types from S3 and depend on the `module` settings in `tsconfig.json`.
- **S8 + S9 → S10.** Linters and formatters operate on the files, the config, and the import structure already in place.
- **S11 supports S8, S9, and S10.** It is the foundation that installs and version-locks TypeScript, ESLint, and Prettier. It is *taught* last but *used* first, so do the starter-project install at the start of class.

### The everyday workflow (a loop, for a flowchart)

1. Write code in the editor, which shows type errors and lint warnings live (S2 to S7, S10).
2. Save, so Prettier formats automatically (S10).
3. Run `npm run check`: type-check, then lint, then format check (S8, S10).
4. Commit the source **and** the lockfile (S11).
5. On another machine or in CI: `npm ci`, then the same `npm run check` (S11, S10, S8).

---

## Key Terms Glossary

- **Annotation:** the `: type` written after a variable, parameter, or function to state its type.
- **`any`:** a type that turns off checking for a value; avoid it.
- **Compile time:** the period when TypeScript analyzes your source; types exist only here.
- **Runtime:** when the JavaScript is actually executing; types no longer exist.
- **`tsc`:** the TypeScript compiler, which checks types and emits JavaScript.
- **Declaration file (`.d.ts`):** a file containing only type information, describing code that lives elsewhere.
- **`@types/*`:** community-written declaration packages (from DefinitelyTyped) for libraries that do not ship types.
- **Dependency / devDependency:** a package your app needs at runtime / only while developing.
- **Discriminated union:** a union of object types sharing a literal "tag" property that identifies each variant.
- **ES modules (ESM):** JavaScript's standard `import`/`export` module system.
- **Exhaustiveness checking:** using `never` so the compiler errors if a union case is left unhandled.
- **ESLint:** a linter that finds likely bugs and rule violations in JavaScript and TypeScript.
- **Formatter:** a tool (such as Prettier) that rewrites code layout automatically and consistently.
- **Generic:** a function or type that takes a type parameter, so it can work with many types safely.
- **Constraint (generic):** a limit on a type parameter written with `extends` (for example, `T extends { length: number }`).
- **Type parameter:** the placeholder (`T`) in a generic that is filled in with a real type on use.
- **Inference:** the compiler working out a type from the code so you do not have to write it.
- **Interface:** a named description of an object's shape, extendable with `extends`.
- **Intersection (`&`):** a type combining several types into one having all their properties.
- **Linter:** a tool that statically analyzes code for bugs and risky or non-standard patterns.
- **Literal type:** a type that allows exactly one value, such as `"GET"` or `42`.
- **Lockfile:** a file (`package-lock.json`) recording the exact version of every installed package.
- **Module:** a file that shares code through `export` and receives code through `import`.
- **Narrowing:** refining a broad type into a more specific one using runtime checks the compiler understands.
- **`never`:** the type of values that cannot occur; used for exhaustiveness checks.
- **`npm ci`:** installs exactly what the lockfile specifies, for reproducible installs.
- **Non-null assertion (`!`):** tells the compiler a value is not `null`/`undefined` without checking; use sparingly.
- **Optional property (`?`):** a property that may be absent, so its type includes `undefined`.
- **Prettier:** an opinionated code formatter.
- **`readonly`:** a modifier preventing reassignment of a property (compile-time only).
- **Semver:** semantic versioning: `MAJOR.MINOR.PATCH`, used in version ranges like `^6.0.3`.
- **Strict mode (`strict`):** a group of compiler checks, including `strictNullChecks` and `noImplicitAny`, that make typing rigorous.
- **Structural typing:** compatibility decided by an object's shape rather than its declared name.
- **Tuple:** an array with a fixed length and a specific type at each position.
- **Type alias (`type`):** a name for any type, including unions, tuples, and object shapes.
- **Type assertion (`as`):** an instruction that overrides the compiler's idea of a type without checking it.
- **Type guard:** a check (or a function returning `x is T`) that narrows a type.
- **`tsconfig.json`:** the file that configures the TypeScript compiler for a project.
- **Union (`|`):** a type meaning "one of these types".
- **`unknown`:** a safe "anything" type that must be narrowed before use.
- **Utility type:** a built-in generic type like `Partial<T>`, `Pick<T, K>`, `Omit<T, K>`, or `Readonly<T>`.
- **`verbatimModuleSyntax`:** a setting making imports and exports behave exactly as written, requiring `type` on type-only imports.
- **`void`:** the return type for functions that do not return a useful value.

---

## Knowledge Check

### Questions

**1. (Compile time vs. runtime)** You declare `interface User { name: string }`, then write `const u = JSON.parse(text) as User`. After the code is compiled to JavaScript, what happens to `User`, and does TypeScript guarantee `u.name` is really a string?

**2. (Narrowing)** This code errors. Explain why, then fix it twice: once with `typeof` and once by making the function generic-free but safe for both types.

```ts
function shout(value: string | number) {
  return value.toUpperCase();
}
```

**3. (Generics)** What are the types of `a` and `b`, and why does each include `undefined`?

```ts
function first<T>(items: T[]): T | undefined {
  return items[0];
}
const a = first([10, 20]);
const b = first(["x"]);
```

**4. (Strict checking)** Which `strict` flag produces the error below, and what are two correct ways to fix it?

```ts
function len(s: string | null): number {
  return s.length; // Error: 's' is possibly 'null'.
}
```

**5. (Lockfiles)** A teammate's build fails even though yours passes, and you both ran `npm install` a month apart. What is the likely cause, what file fixes it, and which command should the CI server run instead of `npm install`?

### Applied scenario: the Orders module

Build a small `src/orders.ts` and `src/main.ts` in the starter project that does the following:

1. Defines an `OrderStatus` literal union (`"pending" | "shipped" | "delivered"`).
2. Defines a `Payment` **discriminated union** with three variants: `card` (has `last4`), `cash` (no extra data), and `transfer` (has `reference`).
3. Defines an `Order` interface using both, with an optional `note`.
4. Writes `describePayment(payment: Payment): string` using a `switch`.
5. Writes a generic `findById<T extends { id: number }>(items: T[], id: number): T | undefined`.
6. Imports those from `main.ts` using a **type-only import** for the types, finds an order, handles the `undefined` case, and logs its payment description.
7. Runs `npm run check` until it passes.
8. **Stretch:** add a fourth payment variant (`crypto`, with a `wallet` string) and observe what the compiler now tells you. Then clone the repo fresh and run `npm ci && npm run check`.

### Answer key

**1.** The interface is erased, so nothing remains in the JavaScript. No, TypeScript does not guarantee it: `as User` is an assertion that overrides the compiler. `JSON.parse` returns `any`, so the data is unchecked at runtime. Validating it needs a runtime check (hand-written, or a validation library).

**2.** `toUpperCase` does not exist on `number`, and with a union you may only use members valid for *every* option. Fix with narrowing:

```ts
function shout(value: string | number): string {
  return typeof value === "string" ? value.toUpperCase() : String(value);
}
```

A second acceptable fix: convert first, so the method is always called on a known type: `String(value).toUpperCase()`.

**3.** `a` is `number | undefined` and `b` is `string | undefined`. TypeScript infers `T` from the array contents. The return type includes `undefined` because the array could be empty, in which case `items[0]` has no value.

**4.** `strictNullChecks`. Fixes: narrow with a check (`s === null ? 0 : s.length`, or `if (s === null) return 0;`), or change the parameter to `string` so `null` can never be passed. (Optional chaining with a default, `s?.length ?? 0`, also works.) A non-null assertion (`s!.length`) silences the error but is unsafe, so it is the wrong answer here.

**5.** Version ranges in `package.json` (such as `^6.0.3`) let `npm install` resolve to different versions at different times. The fix is to **commit `package-lock.json`** so everyone installs identical versions, and the CI server should run **`npm ci`**.

**Orders module: reference solution**

```ts
// src/orders.ts
export type OrderStatus = "pending" | "shipped" | "delivered";

export type Payment =
  | { method: "card"; last4: string }
  | { method: "cash" }
  | { method: "transfer"; reference: string };

export interface Order {
  id: number;
  status: OrderStatus;
  total: number;
  payment: Payment;
  note?: string;
}

export function describePayment(payment: Payment): string {
  switch (payment.method) {
    case "card":
      return `Card ending in ${payment.last4}`;
    case "cash":
      return "Cash";
    case "transfer":
      return `Transfer, ref ${payment.reference}`;
  }
}

export function findById<T extends { id: number }>(
  items: T[],
  id: number,
): T | undefined {
  return items.find((item) => item.id === id);
}
```

```ts
// src/main.ts
import { describePayment, findById, type Order } from "./orders.js";

const orders: Order[] = [
  { id: 1, status: "shipped", total: 49.99, payment: { method: "card", last4: "4242" } },
  { id: 2, status: "pending", total: 12, payment: { method: "cash" } },
];

const order = findById(orders, 2);

if (order !== undefined) {
  console.log(describePayment(order.payment));
} else {
  console.log("Order not found");
}
```

What to look for in the stretch task: adding the `crypto` variant makes `describePayment` fail to compile with "Function lacks ending return statement and return type does not include 'undefined'", because the `switch` no longer covers every case. That is exhaustiveness checking working. (Adding the `never` default from Section 5 gives an even clearer error at the exact line.) Also note that `order` had to be checked for `undefined` before use, because `findById` honestly reports that an item may not be found.

---

## Summary Recap

- **Types are a compile-time safety net.** TypeScript checks your code, then erases the types. It never validates real data at runtime, so data from outside (APIs, JSON, user input) still needs runtime checking.
- **Model your data honestly.** Use `interface` for object shapes, `type` for unions and aliases, literal types for fixed sets of values, and `unknown` instead of `any` when you truly do not know.
- **Narrowing turns "maybe A or B" into "definitely A".** Use `typeof`, `in`, `instanceof`, and equality checks, favor discriminated unions with a shared tag, and use `never` so new cases cannot be forgotten. Avoid `as` and `!` as quick fixes.
- **Function signatures are contracts, and generics relate types within them.** Annotate parameters, be explicit about exported return types, and use a type parameter (`<T>`, with `extends` when needed) only when the output type depends on the input type.
- **Strict mode and ES modules are the baseline of a healthy project.** Keep `strict: true` (plus `noUncheckedIndexedAccess`), use `import type` for types, mind the `.js` extension rule under `nodenext`, and fix errors rather than suppressing them.
- **Automate quality and lock your dependencies.** Type-check, ESLint, and Prettier run from npm scripts, on save, and in CI, and the committed lockfile with `npm ci` makes every install identical on every machine.
