# Backend Foundations: Node.js, Express and REST APIs

## 1. Learning Objectives

By the end, you will be able to:

1. **Explain** what Node.js is, why it handles many requests at once, and how the event loop decides what runs next.
2. **Set up** a TypeScript Node project with a standard folder structure and environment-based configuration.
3. **Build** an Express API using routes, middleware, controllers and services.
4. **Handle errors** in one central place and return clear error responses.
5. **Design** REST endpoints with the right HTTP method, status code and response shape.

---

## 2. Section Breakdown

- **Part A — Node.js:** runtime, asynchronous I/O, event loop, configuration
- **Part B — Express:** folder structure, routes, middleware, controllers, services, error handling
- **Part C — REST:** resources, HTTP methods, status codes, request/response

---

### Part A — Node.js

---

#### A1. What Is Node.js?

**Explanation**

**Node.js** is a **runtime**: a program that runs JavaScript outside the browser, on a server or your computer.

It has two main parts:
- **V8**, the JavaScript engine from Chrome. It runs your code.
- **libuv**, a library that handles **asynchronous I/O** (files, network, timers) and runs the **event loop**.

| Browser                           | Node.js                                                              |
| --------------------------------- | -------------------------------------------------------------------- |
| Has `window`, `document`, the DOM | No DOM                                                               |
| Can't read files on your computer | Can read files, open network connections, read environment variables |
| Used to build user interfaces     | Used to build servers, APIs, scripts and tools                       |

**Where TypeScript fits:** Node runs JavaScript. TypeScript is checked while you write code, then the types are removed and plain JavaScript runs. **Types do not exist at runtime.**

**Why it matters**
- You can use one language for frontend and backend.
- Node is very good at web servers, because servers spend most of their time *waiting* (for databases, files and other APIs).

**Analogy**
> V8 is the car's engine. Node.js is the whole car (engine, wheels and steering), built to drive on servers instead of inside a browser.

**Common mistakes**
- Thinking Node.js is a language or a framework. It's a runtime. TypeScript/JavaScript is the language; Express is the framework.
- Using browser things like `window`, `document` or `localStorage` in server code.

---

#### A2. Project Setup (TypeScript + Node)

**Explanation**

```bash
npm init -y
npm install express cors pino
npm install -D typescript tsx @types/node @types/express @types/cors pino-pretty
```

- **`dependencies`** are needed when the app runs (`express`, `cors`, `pino`).
- **`devDependencies`** are only needed while developing (`typescript`, `tsx`, type packages).
- **`tsx`** runs `.ts` files directly during development.
- **`tsc`** compiles `.ts` files into `.js` files in `dist/` for production.

**`package.json`** (key parts):

```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx watch --env-file=.env src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

- `"type": "module"` lets us use `import` / `export`, the same module system you use in React.
- `npm run dev` runs the server and restarts it when a file changes.

**`tsconfig.json`** (a simple version):

```jsonc
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "module": "nodenext",
    "target": "esnext",
    "types": ["node"],
    "strict": true,
    "sourceMap": true,
    "skipLibCheck": true,
    "verbatimModuleSyntax": true,
    "rewriteRelativeImportExtensions": true
  },
  "include": ["src/**/*"]
}
```

**About import paths:** with this setup, relative imports must include the file extension:

```ts
import { env } from "./config/env.ts"; // ✅
import { env } from "./config/env";    // ❌ error: extension required
```

`rewriteRelativeImportExtensions` lets us write `.ts`, and changes it to `.js` when compiling.

**Common mistakes**
- Leaving out the file extension in imports. In React with Vite you could leave it out; in Node you can't.
- Forgetting `"type": "module"`, which gives the error `Cannot use import statement outside a module`.
- Committing `node_modules`, `dist` or `.env` to Git. Add all three to `.gitignore`.

---

#### A3. Asynchronous I/O

**Explanation**

**I/O** (input/output) is any work that happens outside your code: reading a file, querying a database or calling another API. I/O is slow compared to running code.

- **Blocking (synchronous):** the program stops and waits until the I/O finishes.
- **Non-blocking (asynchronous):** the program starts the I/O, moves on to other work, and handles the result when it's ready.

Node uses non-blocking I/O, written with `async` / `await`:

```ts
import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";

// ✅ Non-blocking: Node can handle other requests while waiting
const data = await readFile("data.json", "utf8");

