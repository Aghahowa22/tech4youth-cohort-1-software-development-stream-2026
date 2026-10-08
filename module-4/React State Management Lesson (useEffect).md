# React `useEffect`

## 1. What is `useEffect`?

`useEffect` is a React Hook that allows us to perform **side effects** in a component.

A **side effect** is something a component does that is not simply calculating and displaying UI.

Examples of side effects include:

- Fetching data from an API
- Changing the browser document title
- Setting up a timer
- Listening for browser events
- Saving data to `localStorage`
- Running code when a component loads
- Running code when a particular state or prop changes
- Cleaning up a timer or event listener

### Basic Syntax

```jsx
import { useEffect } from "react";

useEffect(() => {
  // Code to run
});

```

The function inside `useEffect` is called the **effect function**.

For example:

```jsx
import { useEffect } from "react";

function App() {
  useEffect(() => {
    console.log("The effect is running");
  });

  return <h1>Hello React</h1>;
}

export default App;

```

---

# 2. Why Do We Need `useEffect`?

React components are mainly responsible for:

1. Receiving data
2. Processing data
3. Displaying UI

However, sometimes our component needs to interact with something outside the component.

For example, suppose we want to change the browser tab title.

We could do:

```jsx
document.title = "My Website";

```

But React provides `useEffect` for handling this kind of operation.

```jsx
import { useEffect } from "react";

function App() {
  useEffect(() => {
    document.title = "My Website";
  });

  return <h1>Welcome</h1>;
}

```

The `useEffect` tells React:

> "After rendering this component, run this code."

---

# 3. `useEffect` and Rendering

A simple React component might look like this:

```jsx
function App() {
  return <h1>Hello World</h1>;
}

```

React renders the component and displays:

```text
Hello World

```

When we use `useEffect`:

```jsx
function App() {
  useEffect(() => {
    console.log("Component rendered");
  });

  return <h1>Hello World</h1>;
}

```

React:

1. Renders the component
2. Displays the UI
3. Runs the effect

So you can think of it as:

```text
Component renders
       ↓
UI appears
       ↓
useEffect runs

```

---

# 4. Importing `useEffect`

`useEffect` is imported from React.

```jsx
import { useEffect } from "react";

```

If you are already importing `useState`, you can import both together:

```jsx
import { useState, useEffect } from "react";

```

Example:

```jsx
import { useState, useEffect } from "react";

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("Count changed");
  });

  return (
    <div>
      <h1>{count}</h1>

      <button onClick={() => setCount(count + 1)}>
        Increase
      </button>
    </div>
  );
}

export default App;

```

---

# 5. The Dependency Array

One of the most important parts of `useEffect` is the **dependency array**.

The dependency array tells React **when the effect should run**.

The syntax is:

```jsx
useEffect(() => {
  // Effect
}, []);

```

The second argument is the dependency array.

There are three important ways to use it.

---

# 6. `useEffect` Without a Dependency Array

Example:

```jsx
useEffect(() => {
  console.log("Effect running");
});

```

There is no dependency array.

This means the effect runs **after every render**.

Example:

```jsx
import { useState, useEffect } from "react";

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("Effect running");
  });

  return (
    <div>
      <h1>{count}</h1>

      <button onClick={() => setCount(count + 1)}>
        Increase
      </button>
    </div>
  );
}

```

When the page first loads:

```text
Effect running

```

When the button is clicked:

```text
Effect running

```

If the component renders again, the effect runs again.

### Important

Avoid using an effect without a dependency array unless you actually need the effect to run after **every render**.

---

# 7. `useEffect` With an Empty Dependency Array

Example:

```jsx
useEffect(() => {
  console.log("Component loaded");
}, []);

```

The empty array:

```jsx
[]

```

means:

> Run this effect after the component's initial render.

For example:

```jsx
import { useEffect } from "react";

function App() {
  useEffect(() => {
    console.log("Component loaded");
  }, []);

  return <h1>Hello World</h1>;
}

export default App;

```

