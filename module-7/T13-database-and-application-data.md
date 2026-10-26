# SQL and Relational Modelling with PostgreSQL

**Audience:** developers comfortable with JavaScript, Node.js and Express who are new to relational databases.
**Database:** PostgreSQL 13 or newer (most examples also work on older versions; notes call out differences).
**Driver used in Node examples:** `pg` (node-postgres).

---

## 1. Learning Objectives

By the end of this material, learners will be able to:

1. **Design** a normalised PostgreSQL schema (up to Third Normal Form) for a small application, choosing appropriate primary keys, foreign keys, relationship types and constraints, and justify each choice.
2. **Write** correct CRUD statements, joins, aggregate queries and subqueries to answer business questions, and predict how `NULL`s, join types and `GROUP BY` affect the result.
3. **Implement** a multi-statement operation as a transaction from Node.js, including correct `COMMIT`/`ROLLBACK` handling and releasing the connection back to the pool.
4. **Generate** reproducible synthetic seed data at realistic volume using SQL (`generate_series`) so that performance behaviour can be observed.
5. **Diagnose** a slow query by reading an `EXPLAIN (ANALYZE)` plan, and decide whether and which index would help (and when it would not).

---

## 2. The Running Example

Every section uses one small e-commerce schema so concepts build on each other.

```
users ──< orders ──< order_items >── products
  │
  └── 1:1 ── user_profiles
```

- A **user** places many **orders**.
- An **order** contains many **products**, and a product appears in many orders. The `order_items` table resolves this many-to-many relationship.
- A **user** has at most one **profile**.

The complete DDL appears in Section 5. Read the earlier sections first; they explain why it looks the way it does.

---

## 3. Section Breakdown

### 3.1 The Relational Model and PostgreSQL Basics

**Explanation**

A **relational database** stores data in **tables** (formally "relations"). A table has fixed, typed **columns** and any number of **rows**. Rows in different tables are connected by values, not by nested objects or pointers. **SQL** (Structured Query Language) is the declarative language used to define and query that data. *Declarative* means you describe **what** result you want, and the database's **query planner** decides **how** to get it.

SQL statements fall into four families:

| Family                        | Meaning               | Examples                                                    |
| ----------------------------- | --------------------- | ----------------------------------------------------------- |
| **DDL** (Data Definition)     | Define structure      | `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE`, `CREATE INDEX` |
| **DML** (Data Manipulation)   | Change data           | `INSERT`, `UPDATE`, `DELETE`                                |
| **DQL** (Data Query)          | Read data             | `SELECT`                                                    |
| **TCL** (Transaction Control) | Group work atomically | `BEGIN`, `COMMIT`, `ROLLBACK`, `SAVEPOINT`                  |

Common PostgreSQL column types you will use constantly:

| Type                 | Use for              | Notes                                                                                    |
| -------------------- | -------------------- | ---------------------------------------------------------------------------------------- |
| `INTEGER`, `BIGINT`  | Whole numbers        | `BIGINT` for ids that may exceed ~2.1 billion                                            |
| `NUMERIC(p,s)`       | Exact decimals       | Use for money if you want decimals; or store **integer cents**                           |
| `TEXT`, `VARCHAR(n)` | Strings              | In Postgres `TEXT` and `VARCHAR` perform the same; `VARCHAR(n)` only adds a length check |
| `BOOLEAN`            | true/false           |                                                                                          |
| `TIMESTAMPTZ`        | Points in time       | Prefer over `TIMESTAMP` (see mistakes)                                                   |
| `UUID`               | Globally unique ids  |                                                                                          |
| `JSONB`              | Semi-structured data | Indexable; not a substitute for proper columns                                           |

**Why it matters**

Almost every backend you will build persists data in a relational database. Understanding that the database is a **separate server** with its own type system, rules and optimiser (not just a place to dump JSON) changes how you design APIs.

**Analogy**

Think of a table as a strictly typed array of objects where every object must have exactly the same keys and types, and the database refuses to save anything that breaks the rules. Where a JS developer would nest an object (`order.customer`), a relational design stores `customer_id` and *looks it up* when needed.

**Common beginner mistakes**

- **Treating SQL like imperative code.** There are no loops you control; think in sets of rows.
- **Using `TIMESTAMP` instead of `TIMESTAMPTZ`.** `TIMESTAMP` stores a wall-clock time with no zone, which silently misleads once servers, users or daylight saving differ. `TIMESTAMPTZ` stores an absolute instant.
- **Storing money in `FLOAT`/`DOUBLE`.** Binary floating point cannot represent values like 0.1 exactly. Use `NUMERIC` or integer minor units (cents/kobo).
- **Misunderstanding SQL keywords as case-sensitive.** Keywords are not; unquoted identifiers are folded to lowercase. Avoid quoted mixed-case names like `"UserId"`, which then must be quoted forever.
- **Typos in keywords** produce errors that name the *token where parsing failed*, not the real mistake. For example, `IF NOT EXIST` fails "at or near EXIST" because the parser wanted `EXISTS`. The `position` field in the error tells you the character offset.

---

### 3.2 Entities and Keys

**Explanation**

An **entity** is a real-world thing the system tracks (user, product, order). Each entity usually becomes one table; each row is one **instance** of the entity; each column is an **attribute**.

A **key** is a column (or set of columns) that identifies or links rows:

- **Primary key (PK):** uniquely identifies each row. Cannot be `NULL`. One per table. Postgres automatically creates a unique index for it.
- **Candidate key:** any column set that *could* be the PK (e.g. `email` is unique on users).
- **Natural key:** an identifier that exists in the real world (email, ISBN, national ID).
- **Surrogate key:** an identifier invented by the database purely to identify the row (auto-incrementing integer, UUID).
- **Composite key:** a key made of two or more columns (e.g. `(order_id, product_id)`).
- **Foreign key (FK):** a column whose values must match an existing PK (or unique) value in another table. This is how relationships are enforced.
- **Unique key:** enforces no duplicates but, unlike a PK, may allow `NULL`s and a table may have several.

**Choosing a surrogate key type**

| Option                                | Pros                                                                             | Cons                                                                                                  |
| ------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `BIGINT GENERATED ALWAYS AS IDENTITY` | Small, fast, ordered, index-friendly; the modern standard form of auto-increment | Guessable and sequential (leaks volume; do not expose as a secret); awkward to merge across databases |
| `SERIAL` / `BIGSERIAL`                | Older shorthand for the same idea                                                | Superseded by identity columns; ownership/permission quirks                                           |
| `UUID` (`gen_random_uuid()`)          | Globally unique, unguessable, can be generated client-side                       | 16 bytes; random values spread inserts across the index, which can be slower at huge scale            |

`gen_random_uuid()` is built in from PostgreSQL 13. On older versions enable the `pgcrypto` extension first.

**Why it matters**

Keys are what make data *joinable* and *trustworthy*. Without a PK you cannot reliably update or delete one specific row, and without FKs the database cannot stop you from creating an order for a user who does not exist (an **orphan row**).

**Analogy**

A PK is like a passport number: one per person, never blank, never shared. A FK is like writing that passport number on a visa application. The system can verify it points to a real passport.

**Common beginner mistakes**