// ❌ Blocking: everything stops until the file is read
const data2 = readFileSync("data.json", "utf8");
```

**Why it matters**

One Node server can handle thousands of users at once, because it never sits idle waiting. While one request waits for the database, Node works on other requests.

**Analogy**
> **A restaurant waiter.** A *blocking* waiter takes your order, then stands in the kitchen until your food is ready, ignoring every other table. A *non-blocking* waiter gives your order to the kitchen and serves other tables. When the food is ready, they bring it to you. One waiter, many tables.

**Common mistakes**
- Using `...Sync` functions (like `readFileSync`) inside API routes. They block every user.
- Forgetting `await` and getting a `Promise` instead of the data.
- Thinking `async` makes code run in parallel. It doesn't create new threads; it lets Node *wait without blocking*.

---

#### A4. The Event Loop

**Explanation**

Node runs your JavaScript on **one main thread**. The **event loop** decides which piece of code (which **callback**) runs next.

The basic rule:

1. **Synchronous code** runs first, top to bottom.
2. **Microtasks** (promise callbacks, code after `await`) run next.
3. **Timers and I/O callbacks** (like `setTimeout`, finished file reads, incoming requests) run in the next rounds of the loop.

```ts
console.log("1. sync");

setTimeout(() => console.log("4. timeout"), 0);

Promise.resolve().then(() => console.log("3. promise"));

console.log("2. sync");
```

Output:

```
1. sync
2. sync
3. promise
4. timeout
```

Even with a delay of `0`, the timeout waits until all synchronous code and promises are done.

**The loop's main stages (phases), simplified:**

| Phase      | What runs                                                          |
| ---------- | ------------------------------------------------------------------ |
| **Timers** | `setTimeout` and `setInterval` callbacks                           |
| **Poll**   | I/O callbacks: incoming requests, finished file and database reads |
| **Check**  | `setImmediate` callbacks                                           |
| **Close**  | Cleanup callbacks, like a closed connection                        |

Between every callback, Node runs any waiting **microtasks** (promises) first.

**Blocking the event loop**

Because there is one main thread, a slow *synchronous* task freezes the whole server:

```ts
app.get("/slow", (_req, res) => {
  let total = 0;
  for (let i = 0; i < 5_000_000_000; i++) total += i; // takes seconds
  res.json({ total });
});
// While /slow runs, every other request waits.
```

To avoid this, use async APIs for I/O, and move heavy calculations off the main thread (for example, with **worker threads**) or into a background job.

**Analogy**
> **One cashier, one queue.** The cashier (main thread) serves one customer (callback) at a time. VIP customers (promises) are served before regular ones. If one customer takes 10 minutes, everyone behind them waits.

**Common mistakes**
- Thinking `setTimeout(fn, 0)` runs immediately. It runs *after* sync code and promises.
- Doing heavy calculations inside a route handler. This blocks every request.

---

#### A5. Configuration with Environment Variables

**Explanation**

**Configuration** is anything that changes between environments (your laptop vs production): the port, log level, database URL or API keys.

We store these in **environment variables**, read in code through **`process.env`**.

- Locally, we keep them in a **`.env`** file.
- `--env-file=.env` (in our `dev` script) loads that file when the app starts.
- Values in `process.env` are **always strings** (or `undefined`).

```bash
# .env — never commit this file
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug
```

**Read the config once, in one file:**

```ts
// src/config/env.ts
export const env = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProduction: process.env.NODE_ENV === "production",
  logLevel: process.env.LOG_LEVEL ?? "info",
};
```

Every other file imports `env` instead of reading `process.env` directly.

**Why it matters**
- Secrets (passwords, API keys) stay out of your code and out of Git.
- The same code runs everywhere; only the settings change.

**Analogy**
> Your app is the person; environment variables are the outfit. You change clothes for a different occasion, not the person.

**Common mistakes**
- Committing `.env` to Git. Commit a `.env.example` with fake values instead.
- Forgetting values are strings: `"3000" + 1` is `"30001"`. Convert with `Number()`.
- **On macOS, avoid port 5000.** The AirPlay Receiver uses it and answers with `403 Forbidden`. Use 3000 or 4000.

---

### Part B — Express

---

#### B1. What Is Express?

**Explanation**

**Express** is a small framework for building web servers and APIs on Node. It gives us:
- **Routes:** "when a `GET` request comes to `/api/tasks`, run this function."
- **Middleware:** functions that run on every request (logging, parsing JSON, and so on).
- **Helpers:** `req.params`, `req.body`, `res.status()`, `res.json()`.

```ts
import express from "express";

const app = express();

app.get("/hello", (_req, res) => {
  res.json({ message: "Hello from Express" });
});