The effect runs when the component is mounted.

This is commonly used for things such as:

- Initial API requests
- Initial setup
- Loading saved data
- Setting up subscriptions
- Initial browser configuration

---

# 8. Example: Fetching Data

One of the most common uses of `useEffect` is fetching data from an API.

```jsx
import { useEffect } from "react";

function App() {
  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      });
  }, []);

  return <h1>Users</h1>;
}

export default App;

```

The empty dependency array means the request runs when the component loads.

### What happens?

```text
Component loads
      ↓
useEffect runs
      ↓
API request is sent
      ↓
Server responds
      ↓
Data is received

```

---

# 9. Fetching Data and Storing It in State

Usually, we don't just want to print API data to the console.

We want to display it.

We can combine `useEffect` with `useState`.

```jsx
import { useState, useEffect } from "react";

function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((response) => response.json())
      .then((data) => {
        setUsers(data);
      });
  }, []);

  return (
    <div>
      <h1>Users</h1>

      {users.map((user) => (
        <p key={user.id}>{user.name}</p>
      ))}
    </div>
  );
}

export default App;

```

### What happens here?

Initially:

```jsx
const [users, setUsers] = useState([]);

```

The users array is empty.

Then:

```jsx
useEffect(() => {

```

runs after the component loads.

The API request is made.

When the data comes back:

```jsx
setUsers(data);

```

updates the state.

React renders the component again and displays the users.

---

# 10. `useEffect` With a Dependency

We can tell React to run an effect whenever a specific value changes.

For example:

```jsx
useEffect(() => {
  console.log("Count changed");
}, [count]);

```

Here:

```jsx
[count]

```

is the dependency.

React watches `count`.

Whenever `count` changes, the effect runs.

Example:

```jsx
import { useState, useEffect } from "react";

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("Count changed:", count);
  }, [count]);

  return (
    <div>
      <h1>{count}</h1>

      <button onClick={() => setCount(count + 1)}>
        Increase
      </button>
    </div>
  );
}

export default App;

```

When `count` changes:

```text
0 → 1

```

the effect runs.

Then:

```text
1 → 2

```

the effect runs again.

And so on.

---

# 11. Example: Updating the Browser Title

We can use state and `useEffect` together.

```jsx
import { useState, useEffect } from "react";

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `Count: ${count}`;
  }, [count]);

  return (
    <div>
      <h1>{count}</h1>

      <button onClick={() => setCount(count + 1)}>
        Increase
      </button>
    </div>
  );
}

export default App;

```

When the count is:

```text
0

```

the browser title becomes:

```text
Count: 0

```

When the count becomes:

```text
1

```

the title becomes:

```text
Count: 1

```

The effect runs because `count` is included in the dependency array.

---

# 12. Multiple Dependencies

You can have more than one dependency.

Example:

```jsx
useEffect(() => {
  console.log("User or count changed");
}, [user, count]);

```

The effect runs when either:

```text
user changes

```

or:

```text
count changes

```

Example:

```jsx
import { useState, useEffect } from "react";

function App() {
  const [name, setName] = useState("");
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("Name or count changed");
  }, [name, count]);

  return (
    <div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
      />

      <h1>{count}</h1>

      <button onClick={() => setCount(count + 1)}>
        Increase
      </button>
    </div>
  );
}

export default App;

```

The effect runs when:

```text
name changes

```

or:

```text
count changes

```

---

# 13. Understanding the Three Main Patterns

It is important to remember these three patterns.

### Pattern 1 — No dependency array

```jsx
useEffect(() => {
  // runs after every render
});

```

### Pattern 2 — Empty dependency array

```jsx
useEffect(() => {
  // runs after initial render
}, []);

```

### Pattern 3 — Dependencies

```jsx
useEffect(() => {
  // runs after initial render
  // and whenever count changes
}, [count]);

```

A simple way to remember them:

```text
No []       → Every render

[]          → Initial render

[count]     → Initial render + when count changes

```

