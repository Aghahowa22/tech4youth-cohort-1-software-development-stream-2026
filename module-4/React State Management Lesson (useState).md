# React State Management: Beginner-Friendly Notes

## Introduction

State is one of the most important concepts in React. It allows a component to remember information that can change while the application is running.

Examples of information that may need to change include:

- A counter value
- Text entered into a form
- Whether a modal is open
- A selected tab
- A list of products
- A user's profile information
- A shopping cart
- Loading and error information

When state changes, React updates the parts of the user interface that depend on that state.

---

# 1. What Is `useState`?

`useState` is a React Hook that allows a functional component to create and manage state.

It is imported from React:

```tsx
import { useState } from "react";
```

The basic syntax is:

```tsx
const [state, setState] = useState(initialValue);
```

For example:

```tsx
const [count, setCount] = useState(0);
```

There are two important values here:

- `count` — the current state value.
- `setCount` — the function used to update the state.
- `0` — the initial value.

When you call the setter function, React updates the state and re-renders the component.

## Basic Example

Create:

```text
src/components/Counter.tsx
```

Complete code:

```tsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  const increaseCount = () => {
    setCount(count + 1);
  };

  const decreaseCount = () => {
    setCount(count - 1);
  };

  const resetCount = () => {
    setCount(0);
  };

  return (
    <div>
      <h2>Counter</h2>

      <h1>{count}</h1>

      <button onClick={increaseCount}>
        Increase
      </button>

      <button onClick={decreaseCount}>
        Decrease
      </button>

      <button onClick={resetCount}>
        Reset
      </button>
    </div>
  );
}

export default Counter;
```

Call the component from `App.tsx`:

```tsx
import Counter from "./components/Counter";

function App() {
  return (
    <div>
      <h1>My React App</h1>

      <Counter />
    </div>
  );
}

export default App;
```

## What Happens When the Button Is Clicked?

Initially:

```text
count = 0
```

When the user clicks the Increase button:

```tsx
setCount(count + 1);
```

React changes the state from:

```text
0
```

to:

```text
1
```

The component then renders again and displays the new value.

---

# 2. Important `useState` Rules

## Never directly modify state

Do not do this:

```tsx
count = count + 1;
```

Use the setter:

```tsx
setCount(count + 1);
```

For objects, do not directly modify a property:

```tsx
user.name = "John";
```

Instead, create a new object and pass it to the setter:

```tsx
setUser((previousUser) => ({
  ...previousUser,
  name: "John",
}));
```

For arrays, do not directly modify the existing array:

```tsx
todos.push(newTodo);
```

Instead:

```tsx
setTodos((previousTodos) => [
  ...previousTodos,
  newTodo,
]);
```

The general rule is:

> Do not directly modify React state. Use the state setter to provide the new value.

---

# 3. Other State Management Tools and Patterns in React

`useState` is the simplest and most commonly used state tool, but React provides other tools and patterns for different situations.

## 3.1 `useState`

Used for simple local component state.

Examples:

- Input values
- Counters
- Modal visibility
- Tabs
- Dropdowns
- Small forms

```tsx
const [isOpen, setIsOpen] = useState(false);
```

---

## 3.2 `useReducer`

Used when state has more complicated update logic or many related state transitions.

```tsx
const [state, dispatch] = useReducer(reducer, initialState);
```

Common use cases:

- Complex forms
- Multi-step processes
- Shopping carts
- Complex dashboards
- State with many possible actions

---

## 3.3 `useContext`

Used to make state or other values available to multiple components without passing props through every level.

Common use cases:

- Authentication
- Theme
- Language
- User preferences
- Application-wide settings

```tsx
const value = useContext(MyContext);
```

Context is not a replacement for all state. It is most useful when many components need the same value.

---

## 3.4 External State Management Libraries

For larger applications, developers may use dedicated state management libraries.

Common examples include:

- Redux Toolkit
- Zustand
- Jotai
- MobX

These can be useful when application state becomes large or needs to be shared across many unrelated parts of the application.

For a beginner, `useState`, props, lifting state, `useContext`, and eventually `useReducer` are more important to learn first.

---

## 3.5 Server State

Data coming from an API or backend is often called server state.

Examples:

- Users retrieved from a database
- Products from an API
- Transactions
- Notifications
- Orders

Libraries such as TanStack Query can help manage server state, including:

- Fetching
- Caching
- Loading states
- Errors
- Refetching
- Synchronizing data

Server state is different from ordinary local UI state.

---

# 4. Different Types of State You Can Store With `useState`

`useState` can store many types of values.

## String

