# JavaScript Teaching Notes

Sep 28, 2026 · @Emmanuel Omonz

A 14-lesson JavaScript curriculum with teaching notes and runnable code examples, covering the language from first principles through browser basics.

## Lesson 1: What Is JavaScript?

**Teaching points**

- JavaScript is a high-level, interpreted (JIT-compiled) programming language. It was created in 1995 by Brendan Eich in 10 days at Netscape, originally named Mocha, then LiveScript, then JavaScript for marketing reasons (no real relation to Java).
- It is one of the three core web technologies alongside HTML (structure) and CSS (presentation). JavaScript adds behavior and interactivity.
- Standardized as **ECMAScript** (ES) by ECMA International. Version history worth knowing: ES5 (2009), ES6/ES2015 (major update: let/const, arrow functions, classes, promises), then yearly releases (ES2016, ES2017 ... up to ES2027, the current edition in development).
- JavaScript today runs almost everywhere, not just in browsers:
  - **Browser** — client-side scripting (what most beginners start with)
  - **Node.js** — server-side JavaScript, command-line tools
  - **React Native / Electron** — mobile and desktop apps
  - **Deno / Bun** — modern alternative runtimes
- Key characteristics: dynamically typed, single-threaded with an event loop (non-blocking async model), prototype-based object orientation, multi-paradigm (supports procedural, object-oriented, and functional styles).

**Talking point for class**: Ask students to open any website, right-click, and choose "Inspect" then the "Console" tab. Have them type `alert('Hello, class!')` and press Enter. This is their first line of JavaScript and it already changes what the page does — that's the core idea of the whole course.

**No code to run yet** — this lesson is conceptual. Move to Lesson 2 for the first runnable code.

## Lesson 2: Running JavaScript, JavaScript Programs

**Teaching points — three ways to run JS**

1. **Browser DevTools Console** — fastest way to try one-liners. F12 or right-click → Inspect → Console.
2. **Inside an HTML file** with a `<script>` tag — this is how JS reaches a real web page.
3. **Node.js** — run a `.js` file directly from the terminal with `node filename.js`. This is how JS runs outside the browser (servers, tools, scripts).

**Example: script embedded in HTML**

```html
<!DOCTYPE html>
<html>
<head>
  <title>My First JS Page</title>
</head>
<body>
  <h1>Hello!</h1>

  <!-- Best practice: place scripts at the end of body,
       or use the defer attribute, so the page loads first -->
  <script>
    console.log('Page has loaded!');
    document.querySelector('h1').style.color = 'blue';
  </script>
</body>
</html>
```

**Example: external script file** (preferred for real projects)

```html
<script src="app.js" defer></script>
```

```js
// app.js
console.log('Loaded from an external file');
```

**Example: running with Node.js**

```js
// hello.js
console.log('Hello from Node.js!');
```

```bash
node hello.js
# Hello from Node.js!
```

**A JavaScript "program"** is simply a sequence of statements executed top to bottom (with control flow — loops, conditions, functions — changing that order). The engine reads the file, parses it, and executes it line by line.

**Class exercise**: create `hello.js` with `console.log('It works!')` and run it with `node hello.js`. Then create an `index.html` with the same message using `document.write` or `console.log`, and open it in a browser to compare the two environments.

## Lesson 3: Values, Variables, Statements, Datatypes, Operators, Conditions, Loops, Strings, Map, ECMAScript 2027

This is the biggest lesson — plan two or three class sessions for it.

### Values and Variables

A **value** is a piece of data (`42`, `"hello"`, `true`). A **variable** is a named container that stores a value.

```js
let age = 30;
const name = 'Ada';
var isStudent = true; // legacy, avoid in new code
```

### JavaScript Statements

A statement is an instruction the engine executes. Statements end (by convention) with a semicolon.

```js
let x = 5;        // declaration statement
x = x + 1;         // assignment statement
console.log(x);    // expression statement
if (x > 0) {       // control-flow statement
  console.log('positive');
}
```

### Comments

```js
// single-line comment

/* multi-line
   comment */
```

### let, const, var

| Keyword | Scope | Reassignable | Redeclarable | Hoisted |
| --- | --- | --- | --- | --- |
| `var` | function | yes | yes | yes (initialized as `undefined`) |
| `let` | block | yes | no | yes (in "temporal dead zone") |
| `const` | block | no | no | yes (in "temporal dead zone") |