app.listen(3000);
```

**`req` and `res`**
- **`req` (request):** what the client sent (URL, params, body, headers).
- **`res` (response):** what we send back (status code and data).

**Common mistakes**
- Thinking Express replaces Node. Express runs *on* Node.
- Forgetting to send a response. If you never call `res.json()` (or similar), the request hangs.

---

#### B2. Folder Structure

We split code into folders by **job**. This is a standard structure used in many Express projects:

```
tasks-api/
├── .env                      # local settings (not in Git)
├── .env.example              # example settings (in Git)
├── .gitignore
├── package.json
├── tsconfig.json
└── src/
    ├── config/
    │   └── env.ts            # reads environment variables
    ├── controllers/
    │   └── task.controller.ts
    ├── lib/
    │   └── logger.ts         # pino logger
    ├── middlewares/
    │   ├── errorHandler.ts
    │   ├── notFound.ts
    │   └── requestLogger.ts
    ├── models/               # empty for now — Database section
    ├── routes/
    │   ├── index.ts          # combines all routers
    │   ├── health.routes.ts
    │   └── task.routes.ts
    ├── services/
    │   └── task.service.ts
    ├── types/
    │   └── task.types.ts     # TypeScript types
    ├── utils/
    │   └── AppError.ts       # our custom error class
    ├── validators/           # empty for now — Database section
    ├── app.ts                # sets up Express
    └── server.ts             # starts the server
```

**What each folder does:**

| Folder / file            | Job                                                    |
| ------------------------ | ------------------------------------------------------ |
| `server.ts`              | Starts the server (`app.listen`)                       |
| `app.ts`                 | Creates the Express app and adds middleware and routes |
| `config/`                | Settings from environment variables                    |
| `routes/`                | Maps URLs to controller functions                      |
| `controllers/`           | Reads the request, calls a service, sends the response |
| `services/`              | Business logic: the real work and the rules            |
| `middlewares/`           | Code that runs on many requests (logging, 404, errors) |
| `types/`                 | Shared TypeScript types                                |
| `utils/`                 | Small helpers (like `AppError`)                        |
| `lib/`                   | Set-up third-party tools (like the logger)             |
| `models/`, `validators/` | Empty for now; filled in the Database section          |

**The flow of a request:**

```
Request → middleware → route → controller → service
                                   ↓
Response ←──────────────────── controller
```

> **Tip:** Git doesn't save empty folders. Add an empty file called `.gitkeep` inside `models/` and `validators/` so they stay in the project.

---

#### B3. Routes

**Explanation**

A **route** connects an **HTTP method** and a **path** to a function.

```ts
// src/routes/task.routes.ts
import { Router } from "express";
import * as taskController from "../controllers/task.controller.ts";

export const taskRouter: Router = Router();

taskRouter.get("/", taskController.getAllTasks);      // GET    /api/tasks
taskRouter.get("/:id", taskController.getTaskById);   // GET    /api/tasks/:id
taskRouter.post("/", taskController.createTask);      // POST   /api/tasks
taskRouter.patch("/:id", taskController.updateTask);  // PATCH  /api/tasks/:id
taskRouter.delete("/:id", taskController.deleteTask); // DELETE /api/tasks/:id
```

```ts
// src/routes/health.routes.ts
import { Router } from "express";

export const healthRouter: Router = Router();

healthRouter.get("/", (_req, res) => {
  res.status(200).json({ success: true, message: "Health route is working" });
});
```

**`routes/index.ts` combines all routers** so `app.ts` only mounts one:

```ts
// src/routes/index.ts
import { Router } from "express";
import { healthRouter } from "./health.routes.ts";
import { taskRouter } from "./task.routes.ts";

export const apiRouter: Router = Router();