```tsx
const [name, setName] = useState("");
```

## Number

```tsx
const [count, setCount] = useState(0);
```

## Boolean

```tsx
const [isOpen, setIsOpen] = useState(false);
```

## Object

```tsx
const [user, setUser] = useState({
  name: "",
  email: "",
});
```

## Array

```tsx
const [items, setItems] = useState<string[]>([]);
```

## Nullable value

```tsx
const [user, setUser] = useState<User | null>(null);
```

---

# 5. Props

Props are values passed from a parent component to a child component.

Props allow components to become reusable because the parent can provide different data to the same component.

For example, a `UserCard` component can receive a user's name, email, and age through props.

Create:

```text
src/components/UserCard.tsx
```

Complete code:

```tsx
interface UserCardProps {
  name: string;
  email: string;
  age: number;
}

function UserCard({
  name,
  email,
  age,
}: UserCardProps) {
  return (
    <div>
      <h2>{name}</h2>

      <p>Email: {email}</p>

      <p>Age: {age}</p>
    </div>
  );
}

export default UserCard;
```

Now call it from `App.tsx`:

```tsx
import UserCard from "./components/UserCard";

function App() {
  return (
    <div>
      <h1>User Dashboard</h1>

      <UserCard
        name="Eliot"
        email="eliot@example.com"
        age={25}
      />
    </div>
  );
}

export default App;
```

The parent provides the values:

```tsx
<UserCard
  name="Eliot"
  email="eliot@example.com"
  age={25}
/>
```

The child receives them here:

```tsx
function UserCard({
  name,
  email,
  age,
}: UserCardProps)
```

---

# 6. Passing Variables as Props

Props do not have to contain hard-coded values.

You can create values in `App.tsx` and pass them to a component.

Complete `App.tsx` example:

```tsx
import UserCard from "./components/UserCard";

function App() {
  const name = "Eliot";
  const email = "eliot@example.com";
  const age = 25;

  return (
    <div>
      <h1>User Dashboard</h1>

      <UserCard
        name={name}
        email={email}
        age={age}
      />
    </div>
  );
}

export default App;
```

The following:

```tsx
name={name}
```

means:

> Pass the value stored in the `name` variable.

The following:

```tsx
name="Eliot"
```

means:

> Pass the literal string `"Eliot"`.

---

# 7. Passing State as Props

Props become especially useful when the value comes from state.

Create:

```text
src/components/Preview.tsx
```

Complete code:

```tsx
interface PreviewProps {
  text: string;
}

function Preview({ text }: PreviewProps) {
  return (
    <div>
      <h2>Preview</h2>

      <p>
        {text || "Nothing has been entered yet."}
      </p>
    </div>
  );
}

export default Preview;
```

Now `App.tsx`:

```tsx
import { useState } from "react";

import Preview from "./components/Preview";

function App() {
  const [text, setText] = useState("");

  return (
    <div>
      <h1>Text Preview</h1>

      <Preview text={text} />
    </div>
  );
}

export default App;
```

Here, the state starts as an empty string:

```tsx
const [text, setText] = useState("");
```

and the current value is passed to the component:

```tsx
<Preview text={text} />
```

As the state changes, the value received by `Preview` changes as well.

---

# 8. Events in React

Events allow your application to respond to user actions.

Common React events include:

```text
onClick
onChange
onSubmit
onFocus
onBlur
onKeyDown
onMouseEnter
onMouseLeave
```

The most common ones for beginners are `onClick`, `onChange`, and `onSubmit`.

---

# 9. `onClick`

Create:

```text
src/components/Counter.tsx
```

Complete code:

```tsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  const increaseCount = () => {
    setCount(count + 1);
  };

  return (
    <div>
      <h2>Count: {count}</h2>

      <button onClick={increaseCount}>
        Increase
      </button>
    </div>
  );
}

export default Counter;
```

`onClick` runs the function when the button is clicked.

You can also write:

```tsx
<button
  onClick={() => setCount(count + 1)}
>
  Increase
</button>
```

---

# 10. `onChange` With an Input

Create:

```text
src/components/TextInput.tsx
```

Complete code:

```tsx
import { useState } from "react";

function TextInput() {
  const [text, setText] = useState("");

  const handleTextChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setText(event.target.value);
  };

  return (
    <div>
      <h2>Text Input</h2>

      <input
        type="text"
        value={text}
        placeholder="Enter some text"
        onChange={handleTextChange}
      />

      <p>You entered: {text}</p>
    </div>
  );
}

export default TextInput;
```

The important part is:

```tsx
onChange={handleTextChange}
```