```js
var a = 1; // function-scoped, avoid
let b = 2; // block-scoped, use for values that change
const c = 3; // block-scoped, use by default

// const prevents reassignment, not mutation:
const arr = [1, 2, 3];
arr.push(4); // fine — mutating the array
// arr = [5, 6]; // Error — reassigning the variable
```

### JavaScript Has 8 Data Types

**7 primitives + 1 reference type (object):**

```js
// 1. Number
let n = 42;
let f = 3.14;

// 2. String
let s = 'hello';

// 3. Boolean
let isTrue = true;

// 4. Undefined — a declared variable with no value yet
let u;
console.log(u); // undefined

// 5. Null — intentional "no value"
let empty = null;

// 6. BigInt — integers larger than Number can safely hold
let big = 123456789012345678901234567890n;

// 7. Symbol — unique, immutable identifier
let sym = Symbol('id');

// 8. Object — everything else: objects, arrays, functions
let obj = { key: 'value' };
let arr = [1, 2, 3];
let fn = function() {};

console.log(typeof n, typeof s, typeof isTrue, typeof u, typeof empty, typeof big, typeof sym, typeof obj);
// number string boolean undefined object bigint symbol object
// Note: typeof null is 'object' — a famous, long-standing JS quirk.
```

### JavaScript Operators

```js
// Arithmetic
console.log(10 + 3, 10 - 3, 10 * 3, 10 / 3, 10 % 3, 10 ** 2);

// Assignment
let x = 5;
x += 2; x -= 1; x *= 3; x /= 2;

// Comparison
console.log(5 == '5');   // true  (loose — converts types)
console.log(5 === '5');  // false (strict — no conversion, always prefer this)
console.log(5 !== '5');  // true

// Logical
console.log(true && false, true || false, !true);

// Nullish coalescing & optional chaining (modern JS)
let val = null ?? 'default'; // 'default'
let user = { profile: null };
console.log(user.profile?.name); // undefined, no crash
```

### JavaScript Conditions

```js
let score = 85;

if (score >= 90) {
  console.log('A');
} else if (score >= 70) {
  console.log('B');
} else {
  console.log('C');
}

// Ternary
let result = score >= 70 ? 'Pass' : 'Fail';
```

### JavaScript Loops

```js
for (let i = 0; i < 3; i++) {
  console.log('for:', i);
}

let i = 0;
while (i < 3) {
  console.log('while:', i);
  i++;
}

let j = 0;
do {
  console.log('do-while:', j);
  j++;
} while (j < 3);

for (const item of ['a', 'b', 'c']) {
  console.log('for-of:', item);
}
```

### JavaScript Strings

```js
let greeting = 'Hello';
let name = 'World';

console.log(greeting + ', ' + name + '!');       // concatenation
console.log(`${greeting}, ${name}!`);             // template literal (preferred)
console.log(greeting.length);                     // 5
console.log(greeting.toUpperCase());              // HELLO
console.log(greeting.slice(1, 3));                // 'el'
console.log(greeting.includes('ell'));            // true
console.log('  trim me  '.trim());                // 'trim me'
console.log(greeting.split('').reverse().join('')); // 'olleH'
```

### The Map Object

`Map` stores key-value pairs like an object, but keys can be ANY type, and it preserves insertion order.

```js
const scores = new Map();
scores.set('Alice', 90);
scores.set('Bob', 85);
scores.set(42, 'numeric key works too');

console.log(scores.get('Alice')); // 90
console.log(scores.size);         // 3
console.log(scores.has('Bob'));   // true

for (const [key, value] of scores) {
  console.log(key, value);
}

scores.delete('Bob');
```

### ECMAScript 2027