- **Using email as the PK.** Emails change; every referencing table would need updating. Use a surrogate PK and keep email as a `UNIQUE` column.
- **Misspelling a function name** such as `get_random_uuid()`. The correct function is `gen_random_uuid()`.
- **Assuming FK columns are automatically indexed.** They are *not* in Postgres (only PK and `UNIQUE` columns are). Unindexed FKs make joins and cascading deletes slow (see Section 3.12).
- **Exposing sequential ids in public URLs** and assuming it is safe. Authorise every access; use UUIDs if enumeration is a concern.
- **Having no PK at all** "because the app never needs it".

---

### 3.3 Relationships

**Explanation**

A **relationship** describes how rows in two tables relate. There are three kinds, distinguished by **cardinality** (how many on each side).

**One-to-many (1:N)**: the most common. One user has many orders. Put the FK on the **"many"** side:

```sql
orders.user_id REFERENCES users(id)
```

**One-to-one (1:1)**: one user has at most one profile. Put an FK on one side and make it **unique** (often by making the FK the PK):

```sql
user_profiles.user_id PRIMARY KEY REFERENCES users(id)
```

**Many-to-many (M:N)**: an order has many products; a product is in many orders. A relational database cannot store this directly in either table. Create a **junction table** (also called join, bridge or associative table) holding two FKs, usually with a composite PK:

```sql
order_items(order_id, product_id, ...)  -- PK (order_id, product_id)
```

The junction table can also carry attributes *of the relationship itself* (`quantity`, `unit_price_cents`).

**Referential actions (`ON DELETE` / `ON UPDATE`)** define what happens to child rows when a parent is deleted:

| Action                             | Behaviour                                        | Typical use                                 |
| ---------------------------------- | ------------------------------------------------ | ------------------------------------------- |
| `RESTRICT` / `NO ACTION` (default) | Block the delete while children exist            | Orders belonging to a user: protect history |
| `CASCADE`                          | Delete children automatically                    | Order items of a deleted order              |
| `SET NULL`                         | Set child FK to `NULL` (column must be nullable) | Optional links, e.g. "assigned_to"          |
| `SET DEFAULT`                      | Set child FK to its default                      | Rare                                        |

**Why it matters**

Relationship design is the heart of data modelling. Getting cardinality wrong (for example storing a comma-separated list of product ids in an orders column) makes querying, constraining and indexing painful or impossible.

**Analogy**

A junction table is like an attendance register at a school: students and classes are separate lists, and the register records "student X attended class Y" (plus extra details such as the date).

**Common beginner mistakes**

- **Storing arrays or comma-separated ids** instead of a junction table. You lose FK checks and joins.
- **Putting the FK on the wrong side** of a 1:N relationship.
- **Using `CASCADE` everywhere.** One careless `DELETE FROM users` could silently wipe orders, payments and history. Cascade only where children have no meaning without the parent.
- **Forgetting that `unit_price_cents` on order items is deliberate.** Prices change; the price *at purchase time* must be copied, not looked up later. This is intentional controlled duplication, not a normalisation failure.

---

### 3.4 Constraints

**Explanation**

A **constraint** is a rule the database enforces on every write, regardless of which application or script performed it. Constraints are your last line of defence for **data integrity** (the data is valid and consistent).

| Constraint                   | Enforces                                                                           | Example                             |
| ---------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------- |
| `PRIMARY KEY`                | Unique and non-null                                                                | `id UUID PRIMARY KEY`               |
| `FOREIGN KEY` / `REFERENCES` | Value must exist in the parent                                                     | `user_id UUID REFERENCES users(id)` |
| `UNIQUE`                     | No duplicate values (multiple `NULL`s allowed)                                     | `email VARCHAR(255) UNIQUE`         |
| `NOT NULL`                   | A value must be present                                                            | `email ... NOT NULL`                |
| `CHECK`                      | An arbitrary boolean rule                                                          | `CHECK (price_cents >= 0)`          |
| `DEFAULT`                    | A value when none is supplied (not a validity rule, but part of column definition) | `DEFAULT now()`                     |

A constraint violation raises an error with a **SQLSTATE code** you can handle in Node:

| Code    | Meaning                                          |
| ------- | ------------------------------------------------ |
| `23505` | unique_violation (e.g. email already registered) |
| `23503` | foreign_key_violation                            |
| `23502` | not_null_violation                               |
| `23514` | check_violation                                  |

```js
try {
  await pool.query('INSERT INTO users (email, password_hash) VALUES ($1, $2)', [email, hash]);
} catch (err) {
  if (err.code === '23505') return res.status(409).json({ error: 'Email already in use' });
  throw err;
}
```

**Why it matters**

Application-level validation (Zod, Joi, `if` statements) can be bypassed by a second service, a script, a manual fix or a bug. Database constraints cannot. They are also the only reliable way to prevent **race conditions** such as two simultaneous signups with the same email: the check-then-insert pattern in JS is unsafe, a `UNIQUE` constraint is not.

**Analogy**

Application validation is the receptionist checking your form; constraints are the locked door that opens only if the rules are met, no matter who walks up to it.

**Common beginner mistakes**

- **"I validate in Express, so I don't need constraints."** Validation and constraints are complementary; do both.
- **Check-then-insert** (`SELECT` to see whether the email exists, then `INSERT`). Two requests can both pass the check. Insert and handle error `23505`, or use `ON CONFLICT`.
- **Assuming `UNIQUE` prevents multiple `NULL`s.** It does not; each `NULL` is considered distinct.
- **Using `CHECK` with a column list in an `IN`** but forgetting the column can be `NULL`: a `CHECK` passes when the expression is `NULL`/unknown, only `FALSE` fails. Combine with `NOT NULL`.
- **Adding constraints late** to a table with dirty data. Adding them on day one is far easier.

---

### 3.5 Normalisation

**Explanation**

**Normalisation** is the process of organising tables so each fact is stored **once**, in the right place. Its goal is to prevent three **anomalies**:

- **Update anomaly:** the same fact stored in many rows must be changed everywhere, and one is missed.
- **Insert anomaly:** you cannot record one fact without another (cannot add a product until someone orders it).
- **Delete anomaly:** deleting one fact destroys another (deleting the last order erases the customer's address).

The **normal forms** are cumulative levels:

**First Normal Form (1NF):** every column holds a single, atomic value; no repeating groups; each row is unique.

- Violation: `orders.product_ids = '3,7,12'`, or columns `product1, product2, product3`.
- Fix: a junction table `order_items`.

**Second Normal Form (2NF):** in 1NF, and every non-key column depends on the **whole** primary key. This matters only for composite keys.

- Violation: `order_items(order_id, product_id, product_name, quantity)` where `product_name` depends only on `product_id`.
- Fix: move `product_name` into `products`.

**Third Normal Form (3NF):** in 2NF, and no non-key column depends on another non-key column (no **transitive dependency**).

- Violation: `orders(id, user_id, user_email)` where `user_email` is determined by `user_id`, not by the order.
- Fix: keep the email only in `users`.

A handy mnemonic: *every non-key attribute must provide a fact about the key, the whole key, and nothing but the key.*

**Denormalisation** is the deliberate, measured reversal of normalisation (for example caching an `order_total_cents` on `orders`, or copying `unit_price_cents` into `order_items`) to speed up reads or preserve history. Do it only with a reason and a plan for keeping copies correct.

**Why it matters**

A normalised design keeps data consistent with far less application code. Most real bugs like "the customer's name is different on two screens" come from storing one fact in two places.

**Analogy**

Normalisation is like keeping one contact card per person and referencing it, rather than writing everyone's phone number on every sticky note. Change the card once and every reference is right.

**Common beginner mistakes**

- **Normalising to the extreme** (splitting `first_name` and `last_name` into separate tables). Stop where the design stays understandable.
- **Denormalising "for performance" before measuring.** Joins on indexed keys are fast; premature duplication creates consistency bugs.
- **Confusing intentional snapshot data with duplication.** Historical prices and shipping addresses at order time are *facts about that moment*.
- **Using `JSONB` to dodge modelling.** Fine for genuinely flexible attributes; harmful for core relational data.

---

### 3.6 CRUD: Create, Read, Update, Delete

**Explanation**

**CRUD** are the four basic data operations.

**Create: `INSERT`**

```sql
INSERT INTO users (email, password_hash)
VALUES ('ada@example.com', '$2b$10$...')
RETURNING id, email, created_at;
```

`RETURNING` gives you the inserted row (including database-generated values like `id`) in the same round trip. This replaces the need for a second `SELECT`, and exists for `UPDATE` and `DELETE` too.

**Upsert** ("insert or update") uses `ON CONFLICT`:

```sql
INSERT INTO products (id, name, category, price_cents)
OVERRIDING SYSTEM VALUE
VALUES (1, 'Notebook', 'books', 1500)
ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name, price_cents = EXCLUDED.price_cents;
```

`EXCLUDED` refers to the row you *tried* to insert. Use `ON CONFLICT DO NOTHING` to silently skip duplicates (useful in seed scripts).

**Read: `SELECT`**

```sql
SELECT id, email
FROM users
WHERE role = 'USER' AND created_at >= now() - interval '7 days'
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;
```

Logical order of evaluation (different from the written order): `FROM` → `WHERE` → `GROUP BY` → `HAVING` → `SELECT` → `ORDER BY` → `LIMIT`. This explains why you cannot use a `SELECT` alias inside `WHERE`.

**Update: `UPDATE`**

```sql
UPDATE orders SET status = 'paid' WHERE id = 42 RETURNING *;
```

**Delete: `DELETE`**

```sql
DELETE FROM order_items WHERE order_id = 42;
```

**`NULL` handling.** `NULL` means "unknown/absent", not zero or empty string. Any comparison with `NULL` is unknown: `col = NULL` is never true. Use `IS NULL`, `IS NOT NULL`, `IS DISTINCT FROM`, and `COALESCE(col, fallback)`.

**Parameterised queries (essential for Node).** Never build SQL by concatenating user input; that is **SQL injection**. Send values separately as parameters (`$1`, `$2`, ...):

```js
// UNSAFE: attacker sends  email = "' OR '1'='1"
await pool.query(`SELECT * FROM users WHERE email = '${email}'`);

// SAFE
const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
```

Parameters can replace *values* only, never table or column names. Whitelist identifiers in code if they must be dynamic.

**Node driver gotchas**

- `pool.query` returns `{ rows, rowCount, ... }`.
- `COUNT(*)` and `SUM(integer)` return `BIGINT`/`NUMERIC`, which `pg` gives you as **strings**. Cast in SQL (`COUNT(*)::int`) or in JS.
- `TIMESTAMPTZ` columns arrive as JS `Date` objects.

**Why it matters**

CRUD is 80% of everyday backend work. Small habits (`WHERE` clauses, `RETURNING`, parameters) are the difference between safe code and incidents.

**Analogy**

`INSERT/UPDATE/DELETE` act on filing-cabinet contents; `WHERE` is the instruction "only these folders". Forget it and you act on *every* folder.

**Common beginner mistakes**

- **`UPDATE` or `DELETE` without `WHERE`**, which changes every row. Habit: write the `WHERE` first, or test with a `SELECT` using the same condition, or run inside a transaction you can roll back.
- **`SELECT *` in application code.** It over-fetches, breaks when columns are added, and prevents index-only scans. List columns.
- **`OFFSET` pagination on large tables.** `OFFSET 100000` still reads and discards 100,000 rows. Prefer **keyset pagination** (`WHERE id < $lastSeen ORDER BY id DESC LIMIT 20`).
- **`= NULL`** instead of `IS NULL`.
- **String-concatenated SQL.**
- **Forgetting `DELETE` can be blocked by FKs** and not handling error `23503`.

---

### 3.7 Joins

**Explanation**

A **join** combines rows from two tables based on a condition, usually `fk = pk`. Because normalised data is split across tables, joins are how you reassemble it.

```sql
SELECT o.id, o.status, u.email
FROM orders o
INNER JOIN users u ON u.id = o.user_id;
```

Table **aliases** (`o`, `u`) shorten the query and disambiguate columns.

| Join                     | Returns                                                        | Typical use                               |
| ------------------------ | -------------------------------------------------------------- | ----------------------------------------- |
| `INNER JOIN`             | Only rows that match on **both** sides                         | Orders with their users                   |
| `LEFT JOIN` (left outer) | All left rows; right columns are `NULL` when there is no match | All users, including those with no orders |
| `RIGHT JOIN`             | Mirror of left join                                            | Rare; rewrite as a `LEFT JOIN`            |
| `FULL JOIN`              | All rows from both sides, `NULL`-filled where unmatched        | Reconciliation/diff between two datasets  |
| `CROSS JOIN`             | Every left row paired with every right row (Cartesian product) | Generating combinations; seed data        |
| **Self join**            | A table joined to itself (with different aliases)              | Employee → manager                        |

**Finding "things with no related rows" (anti-join):**

```sql
SELECT u.id, u.email
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.id IS NULL;           -- users who never ordered
```

**Many-to-many example (three tables):**

```sql
SELECT o.id AS order_id, p.name, oi.quantity, oi.unit_price_cents
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p     ON p.id = oi.product_id
WHERE o.id = 42;
```

**Why it matters**

Joins are the payoff of normalisation. Doing this in application code (fetching users, then looping to fetch each user's orders) causes the **N+1 query problem**: 1 query for the list plus N more, each a network round trip. One join is almost always faster.

**Analogy**

A join is a mail-merge: take a list of letters (orders), and for each one look up the matching address (user) from another list using a shared id.

**Common beginner mistakes**

- **Missing or wrong `ON` condition**, which produces a Cartesian explosion (1,000 × 50,000 = 50 million rows).
- **Turning a `LEFT JOIN` into an `INNER JOIN` by accident.** A `WHERE` filter on a right-table column (`WHERE o.status = 'paid'`) discards the `NULL` rows the left join produced. Put right-side conditions in the `ON` clause to keep unmatched left rows:
  ```sql
  LEFT JOIN orders o ON o.user_id = u.id AND o.status = 'paid'
  ```
- **Row multiplication.** Joining a user to orders *and* to payments multiplies rows (3 orders × 2 payments = 6 rows per user). Sums computed afterwards are inflated. Aggregate each side in a subquery/CTE first.
- **Ambiguous column names** (`id` in both tables): qualify with the alias.
- **Assuming the join order in the SQL is the execution order.** The planner reorders for efficiency.

---

### 3.8 Aggregates

**Explanation**

An **aggregate function** collapses many rows into one value. Common ones: `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`, `STRING_AGG`, `ARRAY_AGG`.

```sql
SELECT COUNT(*) AS total_orders,
       AVG(unit_price_cents) AS avg_price
FROM order_items;
```

`GROUP BY` splits rows into groups first, then aggregates **per group**:

```sql
SELECT u.id, u.email,
       COUNT(o.id)                     AS order_count,
       COALESCE(SUM(oi.quantity * oi.unit_price_cents), 0) AS spend_cents
FROM users u
LEFT JOIN orders o       ON o.user_id = u.id
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY u.id, u.email
HAVING COUNT(o.id) >= 3
ORDER BY spend_cents DESC;
```

- **`WHERE`** filters **rows before** grouping.
- **`HAVING`** filters **groups after** aggregation (it can reference aggregates).
- **Rule:** every non-aggregated column in `SELECT` must appear in `GROUP BY` (or be functionally dependent on a grouped primary key; Postgres allows grouping by `u.id` and selecting other `users` columns).

**Useful extras**

- `COUNT(DISTINCT col)` counts unique values.
- `FILTER` for conditional aggregates: `COUNT(*) FILTER (WHERE status = 'paid')`.
- `date_trunc('day', created_at)` to bucket timestamps for daily reports.

**`NULL` behaviour**

- `COUNT(*)` counts rows; `COUNT(col)` counts rows where `col` is **not** `NULL`.
- `SUM`/`AVG`/`MIN`/`MAX` ignore `NULL`s; `SUM` of no rows is `NULL`, not 0 (hence `COALESCE`).

**Why it matters**

Dashboards, reports, billing and analytics are all aggregation. Doing it in the database avoids transferring thousands of rows to Node just to add them up.

**Analogy**

`GROUP BY` is sorting receipts into piles by customer, then `SUM` adds up each pile.

**Common beginner mistakes**

- **Using `WHERE` for an aggregate condition** (`WHERE COUNT(*) > 3` is an error; use `HAVING`).
- **Selecting a column not in `GROUP BY`**: "column must appear in the GROUP BY clause".
- **`COUNT(*)` after a `LEFT JOIN`** counts the placeholder row for users with no orders as 1. Count a column from the right table (`COUNT(o.id)`) to get 0.
- **Inflated totals from row multiplication** after multi-table joins (see Section 3.7).
- **Forgetting that `pg` returns counts as strings.**
- **Integer division:** `5 / 2` is `2` in SQL. Cast (`5::numeric / 2`) when you want decimals.

---

### 3.9 Subqueries and CTEs

**Explanation**

A **subquery** is a `SELECT` nested inside another statement. Where it appears determines its type:

| Kind                     | Where                                                            | Example                                                            |
| ------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------ |
| **Scalar**               | Returns one value; used like a constant                          | `WHERE price_cents > (SELECT AVG(price_cents) FROM products)`      |
| **List** (`IN`)          | Returns one column of many rows                                  | `WHERE user_id IN (SELECT id FROM users WHERE role = 'ADMIN')`     |
| **Existence** (`EXISTS`) | Is there at least one row?                                       | `WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id)`     |
| **Derived table**        | In `FROM`, acts as a temporary table                             | `FROM (SELECT user_id, COUNT(*) c FROM orders GROUP BY user_id) t` |
| **Correlated**           | References the outer query; logically re-evaluated per outer row | the `EXISTS` example above                                         |

A **CTE** (Common Table Expression, the `WITH` clause) names a subquery so the statement reads top-to-bottom:

```sql
WITH order_totals AS (
  SELECT order_id, SUM(quantity * unit_price_cents) AS total_cents
  FROM order_items
  GROUP BY order_id
)
SELECT o.id, u.email, t.total_cents
FROM orders o
JOIN users u         ON u.id = o.user_id
JOIN order_totals t  ON t.order_id = o.id
WHERE t.total_cents > 100000;
```

CTEs are also the clean fix for the row-multiplication problem: aggregate each branch in its own CTE, then join the already-collapsed results. Since PostgreSQL 12, simple CTEs are usually inlined by the planner rather than always materialised.

**Why it matters**

Real questions are layered: "users whose spend is above the average spend". Subqueries and CTEs let you express each layer separately and keep complex queries readable and debuggable.

**Analogy**

A subquery is a question inside a question: "Find products priced above average" first requires answering "What is the average?".

**Common beginner mistakes**

- **`NOT IN` with a `NULL` in the list.** If the subquery returns any `NULL`, `x NOT IN (...)` yields no rows at all, because the comparison becomes unknown. Prefer `NOT EXISTS`, which is `NULL`-safe.
- **A scalar subquery returning multiple rows**: error "more than one row returned by a subquery used as an expression".
- **Believing subqueries are always slower than joins.** The planner often rewrites them into the same plan; choose for clarity, then measure.
- **Over-nesting** instead of using a CTE.
- **Correlated subqueries on huge tables with no supporting index.**

---

### 3.10 Transactions and Rollback

**Explanation**

A **transaction** is a group of statements that succeed or fail as **one unit**. Transactions provide the **ACID** guarantees:

- **Atomicity:** all or nothing. If anything fails, everything is undone.
- **Consistency:** the database moves from one valid state to another (constraints hold).
- **Isolation:** concurrent transactions do not see each other's half-finished work.
- **Durability:** once committed, data survives a crash.

```sql
BEGIN;
  INSERT INTO orders (user_id, status) VALUES ('...uuid...', 'pending') RETURNING id;
  INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents) VALUES (101, 5, 2, 1500);
  UPDATE products SET stock = stock - 2 WHERE id = 5;
COMMIT;      -- or ROLLBACK; to discard everything since BEGIN
```

If a statement errors inside a transaction, Postgres marks it **aborted**: every later statement fails with "current transaction is aborted" until you `ROLLBACK`.

**`SAVEPOINT`** lets you roll back part of a transaction:

```sql
SAVEPOINT before_optional_step;
-- ...risky statement...
ROLLBACK TO SAVEPOINT before_optional_step;
```

**Isolation levels (overview).** Postgres defaults to **`READ COMMITTED`**: each statement sees only data committed before *that statement* began. `REPEATABLE READ` gives a stable snapshot for the whole transaction. `SERIALIZABLE` makes concurrent transactions behave as if run one at a time, but you must be ready to **retry** on serialisation failures (SQLSTATE `40001`).

**Locking and concurrency.** `SELECT ... FOR UPDATE` locks the selected rows until the transaction ends, so two requests cannot both read "stock = 1" and both sell it. Two transactions waiting on each other's locks cause a **deadlock**; Postgres detects it and aborts one (`40P01`). Keep transactions short and lock rows in a consistent order.

**Transactions from Node.js (critical pattern).** A **connection pool** hands out many connections. `BEGIN`, your statements and `COMMIT` must all run on the **same** connection, so check one out explicitly:

```js
async function placeOrder(pool, userId, items) {
  const client = await pool.connect();          // one dedicated connection
  try {
    await client.query('BEGIN');
    const { rows: [order] } = await client.query(
      'INSERT INTO orders (user_id) VALUES ($1) RETURNING id', [userId]
    );
    for (const it of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents)
         SELECT $1, id, $3, price_cents FROM products WHERE id = $2`,
        [order.id, it.productId, it.quantity]
      );
    }
    await client.query('COMMIT');
    return order.id;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();                           // ALWAYS return it to the pool
  }
}
```

Your migration runner uses exactly this shape: each migration file runs inside `BEGIN ... COMMIT` and a failure triggers `ROLLBACK`. This works well in PostgreSQL because **DDL is transactional**: a failed `CREATE TABLE` leaves nothing behind, and the migration is not recorded as done.

**Why it matters**

Without transactions, a crash or error halfway through "create order, add items, reduce stock" leaves the data in a corrupt in-between state: an order with no items, or stock reduced with no order.

**Analogy**

A bank transfer: debit and credit must both happen or neither. A transaction is the "undo everything if either step fails" envelope.

**Common beginner mistakes**

- **Using `pool.query('BEGIN')` then `pool.query(...)`.** Each call may use a different pooled connection, so the transaction never covers your statements.
- **Forgetting `client.release()`** (especially on error paths). The pool leaks connections and the app eventually hangs. Always release in `finally`.
- **No `ROLLBACK` in the `catch`**, leaving a connection stuck in an aborted transaction.
- **Making HTTP/API calls (payment gateway, email) inside an open transaction.** It holds locks while waiting on the network. Do external calls outside, or after commit.
- **Assuming `READ COMMITTED` prevents lost updates** in "read, compute in JS, write" flows. Use an atomic `UPDATE ... SET stock = stock - 1 WHERE stock > 0`, `SELECT ... FOR UPDATE`, or a higher isolation level.
- **Long-running transactions**, which hold locks and bloat the database.

---

### 3.11 Synthetic Seed Data

**Explanation**

**Seed data** is data inserted to give a database useful content. **Synthetic** data is artificially generated, not copied from production. It serves two purposes:

1. **Development/testing:** realistic content so screens and tests are not empty.
2. **Performance learning:** indexes and query plans behave differently on 10 rows than on 1,000,000, so you must generate volume to see real behaviour.

**The main tool: `generate_series`**

```sql
SELECT * FROM generate_series(1, 5);   -- 1,2,3,4,5
```

Combine it with `random()`, string functions and arrays to fabricate rows entirely in SQL, which is much faster than looping `INSERT`s from Node.

```sql
-- Make random() repeatable within this session
SELECT setseed(0.42);

