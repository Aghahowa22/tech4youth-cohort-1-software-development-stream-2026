# DOM Events & Asynchronous JavaScript
## The 9 Topics We'll Cover

**The learning path:** Callbacks → Promises → JSON → Fetch (GET) → Fetch (POST) → async/await → DOM & Events → Loading/Error/Retry States → Client Storage & Privacy
---

## 1. Callbacks
JavaScript is single-threaded, so slow tasks (timers, server requests) are handed off and finished later. A callback is a function passed into another function to run when that task is done. Nest too many and you get "callback hell", which is why Promises exist.

## 2. Promises
A Promise is a placeholder for a value that will arrive later. It is either pending, fulfilled or rejected. Use `.then()` and `.catch()` to react, chain them to keep steps flat, and use `Promise.all()` to run independent tasks in parallel.

## 3. JSON
The plain-text format browsers and servers use to exchange data. `JSON.stringify()` turns an object into a string before sending, and `JSON.parse()` turns a string back into an object after receiving. Remember the strict rules: double quotes and no trailing commas.

## 4. Fetching API Data (GET Requests)
`fetch()` retrieves data from a server and returns a Promise. It needs two `.then()` steps: one for the response, one to read the body. It only rejects on network failure, so always check `response.ok`, and use the Network tab to debug.

## 5. Sending JSON Data (POST Requests)
POST sends data *to* a server. It needs three things: `method: 'POST'`, a `Content-Type: application/json` header, and a `JSON.stringify()`'d body. Check `response.ok`, because a 400 or 422 will not trigger `.catch()`.

## 6. async/await
Cleaner syntax on top of Promises that makes async code read top to bottom. `async` marks the function and `await` pauses until a Promise settles. Handle errors with `try/catch/finally`, and still check `response.ok`.

## 7. DOM Selection, Safe Rendering & Events
Select elements with `querySelector` / `querySelectorAll`, and update them with `textContent` or `createElement()` rather than `innerHTML` to avoid XSS. Use `addEventListener` to respond to user actions, call `event.preventDefault()` on form submits, and validate input with clear feedback.

## 8. Loading, Error & Retry States
Every screen that loads data has four states: loading, success, empty and error. Show something meaningful in each, and give users a Retry button on failure that simply calls the load function again.

## 9. Client Storage & Privacy
`localStorage` persists until cleared; `sessionStorage` clears when the tab closes. Both store strings only, so use `JSON.stringify` / `JSON.parse` for objects. Never store passwords, tokens or sensitive data there; auth tokens belong in `httpOnly` cookies.










# DOM Events & Asynchronous JavaScript

## How the Modules Connect

```
Callbacks ──► Promises ──► async/await
                 │
                 ▼
              JSON  ──► Fetch (GET) ──► Fetch (POST)
                               │
                               ▼
                     HTTP + Network Tools
                               │
                               ▼
              DOM Selection & Safe Rendering
                               │
                               ▼
                    Events & Form Validation
                               │
                               ▼
              Loading / Error / Retry States
                               │
                               ▼
                    Client Storage & Privacy
```

Each layer depends on the one above it. Master callbacks before promises, promises before fetch, and fetch before building real UI states.

---



# MODULE 0 — JavaScript Modules (import & export)

>Every modern JavaScript project uses the module system to organise code into separate files. Understanding it first means students can split their async code, DOM logic, and API helpers into clean, reusable files from day one.

---

## Learning Objectives

By the end of this section, you will be able to:

1. Explain what a JavaScript module is and why splitting code into files improves a project.
2. Use `export` and `export default` to share values, functions, and objects from a file.
3. Use `import` to bring named and default exports into another file.
4. Add `type="module"` to a script tag and explain what it changes.
5. Avoid the most common module mistakes (missing `type="module"`, wrong paths, circular imports).

---

## Section Breakdown

### 0.1 — What Is a JavaScript Module?

**Plain-language definition:**
A **module** is simply a JavaScript file. What makes it a module is that it explicitly chooses what to *share* with other files (using `export`) and explicitly declares what it *needs* from other files (using `import`). Nothing in a module is visible to the outside world unless you export it.

**Why it matters:**
Without modules, all your JavaScript lives in one enormous file — or you load many `<script>` tags and everything shares the same global scope, causing name collisions and hard-to-trace bugs. Modules give every file its own private scope and make dependencies explicit and readable.

**Analogy:**
Think of modules like departments in a company. The Accounts department has its own files and processes (private scope). If another department needs a report from Accounts, they formally request it — Accounts *exports* that report. No other department can just walk in and grab files off the desk without that formal handoff. That's exactly what `export` and `import` do.

**Before modules (the old problem):**

```html
<!-- All three scripts share the SAME global scope -->
<script src="helpers.js"></script>  <!-- defines: function formatDate() -->
<script src="user.js"></script>     <!-- also defines: function formatDate() 💥 collision! -->
<script src="app.js"></script>
```

**With modules (the solution):**
Each file has its own scope. You choose exactly what to share and what to use.

---

### 0.2 — Exporting from a Module

**There are two types of exports:**

#### Named Exports
You can export multiple things from one file, each with its own name.

```javascript
// file: utils.js

// Export a constant
export const API_URL = 'https://api.example.com';

// Export a function
export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-GB');
}

// Export another function
export function capitalise(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Or: declare first, export at the bottom (preferred for readability)
function validateEmail(email) {
  return email.includes('@') && email.includes('.');
}

const MAX_RETRIES = 3;

export { validateEmail, MAX_RETRIES };
```

#### Default Export
Each file can have **one** default export — the "main thing" that file provides.

```javascript
// file: UserCard.js

function UserCard(user) {
  const card = document.createElement('div');
  card.className = 'user-card';
  card.textContent = user.name;
  return card;
}

export default UserCard; // one per file — no curly braces
```

**When to use which:**
| Use case                                                    | Export type      |
| ----------------------------------------------------------- | ---------------- |
| A file's primary, single purpose (a class, a main function) | `export default` |
| Utility files with many helpers                             | Named `export`   |
| Constants, config values                                    | Named `export`   |

---

### 0.3 — Importing into a Module

#### Importing Named Exports
Use curly braces `{}` and the **exact** exported name.

```javascript
// file: app.js

import { formatDate, capitalise, API_URL } from './utils.js';
// ↑ curly braces required          ↑ must include .js extension

console.log(API_URL);              // → 'https://api.example.com'
console.log(formatDate('2024-01-15')); // → '15/01/2024'
console.log(capitalise('hello'));  // → 'Hello'
```

#### Renaming on Import (alias)
```javascript
import { validateEmail as checkEmail } from './utils.js';
// Now use checkEmail() instead of validateEmail()
checkEmail('test@example.com'); // → true
```

#### Importing Default Exports
No curly braces — you choose the name yourself.

```javascript
// file: app.js

import UserCard from './UserCard.js'; // any name works for default
// import Card from './UserCard.js'; // this also works

const card = UserCard({ name: 'Amara' });
document.body.appendChild(card);
```

#### Importing Everything (Namespace import)
```javascript
import * as Utils from './utils.js';

Utils.formatDate('2024-01-15');
Utils.capitalise('hello');
console.log(Utils.API_URL);
```

#### Importing Both Default and Named from One File

```javascript
// file: api.js
export default async function fetchData(url) { /* ... */ }
export const BASE_URL = 'https://api.example.com';
export function buildURL(path) { return BASE_URL + path; }
```

```javascript
// file: app.js
import fetchData, { BASE_URL, buildURL } from './api.js';
//     ↑ default    ↑ named exports
```

---

### 0.4 — Using Modules in the Browser

**You must add `type="module"` to your script tag:**

```html
<!-- ❌ Without type="module" — import/export cause a SyntaxError -->
<script src="app.js"></script>

<!-- ✅ With type="module" — modules work correctly -->
<script type="module" src="app.js"></script>
```