ES2027 is the edition currently moving through the TC39 proposal process (finalized editions ship each June). Point students to **[tc39.es/process-document](https://tc39.es/process-document/)** to see which features have reached Stage 4 (finished) for the year the class is taught, since proposals move stage-to-stage over time. Teach the stable, shipped features above first — treat ES2027 as a "what's coming next" discussion, not core curriculum.

## Lesson 4: Making Decisions

Deepen the conditions from Lesson 3: multi-branch logic, `switch`, and truthy/falsy rules.

```js
// if / else if / else
function classify(age) {
  if (age < 13) {
    return 'child';
  } else if (age < 20) {
    return 'teen';
  } else {
    return 'adult';
  }
}
console.log(classify(15)); // 'teen'

// switch — good for many discrete cases
function dayName(day) {
  switch (day) {
    case 0: return 'Sunday';
    case 1: return 'Monday';
    case 6: return 'Saturday';
    default: return 'Weekday';
  }
}
console.log(dayName(6)); // 'Saturday'

// Truthy / falsy — the 8 falsy values in JS:
// false, 0, -0, 0n, '', null, undefined, NaN
if ('') console.log('never runs');
if ('0') console.log('runs! non-empty string is truthy');

// Short-circuit patterns used for decisions
const user = { name: 'Ada' };
const displayName = user.name || 'Anonymous'; // fallback
user.isAdmin && console.log('Welcome, admin'); // guard
```

**Class exercise**: write a `gradeLetter(score)` function using `if/else if`, then rewrite the same logic using nested ternaries, and discuss which is more readable.

## Lesson 5: Functions

```js
// Function declaration — hoisted, can be called before it's defined
function add(a, b) {
  return a + b;
}

// Function expression — not hoisted
const subtract = function(a, b) {
  return a - b;
};

// Arrow function — shorter syntax, no own `this`
const multiply = (a, b) => a * b;
const square = x => x * x; // single param, no parens needed
const sayHi = () => console.log('hi'); // no params

// Default parameters
function greet(name = 'friend') {
  return `Hello, ${name}!`;
}
console.log(greet());        // Hello, friend!
console.log(greet('Ada'));   // Hello, Ada!

// Rest parameters — gather remaining args into an array
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}
console.log(sum(1, 2, 3, 4)); // 10

// Functions are values — can be passed around "first-class functions")
function applyTwice(fn, value) {
  return fn(fn(value));
}
console.log(applyTwice(square, 3)); // 81

// Arrow functions and `this` — arrows inherit `this` from where they're defined
const counter = {
  count: 0,
  incrementBad: function() {
    setTimeout(function() {
      // `this` here is NOT counter — it's undefined/global in strict mode
      // this.count++; would fail
    }, 100);
  },
  incrementGood: function() {
    setTimeout(() => {
      this.count++; // arrow inherits `this` from incrementGood — works correctly
      console.log(this.count);
    }, 100);
  }
};
counter.incrementGood(); // logs 1 after 100ms
```

**Class exercise**: have students write the same function three ways — declaration, expression, and arrow — and discuss when each style is preferable (hoisting needs → declaration; `this` binding concerns → arrow).

## Lesson 6: Scope and Closures

```js
// Global scope — accessible everywhere
let globalVar = 'I am global';

function outer() {
  // Function scope
  let outerVar = 'I am in outer';

  if (true) {
    // Block scope — let/const only exist inside this block
    let blockVar = 'I am in the block';
    console.log(blockVar); // works
  }
  // console.log(blockVar); // ReferenceError — out of scope here

  function inner() {
    // Lexical scope — inner functions see outer variables
    console.log(outerVar); // works — 'inner' can see 'outer's variables
  }
  inner();
}
outer();

// CLOSURE — a function "remembers" the scope it was created in,
// even after the outer function has finished running
function makeCounter() {
  let count = 0; // private variable, not accessible from outside
  return function() {
    count++;
    return count;
  };
}

const counter1 = makeCounter();
console.log(counter1()); // 1
console.log(counter1()); // 2
console.log(counter1()); // 3

const counter2 = makeCounter(); // a completely separate closure
console.log(counter2()); // 1 — independent from counter1

// Practical closure use: a function factory
function makeMultiplier(factor) {
  return num => num * factor;
}
const double = makeMultiplier(2);
const triple = makeMultiplier(3);
console.log(double(5), triple(5)); // 10 15
```

**Class exercise**: ask students to explain, in their own words, why `counter1()` and `counter2()` don't interfere with each other. This checks whether they understand that each call to `makeCounter()` creates a brand-new, private `count` variable.

## Lesson 7: Objects

```js
// Object literal
const person = {
  name: 'Ada',
  age: 30,
  isStudent: false,
  greet() {                 // method (shorthand syntax)
    return `Hi, I'm ${this.name}`;
  }
};