-- 10,000 users
INSERT INTO users (email, password_hash, role)
SELECT 'user' || n || '@example.test',
       md5(n::text),                                   -- fake hash, never a real password
       CASE WHEN n % 100 = 0 THEN 'ADMIN' ELSE 'USER' END
FROM generate_series(1, 10000) AS n;

-- 1,000 products across 4 categories
INSERT INTO products (name, category, price_cents)
SELECT 'Product ' || n,
       (ARRAY['books','toys','tools','garden'])[1 + (n % 4)],
       100 + floor(random() * 50000)::int
FROM generate_series(1, 1000) AS n;

-- 5 orders per user (50,000), spread over the last year
INSERT INTO orders (user_id, status, created_at)
SELECT u.id,
       (ARRAY['pending','paid','shipped','cancelled'])[1 + floor(random() * 4)::int],
       now() - make_interval(days => floor(random() * 365)::int)
FROM users u
CROSS JOIN generate_series(1, 5);

-- 3 distinct random products per order
INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents)
SELECT o.id, p.id, 1 + floor(random() * 3)::int, p.price_cents
FROM orders o
CROSS JOIN LATERAL (
  SELECT id, price_cents FROM products ORDER BY random() LIMIT 3
) p;
```

(`LATERAL` lets the subquery run once per outer row. The last statement is the slowest and may take several seconds. That is acceptable for a seed.)

After bulk loading, refresh the planner's statistics:

```sql
ANALYZE;
```

**Realism tips**

- **Skewed distributions:** real data is uneven (a few power users place most orders). Uniform `random()` is a simplification; mention it when interpreting results.
- **Valid references:** generate parents first, then children that reference real parent ids.
- **JS alternative:** `@faker-js/faker` generates realistic names/addresses; insert in **batches** (multi-row `VALUES` or `COPY`) rather than one query per row.
- **Safety:** use reserved test domains (`example.test`, `example.com`), never real personal data, and never run a seed script against production.
- **Idempotency:** make seed scripts safe to rerun (`ON CONFLICT DO NOTHING`, or truncate in development first).

**Why it matters**

You cannot judge an index or a query plan on an empty table. Synthetic data lets you reproduce "it's slow in production" safely, share a consistent dataset with a team, and write deterministic tests.

**Analogy**

Crash-test dummies: realistic enough to learn how the system behaves under load, with no real people at risk.

**Common beginner mistakes**

- **Seeding with real or scraped customer data**, a privacy and compliance risk.
- **Looping single-row `INSERT`s from Node** for 100,000 rows. It is orders of magnitude slower than one set-based statement.
- **Forgetting `ANALYZE`** after bulk loading, so the planner uses stale statistics and picks poor plans.
- **Testing performance on tiny data** and concluding "the index did nothing".
- **Unrepeatable seeds** that make bugs impossible to reproduce.

---

### 3.12 Indexes

**Explanation**

An **index** is a separate, sorted data structure that lets Postgres find rows without reading the whole table. The default type is a **B-tree**: a balanced tree sorted by the indexed column, supporting equality (`=`), ranges (`<`, `>`, `BETWEEN`), `ORDER BY` and prefix `LIKE 'abc%'`.

Without an index, finding `WHERE user_id = X` requires a **sequential scan** (reading every row). With one, Postgres walks the tree to the matching entries.

```sql
CREATE INDEX idx_orders_user_id ON orders (user_id);
```

**Index variants**

| Kind                                 | Example                                                               | Use                                                |
| ------------------------------------ | --------------------------------------------------------------------- | -------------------------------------------------- |
| **Single-column**                    | `(user_id)`                                                           | Filter/join on one column                          |
| **Composite (multi-column)**         | `(user_id, created_at)`                                               | Filter on user, then sort/range by date            |
| **Unique**                           | `CREATE UNIQUE INDEX ...`                                             | Enforce uniqueness (what `UNIQUE` creates for you) |
| **Partial**                          | `CREATE INDEX ... ON orders (created_at) WHERE status = 'pending'`    | Small index for a hot subset                       |
| **Expression**                       | `CREATE INDEX ... ON users (lower(email))`                            | Case-insensitive lookups                           |
| **Covering**                         | `CREATE INDEX ... ON orders (user_id) INCLUDE (status)`               | Enables index-only scans                           |
| **GIN / GiST / BRIN** (mention only) | `GIN` on `JSONB`/arrays/full-text, `BRIN` for huge append-only tables | Specialised data types and sizes                   |

**Composite index rule (leftmost prefix).** An index on `(a, b)` helps queries filtering on `a`, or on `a` and `b`, but generally **not** on `b` alone. Put equality columns first, then range/sort columns.

**Automatic indexes:** Postgres creates indexes for `PRIMARY KEY` and `UNIQUE` constraints. It does **not** index foreign key columns. You almost always should, because joins and `ON DELETE` checks hit them.

**The cost of indexes**

Every index is a trade-off:

- Extra **disk space**.
- Slower **writes**: each `INSERT`/`UPDATE`/`DELETE` must also update every affected index.
- Requires maintenance (`VACUUM`, occasional rebuilds).

So index for the queries you actually run, not every column.

**When an index will *not* be used**

- The query returns a large share of the table (a sequential scan is cheaper). This is correct behaviour, not a bug.
- A function wraps the column: `WHERE lower(email) = 'x'` cannot use a plain index on `email`. Use an expression index.
- Leading wildcard: `LIKE '%abc'`.
- Type mismatch or implicit cast on the column.
- The table is tiny.
- Stale statistics (run `ANALYZE`).

**Why it matters**

Indexing is usually the single biggest lever for query performance. A lookup that scans 5,000,000 rows can become a handful of page reads.

**Analogy**

The index at the back of a textbook: rather than reading every page to find "transactions", you look it up alphabetically and jump to the page numbers. Keeping the index up to date is extra work every time the book is edited.

**Common beginner mistakes**

- **Indexing every column** "just in case".
- **Not indexing foreign keys.**
- **Wrong column order** in a composite index.
- **Expecting an index to help `WHERE lower(email) = ...`** without an expression index.
- **Adding an index and not verifying** with `EXPLAIN` that it is used.
- **Building an index on a busy production table** with a plain `CREATE INDEX`, which blocks writes. Use `CREATE INDEX CONCURRENTLY` (cannot run inside a transaction block, so it needs special handling in a transactional migration runner).

---

### 3.13 Query Plans and `EXPLAIN`

**Explanation**

A **query plan** is the step-by-step strategy the planner chose to execute your SQL. `EXPLAIN` shows the plan *without running* the query. `EXPLAIN ANALYZE` **runs it** and adds actual timings and row counts. `BUFFERS` adds memory/disk page counts.

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders WHERE user_id = '00000000-0000-0000-0000-000000000001';
```