apiRouter.use("/health", healthRouter); // → /api/health
apiRouter.use("/tasks", taskRouter);    // → /api/tasks
```

**Where data comes from in a request:**

| Source           | Example                      | How to read it                   |
| ---------------- | ---------------------------- | -------------------------------- |
| **Route params** | `/api/tasks/42`              | `req.params.id` → `"42"`         |
| **Query string** | `/api/tasks?completed=true`  | `req.query.completed` → `"true"` |
| **Body**         | JSON sent with POST or PATCH | `req.body`                       |

**Analogy**
> Routes are like React Router: `<Route path="/tasks/:id">` shows a component, and `taskRouter.get("/:id", ...)` runs a function. `useParams()` is like `req.params`.

**Common mistakes**
- Forgetting that params and query values are **strings**: `"42"`, not `42`.
- Route order: routes match top to bottom. Put `/stats` **before** `/:id`, or `/stats` will match `/:id` with `id = "stats"`.
- Putting verbs in URLs, like `/getTasks` or `/deleteTask`. The HTTP method already says the action (see Part C).

---

#### B4. Middleware

**Explanation**

**Middleware** is a function that runs **between** receiving a request and sending a response. It gets `req`, `res` and `next`:

- It can read or change the request.
- It can **send a response** and stop.
- Or it can call **`next()`** to pass the request to the next step.

Express runs middleware **in the order you add it**.

**A simple custom middleware: log every request**

```ts
// src/middlewares/requestLogger.ts
import type { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger.ts";

export function requestLogger(req: Request, _res: Response, next: NextFunction): void {
  logger.info(`${req.method} ${req.originalUrl}`);
  next(); // pass to the next step — without this, the request hangs
}
```

**The logger it uses**

```ts
// src/lib/logger.ts
import { pino } from "pino";
import { env } from "../config/env.ts";

export const logger = pino({
  level: env.logLevel,
  // pretty, coloured logs in development only
  ...(env.isProduction ? {} : { transport: { target: "pino-pretty" } }),
});
```

**Putting middleware together in `app.ts`**

```ts
// src/app.ts
import express from "express";
import type { Express } from "express";
import cors from "cors";
import { apiRouter } from "./routes/index.ts";
import { requestLogger } from "./middlewares/requestLogger.ts";
import { notFound } from "./middlewares/notFound.ts";
import { errorHandler } from "./middlewares/errorHandler.ts";

export function createApp(): Express {
  const app = express();

  // 1. Middleware that runs on every request
  app.use(cors());                                 // allow requests from the frontend
  app.use(express.json());                         // read JSON bodies into req.body
  app.use(express.urlencoded({ extended: true })); // read form bodies
  app.use(requestLogger);                          // log each request

  // 2. Routes
  app.use("/api", apiRouter);

  // 3. Nothing matched → 404
  app.use(notFound);

  // 4. Errors → error handler (always last)
  app.use(errorHandler);

  return app;
}
```

```ts
// src/server.ts
import { env } from "./config/env.ts";
import { createApp } from "./app.ts";
import { logger } from "./lib/logger.ts";

const app = createApp();

app.listen(env.port, () => {
  logger.info(`Server running on http://localhost:${env.port}`);
});
```

**Common middleware**

| Middleware       | What it does                                        |
| ---------------- | --------------------------------------------------- |
| `express.json()` | Turns a JSON request body into `req.body`           |
| `cors()`         | Lets your React app (on another port) call this API |
| `requestLogger`  | Our own: logs every request                         |
| `notFound`       | Our own: handles routes that don't exist            |
| `errorHandler`   | Our own: handles errors                             |

**Analogy**
> **Airport checkpoints:** check-in → security → passport control → gate. Each checkpoint can let you through (`next()`) or stop you (send a response).

**Common mistakes**
- Forgetting `next()` without sending a response. The request hangs.
- Adding `express.json()` **after** the routes. `req.body` is then `undefined`.
- Adding `notFound` **before** the routes. Every request returns 404.
- CORS errors in the browser are fixed on the **server** (with `cors()`), not in React.

---

#### B5. Controllers

**Explanation**

A **controller** handles the **HTTP part** of a request:

1. Read what it needs from `req` (params, body).
2. Call a **service** to do the work.
3. Send the response with the right **status code**.

Controllers do **not** contain business rules or data logic. That's the service's job.

```ts
// src/controllers/task.controller.ts
import type { Request, Response } from "express";
import * as taskService from "../services/task.service.ts";

type TaskParams = { id: string };

export async function getAllTasks(_req: Request, res: Response): Promise<void> {
  const tasks = await taskService.getAllTasks();
  res.status(200).json({ success: true, data: tasks });
}

export async function getTaskById(req: Request<TaskParams>, res: Response): Promise<void> {
  const task = await taskService.getTaskById(req.params.id);
  res.status(200).json({ success: true, data: task });
}

export async function createTask(req: Request, res: Response): Promise<void> {
  const task = await taskService.createTask(req.body);
  res.status(201).json({ success: true, data: task });
}

export async function updateTask(req: Request<TaskParams>, res: Response): Promise<void> {
  const task = await taskService.updateTask(req.params.id, req.body);
  res.status(200).json({ success: true, data: task });
}

export async function deleteTask(req: Request<TaskParams>, res: Response): Promise<void> {
  await taskService.deleteTask(req.params.id);
  res.status(204).send(); // 204 = success, no content
}
```

Notice there's **no `try/catch`**. In **Express 5**, if an `async` controller throws an error, Express sends it to the error handler automatically (see B7).

> **Note:** `req.body` is not checked yet, so the API trusts whatever the client sends. Checking the body (validation) is covered in the Database section.

**Analogy**
> The controller is the **waiter**: it takes the order, passes it to the kitchen (service), and brings the food back. The waiter doesn't cook.

**Common mistakes**
- Putting all logic in the controller ("fat controllers"). It becomes hard to read and reuse.
- Sending `200` for everything. Use the right status code (Part C).

---

#### B6. Services

**Explanation**

A **service** holds the **business logic**: the actual work and the rules of the app. For example: "a completed task can't be renamed."

Services **don't know about HTTP**. No `req`, no `res`, no `res.status()`. If something goes wrong, a service **throws an error**, and the error handler turns it into a response.

**The types first:**

```ts
// src/types/task.types.ts
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface CreateTaskInput {
  title: string;
}

export interface UpdateTaskInput {
  title?: string;
  completed?: boolean;
}
```

**The service:**

```ts
// src/services/task.service.ts
import { randomUUID } from "node:crypto";
import type { CreateTaskInput, Task, UpdateTaskInput } from "../types/task.types.ts";
import { AppError } from "../utils/AppError.ts";

// Temporary in-memory storage — replaced by a database in the Database section
const tasks: Task[] = [];

export async function getAllTasks(): Promise<Task[]> {
  return tasks;
}

export async function getTaskById(id: string): Promise<Task> {
  const task = tasks.find((t) => t.id === id);
  if (!task) {
    throw new AppError(404, "Task not found");
  }
  return task;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const task: Task = {
    id: randomUUID(),
    title: input.title,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  return task;
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  const task = await getTaskById(id); // throws 404 if not found

  // Business rule: a completed task can't be renamed
  if (task.completed && input.title !== undefined) {
    throw new AppError(409, "Completed tasks cannot be renamed");
  }

  if (input.title !== undefined) task.title = input.title;
  if (input.completed !== undefined) task.completed = input.completed;

  return task;
}

export async function deleteTask(id: string): Promise<void> {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) {
    throw new AppError(404, "Task not found");
  }
  tasks.splice(index, 1);
}
```

The functions are `async` even though the data is in memory. When we switch to a database, the database calls will be async, and the controllers won't need to change.

**Why it matters**
- Business rules live in one place.
- The same service can be reused by other parts of the app.
- Controllers stay short and easy to read.

**Analogy**
> The service is the **kitchen**: it cooks and follows the recipes and rules. It doesn't care which waiter brought the order.
>
> Frontend parallel: like moving logic out of a React component into a custom hook.

**Common mistakes**
- Using `res` or setting status codes inside a service.
- Throwing plain strings (`throw "not found"`). Throw an `Error` (or `AppError`) instead.

---

#### B7. Error Handling

**Explanation**

Instead of handling errors in every controller, we handle them in **one place**: the **error handler** middleware.

The pieces:

1. **`AppError`**, an error class that carries a **status code**.
2. **Services throw `AppError`**, e.g. `throw new AppError(404, "Task not found")`.
3. **Express 5 catches errors** from async controllers and passes them to the error handler.
4. **The error handler** sends the response.

**Step 1: `AppError`**

```ts
// src/utils/AppError.ts
export class AppError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}
```

**Step 2: the error handler**

```ts
// src/middlewares/errorHandler.ts
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.ts";
import { logger } from "../lib/logger.ts";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Errors we created on purpose (404, 409, ...)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  // Anything else is a bug → log it, and send a safe general message
  logger.error({ err }, "Unhandled error");
  res.status(500).json({ success: false, message: "Internal server error" });
}
```

**Step 3: the 404 handler** (for routes that don't exist)

```ts
// src/middlewares/notFound.ts
import type { Request, Response } from "express";

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ success: false, message: "Route not found" });
}
```

**Important rules**
- The error handler must have **4 parameters**: `(err, req, res, next)`. That's how Express knows it's an error handler. Keep `_next` even though it's unused.
- The underscore (`_req`, `_next`) means "not used, but must be here."
- Add the error handler **last** in `app.ts`.

**How an error travels:**

```
Service throws AppError(404, "Task not found")
   ↓