console.log(person.name);      // dot notation
console.log(person['age']);    // bracket notation — needed for dynamic keys
console.log(person.greet());   // 'Hi, I'm Ada'

// Adding / updating / deleting properties
person.city = 'Lagos';
person.age = 31;
delete person.isStudent;

// `this` refers to the object the method is called on
const car = {
  brand: 'Toyota',
  drive() { console.log(`${this.brand} is driving`); }
};
car.drive(); // 'Toyota is driving'

// Destructuring — pull properties into variables
const { name, age } = person;
console.log(name, age); // Ada 31

const { name: fullName = 'Unknown' } = {}; // rename + default
console.log(fullName); // 'Unknown'

// Spread — copy/merge objects
const basePerson = { name: 'Ada', role: 'dev' };
const extended = { ...basePerson, role: 'lead' }; // override role
console.log(extended); // { name: 'Ada', role: 'lead' }

// Useful Object static methods
console.log(Object.keys(person));     // ['name', 'age', 'city', 'greet']
console.log(Object.values(person));
console.log(Object.entries(person));  // [['name','Ada'], ...]

// Object.freeze — prevent any modification
const frozen = Object.freeze({ x: 1 });
frozen.x = 2; // silently fails (or throws in strict mode)
console.log(frozen.x); // still 1
```

**Class exercise**: model a `book` object (title, author, pages, `isLong()` method returning `pages > 300`), then destructure `title` and `author` out of it into standalone variables.

## Lesson 8: Arrays

```js
const fruits = ['apple', 'banana', 'cherry'];

console.log(fruits[0]);      // 'apple'
console.log(fruits.length);  // 3

// Mutating methods
fruits.push('date');         // add to end
fruits.pop();                 // remove from end
fruits.unshift('avocado');   // add to start
fruits.shift();               // remove from start
fruits.splice(1, 1, 'blueberry'); // remove/replace at index

// Non-mutating, functional methods — the ones used constantly in real code
const numbers = [1, 2, 3, 4, 5];

const doubled = numbers.map(n => n * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

const evens = numbers.filter(n => n % 2 === 0);
console.log(evens); // [2, 4]

const total = numbers.reduce((sum, n) => sum + n, 0);
console.log(total); // 15

const found = numbers.find(n => n > 3);
console.log(found); // 4

const hasEven = numbers.some(n => n % 2 === 0);
const allPositive = numbers.every(n => n > 0);
console.log(hasEven, allPositive); // true true

numbers.forEach(n => console.log('item:', n));

// Destructuring arrays
const [first, second, ...rest] = numbers;
console.log(first, second, rest); // 1 2 [3, 4, 5]

// Spread — combine/copy arrays
const combined = [...numbers, ...fruits];
const copy = [...numbers];

// Sorting (be careful — sorts in place, and numbers need a compare function)
const nums = [10, 2, 33, 4];
nums.sort((a, b) => a - b);
console.log(nums); // [2, 4, 10, 33]

// Chaining methods — a very common real-world pattern
const result = numbers
  .filter(n => n % 2 !== 0)
  .map(n => n * 10)
  .reduce((sum, n) => sum + n, 0);
console.log(result); // (1+3+5)*10 = 90
```

**Class exercise**: given an array of student scores, use `filter` + `map` + `reduce` chained together to find the average of passing scores (≥ 50).

## Lesson 9: Loops (deeper dive)

Lesson 3 introduced loops; this lesson goes further — `for...in`, loop control, and nested loops.

```js
// for...in — iterates over OBJECT KEYS (not meant for arrays)
const person = { name: 'Ada', age: 30, city: 'Lagos' };
for (const key in person) {
  console.log(key, '->', person[key]);
}

// for...of — iterates over VALUES of any iterable (arrays, strings, maps, sets)
for (const char of 'abc') {
  console.log(char);
}

// break — exit the loop entirely
for (let i = 0; i < 10; i++) {
  if (i === 5) break;
  console.log(i); // 0 1 2 3 4
}

// continue — skip to the next iteration
for (let i = 0; i < 5; i++) {
  if (i === 2) continue;
  console.log(i); // 0 1 3 4
}

// Nested loops — e.g. building a multiplication table
for (let i = 1; i <= 3; i++) {
  let row = '';
  for (let j = 1; j <= 3; j++) {
    row += (i * j) + ' ';
  }
  console.log(row);
}
// 1 2 3
// 2 4 6
// 3 6 9

// Labeled break — escape an outer loop from inside a nested one
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (j === 1) continue outer;
    console.log(i, j);
  }
}
```

**Common pitfall to teach**: `for...in` on an array gives you index strings, not values, and can include inherited properties — always prefer `for...of`, `.forEach`, or `.map` for arrays.

## Lesson 10: Modules

Modules let you split code across files and share values between them with `export` / `import`. Requires either Node.js (`type: module` in package.json) or a `<script type="module">` tag in the browser.

```js
// math.js — named exports (can have many per file)
export function add(a, b) {
  return a + b;
}