**Warning:** `EXPLAIN ANALYZE` really executes the statement. For `INSERT`/`UPDATE`/`DELETE`, wrap it so the change is undone:

```sql
BEGIN;
EXPLAIN ANALYZE UPDATE orders SET status = 'paid' WHERE id = 42;
ROLLBACK;
```

**An illustrative plan** (exact numbers will differ on your machine):

```
Seq Scan on orders  (cost=0.00..1041.00 rows=5 width=40)
                    (actual time=0.015..9.812 rows=5 loops=1)
  Filter: (user_id = '...'::uuid)
  Rows Removed by Filter: 49995
Planning Time: 0.1 ms
Execution Time: 9.9 ms
```

After `CREATE INDEX idx_orders_user_id ON orders (user_id);` and `ANALYZE orders;`:

```
Index Scan using idx_orders_user_id on orders
                    (cost=0.29..8.31 rows=5 width=40)
                    (actual time=0.020..0.025 rows=5 loops=1)
  Index Cond: (user_id = '...'::uuid)
Execution Time: 0.05 ms
```

**How to read a plan**

1. A plan is a **tree**. Read from the **innermost / most-indented node outward**; data flows upward.
2. Each node shows:
   - **`cost=a..b`**: the planner's *estimated* cost in arbitrary units (`a` = startup cost, `b` = total). Compare costs only within the same database; they are not milliseconds.
   - **`rows`**: *estimated* rows; with `ANALYZE`, **`actual ... rows`** shows the truth.
   - **`actual time=a..b`** (ms) and **`loops`**: a node inside a loop reports *per-loop* time, so multiply by `loops`.