When the user types, React provides the event object.

The entered value is available through:

```tsx
event.target.value
```

Then:

```tsx
setText(event.target.value);
```

updates the state.

---

# 11. `onSubmit` With a Form

Create:

```text
src/components/LoginForm.tsx
```

Complete code:

```tsx
import { useState } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    console.log({
      email,
      password,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) =>
          setEmail(event.target.value)
        }
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) =>
          setPassword(event.target.value)
        }
      />

      <button type="submit">
        Login
      </button>
    </form>
  );
}

export default LoginForm;
```

`event.preventDefault()` prevents the browser from reloading the page when the form is submitted.

---

# 12. Passing Functions as Props

Functions can also be passed from a parent to a child.

This is especially important for lifting state.

Create:

```text
src/components/TextInput.tsx
```

Complete code:

```tsx
interface TextInputProps {
  text: string;
  onTextChange: (value: string) => void;
}

function TextInput({
  text,
  onTextChange,
}: TextInputProps) {
  return (
    <div>
      <label>
        Enter text:
      </label>

      <input
        type="text"
        value={text}
        onChange={(event) =>
          onTextChange(event.target.value)
        }
      />
    </div>
  );
}

export default TextInput;
```

The prop:

```tsx
onTextChange: (value: string) => void;
```

means:

> This component expects to receive a function that accepts a string and does not return a value.

Now `App.tsx` can provide the function:

```tsx
import { useState } from "react";

import TextInput from "./components/TextInput";

function App() {
  const [text, setText] = useState("");

  return (
    <div>
      <h1>Text Input</h1>

      <TextInput
        text={text}
        onTextChange={setText}
      />
    </div>
  );
}

export default App;
```

Here:

```tsx
onTextChange={setText}
```

passes the state setter function to the child.

---

# 13. Arrays in State

Arrays are commonly used for collections of data.

Examples:

- Products
- Users
- Todos
- Transactions
- Messages
- Notifications
- Cart items

Create:

```text
src/components/TodoList.tsx
```

Complete code:

```tsx
import { useState } from "react";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = () => {
    const newTodo: Todo = {
      id: Date.now(),
      title: "Learn React",
      completed: false,
    };

    setTodos((previousTodos) => [
      ...previousTodos,
      newTodo,
    ]);
  };

  const deleteTodo = (id: number) => {
    setTodos((previousTodos) =>
      previousTodos.filter(
        (todo) => todo.id !== id
      )
    );
  };

  const toggleTodo = (id: number) => {
    setTodos((previousTodos) =>
      previousTodos.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              completed: !todo.completed,
            }
          : todo
      )
    );
  };

  return (
    <div>
      <h2>Todo List</h2>

      <button onClick={addTodo}>
        Add Todo
      </button>

      {todos.length === 0 ? (
        <p>No todos yet.</p>
      ) : (
        <div>
          {todos.map((todo) => (
            <div key={todo.id}>
              <span>
                {todo.completed ? "Completed" : "Pending"}
              </span>

              <span>
                {" "}
                {todo.title}
              </span>

              <button
                onClick={() =>
                  toggleTodo(todo.id)
                }
              >
                Toggle
              </button>

              <button
                onClick={() =>
                  deleteTodo(todo.id)
                }
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TodoList;
```

Call it from `App.tsx`:

```tsx
import TodoList from "./components/TodoList";

function App() {
  return (
    <div>
      <h1>Todo Application</h1>

      <TodoList />
    </div>
  );
}

export default App;
```

---

# 14. Adding Items to an Array

The important pattern is:

```tsx
setTodos((previousTodos) => [
  ...previousTodos,
  newTodo,
]);
```

Suppose the current array is:

```tsx
[
  todo1,
  todo2
]
```

The new array becomes:

```tsx
[
  todo1,
  todo2,
  newTodo
]
```

The spread operator:

```tsx
...previousTodos
```

copies the existing items into a new array.

---

# 15. Removing Items From an Array

Use `filter()`.

```tsx
setTodos((previousTodos) =>
  previousTodos.filter(
    (todo) => todo.id !== id
  )
);
```

This creates a new array containing every todo except the one whose ID matches the supplied ID.

---

# 16. Updating Items in an Array

Use `map()`.

```tsx
setTodos((previousTodos) =>
  previousTodos.map((todo) =>
    todo.id === id
      ? {
          ...todo,
          completed: !todo.completed,
        }
      : todo
  )
);
```

This means:

1. Go through every todo.
2. Find the todo with the matching ID.
3. Create a new version of that todo.
4. Change its `c