export const PI = 3.14159;

// user.js — default export (one per file, imported under any name)
export default class User {
  constructor(name) {
    this.name = name;
  }
}
```

```js
// app.js — importing
import { add, PI } from './math.js';
import User from './user.js'; // default import — no curly braces

console.log(add(2, 3), PI);
const u = new User('Ada');

// Import everything as a namespace object
import * as MathUtils from './math.js';
console.log(MathUtils.add(1, 1));

// Renaming on import
import { add as sum } from './math.js';
```

```html
<!-- In the browser, mark the script as a module -->
<script type="module" src="app.js"></script>
```

**Why modules matter**: they keep files small and focused, avoid polluting the global scope, and let tools (bundlers like Vite/Webpack) only include the code that's actually used ("tree-shaking").

**Class exercise**: split a small calculator program into `operations.js` (exporting `add`, `subtract`, `multiply`, `divide`) and `main.js` (importing and using them).

## Lesson 11: Errors

```js
// try / catch / finally
function divide(a, b) {
  try {
    if (b === 0) {
      throw new Error('Cannot divide by zero');
    }
    return a / b;
  } catch (error) {
    console.error('Something went wrong:', error.message);
    return null;
  } finally {
    console.log('Division attempt finished'); // always runs
  }
}

console.log(divide(10, 2)); // 5, then 'Division attempt finished'
console.log(divide(10, 0)); // logs the error, then null

// Built-in error types
try {
  null.someProperty; // TypeError
} catch (e) {
  console.log(e instanceof TypeError, e.message);
}

try {
  undefinedFunction(); // ReferenceError
} catch (e) {
  console.log(e instanceof ReferenceError, e.message);
}

// Custom error classes — useful for distinguishing error types
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

function setAge(age) {
  if (age < 0) {
    throw new ValidationError('Age cannot be negative');
  }
  return age;
}

try {
  setAge(-5);
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Validation failed:', error.message);
  } else {
    throw error; // re-throw anything we didn't expect
  }
}
```

**Class exercise**: write a `parseAge(input)` function that throws a `ValidationError` if the input isn't a positive number, and a caller that catches and displays a friendly message.

## Lesson 12: Async JavaScript

**Core idea**: JavaScript is single-threaded but non-blocking. Long-running tasks (timers, network requests) are handed off, and the **event loop** runs their callback once they finish, without freezing the rest of the program.

```js
// 1. Callbacks — the original approach (can lead to "callback hell")
function fetchDataCallback(callback) {
  setTimeout(() => {
    callback('data loaded');
  }, 1000);
}
fetchDataCallback(result => console.log(result)); // after 1s: 'data loaded'

// 2. Promises — represent a future value: pending -> fulfilled or rejected
function fetchDataPromise() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = true;
      if (success) {
        resolve('data loaded');
      } else {
        reject(new Error('failed to load'));
      }
    }, 1000);
  });
}

fetchDataPromise()
  .then(result => console.log(result))
  .catch(error => console.error(error))
  .finally(() => console.log('done'));

// Chaining promises avoids nested callbacks
fetchDataPromise()
  .then(result => result.toUpperCase())
  .then(upper => console.log(upper)) // 'DATA LOADED'
  .catch(error => console.error(error));

// 3. async/await — syntactic sugar over promises, reads like sync code
async function loadData() {
  try {
    const result = await fetchDataPromise();
    console.log(result); // 'data loaded'
    return result;
  } catch (error) {
    console.error('Error:', error.message);
  }
}
loadData();

// Running promises in parallel
async function loadAll() {
  const [a, b] = await Promise.all([
    fetchDataPromise(),
    fetchDataPromise()
  ]);
  console.log(a, b);
}