Express 5 catches it from the async controller
   ↓
errorHandler sends: 404 { "success": false, "message": "Task not found" }
```

**Express 4 vs Express 5:** in Express 4, errors from `async` functions were **not** caught automatically; you needed `try/catch` and `next(err)`. Express 5 does it for you. Many older tutorials still show the Express 4 way.

**Analogy**
> Like a React **Error Boundary**: one component catches errors from everything inside it. The error handler catches errors from every route.

**Common mistakes**
- Writing the error handler with only 3 parameters. Express then ignores it.
- Adding the error handler before the routes.
- Sending the real error message for unknown errors. It can expose private details. Send a general message and log the details.

---

### Part C — REST

---

#### C1. REST and Resources

**Explanation**

**REST** is a common way to design APIs. The main ideas:

- The API is organised around **resources**: the "things" in your app (tasks, users, orders).
- Each resource has a **URL**.
- You use **HTTP methods** to say what to do with it.
- Data is sent as **JSON**.

**URL rules:**

| URL                         | Meaning                        |
| --------------------------- | ------------------------------ |
| `/api/tasks`                | All tasks (the **collection**) |
| `/api/tasks/42`             | One task, with id 42           |
| `/api/tasks?completed=true` | Filtered list (query string)   |

- Use **nouns**, not verbs: `/api/tasks`, not `/api/getTasks`.
- Use **plural** names: `/api/tasks`, not `/api/task`.
- Use lowercase, with hyphens for multiple words: `/api/order-items`.

**Analogy**
> A library: `/books` is the shelf, `/books/42` is one book. You don't need a different door to borrow and to return; you use the same address with a different action.

**Common mistakes**
- Verbs in URLs: `/createTask`, `/deleteTask/5`.
- Mixing singular and plural: `/task/5` and `/users`.

---

#### C2. HTTP Methods

**Explanation**

The **HTTP method** says what action to take on a resource.

| Method     | Action                  | Example                | Has a body? |
| ---------- | ----------------------- | ---------------------- | ----------- |
| **GET**    | Read                    | `GET /api/tasks/42`    | No          |
| **POST**   | Create                  | `POST /api/tasks`      | Yes         |
| **PUT**    | Replace the whole thing | `PUT /api/tasks/42`    | Yes         |
| **PATCH**  | Update some fields      | `PATCH /api/tasks/42`  | Yes         |
| **DELETE** | Remove                  | `DELETE /api/tasks/42` | No          |

**PUT vs PATCH:**

```
Current task: { "title": "Buy milk", "completed": false }