---

# 14. `useEffect` With `localStorage`

`useEffect` can also be used to save data to the browser's `localStorage`.

Example:

```jsx
import { useState, useEffect } from "react";

function App() {
  const [name, setName] = useState("");

  useEffect(() => {
    localStorage.setItem("name", name);
  }, [name]);

  return (
    <div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
      />

      <h1>Hello {name}</h1>
    </div>
  );
}

export default App;

```

Whenever `name` changes:

```jsx
localStorage.setItem("name", name);

```

runs and saves the new value.

---

# 15. Reading From `localStorage`

We can also use `useEffect` to read saved data.

```jsx
import { useState, useEffect } from "react";

function App() {
  const [name, setName] = useState("");

  useEffect(() => {
    const savedName = localStorage.getItem("name");

    if (savedName) {
      setName(savedName);
    }
  }, []);

  return (
    <div>
      <h1>Hello {name}</h1>
    </div>
  );
}

export default App;

```

Because the dependency array is empty:

```jsx
[]

```

the saved name is retrieved when the component loads.

---

# 16. `useEffect` and Timers

Another common use of `useEffect` is creating a timer.

```jsx
import { useEffect } from "react";

function App() {
  useEffect(() => {
    const timer = setInterval(() => {
      console.log("Timer running");
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return <h1>Timer Example</h1>;
}

export default App;

```

Here:

```jsx
setInterval()

```

runs code every second.

But we also have:

```jsx
return () => {
  clearInterval(timer);
};

```

This is called **cleanup**.

---

# 17. What is Cleanup?

Some effects create things that need to be stopped or removed.

Examples:

- Timers
- Event listeners
- Subscriptions
- WebSocket connections

React allows us to clean them up.

The cleanup function is returned from the effect:

```jsx
useEffect(() => {
  // Setup

  return () => {
    // Cleanup
  };
}, []);

```

Think of it as:

```text
Component starts
      ↓
Setup effect
      ↓
Component runs
      ↓
Component is removed
      ↓
Cleanup effect

```

---

# 18. Example: Event Listener

Suppose we want to listen for when the user presses a key.

```jsx
import { useEffect } from "react";

function App() {
  useEffect(() => {
    const handleKeyDown = (event) => {
      console.log(event.key);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return <h1>Press a key</h1>;
}

export default App;

```

We add the listener:

```jsx
window.addEventListener("keydown", handleKeyDown);

```

Then we remove it during cleanup:

```jsx
window.removeEventListener("keydown", handleKeyDown);

```

This prevents unnecessary event listeners from remaining active.

---

# 19. `useEffect` With Props

`useEffect` can also react to changes in props.

For example:

```jsx
function User({ name }) {
  useEffect(() => {
    console.log("Name changed:", name);
  }, [name]);

  return <h1>Hello {name}</h1>;
}

```

The dependency:

```jsx
[name]

```

means the effect runs when the `name` prop changes.

For example, if the parent changes:

```jsx
<User name="Eliot" />

```

to:

```jsx
<User name="David" />

```

the effect runs again.

---

# 20. Example With Parent and Child Components

### Parent

```jsx
import { useState } from "react";
import User from "./User";

function App() {
  const [name, setName] = useState("Eliot");

  return (
    <div>
      <button onClick={() => setName("David")}>
        Change Name
      </button>

      <User name={name} />
    </div>
  );
}

export default App;

```

### Child

```jsx
import { useEffect } from "react";

function User({ name }) {
  useEffect(() => {
    console.log("Name changed:", name);
  }, [name]);

  return <h1>Hello {name}</h1>;
}

export default User;

```

When the button changes the name:

```text
Eliot → David

```

the child receives the new prop.

Because `name` is a dependency:

```jsx
[name]

```

the effect runs.

---

# 21. A Common Beginner Mistake

Avoid putting state updates inside an effect without understanding the dependency.

For example:

```jsx
useEffect(() => {
  setCount(count + 1);
}, [count]);

```