3. **Compare estimated vs actual rows.** Big mismatches (estimate 10, actual 500,000) usually mean stale or insufficient statistics, and the planner will make poor choices. Run `ANALYZE`.

**Common node types**

| Node                                      | Meaning                                                                                                 |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Seq Scan**                              | Reads the whole table. Fine for small tables or when most rows are needed                               |
| **Index Scan**                            | Walks the index, then fetches matching rows from the table                                              |
| **Index Only Scan**                       | Answers from the index alone (needs a covering index and a recently vacuumed table)                     |
| **Bitmap Index Scan + Bitmap Heap Scan**  | Index finds many matches, which are then fetched in page order; the middle ground                       |
| **Nested Loop**                           | For each outer row, look up inner rows. Great when the outer set is small and the inner side is indexed |
| **Hash Join**                             | Builds an in-memory hash table of one side; good for larger unsorted joins                              |
| **Merge Join**                            | Merges two sorted inputs                                                                                |
| **Sort / HashAggregate / GroupAggregate** | Ordering and grouping work                                                                              |

**A tuning workflow**

1. Reproduce the slow query with realistic data volume.
2. Run `EXPLAIN (ANALYZE, BUFFERS)`.
3. Find the node with the largest actual time or the biggest estimate error.
4. Look for: sequential scan on a large table with a selective filter, `Rows Removed by Filter` in the millions, a sort spilling to disk, a nested loop with a huge `loops` count.
5. Hypothesise a fix (an index, a rewritten condition, updated statistics), apply it, and **re-run `EXPLAIN` to confirm** the plan and timing actually improved.

**Why it matters**

`EXPLAIN` replaces guesswork. It tells you whether your index is used, why a query is slow and where time goes, which is the foundation of database performance work.

**Analogy**

A satnav's planned route: the plan lists each leg and estimated time; `ANALYZE` is the actual trip log. If the route was wrong, you see which leg took the time.

**Common beginner mistakes**

- **Running `EXPLAIN ANALYZE` on `DELETE`/`UPDATE` without a rollback**, which changes real data.
- **Concluding "the index isn't working" when a Seq Scan appears** on a small table or a low-selectivity filter. The planner may be right.
- **Reading cost as milliseconds.**
- **Ignoring `loops`**, so a "fast" node inside a 50,000-iteration loop is actually the bottleneck.
- **Tuning on a tiny dataset** or without running `ANALYZE` first.
- **Judging by one run.** The first execution may be slow due to cold cache; repeat it.

---

## 4. How the Sub-Sections Connect

### Overall sequence

The topic follows a natural progression from **designing** data, to **using** it, to **making it safe**, to **making it fast**:

```
[3.1 Relational basics]
        │
        ▼
[3.2 Entities & keys] ──► [3.3 Relationships] ──► [3.4 Constraints]
        │                        │                      │
        └────────────┬───────────┴──────────────────────┘
                     ▼
              [3.5 Normalisation]          ← DESIGN LAYER
                     │
                     ▼
              [3.6 CRUD]                   ← USE LAYER
                     │
          ┌──────────┼───────────┐
          ▼          ▼           ▼
     [3.7 Joins] [3.8 Aggregates] [3.9 Subqueries/CTEs]
          └──────────┼───────────┘
                     ▼
         [3.10 Transactions & rollback]    ← SAFETY LAYER
                     │
                     ▼
         [3.11 Synthetic seed data]        ← VOLUME
                     │
                     ▼
              [3.12 Indexes]               ← PERFORMANCE LAYER
                     │
                     ▼
         [3.13 Query plans / EXPLAIN]
                     │
                     └──────► (feeds back to 3.12 Indexes and 3.5 Design)
```

### Dependencies (what must come before what)