PATCH /api/tasks/42  { "completed": true }
→ { "title": "Buy milk", "completed": true }     (only completed changed)

PUT /api/tasks/42    { "completed": true }
→ { "completed": true }                           (the whole task replaced; title is gone)
```

**Two useful terms:**
- **Safe:** doesn't change any data. **GET** is safe.
- **Idempotent:** sending the same request many times gives the same result as sending it once. **GET, PUT and DELETE** are idempotent. **POST is not**: sending it twice creates two tasks.

**Common mistakes**
- Using GET to change or delete data.
- Using POST for everything.

---

#### C3. Status Codes

**Explanation**

The **status code** is a 3-digit number in every response that says what happened.

- **2xx** — success
- **4xx** — the **client** made a mistake
- **5xx** — the **server** had a problem

**The codes you'll use most:**

| Code    | Meaning               | When to use                          | Tasks API example            |
| ------- | --------------------- | ------------------------------------ | ---------------------------- |
| **200** | OK                    | Successful GET, PATCH or PUT         | Get a task                   |
| **201** | Created               | POST created something               | Create a task                |
| **204** | No Content            | Success, nothing to send back        | Delete a task                |
| **400** | Bad Request           | The request data is wrong            | Missing or broken JSON       |
| **401** | Unauthorized          | Not logged in                        | No token sent                |
| **403** | Forbidden             | Logged in, but not allowed           | Deleting someone else's task |
| **404** | Not Found             | The resource doesn't exist           | Task 999 doesn't exist       |
| **409** | Conflict              | The action clashes with current data | Renaming a completed task    |
| **500** | Internal Server Error | A bug on the server                  | Unexpected crash             |

**Why it matters**

In React, **`fetch` does not throw an error for 404 or 500**. You check `res.ok` (true for 200–299):

```ts
const res = await fetch("/api/tasks/999");

if (!res.ok) {
  const body = await res.json(); // { success: false, message: "Task not found" }
  console.log(body.message);
}
```

If your API sends `200` with an error message, the frontend can't tell that something went wrong.

**Analogy**
> A delivery service: "delivered" (2xx), "wrong address" (4xx, fix it and try again), "our truck broke down" (5xx, the problem is on our side).

**Common mistakes**
- Sending `200` with an error message in the body.
- Mixing up **401** (not logged in) and **403** (logged in, but not allowed).
- Sending **404** for an empty list. An empty list is still a success: `200` with `[]`.
- Sending a body with **204**. A 204 response must have no body.

---

#### C4. Request and Response

**Explanation**

Every request and response has:
- **Headers:** extra information, like `Content-Type: application/json`.
- **Body** (optional): the data, usually JSON.

**Example request (create a task):**

```http
POST /api/tasks
Content-Type: application/json

{ "title": "Prepare lesson" }
```

**Example response:**

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "success": true,
  "data": {
    "id": "8f14e45f-ceea-467a-9c3e-2b1f0e4a6d21",
    "title": "Prepare lesson",
    "completed": false,
    "createdAt": "2026-10-18T21:00:00.000Z"
  }
}
```

**Keep one consistent response shape** across the whole API:

```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "message": "Task not found" }
```

The frontend can then handle every response the same way.

**The Tasks API at a glance:**