This creates a problem.

Every time `count` changes, the effect runs.

The effect then changes `count`.

That causes another render.

The effect runs again.

This can continue indefinitely:

```text
count changes
    ↓
effect runs
    ↓
setCount()
    ↓
count changes
    ↓
effect runs
    ↓
setCount()
    ↓
...

```

This can create an **infinite loop**.

---

# 22. Another Common Mistake — Missing Dependencies

Consider:

```jsx
useEffect(() => {
  console.log(name);
}, []);

```

The effect uses:

```jsx
name

```

but `name` isn't included in the dependency array.

If the effect is supposed to respond to changes in `name`, it should generally be:

```jsx
useEffect(() => {
  console.log(name);
}, [name]);

```

The dependency array should generally contain the values from the component that the effect depends on.

---

# 23. `useEffect` Should Not Be Used for Everything

A common beginner mistake is using `useEffect` whenever something happens.

For example, this is unnecessary:

```jsx
useEffect(() => {
  console.log(count);
}, [count]);

```

if you simply want to log the value immediately after a button click.

Sometimes the logic belongs directly in the event handler:

```jsx
function handleClick() {
  console.log(count);
  setCount(count + 1);
}

```

Then:

```jsx
<button onClick={handleClick}>
  Increase
</button>

```

### Simple rule

Use an **event handler** when something should happen because the user performed an action.

Use **`useEffect`** when something should happen because a component rendered or because a value changed.

---

# 24. Event Handler vs `useEffect`

### User action

Use an event handler:

```jsx
function handleClick() {
  console.log("Button clicked");
}

```

```jsx
<button onClick={handleClick}>
  Click Me
</button>

```

### React state/prop change

Use an effect:

```jsx
useEffect(() => {
  console.log("Count changed");
}, [count]);

```

This distinction is important.

---

# 25. A Practical Example

Let's create a simple counter that:

- Uses `useState`
- Uses `useEffect`
- Updates the document title
- Saves the count to `localStorage`

```jsx
import { useState, useEffect } from "react";

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `Count: ${count}`;

    localStorage.setItem("count", count);
  }, [count]);

  return (
    <div>
      <h1>Count: {count}</h1>

      <button onClick={() => setCount(count + 1)}>
        Increase
      </button>

      <button onClick={() => setCount(count - 1)}>
        Decrease
      </button>
    </div>
  );
}

export default App;

```

Here, whenever `count` changes:

```jsx
[count]

```

causes the effect to run.

The effect then:

```jsx
document.title = `Count: ${count}`;

```

updates the browser title.

And:

```jsx
localStorage.setItem("count", count);

```

saves the count.

---

# 26. A More Complete API Example

A common React application pattern is:

```text
Component loads
       ↓
useEffect runs
       ↓
API request
       ↓
Data received
       ↓
setState()
       ↓
Component renders with data

```

Example:

```jsx
import { useState, useEffect } from "react";

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((response) => response.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <h1>Loading...</h1>;
  }

  return (
    <div>
      <h1>Users</h1>

      {users.map((user) => (
        <p key={user.id}>
          {user.name}
        </p>
      ))}
    </div>
  );
}

export default App;

```

This is a pattern you will use frequently when building real applications.

---

# 27. The Cleanup Pattern

The general cleanup pattern looks like this:

```jsx
useEffect(() => {
  // Setup

  return () => {
    // Cleanup
  };
}, []);

```

Example:

```jsx
useEffect(() => {
  const timer = setInterval(() => {
    console.log("Running...");
  }, 1000);

  return () => {
    clearInterval(timer);
  };
}, []);

```

The first part creates the effect:

```jsx
const timer = setInterval(...);

```

The returned function removes the effect:

```jsx
clearInterval(timer);

```

---

# 28. Important Things to Remember

### `useEffect` runs after rendering

```jsx
useEffect(() => {
  // runs after render
});

```

### Empty dependency array