// The event loop, demonstrated
console.log('1: start');
setTimeout(() => console.log('2: timeout callback'), 0);
Promise.resolve().then(() => console.log('3: promise callback'));
console.log('4: end');
// Output order: 1, 4, 3, 2
// Synchronous code always runs first; microtasks (promises) run before
// macrotasks (setTimeout), even with a 0ms delay.
```

**Class exercise**: rewrite the callback-based `fetchDataCallback` example as a promise, then again with `async/await`, so students see the same behavior expressed three ways.

## Lesson 13: JSON and API-Shaped Data

JSON (JavaScript Object Notation) is the standard format for sending data between a client and a server. It looks like a JS object/array literal but is actually just text.

```js
// JavaScript object
const user = {
  name: 'Ada',
  age: 30,
  skills: ['JS', 'React Native'],
  isActive: true
};

// Convert object -> JSON string (for sending over the network)
const jsonString = JSON.stringify(user);
console.log(jsonString);
// '{"name":"Ada","age":30,"skills":["JS","React Native"],"isActive":true}'

console.log(JSON.stringify(user, null, 2)); // pretty-printed, 2-space indent

// Convert JSON string -> object (parsing a response)
const parsed = JSON.parse(jsonString);
console.log(parsed.name); // 'Ada'

// JSON rules to teach explicitly:
// - keys must be double-quoted strings
// - no functions, no undefined, no comments allowed in JSON
// - JSON.parse throws SyntaxError on malformed JSON — always wrap in try/catch
try {
  JSON.parse('{ bad json }');
} catch (e) {
  console.log(e instanceof SyntaxError); // true
}

// Fetching API-shaped data with the Fetch API
async function getUser(id) {
  try {
    const response = await fetch(`https://api.example.com/users/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const data = await response.json(); // parses the JSON body automatically
    return data;
  } catch (error) {
    console.error('Failed to fetch user:', error.message);
  }
}

// Sending JSON data (a POST request)
async function createUser(newUser) {
  const response = await fetch('https://api.example.com/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newUser)
  });
  return response.json();
}
```

**Class exercise**: take a small nested object (e.g. an order with a customer and a list of items), `JSON.stringify` it, print it, then `JSON.parse` it back and confirm it's `deepEqual` in shape to the original.

## Lesson 14: Just Enough Browser JavaScript

The closing lesson — bring everything together by manipulating a real web page. Best taught live in an HTML file.

```html
<!DOCTYPE html>
<html>
<body>
  <h1 id="title">Hello</h1>
  <button id="btn">Click me</button>
  <ul id="list"></ul>

  <script>
    // Selecting elements
    const title = document.getElementById('title');
    const button = document.querySelector('#btn');   // CSS-selector style, more flexible
    const items = document.querySelectorAll('li');   // returns a NodeList

    // Reading and changing content
    console.log(title.textContent);
    title.textContent = 'Welcome!';
    title.style.color = 'darkblue';
    title.classList.add('highlight')

    // Creating and inserting elements
    const list = document.getElementById('list');
    function addItem(text) {
      const li = document.createElement('li');
      li.textContent = text;
      list.appendChild(li);
    }
    addItem('First item');
    addItem('Second item');

    // Events — responding to user interaction
    let clickCount = 0;
    button.addEventListener('click', () => {
      clickCount++;
      addItem(`Clicked ${clickCount} time(s)`);
    });

    // Event delegation — one listener handles many children
    list.addEventListener('click', (event) => {
      if (event.target.tagName === 'LI') {
        event.target.style.textDecoration = 'line-through';
      }
    });

    // Waiting for the DOM to be ready (only needed without `defer`)
    document.addEventListener('DOMContentLoaded', () => {
      console.log('DOM fully loaded and parsed');
    });
  </script>
</body>
</html>
```

**Key browser objects to name**: `document` (the page), `window` (the browser tab/global object), and the DOM (Document Object Model) tree that JavaScript reads and mutates.

**Capstone class exercise**: build a tiny to-do list — an input box, an "Add" button that creates a new `<li>` with the input's value, and a click-to-delete handler on each item. This exercise touches almost every lesson in the course: variables, functions, arrays (or DOM lists), conditions, loops, events, and objects.