| Method & URL            | Body sent                    | Success             | Possible errors   |
| ----------------------- | ---------------------------- | ------------------- | ----------------- |
| `GET /api/tasks`        | —                            | `200` list of tasks | —                 |
| `GET /api/tasks/:id`    | —                            | `200` one task      | `404`             |
| `POST /api/tasks`       | `{ "title": "..." }`         | `201` new task      | `400` broken JSON |
| `PATCH /api/tasks/:id`  | `{ "title"?, "completed"? }` | `200` updated task  | `404`, `409`      |
| `DELETE /api/tasks/:id` | —                            | `204` no body       | `404`             |

**Common mistakes**
- Forgetting the `Content-Type: application/json` header when sending JSON from the frontend. `req.body` is then empty.
- Using a different response shape in every route.

---

## 3. How the Sub-Sections Connect

### 3.1 The three layers

```
┌───────────────────────────────────────────────┐
│ Part C — REST                                 │
│ WHAT the API looks like                       │
│ (URLs, methods, status codes, JSON shape)     │
├───────────────────────────────────────────────┤
│ Part B — Express                              │
│ HOW the code is organised                     │
│ (routes → middleware → controllers → services)│
├───────────────────────────────────────────────┤
│ Part A — Node.js                              │
│ WHERE it runs                                 │
│ (runtime, async I/O, event loop, config)      │
└───────────────────────────────────────────────┘
```

- **Node.js (A)** is the foundation: Express runs on it, and every request is handled by the event loop.
- **Express (B)** is how we organise the server code.
- **REST (C)** tells us what our routes, status codes and responses should be.

### 3.2 Teaching order

**A1 → A2 → A3 → A4 → A5 → B1 → B2 → B3 → B4 → B5 → B6 → B7 → C1 → C2 → C3 → C4**

Key dependencies:
- **A3 (async)** comes before **A4 (event loop)**: the loop handles async callbacks.
- **A5 (config)** comes before **B4**: `server.ts` reads the port from `env`.
- **B3 (routes)** comes before **B4 (middleware)**: both use `app.use` / routers.
- **B5 (controllers) → B6 (services) → B7 (errors)**: services throw errors, and the error handler catches them.
- **C2 (methods)** comes before **C3 (status codes)**: the right status code depends on the method.

Links across parts:
- **C1 + C2 → B3:** REST rules decide which routes we create.
- **C3 → B5 + B7:** controllers send success codes, and the error handler sends error codes.
- **C4 → B5 + B7:** controllers and the error handler both use the same response shape.
- **A4 → B5/B6:** slow synchronous code in a controller or service blocks the whole server.

### 3.3 The journey of one request