**What `type="module"` changes:**
- `import`/`export` syntax is enabled
- The file gets its own private scope (no accidental globals)
- The script is **deferred by default** — runs after the HTML is fully parsed
- The browser only loads each module once, even if imported in multiple files

**Serving modules locally:**
Modules require files to be served over HTTP/HTTPS — they do not work when you open an HTML file directly with `file://`. Use a local development server (VS Code Live Server extension, or `npx serve`).

---

### 0.5 — A Real-World Module Structure

**How a small project using modules looks:**

```
project/
├── index.html
├── app.js          ← entry point (imported by index.html)
├── api.js          ← all fetch/API functions
├── utils.js        ← helper functions (formatDate, capitalise, etc.)
└── dom.js          ← functions that create/update DOM elements
```

```javascript
// file: api.js
const BASE_URL = 'https://api.example.com';

export async function getUsers() {
  const res = await fetch(`${BASE_URL}/users`);
  if (!res.ok) throw new Error('Failed to load users');
  return res.json();
}

export async function createUser(data) {
  const res = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create user');
  return res.json();
}
```

```javascript
// file: dom.js
export function renderUserCard(user) {
  const card = document.createElement('div');
  card.className = 'user-card';

  const name = document.createElement('h3');
  name.textContent = user.name; // safe — textContent, not innerHTML

  const email = document.createElement('p');
  email.textContent = user.email;

  card.appendChild(name);
  card.appendChild(email);
  return card;
}

export function showError(container, message) {
  container.innerHTML = '';
  const p = document.createElement('p');
  p.className = 'error';
  p.textContent = message;
  container.appendChild(p);
}
```

```javascript
// file: app.js  ← the entry point
import { getUsers } from './api.js';
import { renderUserCard, showError } from './dom.js';

const list = document.querySelector('#user-list');

async function init() {
  try {
    const users = await getUsers();
    users.forEach(user => list.appendChild(renderUserCard(user)));
  } catch (err) {
    showError(list, err.message);
  }
}

init();
```

```html
<!-- index.html -->
<div id="user-list"></div>
<script type="module" src="app.js"></script>
```

This structure means each file has one clear responsibility — easy to read, test, and update independently.

---

### 0.6 — Common Beginner Mistakes

**Mistake 1 — Missing `type="module"`:**
```html
<!-- ❌ Causes: Uncaught SyntaxError: Cannot use import statement in a non-module script -->
<script src="app.js"></script>

<!-- ✅ Fix: -->
<script type="module" src="app.js"></script>
```

**Mistake 2 — Missing the `.js` extension in import paths:**
```javascript
// ❌ Works in bundlers (Webpack, Vite) but NOT in the browser directly
import { formatDate } from './utils';

// ✅ Browser requires the full filename with extension
import { formatDate } from './utils.js';
```

**Mistake 3 — Using curly braces for a default import:**
```javascript
// ❌ Trying to import a default export with curly braces
import { UserCard } from './UserCard.js'; // → undefined or error

// ✅ Default imports have no curly braces
import UserCard from './UserCard.js';
```

**Mistake 4 — Multiple default exports in one file:**
```javascript
// ❌ SyntaxError — only one default export per file
export default function add() {}
export default function subtract() {} // error!

// ✅ Use named exports for multiple things
export function add() {}
export function subtract() {}
```