- **Keys (3.2) → Relationships (3.3):** relationships are implemented *with* PK/FK pairs.
- **Relationships (3.3) + Constraints (3.4) → Normalisation (3.5):** normalising means splitting tables, then reconnecting them with FKs and protecting them with constraints.
- **Schema (3.1–3.5) → CRUD (3.6):** you cannot write data until tables exist; constraints decide which writes are accepted.
- **CRUD (3.6) → Joins, Aggregates, Subqueries (3.7–3.9):** these are three ways to extend `SELECT`. They are largely independent of one another but all assume basic `SELECT`/`WHERE`. Joins come first because aggregates and subqueries are usually applied *across* joined data.
- **Joins + Aggregates (3.7, 3.8) → row multiplication:** the main interaction pitfall; resolved with CTEs/subqueries (3.9).
- **CRUD (3.6) → Transactions (3.10):** a transaction wraps multiple CRUD statements. Constraints (3.4) are what make a transaction *fail*, triggering rollback.
- **Schema + CRUD → Seed data (3.11):** seed statements must satisfy constraints and respect FK insert order (parents before children).
- **Seed data (3.11) → Indexes and plans (3.12, 3.13):** performance work needs realistic volume to be meaningful.
- **Indexes ↔ Query plans:** a **feedback loop**. Plans (3.13) reveal which index to add; re-running the plan confirms it worked.
- **Normalisation ↔ Performance:** well-designed schemas make good indexing straightforward; occasionally, plan analysis motivates a *deliberate* denormalisation.

### Hierarchy (for a layered diagram)

| Layer          | Question it answers                                       | Sections          |
| -------------- | --------------------------------------------------------- | ----------------- |
| 1. Model       | "What are the things and how do they relate?"             | 3.1–3.5           |
| 2. Query       | "How do I read and change the data?"                      | 3.6–3.9           |
| 3. Safety      | "How do I keep it correct under failure and concurrency?" | 3.4 (rules), 3.10 |
| 4. Performance | "How do I make it fast, and prove it?"                    | 3.11–3.13         |

---

## 5. Reference Schema (complete DDL)

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT,
  google_id     VARCHAR(255) UNIQUE,
  role          VARCHAR(20) NOT NULL DEFAULT 'USER'
                CHECK (role IN ('USER', 'ADMIN')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_profiles (            -- 1:1 with users
  user_id    UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name  TEXT NOT NULL,
  phone      TEXT
);

CREATE TABLE products (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        TEXT    NOT NULL,
  category    TEXT    NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0)
);