`GET /api/tasks/999` (a task that doesn't exist):

1. The request arrives. Node's **event loop** picks it up (A4).
2. **Middleware** runs: `cors`, `express.json`, `requestLogger` (B4).
3. **Routes** match `/api` → `/tasks` → `/:id` (B3).
4. **Controller** `getTaskById` calls the service (B5).
5. **Service** can't find task 999 and throws `AppError(404, "Task not found")` (B6).
6. **Express 5** catches the error and sends it to the **error handler** (B7).
7. **Error handler** sends `404 { "success": false, "message": "Task not found" }` (C3, C4).
8. **React** gets `res.ok === false` and shows "Task not found."

---

## 4. Key Terms Glossary

| Term                     | Definition                                                                        |
| ------------------------ | --------------------------------------------------------------------------------- |
| **Node.js**              | A runtime that runs JavaScript outside the browser.                               |
| **Runtime**              | A program that runs code in a particular environment.                             |
| **V8**                   | The JavaScript engine (from Chrome) that Node uses.                               |
| **libuv**                | The library that gives Node async I/O and the event loop.                         |
| **TypeScript**           | JavaScript with types; checked while coding, removed before running.              |
| **tsx**                  | A tool that runs TypeScript files directly during development.                    |
| **tsc**                  | The TypeScript compiler; turns `.ts` into `.js`.                                  |
| **I/O**                  | Input/output: reading files, databases or network calls.                          |
| **Blocking**             | Code that makes the program stop and wait.                                        |
| **Non-blocking (async)** | Code that starts a task and moves on, handling the result later.                  |
| **Event loop**           | The system that decides which callback Node runs next.                            |
| **Callback**             | A function that runs later, when something finishes.                              |
| **Microtask**            | A high-priority callback, such as a promise `.then` or code after `await`.        |
| **Environment variable** | A setting outside the code, read with `process.env`.                              |
| **`.env` file**          | A local file of environment variables; never committed.                           |
| **Express**              | A framework for building web servers and APIs on Node.                            |
| **Route**                | A method + path connected to a function.                                          |
| **Route param**          | A dynamic part of the URL, like `:id`, read with `req.params`.                    |
| **Query string**         | Extra values after `?` in the URL, read with `req.query`.                         |
| **Router**               | A group of related routes.                                                        |
| **Middleware**           | A function that runs between the request and the response.                        |
| **`next()`**             | Passes the request to the next middleware.                                        |
| **CORS**                 | Browser rules for calling an API on another domain or port; set up on the server. |
| **Controller**           | Handles the HTTP part: reads the request, calls a service, sends the response.    |
| **Service**              | Holds the business logic and rules.                                               |
| **Business logic**       | The rules of your app (what is allowed and how data changes).                     |
| **AppError**             | Our custom error class that carries a status code.                                |
| **Error handler**        | Middleware with 4 parameters that turns errors into responses.                    |
| **REST**                 | A way of designing APIs around resources and HTTP methods.                        |
| **Resource**             | A "thing" in the API, like a task or a user.                                      |
| **HTTP method**          | The action: GET, POST, PUT, PATCH, DELETE.                                        |
| **Safe**                 | Doesn't change data (GET).                                                        |
| **Idempotent**           | Repeating the request gives the same result (GET, PUT, DELETE).                   |
| **Status code**          | A 3-digit number saying what happened (2xx, 4xx, 5xx).                            |
| **Header**               | Extra information sent with a request or response.                                |
| **Body**                 | The data sent with a request or response, usually JSON.                           |

---

## 5. Knowledge Check

### Q1 — Event loop
What does this print?

```ts
console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");
```

<details><summary>Answer</summary>

`A`, `D`, `C`, `B`. Synchronous code runs first (`A`, `D`), then promises (`C`), then timers (`B`).
</details>

### Q2 — Blocking
A route uses `readFileSync` to read a large file. When many users call it, the whole API becomes slow, even the health route. Why? How do you fix it?

<details><summary>Answer</summary>

`readFileSync` is blocking: it stops the main thread until the file is read, so no other request can run. Fix: use the async version, `await readFile(...)` from `node:fs/promises`.
</details>

### Q3 — Middleware order
What's wrong with this `app.ts`?

```ts
app.use(notFound);
app.use("/api", apiRouter);
app.use(express.json());
app.use(errorHandler);
```

<details><summary>Answer</summary>

1. `notFound` is first, so every request returns 404. Move it after the routes.
2. `express.json()` is after the routes, so `req.body` is `undefined`. Move it to the top.
</details>

### Q4 — Which layer?
Where should each piece of code go: route, controller or service?

a) `taskRouter.delete("/:id", ...)`
b) `if (task.completed) throw new AppError(409, "...")`
c) `res.status(201).json({ success: true, data: task })`

<details><summary>Answer</summary>

a) **Route.** It connects a method and path to a function.
b) **Service.** It's a business rule.
c) **Controller.** It sends the HTTP response.
</details>

### Q5 — Methods and status codes
Give the method, URL and success status code for each:

a) Get all tasks
b) Create a task
c) Mark task 7 as completed
d) Delete task 7
e) Get task 999, which doesn't exist (give the status code)

<details><summary>Answer</summary>

a) `GET /api/tasks` → **200**
b) `POST /api/tasks` → **201**
c) `PATCH /api/tasks/7` with `{ "completed": true }` → **200**
d) `DELETE /api/tasks/7` → **204**
e) `GET /api/tasks/999` → **404**
</details>

### Mini exercise

Add two features to the Tasks API:

1. **`GET /api/tasks/stats`** returns `{ total, completed, pending }`.
   - Add the route, a controller function and a service function.
   - Think about route order.
2. **A new business rule:** a user can't have more than 20 tasks. Creating a 21st task returns **409** with the message `"Task limit reached"`.

<details><summary>What to check</summary>

- The `/stats` route is placed **before** `/:id` in `task.routes.ts`.
- The counting logic is in the **service**, not the controller.
- The 20-task rule is in the **service** and throws `AppError(409, "Task limit reached")`.
- The controller has no `try/catch`; the error handler sends the 409 response.
- Responses use the `{ success, data }` / `{ success, message }` shape.
</details>

---

## 6. Summary

- **Node.js** runs JavaScript outside the browser. It uses **non-blocking I/O**, so one server can handle many requests while it waits for files, databases and APIs.
- The **event loop** runs one thing at a time: sync code first, then promises, then timers and I/O callbacks. **Never block it** with slow synchronous code.
- Keep **configuration** in environment variables, read once in `config/env.ts`, and never commit `.env`.
- **Express** apps follow a simple flow: **middleware → routes → controllers → services**. Controllers handle HTTP; services hold the business rules.
- **Errors** are handled in one place. Services throw `AppError(status, message)`; the **error handler** (4 parameters, added last) sends the response.
- **REST APIs** use noun URLs, the right **HTTP method**, the right **status code**, and the **same JSON response shape** everywhere.