**Mistake 5 — Opening index.html directly (file:// protocol):**
Modules loaded via `file://` are blocked by browser security (CORS). Always use a local server.

---

## How Sub-sections Connect

`0.1` explains *why* modules exist and the problem they solve → `0.2` teaches how to *share* code (export) → `0.3` teaches how to *use* code from another file (import) → `0.4` shows how to enable modules in the browser → `0.5` demonstrates a complete real-world structure → `0.6` prevents the most common errors.

This module is the foundation everything else builds on — all subsequent modules (Callbacks, Promises, Fetch) should be written using the module pattern.

---


# MODULE 1 — Callbacks

## Learning Objectives

By the end of this section, you will be able to:

1. Explain in plain language why JavaScript needs a way to handle tasks that take time.
2. Write a function that accepts another function as an argument and calls it at the right moment.
3. Identify callback-based patterns in real code (e.g., `setTimeout`, event listeners).
4. Describe the problem with deeply nested callbacks ("callback hell") and why it was replaced.

---

## Section Breakdown

### 1.1 — Why JavaScript Runs One Thing at a Time

**Plain-language definition:**
JavaScript is *single-threaded*, meaning it can only do one thing at a time. It runs through your code line by line, top to bottom. If it hits a slow task (like loading an image or waiting for a server), it cannot pause and move on — unless you explicitly tell it to hand that task off and deal with the result *later*.

**Why it matters:**
Every interactive web page does slow things: it fetches data, reads files, waits for timers. Without a way to handle these asynchronously, your entire page would freeze until each slow task finished — a terrible experience for users.

**Analogy:**
Think of a restaurant waiter. A bad waiter stands at your table staring at you until your food is ready before helping anyone else. A good waiter takes your order, passes it to the kitchen, and immediately goes to serve other tables. When the food is ready, the kitchen *calls back* to the waiter. That's asynchronous programming.

**Common misconception:**
Beginners often think JavaScript is "doing two things at once." It isn't. It's handing tasks off to the browser's built-in tools (the Web APIs) and moving on. The browser calls back into JavaScript when those tasks are done.

---

### 1.2 — What Is a Callback Function?

**Plain-language definition:**
A callback is simply a function you pass *as an argument* to another function, to be called later — either after a delay, after an event, or after an operation finishes.

**Why it matters:**
Callbacks are the original mechanism JavaScript used for everything asynchronous. You'll see them in timers, event listeners, array methods (`.forEach`, `.map`), and older APIs. Understanding them is essential before learning Promises.

**Concrete example:**

```javascript
// A simple callback with setTimeout
function greetUser() {
  console.log("Hello! The page is ready.");
}

setTimeout(greetUser, 2000); // call greetUser after 2 seconds

console.log("This runs first!"); 
// Output:
// "This runs first!"
// (2 seconds later) "Hello! The page is ready."
```

**Another example — passing a callback to your own function:**

```javascript
function doMath(a, b, callback) {
  const result = a + b;
  callback(result); // call the function we were given
}

doMath(5, 3, function(answer) {
  console.log("The answer is:", answer); // → "The answer is: 8"
});
```

**Common beginner mistakes:**
- **Calling the function instead of passing it:** Writing `setTimeout(greetUser(), 2000)` instead of `setTimeout(greetUser, 2000)`. The `()` calls it immediately — you're passing its *return value*, not the function itself.
- **Forgetting the callback might not run immediately:** Writing code after the callback that assumes the callback has already finished.

---

### 1.3 — Callback Hell (and Why It's a Problem)

**Plain-language definition:**
When you need to do several async things in sequence, you end up nesting callbacks inside callbacks inside callbacks. This creates deeply indented, hard-to-read code nicknamed "callback hell" or "the pyramid of doom."

**Why it matters:**
Real apps chain multiple async steps: fetch a user, then fetch their orders, then fetch order details. With callbacks, this quickly becomes unreadable and error-prone.

**Example:**

```javascript
// Callback hell — hard to read and debug
getUser(userId, function(user) {
  getOrders(user.id, function(orders) {
    getOrderDetails(orders[0].id, function(details) {
      getShippingInfo(details.shipId, function(shipping) {
        console.log(shipping); // finally!
      });
    });
  });
});
```

**Common mistakes:**
- Mixing synchronous error handling (`try/catch`) with callbacks — it doesn't work. Each callback needs its own error handling.
- Not handling the error argument (conventional first argument in Node-style callbacks): `function(error, result) { }`.

---

## How Sub-sections Connect

`1.1` establishes *why* async exists → `1.2` shows the original solution (callbacks) → `1.3` shows the limitation of that solution, which motivates Module 2 (Promises).

---

## Key Terms Glossary

| Term                | Definition                                                                             |
| ------------------- | -------------------------------------------------------------------------------------- |
| **Single-threaded** | JavaScript can execute only one operation at a time                                    |
| **Asynchronous**    | A task that starts now but finishes later, without blocking other code                 |
| **Callback**        | A function passed as an argument to be called later                                    |
| **Web APIs**        | Browser-provided tools (timers, fetch, DOM events) that handle slow tasks outside JS   |
| **Callback hell**   | Deeply nested callbacks that make code hard to read and maintain                       |
| **`setTimeout`**    | A Web API function that delays execution of a callback by a set number of milliseconds |

---

## Knowledge Check

1. What is wrong with this code? `setTimeout(sayHello(), 1000)` — fix it and explain why.
2. Write a function `wait(ms, callback)` that calls the callback after `ms` milliseconds. Use it to log "Done!" after 3 seconds.
3. Why can't you use `try/catch` around an asynchronous callback to catch errors inside it?
4. Describe in your own words what "single-threaded" means and why it makes async code necessary.
5. **Scenario:** You need to load a user profile and then — only after it loads — load their posts. Write this using nested callbacks. Then describe one problem with your code.

---

## Summary Recap

- JavaScript is single-threaded: it runs one thing at a time, so slow tasks must be handled asynchronously.
- A callback is a function passed to another function to be called when a task is complete.
- Pass the function reference (`greetUser`), never call it immediately (`greetUser()`).
- Callbacks appear everywhere: `setTimeout`, `addEventListener`, `.forEach`, `.map`.
- Nesting multiple callbacks creates "callback hell" — deeply indented, hard-to-maintain code.
- This problem motivated the creation of Promises (next module).

---
---

# MODULE 2 — Promises

## Learning Objectives

By the end of this section, you will be able to:

1. Describe what a Promise is and the three states it can be in.
2. Use `.then()` and `.catch()` to handle the result of a Promise.
3. Chain multiple `.then()` calls to run async steps in sequence.
4. Use `Promise.all()` to run multiple async operations in parallel.
5. Explain how Promises are better than callbacks for async code.

---

## Section Breakdown

### 2.1 — What Is a Promise?

**Plain-language definition:**
A Promise is an object that represents the *eventual* result of an asynchronous operation. It is a placeholder for a value that doesn't exist yet but will at some point in the future — or will fail with a reason.

**Why it matters:**
Promises are the foundation of modern async JavaScript. The Fetch API, `async/await`, and most modern browser APIs all return Promises. You cannot use these tools without understanding Promises first.

**Analogy:**
Think of ordering a package online. The order confirmation is the Promise — it's proof that something is coming. Later, the package either *arrives* (fulfilled) or the delivery *fails* (rejected). You don't stand at the door waiting; you go about your day and act when it arrives.

**The three states:**
- **Pending** — the async operation is still in progress
- **Fulfilled** — the operation completed successfully (has a value)
- **Rejected** — the operation failed (has a reason/error)

Once a Promise settles (fulfilled or rejected) it never changes state again.

---

### 2.2 — Consuming a Promise: `.then()` and `.catch()`

**Plain-language definition:**
You consume a Promise (i.e., react to its result) using two methods:
- `.then(callback)` — runs when the Promise is fulfilled; receives the resolved value
- `.catch(callback)` — runs when the Promise is rejected; receives the error

**Why it matters:**
This is the most common pattern you'll see when using the Fetch API and other modern tools.

**Concrete example:**

```javascript
// Imagine fetchUserData() returns a Promise
fetchUserData(42)
  .then(function(user) {
    console.log("Got user:", user.name); // runs on success
  })
  .catch(function(error) {
    console.log("Something went wrong:", error.message); // runs on failure
  });
```

**Common beginner mistakes:**
- Forgetting `.catch()` entirely — unhandled rejections cause silent failures.
- Putting logic after the `.then()` block that assumes the data is already loaded (it isn't yet).
- Trying to `return` a value out of `.then()` and use it outside — you cannot "escape" a Promise.

---

### 2.3 — Chaining Promises

**Plain-language definition:**
When you `return` a value inside `.then()`, the next `.then()` in the chain receives it. This allows you to sequence async steps cleanly — without nesting.

**Why it matters:**
This is the solution to callback hell. Instead of nesting, you chain.

**Concrete example:**

```javascript
// Chained steps — flat and readable
getUser(userId)
  .then(function(user) {
    return getOrders(user.id); // return the next Promise
  })
  .then(function(orders) {
    return getOrderDetails(orders[0].id); // return again
  })
  .then(function(details) {
    console.log("Order details:", details);
  })
  .catch(function(error) {
    console.log("Error at any step:", error); // one catch handles all
  });
```

**Common beginner mistakes:**
- Forgetting to `return` inside `.then()` — the chain breaks and the next `.then()` gets `undefined`.
- Writing `return` but writing `return value` instead of `return promiseReturningFunction(value)`.

---

### 2.4 — Creating Your Own Promise

**Plain-language definition:**
You can create a Promise using `new Promise((resolve, reject) => { })`. Inside, you call `resolve(value)` on success or `reject(error)` on failure.

**Why it matters:**
Useful when wrapping older callback-based code into the Promise pattern.

**Concrete example:**

```javascript
function wait(ms) {
  return new Promise(function(resolve, reject) {
    if (ms < 0) {
      reject(new Error("Time cannot be negative"));
    } else {
      setTimeout(resolve, ms); // resolve with no value after ms
    }
  });
}

wait(2000)
  .then(function() { console.log("2 seconds passed!"); })
  .catch(function(err) { console.log(err.message); });
```

---

### 2.5 — Running Promises in Parallel: `Promise.all()`

**Plain-language definition:**
`Promise.all([p1, p2, p3])` takes an array of Promises and returns a new Promise that fulfills when *all* of them fulfill, or rejects as soon as *any one* of them rejects.

**Why it matters:**
When you need multiple pieces of data that don't depend on each other, fetching them one by one is wasteful. `Promise.all()` fires them all at once.

**Concrete example:**

```javascript
Promise.all([
  fetchUser(1),
  fetchProducts(),
  fetchSettings()
])
.then(function([user, products, settings]) {
  // all three arrived — destructure the array
  console.log(user, products, settings);
})
.catch(function(error) {
  console.log("One of the requests failed:", error);
});
```

**Common beginner mistakes:**
- Not realising that if *one* Promise rejects, the entire `Promise.all()` rejects immediately (even if the others succeed).
- Using `Promise.all()` when operations *do* depend on each other — chain them instead.

---

## How Sub-sections Connect

`2.1` defines the concept → `2.2` shows how to *use* a Promise → `2.3` shows how to *sequence* multiple Promises → `2.4` shows how to *create* one → `2.5` shows how to run several at once. Each builds directly on the last.

---

## Key Terms Glossary

| Term                | Definition                                                                      |
| ------------------- | ------------------------------------------------------------------------------- |
| **Promise**         | An object representing the eventual result of an async operation                |
| **Pending**         | A Promise that has not yet settled                                              |
| **Fulfilled**       | A Promise that completed successfully                                           |
| **Rejected**        | A Promise that failed                                                           |
| **`.then()`**       | Method called when a Promise fulfills; receives the resolved value              |
| **`.catch()`**      | Method called when a Promise rejects; receives the error                        |
| **`.finally()`**    | Method called regardless of outcome (useful for cleanup)                        |
| **`Promise.all()`** | Runs multiple Promises in parallel; resolves when all succeed                   |
| **Chaining**        | Returning a Promise from `.then()` to sequence async operations without nesting |

---

## Knowledge Check

1. A Promise is in the ______ state when it has neither succeeded nor failed yet.
2. What happens if you forget to `return` inside a `.then()` callback?
3. Write a Promise chain that: (a) fetches a product by ID, (b) fetches its category using the product's `categoryId`, (c) logs the category name.
4. **Scenario:** You're building a dashboard that needs a user's profile AND their notifications at the same time. Which method do you use and why?
5. What is the difference between `.catch()` at the end of a chain vs. a `.catch()` after each `.then()`?

---

## Summary Recap

- A Promise represents a future value — it's pending, then either fulfilled or rejected.
- Use `.then()` to handle success and `.catch()` to handle failure; always include `.catch()`.
- Chain Promises by returning a new Promise from inside `.then()` — keeps async steps flat and readable.
- Create Promises with `new Promise((resolve, reject) => {})` to wrap old callback code.
- Use `Promise.all()` to run independent async operations in parallel for better performance.
- One `.catch()` at the end of a chain handles errors from any step above it.

---
---

# MODULE 3 — JSON (JavaScript Object Notation)

## Learning Objectives

By the end of this section, you will be able to:

1. Explain what JSON is and why it is used to transfer data between systems.
2. Convert a JavaScript object to a JSON string using `JSON.stringify()`.
3. Convert a JSON string back to a JavaScript object using `JSON.parse()`.
4. Identify what JavaScript values cannot be included in JSON.
5. Safely parse JSON from untrusted sources with error handling.

---

## Section Breakdown

### 3.1 — What Is JSON?

**Plain-language definition:**
JSON (JavaScript Object Notation) is a text format for representing structured data. It looks almost identical to a JavaScript object literal but it is *plain text* — a string — and it has strict rules about what is allowed.

**Why it matters:**
When your browser talks to a server, both sides need to agree on how to represent data. JSON became the universal standard for this because it is lightweight, human-readable, and works in every programming language, not just JavaScript.

**Analogy:**
Think of JSON as a language-neutral "export format" for data — the same way a `.csv` file can be opened by Excel, Google Sheets, or any other tool. A JavaScript object only lives inside JavaScript; its JSON string form can travel over the internet and be understood by Python, Java, Ruby, or any other server.

---

### 3.2 — `JSON.stringify()` — Object to String

**Plain-language definition:**
`JSON.stringify(value)` converts a JavaScript value (usually an object or array) into a JSON-formatted string.

**Why it matters:**
Before sending data to a server in a POST request, you must convert it to a JSON string. The server receives text over the network, not JavaScript objects.

**Concrete example:**

```javascript
const user = {
  name: "Amara",
  age: 24,
  skills: ["HTML", "CSS", "JavaScript"],
  active: true
};

const jsonString = JSON.stringify(user);
console.log(jsonString);
// → '{"name":"Amara","age":24,"skills":["HTML","CSS","JavaScript"],"active":true}'

console.log(typeof jsonString); // → "string"
```

**Formatting for readability (pretty-print):**

```javascript
const pretty = JSON.stringify(user, null, 2); // 2-space indent
console.log(pretty);
/*
{
  "name": "Amara",
  "age": 24,
  "skills": [
    "HTML",
    "CSS",
    "JavaScript"
  ],
  "active": true
}
*/
```

**What gets dropped by `JSON.stringify()`:**
- `undefined` values
- Functions
- `Symbol` keys
- `NaN` and `Infinity` become `null`

---

### 3.3 — `JSON.parse()` — String to Object

**Plain-language definition:**
`JSON.parse(string)` converts a JSON string back into a JavaScript object or array that you can work with in your code.

**Why it matters:**
When a server sends your page data, it arrives as a string. Before you can access `data.name` or loop over `data.items`, you must parse it.

**Concrete example:**

```javascript
const jsonString = '{"name":"Amara","age":24,"active":true}';
const user = JSON.parse(jsonString);

console.log(user.name);    // → "Amara"
console.log(user.age + 1); // → 25 (it's a number, not a string)
```

**Always wrap `JSON.parse()` in a try/catch:**

```javascript
function safeParse(str) {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.error("Invalid JSON received:", error.message);
    return null;
  }
}
```

**Common beginner mistakes:**
- Forgetting that the input to `JSON.parse()` must be a valid JSON string — invalid JSON throws a `SyntaxError`.
- Trying to access properties on the raw string before parsing: `const name = response.name` — `response` is a string, it has no `.name`.
- Using single quotes in JSON manually — JSON requires *double* quotes for all strings and keys.

---

### 3.4 — JSON Rules: What's Different from JavaScript Objects

**The key differences:**

| Feature         | JavaScript Object           | JSON                           |
| --------------- | --------------------------- | ------------------------------ |
| Key quotes      | Optional: `{ name: "Ana" }` | Required: `{ "name": "Ana" }`  |
| String quotes   | Single or double            | Double only                    |
| Trailing commas | Allowed                     | **Not allowed — causes error** |
| Functions       | Allowed                     | **Not allowed**                |
| `undefined`     | Allowed                     | **Not allowed**                |
| Comments        | Allowed                     | **Not allowed**                |

---

## How Sub-sections Connect

`3.1` explains *what* JSON is and *why* it exists → `3.2` covers converting TO JSON (needed before sending to a server) → `3.3` covers converting FROM JSON (needed after receiving from a server) → `3.4` prevents the most common syntax errors students encounter.

---

## Key Terms Glossary

| Term                   | Definition                                                                  |
| ---------------------- | --------------------------------------------------------------------------- |
| **JSON**               | JavaScript Object Notation — a text format for representing structured data |
| **`JSON.stringify()`** | Converts a JS value into a JSON string                                      |
| **`JSON.parse()`**     | Converts a JSON string into a JS value                                      |
| **Serialization**      | Converting a data structure into a format that can be stored or transmitted |
| **Deserialization**    | Converting stored/transmitted data back into a usable structure             |
| **`SyntaxError`**      | Error thrown when `JSON.parse()` receives an invalid JSON string            |

---

## Knowledge Check

1. What does `JSON.stringify({ name: "Sam", greet: function() {} })` return? What happens to the function?
2. Write a function `toJSON(obj)` that converts any object to a JSON string, and a function `fromJSON(str)` that safely parses it.
3. Fix this broken JSON: `{ name: 'Sam', age: 30, }` — list every error.
4. Why must you parse JSON after receiving it from a server, even though it "looks like" a JavaScript object?
5. **Scenario:** A colleague logs `console.log(response)` and sees `'{"items":[1,2,3]}'` (a string). They try `response.items` and get `undefined`. Explain the bug and fix it.

---

## Summary Recap

- JSON is a plain-text data format used to transfer structured data between systems.
- `JSON.stringify()` converts a JavaScript value → JSON string (use before sending to a server).
- `JSON.parse()` converts a JSON string → JavaScript value (use after receiving from a server).
- JSON requires double quotes on all keys and string values; no trailing commas, no functions.
- `undefined`, functions, and Symbols are silently dropped by `JSON.stringify()`.
- Always wrap `JSON.parse()` in `try/catch` — invalid JSON throws a `SyntaxError`.

---
---

# MODULE 4 — Fetching API Data (GET Requests)

## Learning Objectives

By the end of this section, learners will be able to:

1. Explain what the Fetch API is and how a GET request works.
2. Write a `fetch()` call that retrieves data from a URL and logs the result.
3. Explain why `fetch()` requires two `.then()` calls and what each does.
4. Handle network errors and non-OK HTTP responses correctly.
5. Use the browser's Network tab to inspect a real fetch request.

---

## Section Breakdown

### 4.1 — What Is HTTP and What Is a GET Request?

**Plain-language definition:**
HTTP (Hypertext Transfer Protocol) is the set of rules browsers and servers use to communicate. A **GET** request is a message your browser sends to a server saying "please give me this data." The server responds with a status code and (usually) data.

**Key HTTP status codes to know:**

| Code                        | Meaning                           |
| --------------------------- | --------------------------------- |
| `200 OK`                    | Success — data is in the response |
| `404 Not Found`             | The URL doesn't exist             |
| `401 Unauthorized`          | You need to be logged in          |
| `403 Forbidden`             | You don't have permission         |
| `500 Internal Server Error` | Something broke on the server     |

---

### 4.2 — The Fetch API

**Plain-language definition:**
`fetch(url)` is a built-in browser function that sends an HTTP request and returns a **Promise** that resolves with a `Response` object.

**Why it matters:**
Fetch is the standard, modern way for web pages to communicate with servers. It replaced older, more verbose tools (like `XMLHttpRequest`) and is built into every modern browser.

**The two-step pattern:**

```javascript
fetch('https://jsonplaceholder.typicode.com/users/1')
  .then(function(response) {
    // Step 1: the response arrived, but the body is a stream — read it
    return response.json(); // returns another Promise
  })
  .then(function(data) {
    // Step 2: the body has been fully read and parsed
    console.log(data.name); // → "Leanne Graham"
  })
  .catch(function(error) {
    console.error("Network request failed:", error);
  });
```

**Why two `.then()` calls?**
The first resolves when the server *responds* (headers arrive). The body of the response is a stream that hasn't been fully read yet. Calling `response.json()` reads and parses the body — which is also asynchronous — so it returns another Promise.

---

### 4.3 — Handling Errors Properly

**Plain-language definition:**
`fetch()` only rejects (triggers `.catch()`) on **network failures** (e.g., no internet). It does NOT reject on bad HTTP status codes like 404 or 500. You must check `response.ok` manually.

**Why it matters:**
This is the single most common mistake students make with fetch. A 404 response is still a "successful" network request as far as `fetch()` is concerned.

**Correct error handling:**

```javascript
fetch('https://api.example.com/users/999')
  .then(function(response) {
    if (!response.ok) {
      // response.ok is true for 200-299 status codes only
      throw new Error('Request failed: ' + response.status);
    }
    return response.json();
  })
  .then(function(data) {
    console.log(data);
  })
  .catch(function(error) {
    // catches BOTH network failures AND our thrown error above
    console.error(error.message);
  });
```

---

### 4.4 — Using the Browser's Network Tab

**Why it matters:**
The Network tab in browser DevTools shows every HTTP request your page makes — the URL, method, status code, request headers, response headers, and full response body. It is your primary debugging tool for fetch issues.

**How to use it:**
1. Open DevTools (`F12` or right-click → Inspect)
2. Click the **Network** tab
3. Reload the page or trigger your fetch
4. Click on any request to see its details
5. The **Preview** or **Response** sub-tab shows the JSON

**Key things to look for:**
- Status code (is it 200?)
- Response body (is the JSON what you expected?)
- Request URL (did you spell it right?)
- Request headers (did the `Content-Type` get sent?)

---

## How Sub-sections Connect

`4.1` sets the foundation (HTTP vocabulary) → `4.2` introduces the tool (`fetch`) → `4.3` teaches correct error handling (the most critical skill) → `4.4` gives students the debugging tools to fix problems themselves.

---

## Key Terms Glossary

| Term                  | Definition                                                                            |
| --------------------- | ------------------------------------------------------------------------------------- |
| **HTTP**              | The protocol browsers and servers use to communicate                                  |
| **GET request**       | A request that retrieves data from a server without modifying it                      |
| **`fetch()`**         | Built-in browser API for making HTTP requests; returns a Promise                      |
| **`Response` object** | The object returned when a fetch Promise resolves; contains status, headers, and body |
| **`response.ok`**     | Boolean — `true` if the status code is 200–299                                        |
| **`response.json()`** | Reads the response body and parses it as JSON; returns a Promise                      |
| **Network tab**       | Browser DevTools panel showing all HTTP requests                                      |
| **Status code**       | A number the server sends to indicate the outcome of a request                        |

---

## Knowledge Check

1. Write a `fetch()` call to `https://api.example.com/products` that logs each product's name.
2. What does `response.ok` check and why is it necessary?
3. If the server returns a 500 error, does `fetch()` reject? What does it do instead?
4. **Scenario:** You write a fetch that always reaches `.then(data => ...)` but `data` is `undefined`. Using the Network tab, how would you investigate?
5. Explain in plain language why `fetch()` needs two `.then()` calls where one would seem to be enough.

---

## Summary Recap

- `fetch(url)` sends an HTTP GET request and returns a Promise.
- Use two `.then()` calls: the first gets the `Response`, the second reads and parses the body.
- `fetch()` only rejects on network failure — always check `response.ok` for bad status codes.
- Throw an error inside `.then()` if `response.ok` is false; your `.catch()` will handle it.
- The browser's Network tab shows every request, response, status code, and body.
- API data arrives as a string; `response.json()` parses it into a usable JavaScript object.

---
---

# MODULE 5 — Sending JSON Data (POST Requests)

## Learning Objectives

By the end of this section, learners will be able to:

1. Explain what a POST request is and how it differs from GET.
2. Write a `fetch()` POST request with the correct method, headers, and JSON body.
3. Use `JSON.stringify()` correctly before sending data.
4. Handle the server's response to a POST request.
5. Identify common mistakes in fetch POST requests.

---

## Section Breakdown

### 5.1 — What Is a POST Request?

**Plain-language definition:**
A **POST** request sends data *to* a server, asking it to create or process something. Unlike GET (which just retrieves), POST includes a **body** — the data you are sending.

**Common use cases:**
- Submitting a login form (sending username + password)
- Creating a new user account
- Adding a product to a cart
- Saving a blog post

---

### 5.2 — The Fetch POST Pattern

**The three required pieces for a POST request:**
1. `method: 'POST'` — tells the server this is not a retrieval
2. `headers: { 'Content-Type': 'application/json' }` — tells the server the body is JSON
3. `body: JSON.stringify(data)` — the actual data, converted to a string

**Concrete example:**

```javascript
const newUser = {
  name: "Tunde Adeyemi",
  email: "tunde@example.com",
  role: "student"
};

fetch('https://api.example.com/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(newUser)
})
  .then(function(response) {
    if (!response.ok) {
      throw new Error('Could not create user: ' + response.status);
    }
    return response.json(); // server usually returns the created object
  })
  .then(function(createdUser) {
    console.log("Created:", createdUser);
    console.log("New user ID:", createdUser.id);
  })
  .catch(function(error) {
    console.error("Error:", error.message);
  });
```

---

### 5.3 — Reading the Server's Response to a POST

**Plain-language definition:**
Most APIs respond to a POST request with the newly created record (including its server-assigned ID) and a status code of `201 Created`. Always read the response body — it usually contains information you need, like the new record's ID.

**Common response status codes for POST:**

| Code                       | Meaning                                        |
| -------------------------- | ---------------------------------------------- |
| `201 Created`              | Success — a new resource was created           |
| `200 OK`                   | Success — some APIs use 200 for POST too       |
| `400 Bad Request`          | You sent invalid or incomplete data            |
| `422 Unprocessable Entity` | Validation failed (e.g., email already exists) |
| `401 Unauthorized`         | Not logged in                                  |

---

### 5.4 — Common POST Request Mistakes

**Mistake 1 — Sending the object directly (not stringified):**

```javascript
// ❌ Wrong — body must be a string
body: newUser

// ✅ Correct
body: JSON.stringify(newUser)
```

**Mistake 2 — Missing the Content-Type header:**
```javascript
// ❌ Without this header, the server may not know how to read the body
// and will return 400 or 415

// ✅ Always include for JSON
headers: { 'Content-Type': 'application/json' }
```

**Mistake 3 — Checking only `.catch()` for errors (not `response.ok`):**
A 400 or 422 error will NOT trigger `.catch()`. Check `response.ok` in the first `.then()`.

---

## How Sub-sections Connect

`5.1` defines what POST is → `5.2` shows the complete code pattern → `5.3` shows how to read what the server sends back → `5.4` prevents the most common bugs. All build on Module 3 (JSON) and Module 4 (fetch GET).

---

## Key Terms Glossary

| Term                  | Definition                                                                 |
| --------------------- | -------------------------------------------------------------------------- |
| **POST request**      | An HTTP request that sends data to a server to create or process something |
| **Request body**      | The data payload included in a POST (or PUT/PATCH) request                 |
| **`Content-Type`**    | A header telling the server what format the request body is in             |
| **`201 Created`**     | HTTP status indicating a resource was successfully created                 |
| **`400 Bad Request`** | HTTP status indicating the request data was invalid or malformed           |

---

## Knowledge Check

1. What are the three required parts of a fetch POST request that a GET request doesn't need?
2. Why must you call `JSON.stringify()` on your data before putting it in the `body`?
3. A server returns a `400` status to your POST request. Does `.catch()` run? What should you do?
4. **Scenario:** Write a `createProduct(name, price)` function that POSTs to `/api/products` and returns the server's created product object (including its new ID).
5. What does the `Content-Type: application/json` header tell the server?

---

## Summary Recap

- POST requests send data *to* a server (GET requests retrieve data *from* a server).
- Always include: `method: 'POST'`, `headers: { 'Content-Type': 'application/json' }`, and `body: JSON.stringify(data)`.
- The `body` must be a string — use `JSON.stringify()` before assigning it.
- Check `response.ok` in your first `.then()` — POST errors (400, 422) won't trigger `.catch()`.
- The server's response usually contains the newly created object, including its server-assigned ID.
- Test POST requests in the Network tab to see what you actually sent and what the server returned.

---
---

# MODULE 6 — async/await

## Learning Objectives

By the end of this section, learners will be able to:

1. Explain that `async/await` is syntax built on top of Promises — not a replacement.
2. Convert a Promise chain into equivalent `async/await` code.
3. Use `try/catch/finally` to handle errors in async functions.
4. Identify and explain the purpose of the `await` keyword.
5. Explain what happens if you use `await` outside an `async` function.

---

## Section Breakdown

### 6.1 — What Is async/await?

**Plain-language definition:**
`async/await` is special JavaScript syntax that lets you write asynchronous code in a way that *looks and reads like* synchronous code. Under the hood, it still uses Promises — it is purely a cleaner way to write the same thing.

**Why it matters:**
Long Promise chains become hard to read. `async/await` makes async code look linear and sequential — much easier for beginners (and professionals) to follow.

**The two keywords:**
- `async` — placed before a function declaration; makes the function always return a Promise
- `await` — placed before a Promise inside an `async` function; *pauses* the function until the Promise settles

---

### 6.2 — Converting a Promise Chain to async/await

**Same operation, two styles:**

```javascript
// ── Promise chain style ─────────────────────────────────
function loadUser(id) {
  return fetch(`/api/users/${id}`)
    .then(res => res.json())
    .then(user => {
      console.log(user.name);
      return user;
    })
    .catch(err => console.error(err));
}

// ── async/await style ───────────────────────────────────
async function loadUser(id) {
  try {
    const res  = await fetch(`/api/users/${id}`);
    const user = await res.json();
    console.log(user.name);
    return user;
  } catch (err) {
    console.error(err);
  }
}
```

Both are identical in behaviour. The `async/await` version reads top to bottom like normal code.

---

### 6.3 — Error Handling with try/catch

**Plain-language definition:**
Inside an `async` function, you wrap `await` calls in `try { } catch (error) { }`. If any awaited Promise rejects, execution jumps to the `catch` block — exactly like a thrown error in synchronous code.

**Full pattern:**

```javascript
async function createUser(userData) {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const newUser = await response.json();
    console.log("Created user with ID:", newUser.id);
    return newUser;

  } catch (error) {
    console.error("Failed to create user:", error.message);
    return null;
  } finally {
    console.log("Request attempt finished."); // always runs
  }
}
```

**Common beginner mistakes:**
- Using `await` outside an `async` function — causes a `SyntaxError`.
- Forgetting `await` before a Promise — you get the Promise object itself, not its value.
- Not checking `response.ok` — the same mistake as with `.then()` chains.
- Wrapping everything in one huge `try/catch` with no granular error handling.

---

## Key Terms Glossary

| Term            | Definition                                                                         |
| --------------- | ---------------------------------------------------------------------------------- |
| **`async`**     | Keyword that makes a function return a Promise and enables `await` inside it       |
| **`await`**     | Pauses an async function until the Promise resolves; returns the resolved value    |
| **`try/catch`** | Syntax for handling errors: `try` runs the code, `catch` handles any thrown errors |
| **`finally`**   | Block that runs after `try/catch` regardless of success or failure                 |

---

## Knowledge Check

1. Rewrite this Promise chain using `async/await`: `fetch('/api/data').then(r => r.json()).then(d => console.log(d)).catch(console.error)`.
2. What is the return value of an `async` function that `return`s the string `"hello"`?
3. What happens if you write `await fetch(url)` inside a regular (non-async) function?
4. Why is `try/catch` used with `async/await` instead of `.catch()`?
5. **Scenario:** Your `async` function awaits three API calls in sequence. The second one fails. What happens?

---

## Summary Recap

- `async/await` is syntax sugar over Promises — it makes async code look synchronous.
- Mark a function `async` to use `await` inside it; it always returns a Promise.
- `await` pauses execution until the Promise settles, then gives you the resolved value.
- Replace `.catch()` with `try/catch/finally` for clean error handling.
- Still check `response.ok` after `await fetch(...)` — await does not solve this.
- An `async` function that `return`s a value automatically wraps it in `Promise.resolve()`.

---
---

# MODULE 7 — DOM Selection, Safe Rendering & Events

## Learning Objectives

By the end of this section, learners will be able to:

1. Select DOM elements using `querySelector` and `querySelectorAll`.
2. Update page content safely (avoiding XSS) using `textContent` and `createElement`.
3. Attach event listeners to elements and respond to user interactions.
4. Build and validate an HTML form using JavaScript.
5. Display success and error feedback messages to the user.

---

## Section Breakdown

### 7.1 — DOM Selection

**Plain-language definition:**
The DOM (Document Object Model) is the browser's live representation of your HTML as a tree of objects you can read and modify with JavaScript. **Selecting** a DOM element means getting a reference to an HTML element so you can change it, read it, or listen for events on it.

**The essential selectors:**

```javascript
// Get ONE element (first match)
const title     = document.querySelector('h1');
const loginBtn  = document.querySelector('#login-btn');       // by ID
const card      = document.querySelector('.product-card');    // by class
const firstInput = document.querySelector('input[type="email"]'); // by attribute

// Get ALL matching elements (returns a NodeList)
const allButtons = document.querySelectorAll('button');
const allCards   = document.querySelectorAll('.card');

// Loop over them
allCards.forEach(function(card) {
  console.log(card.textContent);
});
```

**Common beginner mistakes:**
- Using `getElementById()`, `getElementsByClassName()` — prefer `querySelector` for consistency.
- Forgetting `#` for IDs and `.` for classes.
- Running the script before the DOM loads — put `<script>` at the end of `<body>` or use `DOMContentLoaded`.

---

### 7.2 — Updating the DOM Safely

**Plain-language definition:**
You can change what's displayed on a page by modifying DOM element properties. However, how you set content matters — the wrong method opens your site to **Cross-Site Scripting (XSS)** attacks.

**Safe methods:**

```javascript
const title = document.querySelector('h1');

// ✅ SAFE — sets plain text, HTML tags are treated as literal text
title.textContent = 'Welcome, Amara!';

// ✅ SAFE — building elements programmatically
const li = document.createElement('li');
li.textContent = userData.name; // never insert user input as HTML
document.querySelector('#user-list').appendChild(li);
```

**The dangerous method — avoid with user data:**

```javascript
// ❌ DANGEROUS — if content comes from a user or API, this can execute scripts
element.innerHTML = userData.bio;

// Only use innerHTML with content YOU fully control (static strings)
// Never use it with data from APIs, forms, or URL parameters
```

**Why XSS matters:**
If a malicious user submits `<script>alert('hacked')</script>` as their name, and you render it with `.innerHTML`, that script runs in every other user's browser. Using `.textContent` or `createElement` prevents this entirely.

---

### 7.3 — Event Listeners

**Plain-language definition:**
An event listener is a function you attach to an element that runs when a specific thing happens — a click, a key press, a form submission, a mouse hover.

**The pattern:**

```javascript
const button = document.querySelector('#submit-btn');

button.addEventListener('click', function(event) {
  console.log('Button was clicked!');
  console.log('The button text is:', event.target.textContent);
});
```

**Common events to know:**

| Event              | Fires when...                                  |
| ------------------ | ---------------------------------------------- |
| `click`            | User clicks an element                         |
| `submit`           | A form is submitted                            |
| `input`            | A form field's value changes (every keystroke) |
| `change`           | A field's value changes and loses focus        |
| `keydown`          | A key is pressed                               |
| `DOMContentLoaded` | The DOM is fully loaded and ready              |

**The `event` object:**
- `event.target` — the element that was interacted with
- `event.preventDefault()` — stops the default browser action (e.g., stops a form from refreshing the page)

---

### 7.4 — Form Validation and Feedback

**Plain-language definition:**
Form validation is the process of checking that user input is correct *before* sending it to a server. Feedback messages tell the user what went wrong or right.

**Full example — login form with validation and feedback:**

```html
<form id="login-form">
  <input type="email"    id="email"    placeholder="Email" />
  <input type="password" id="password" placeholder="Password" />
  <button type="submit">Log In</button>
  <p id="feedback"></p>
</form>
```

```javascript
const form     = document.querySelector('#login-form');
const feedback = document.querySelector('#feedback');

form.addEventListener('submit', async function(event) {
  event.preventDefault(); // stop the page from reloading

  const email    = document.querySelector('#email').value.trim();
  const password = document.querySelector('#password').value;

  // Clear previous feedback
  feedback.textContent = '';
  feedback.className   = '';

  // Validate
  if (!email) {
    showError('Please enter your email address.');
    return;
  }
  if (!email.includes('@')) {
    showError('Please enter a valid email address.');
    return;
  }
  if (password.length < 6) {
    showError('Password must be at least 6 characters.');
    return;
  }

  // Submit
  try {
    showLoading('Logging in...');
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) throw new Error('Invalid email or password.');
    
    const data = await res.json();
    showSuccess('Welcome back, ' + data.name + '!');

  } catch (error) {
    showError(error.message);
  }
});

function showError(message) {
  feedback.textContent = message;
  feedback.className   = 'error';
}

function showSuccess(message) {
  feedback.textContent = message;
  feedback.className   = 'success';
}

function showLoading(message) {
  feedback.textContent = message;
  feedback.className   = 'loading';
}
```

**Common beginner mistakes:**
- Not calling `event.preventDefault()` on form submit — the page refreshes and your JS code never runs.
- Forgetting `.trim()` on text inputs — `"   "` (spaces) passes a non-empty check but is not valid.
- Showing raw API error messages from the server directly to users — always write user-friendly messages.

---

## Key Terms Glossary

| Term                         | Definition                                                             |
| ---------------------------- | ---------------------------------------------------------------------- |
| **DOM**                      | Document Object Model — the browser's live tree of HTML elements       |
| **`querySelector()`**        | Selects the first element matching a CSS selector                      |
| **`querySelectorAll()`**     | Selects all elements matching a CSS selector; returns a NodeList       |
| **`textContent`**            | Reads or sets the text content of an element (safely, no HTML parsing) |
| **`innerHTML`**              | Reads or sets an element's HTML content — dangerous with user data     |
| **`createElement()`**        | Creates a new DOM element programmatically                             |
| **`addEventListener()`**     | Attaches a function to an element to run when an event fires           |
| **`event.preventDefault()`** | Stops the browser's default behaviour for an event                     |
| **XSS**                      | Cross-Site Scripting — injecting malicious scripts via user input      |
| **Form validation**          | Checking input data meets requirements before submitting it            |

---

## Knowledge Check

1. What is the difference between `textContent` and `innerHTML`? When should you never use `innerHTML`?
2. Write JavaScript that listens for a click on `#delete-btn` and logs the value of a `data-id` attribute on that button.
3. Why must you call `event.preventDefault()` when handling a form's `submit` event?
4. What does `.trim()` do and why is it important for form input?
5. **Scenario:** A user submits a form. Your validation passes. You send a POST request. The server returns `422`. The page shows no feedback. Find and fix all bugs.

---

## Summary Recap

- Use `querySelector` and `querySelectorAll` to select DOM elements by any CSS selector.
- Use `.textContent` or `createElement()` to update the page — never `innerHTML` with user-provided data.
- Attach behaviour with `addEventListener(event, callback)`.
- Always call `event.preventDefault()` on form submissions to stop the page from reloading.
- Validate all inputs before sending — check empty fields, format (email, length), and range.
- Always show clear feedback: loading state while waiting, success on completion, error on failure.

---
---

# MODULE 8 — Loading, Error & Retry States; Client Storage

## Learning Objectives

By the end of this section, learners will be able to:

1. Implement the four UI states an async operation produces: loading, empty, success, and error.
2. Build a retry button that lets users re-attempt a failed request.
3. Store and retrieve simple data from `localStorage` and `sessionStorage`.
4. Explain the privacy limitations of client-side storage and what should never be stored there.
5. Choose between `localStorage` and `sessionStorage` appropriately.

---

## Section Breakdown

### 8.1 — The Four Application States

**Plain-language definition:**
Any screen that loads data from an API can be in exactly one of four states at any time. Good UI design accounts for all four and shows the user something meaningful in each.

| State       | Description                               | What to show                                   |
| ----------- | ----------------------------------------- | ---------------------------------------------- |
| **Loading** | Request is in flight                      | Spinner, skeleton screen, or "Loading..." text |
| **Success** | Data arrived and is not empty             | The actual content                             |
| **Empty**   | Data arrived but the list/result is empty | "No results found" message, or a CTA           |
| **Error**   | Request failed for any reason             | Error message + retry button                   |

**Why it matters:**
A page that shows nothing while loading, or goes blank on error, feels broken. Handling all four states is what separates a professional app from a beginner's project.

---

### 8.2 — Implementing All Four States

**Complete pattern:**

```javascript
const container = document.querySelector('#product-list');

async function loadProducts() {
  // ── LOADING STATE ──────────────────────────────────────
  container.innerHTML = '<p class="loading">Loading products...</p>';

  try {
    const res = await fetch('/api/products');

    if (!res.ok) throw new Error(`Failed to load: ${res.status}`);

    const products = await res.json();

    // ── EMPTY STATE ────────────────────────────────────────
    if (products.length === 0) {
      container.innerHTML = '<p class="empty">No products available yet.</p>';
      return;
    }

    // ── SUCCESS STATE ──────────────────────────────────────
    container.innerHTML = ''; // clear loading
    products.forEach(function(product) {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.textContent = product.name; // safe — no innerHTML with data
      container.appendChild(card);
    });

  } catch (error) {
    // ── ERROR STATE ────────────────────────────────────────
    container.innerHTML = `
      <p class="error">Could not load products. ${error.message}</p>
      <button id="retry-btn">Try Again</button>
    `;
    document.querySelector('#retry-btn').addEventListener('click', loadProducts);
  }
}

loadProducts(); // call on page load
```

**Note on innerHTML here:** The error template string above uses `innerHTML` — this is acceptable *only* because the content (`error.message`) is your own application's error message, not user input or raw API data. Never put API response bodies or form input inside `innerHTML`.

---

### 8.3 — Client-Side Storage: localStorage and sessionStorage

**Plain-language definition:**
Browsers give you two simple key-value stores for saving data on the user's device:
- **`localStorage`** — persists until manually cleared (survives browser close/reopen)
- **`sessionStorage`** — cleared when the browser tab closes

Both store strings only (use `JSON.stringify/parse` for objects).

**The API:**

```javascript
// ── localStorage ─────────────────────────────────────────
localStorage.setItem('theme', 'dark');
const theme = localStorage.getItem('theme'); // → 'dark'
localStorage.removeItem('theme');
localStorage.clear(); // removes everything

// ── Storing objects ──────────────────────────────────────
const preferences = { theme: 'dark', language: 'en' };
localStorage.setItem('prefs', JSON.stringify(preferences));

const saved = JSON.parse(localStorage.getItem('prefs'));
console.log(saved.theme); // → 'dark'

// ── sessionStorage (same API, different lifetime) ────────
sessionStorage.setItem('currentStep', '2');
const step = sessionStorage.getItem('currentStep'); // gone when tab closes
```

---

### 8.4 — Privacy Limits: What NOT to Store Client-Side

**Critical rule: Never store sensitive data in `localStorage` or `sessionStorage`.**

These stores are accessible to any JavaScript on the page — including third-party scripts, analytics tools, and injected scripts from browser extensions.

**Never store:**
- Passwords
- Authentication tokens (JWTs, session tokens) — store securely in `httpOnly` cookies instead
- Credit card numbers or financial data
- Personal health information
- Any data that would cause harm if stolen

**Safe to store:**
- UI preferences (dark mode, language, font size)
- Non-sensitive cached data (last-searched city, saved draft text)
- Feature flags or settings
- Shopping cart items (for convenience, but not payment info)

**Storage limits and caveats:**
- Approximately **5–10 MB** per origin (varies by browser)
- Synchronous (blocking) — don't store large datasets
- Not shared between different domains
- Not accessible in private/incognito mode across sessions

---

## How Sub-sections Connect

`8.1` introduces the concept of four states → `8.2` shows the complete code implementing all four → `8.3` introduces client storage as a tool that complements these states (e.g., caching data, remembering preferences) → `8.4` teaches the critical security boundary.

---

## Key Terms Glossary

| Term                  | Definition                                                                          |
| --------------------- | ----------------------------------------------------------------------------------- |
| **Loading state**     | UI state while an async request is in progress                                      |
| **Empty state**       | UI state when a request succeeds but returns no data                                |
| **Error state**       | UI state when a request fails; should include a retry option                        |
| **Retry**             | Re-attempting a failed operation, usually triggered by user action                  |
| **`localStorage`**    | Browser key-value store that persists until manually cleared                        |
| **`sessionStorage`**  | Browser key-value store cleared when the tab closes                                 |
| **`httpOnly` cookie** | A cookie inaccessible to JavaScript — the correct place for auth tokens             |
| **XSS**               | Cross-Site Scripting — reason why sensitive data in localStorage is a security risk |

---

## Knowledge Check

1. Name the four UI states an async data-fetching screen can be in and what the user should see in each.
2. What is the difference between `localStorage` and `sessionStorage`?
3. Why should you never store a JWT authentication token in `localStorage`?
4. **Scenario:** You build a product list page. On load: (a) nothing renders for 3 seconds, then (b) an empty `<div>` appears, then (c) on a bad connection the page is completely blank. Fix all three problems.
5. Write code that saves a user's chosen language to `localStorage` and reads it back when the page loads (defaulting to `'en'` if nothing is saved).

---

## Summary Recap

- Every async UI has four states: loading, success, empty, and error — design for all four.
- Show loading feedback immediately; show an error message + retry button if the request fails.
- A retry button calls the same load function again — simple and effective.
- `localStorage` persists across sessions; `sessionStorage` clears when the tab closes — both store strings only.
- Wrap stored objects with `JSON.stringify()` on save and `JSON.parse()` on load.
- Never store passwords, tokens, or sensitive personal data in browser storage — use `httpOnly` cookies for auth.

---

---

# MASTER GLOSSARY — Full Module Reference

| Term                     | Definition                                                          |
| ------------------------ | ------------------------------------------------------------------- |
| **Asynchronous**         | Code that starts now but finishes later without blocking other code |
| **Callback**             | A function passed as an argument, to be called later                |
| **Callback hell**        | Deeply nested callbacks that make code hard to read                 |
| **Promise**              | An object representing the eventual result of an async operation    |
| **Pending**              | A Promise not yet settled                                           |
| **Fulfilled**            | A Promise that completed successfully                               |
| **Rejected**             | A Promise that failed                                               |
| **`.then()`**            | Handles a Promise's success                                         |
| **`.catch()`**           | Handles a Promise's failure                                         |
| **`async`**              | Keyword making a function always return a Promise                   |
| **`await`**              | Pauses an async function until a Promise resolves                   |
| **JSON**                 | Text format for structured data used between systems                |
| **`JSON.stringify()`**   | Converts JS value → JSON string                                     |
| **`JSON.parse()`**       | Converts JSON string → JS value                                     |
| **HTTP**                 | Protocol browsers and servers use to communicate                    |
| **GET request**          | Retrieves data from a server                                        |
| **POST request**         | Sends data to a server                                              |
| **`fetch()`**            | Built-in browser API for HTTP requests                              |
| **`response.ok`**        | True if HTTP status is 200–299                                      |
| **Status code**          | Number indicating the outcome of an HTTP request                    |
| **DOM**                  | Browser's live object tree of HTML elements                         |
| **`querySelector()`**    | Selects first matching DOM element                                  |
| **`textContent`**        | Safely sets element text (no HTML parsing)                          |
| **`innerHTML`**          | Sets HTML content — dangerous with user data                        |
| **`addEventListener()`** | Attaches a callback to fire on a DOM event                          |
| **XSS**                  | Cross-Site Scripting — malicious script injection via user input    |
| **Form validation**      | Checking input before submitting                                    |
| **Loading state**        | UI while async request is in progress                               |
| **Empty state**          | UI when successful but no data exists                               |
| **Error state**          | UI when request fails                                               |
| **`localStorage`**       | Browser storage persisting until cleared                            |
| **`sessionStorage`**     | Browser storage cleared on tab close                                |
| **`httpOnly` cookie**    | Server-set cookie inaccessible to JS — correct place for tokens     |


---

## Key Terms Glossary

| Term                 | Definition                                                                            |
| -------------------- | ------------------------------------------------------------------------------------- |
| **Module**           | A JavaScript file with its own private scope that explicitly exports and imports      |
| **`export`**         | Keyword that makes a value, function, or class available to other files               |
| **`export default`** | Exports one primary value from a file; each file can have only one                    |
| **Named export**     | An export with an explicit name; imported with `{}` using that exact name             |
| **`import`**         | Keyword that brings exported values from another module into the current file         |
| **Import alias**     | Renaming an import with `as`: `import { fn as myFn } from './file.js'`                |
| **Namespace import** | `import * as Name` — imports all named exports as properties of one object            |
| **`type="module"`**  | HTML attribute on `<script>` that enables ES module syntax                            |
| **Entry point**      | The first file the browser loads; it imports everything else (commonly `app.js`)      |
| **Circular import**  | File A imports from File B, and File B imports from File A — usually a design mistake |

---

## Knowledge Check

1. What is the difference between a named export and a default export? When would you use each?
2. Fix this broken import: `import UserCard from './UserCard.js'` is returning `undefined`. The file uses `export function UserCard() {}`. What is wrong and how do you fix it?
3. You open your project in the browser and see: *"Cannot use import statement outside a module"*. What is the cause and what is the fix?
4. Write a module `maths.js` that exports three named functions: `add(a, b)`, `subtract(a, b)`, `multiply(a, b)`. Then write `app.js` that imports all three and logs the results of calling each.
5. **Scenario:** A classmate says "I just put all my JavaScript in one file so I don't have to deal with imports." List two concrete problems they will run into as the project grows.

---

## Summary Recap

- A module is a JavaScript file with its own private scope — nothing leaks to the global scope unless exported.
- Use named `export` for utility files with multiple functions; use `export default` for a file's single main purpose.
- Import named exports with curly braces `{ }` and the exact name; import default exports without curly braces.
- Add `type="module"` to your `<script>` tag — without it, `import`/`export` cause a syntax error.
- Always include the `.js` extension in import paths when working directly in the browser.
- Modules must be served over HTTP (use a local dev server) — they do not work with `file://` URLs.
- Structure projects into focused files (`api.js`, `dom.js`, `utils.js`, `app.js`) for clean, maintainable code.