CREATE TABLE orders (                   -- 1:N from users
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status     TEXT NOT NULL DEFAULT 'pending'
             CHECK (status IN ('pending','paid','shipped','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE order_items (              -- junction: M:N orders <-> products
  order_id         BIGINT  NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id       BIGINT  NOT NULL REFERENCES products(id),
  quantity         INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
  PRIMARY KEY (order_id, product_id)
);

-- Foreign keys are NOT indexed automatically:
CREATE INDEX idx_orders_user_id ON orders (user_id);
-- order_items.order_id is already covered by the composite PK (leftmost column);
-- product_id needs its own index for "which orders contain product X?":
CREATE INDEX idx_order_items_product_id ON order_items (product_id);
```

Design notes learners should be able to explain:

- Why `orders.user_id` is `ON DELETE RESTRICT` but `order_items.order_id` is `ON DELETE CASCADE`.
- Why `unit_price_cents` is stored on `order_items` even though `products.price_cents` exists.
- Why `(order_id, product_id)` makes a good composite PK here (it also prevents the same product being added twice to one order).
- Why `user_profiles.user_id` is both PK and FK (it enforces 1:1).

---

## 6. Key Terms Glossary

| Term                               | Definition                                                                                           |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **ACID**                           | Atomicity, Consistency, Isolation, Durability: the guarantees of a reliable transaction.             |
| **Aggregate function**             | A function (`COUNT`, `SUM`, `AVG`...) that reduces many rows to one value.                           |
| **Alias**                          | A temporary name for a table or column within a query (`orders o`, `AS total`).                      |
| **Anomaly (update/insert/delete)** | A data inconsistency caused by storing a fact in more than one place.                                |
| **Anti-join**                      | A query for rows with *no* match in another table (`LEFT JOIN ... WHERE x IS NULL` or `NOT EXISTS`). |
| **Atomic**                         | Indivisible; either fully happens or does not happen at all.                                         |
| **B-tree**                         | The default balanced-tree index structure, good for equality, ranges and sorting.                    |
| **Cardinality**                    | How many rows on one side relate to rows on the other (1:1, 1:N, M:N).                               |
| **CHECK constraint**               | A rule requiring a boolean expression to be true for every row.                                      |
| **Commit**                         | Permanently save all changes made in the current transaction.                                        |
| **Composite key/index**            | A key or index made of multiple columns.                                                             |
| **Connection pool**                | A managed set of reusable database connections shared by the application.                            |
| **Constraint**                     | A rule enforced by the database on every write.                                                      |
| **Correlated subquery**            | A subquery that references columns from the outer query.                                             |
| **CRUD**                           | Create, Read, Update, Delete: the four basic data operations.                                        |
| **CTE**                            | Common Table Expression; a named temporary result defined with `WITH`.                               |
| **Cross join**                     | A join returning every combination of rows from two tables.                                          |
| **DDL / DML / DQL / TCL**          | SQL families: definition, manipulation, query and transaction control.                               |
| **Deadlock**                       | Two transactions each waiting for a lock the other holds.                                            |
| **Denormalisation**                | Deliberately storing redundant data to speed reads or preserve history.                              |
| **Entity**                         | A real-world thing represented as a table.                                                           |
| **EXPLAIN / EXPLAIN ANALYZE**      | Commands that show the planned / actually executed query plan.                                       |
| **Foreign key (FK)**               | A column referencing another table's key, enforcing a relationship.                                  |
| **Generate_series**                | A function producing a sequence of values, used to create bulk synthetic rows.                       |
| **Identity column**                | An auto-generating integer column (`GENERATED ALWAYS AS IDENTITY`).                                  |
| **Index**                          | A sorted auxiliary structure that speeds up lookups at the cost of write speed and space.            |
| **Isolation level**                | How much one transaction can see of others' concurrent changes.                                      |
| **Join**                           | Combining rows from two tables using a matching condition.                                           |
| **Junction table**                 | A table resolving a many-to-many relationship using two foreign keys.                                |
| **Keyset pagination**              | Paging by "rows after the last seen key" instead of `OFFSET`.                                        |
| **N+1 problem**                    | One query for a list plus one extra query per item; fixed with joins/batching.                       |
| **Normal form (1NF/2NF/3NF)**      | Cumulative levels of schema organisation that reduce redundancy.                                     |
| **Normalisation**                  | Structuring tables so each fact is stored once.                                                      |
| **NULL**                           | A marker meaning "unknown/absent"; comparisons with it are never true.                               |
| **Orphan row**                     | A child row whose referenced parent no longer exists.                                                |
| **Parameterised query**            | A query sending values separately (`$1`) from SQL text to prevent injection.                         |
| **Partial index**                  | An index covering only rows matching a `WHERE` condition.                                            |
| **Primary key (PK)**               | The unique, non-null identifier of each row.                                                         |
| **Query planner**                  | The component choosing the execution strategy for a query.                                           |
| **Rollback**                       | Undo all changes made in the current transaction.                                                    |
| **Savepoint**                      | A marker inside a transaction you can roll back to.                                                  |
| **Selectivity**                    | The fraction of rows a filter matches; highly selective filters benefit most from indexes.           |
| **Seed data**                      | Data inserted to populate a database for development, testing or demos.                              |
| **Sequential scan**                | Reading every row of a table.                                                                        |
| **SQL injection**                  | An attack where user input is interpreted as SQL because it was concatenated into a query.           |
| **SQLSTATE**                       | A five-character error code (e.g. `23505`) identifying the error class.                              |
| **Subquery**                       | A `SELECT` nested inside another statement.                                                          |
| **Surrogate / natural key**        | An invented identifier vs. a real-world identifier.                                                  |
| **Transaction**                    | A group of statements executed as one all-or-nothing unit.                                           |
| **Transitive dependency**          | A non-key column depending on another non-key column (violates 3NF).                                 |
| **Upsert**                         | Insert, or update if the row already exists (`ON CONFLICT`).                                         |
| **Vacuum / Analyze**               | Maintenance commands: reclaim dead rows / refresh planner statistics.                                |

---

## 7. Knowledge Check

### Questions

**Q1 (Design).** A teammate proposes this table:

```
orders(id, customer_name, customer_email, product_names, total)
```
where `product_names` contains values like `"Notebook, Pen, Stapler"`.
a) Which normal forms does it violate, and why?
b) Redesign it using the entities from this course.

**Q2 (Joins and aggregates).** Write a query that lists **every** user's email and the **number of paid orders** they have, including users with zero. Then explain why putting `WHERE o.status = 'paid'` after a `LEFT JOIN` would give the wrong answer.

**Q3 (Subqueries).** Why does `SELECT * FROM users WHERE id NOT IN (SELECT user_id FROM some_table)` sometimes return zero rows even though many users are missing from `some_table`? How do you fix it?

**Q4 (Transactions).** This Express handler is meant to create an order and its items atomically. Identify **three** bugs.

```js
async function createOrder(userId, items) {
  await pool.query('BEGIN');
  const { rows } = await pool.query(
    'INSERT INTO orders (user_id) VALUES ($1) RETURNING id', [userId]);
  for (const it of items) {
    await pool.query(
      'INSERT INTO order_items VALUES ($1, $2, $3, $4)',
      [rows[0].id, it.productId, it.qty, it.price]);
  }
  await pool.query('COMMIT');
}
```

**Q5 (Indexes and plans).** `EXPLAIN ANALYZE SELECT * FROM users WHERE lower(email) = 'ada@example.com';` shows a `Seq Scan` on 10,000 rows even though `email` has a `UNIQUE` constraint. Explain why and give the fix. After applying it, what should you look for in the new plan, and what step would you take if the plan still shows a sequential scan?

### Applied scenario (hands-on exercise)

Using the reference schema (Section 5):

1. Create the schema in a fresh database inside a single migration file.
2. Seed it with the statements from Section 3.11.
3. Run `EXPLAIN (ANALYZE, BUFFERS)` for:
   ```sql
   SELECT o.id, o.created_at
   FROM orders o
   WHERE o.user_id = (SELECT id FROM users WHERE email = 'user42@example.test')
   ORDER BY o.created_at DESC
   LIMIT 10;
   ```
   Record the execution time and node types.
4. Add `CREATE INDEX idx_orders_user_created ON orders (user_id, created_at DESC);`, run `ANALYZE orders;`, and re-run. Compare plan nodes and times.
5. Write a Node function (using `pool.connect()`) that cancels an order: set its status to `'cancelled'` and fail with `ROLLBACK` if the order was already `'shipped'`. Test both paths.
6. Write one-paragraph notes: which part of the speed-up came from the index, and what is the write-cost trade-off?

### Answer key

**A1.** a) **1NF** is violated because `product_names` holds multiple values in one column. **2NF/3NF** issues: customer details (`customer_name`, `customer_email`) depend on the customer, not on the order, which is a transitive dependency; `total` is derivable from the items (a denormalised value). b) `users(id, email, ...)`, `orders(id, user_id FK, status, created_at)`, `products(id, name, price_cents)`, `order_items(order_id FK, product_id FK, quantity, unit_price_cents, PK(order_id, product_id))`. Total is computed with `SUM(quantity * unit_price_cents)` or cached deliberately.

**A2.**
```sql
SELECT u.email, COUNT(o.id) AS paid_orders
FROM users u
LEFT JOIN orders o ON o.user_id = u.id AND o.status = 'paid'
GROUP BY u.id, u.email;
```
A `WHERE o.status = 'paid'` runs *after* the join; users with no orders have `o.status = NULL`, which fails the filter, so they disappear and the query behaves like an `INNER JOIN`. Moving the condition into `ON` keeps unmatched users with a count of 0. `COUNT(o.id)` (not `COUNT(*)`) is what yields 0 for them.

**A3.** If the subquery returns even one `NULL`, `id NOT IN (...)` evaluates to *unknown* for every row, so nothing is returned. Fix: `WHERE NOT EXISTS (SELECT 1 FROM some_table t WHERE t.user_id = users.id)`, or filter `WHERE user_id IS NOT NULL` inside the subquery.

**A4.** (1) `pool.query` for `BEGIN`, the inserts and `COMMIT` may use **different connections**, so there is no real transaction; use `const client = await pool.connect()` and run every statement on `client`. (2) **No `try/catch` with `ROLLBACK`**: any error leaves partial data (or an aborted transaction). (3) **No `client.release()` in a `finally`**, which leaks connections. Bonus issues: the `INSERT INTO order_items VALUES (...)` lacks a column list (fragile), and trusting `it.price` from the client lets users set their own price. Read it from `products`.

**A5.** The `lower(email)` expression prevents Postgres from using the plain index (or the unique constraint's index) on `email`. Fix: `CREATE INDEX idx_users_email_lower ON users (lower(email));` (or `CREATE UNIQUE INDEX` if case-insensitive uniqueness is wanted). In the new plan look for an `Index Scan`/`Bitmap Index Scan` using the new index and a drop in actual time. If it is still a `Seq Scan`: run `ANALYZE users;`, confirm the query expression exactly matches the index expression, and consider that with only 10,000 rows (or a low-selectivity filter) the planner may legitimately prefer a sequential scan. Re-test with larger data.

---

## 8. Summary Recap

- **Model first.** Entities become tables; **primary keys** identify rows and **foreign keys** express relationships (1:1, 1:N, and M:N via a **junction table**). **Normalise to 3NF** so each fact lives in one place, and denormalise only deliberately and with measurement.
- **Let the database enforce the rules.** `NOT NULL`, `UNIQUE`, `CHECK` and foreign keys protect integrity even when application code has bugs or races. Handle their SQLSTATE errors (such as `23505`) in your Express layer.
- **Query in sets, with parameters.** Master CRUD with `RETURNING` and `ON CONFLICT`; always use `$1`-style parameters, and never write `UPDATE`/`DELETE` without `WHERE`. Use **joins** to combine tables, **aggregates** with `GROUP BY`/`HAVING` to summarise, and **subqueries/CTEs** to layer questions. Watch for `NULL` traps, `LEFT JOIN` filter placement and row multiplication.
- **Use transactions for multi-step changes.** Wrap related statements in `BEGIN ... COMMIT` with `ROLLBACK` on error, using a **dedicated pooled client** (`pool.connect()`) and always `release()` it. Postgres DDL is transactional, which is why migrations roll back cleanly.
- **Make it fast only after you can measure it.** Generate realistic **synthetic data** with `generate_series`, run `ANALYZE`, and add **indexes** that match real query patterns (index your foreign keys; mind composite column order; expression indexes for function-wrapped columns).
- **Read the plan, don't guess.** `EXPLAIN (ANALYZE, BUFFERS)` shows scan types, join strategies, estimated vs actual rows and timing. Diagnose, change one thing, and re-run `EXPLAIN` to prove the improvement, remembering that `EXPLAIN ANALYZE` executes the query.