```jsx
useEffect(() => {
  // initial setup
}, []);

```

### Dependency array

```jsx
useEffect(() => {
  // runs when count changes
}, [count]);

```

### Multiple dependencies

```jsx
useEffect(() => {
  // runs when name or count changes
}, [name, count]);

```

### Cleanup

```jsx
useEffect(() => {
  // setup

  return () => {
    // cleanup
  };
}, []);

```

---

# 29. Quick Reference

| Code                                 | When it runs                                            |
| ------------------------------------ | ------------------------------------------------------- |
| `useEffect(() => {})`                | After every render                                      |
| `useEffect(() => {}, [])`            | After initial render                                    |
| `useEffect(() => {}, [count])`       | After initial render and when `count` changes           |
| `useEffect(() => {}, [name, count])` | After initial render and when `name` or `count` changes |

---

# 30. Common Uses of `useEffect`

You will commonly use `useEffect` for:

### API requests

```jsx
useEffect(() => {
  fetch("/api/users");
}, []);

```

### Document title

```jsx
useEffect(() => {
  document.title = "Dashboard";
}, []);

```

### Local storage

```jsx
useEffect(() => {
  localStorage.setItem("name", name);
}, [name]);

```

### Timers

```jsx
useEffect(() => {
  const timer = setInterval(() => {
    console.log("Running");
  }, 1000);

  return () => clearInterval(timer);
}, []);

```

### Event listeners

```jsx
useEffect(() => {
  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
  };
}, []);

```

### Responding to state changes

```jsx
useEffect(() => {
  console.log("Count changed");
}, [count]);

```

### Responding to prop changes

```jsx
useEffect(() => {
  console.log("User changed");
}, [user]);

```

---

# 31. Simple Mental Model

When learning `useEffect`, remember:

> **`useEffect` lets your component perform an action after rendering or when its dependencies change.**

Think about it like this:

```text
React renders component
        ↓
Does the component have an effect?
        ↓
      YES
        ↓
Run the effect
        ↓
Did its dependencies change?
        ↓
      YES
        ↓
Run it again

```

The most important thing to understand is the dependency array:

```jsx
[]

```

means:

> "I don't want this effect to react to changing dependencies."

Whereas:

```jsx
[count]

```

means:

> "Run this effect whenever `count` changes."

And:

```jsx
[name, count]

```

means:

> "Run this effect whenever `name` or `count` changes."

---

# 32. Practice Exercises

### Exercise 1 — Document Title

Create a counter where the browser title displays:

```text
Count: 0

```

Then changes to:

```text
Count: 1
Count: 2
Count: 3

```

as the user clicks the button.

---

### Exercise 2 — Name

Create an input:

```text
Enter your name

```

When the user types their name, use `useEffect` to display it in the browser title.

For example:

```text
Hello Eliot

```

---

### Exercise 3 — API Data

Fetch users from:

```text
https://jsonplaceholder.typicode.com/users

```

Display their names on the page.

Requirements:

- Use `useState`
- Use `useEffect`
- Display `Loading...` while waiting
- Display the users after the request completes

---

### Exercise 4 — Local Storage

Create a name input.

Save the name to `localStorage` whenever it changes.

When the component loads, retrieve the saved name and display it.

---

# Summary

`useEffect` is a React Hook used for handling **side effects**.

The basic structure is:

```jsx
useEffect(() => {
  // side effect
}, []);

```

The three patterns you should remember are:

```jsx
// Every render
useEffect(() => {
  // code
});

```

```jsx
// Initial render
useEffect(() => {
  // code
}, []);

```

```jsx
// Initial render + when count changes
useEffect(() => {
  // code
}, [count]);

```

And when an effect creates something that needs to be removed:

```jsx
useEffect(() => {
  // setup

  return () => {
    // cleanup
  };
}, []);

```

The most common things you'll use `useEffect` for are **API requests, browser APIs, localStorage, timers, event listeners, subscriptions, and responding to state or prop changes**.

provide this in a markdown file