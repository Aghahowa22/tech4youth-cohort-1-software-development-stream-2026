// import { User, guest } from "./user.js";
// import { askUserQuestion, askUserQuestion2 } from "./util.js";

// function greetUser(userName = "Mr Man") {
//   User();
//   guest();
//   return console.log(`Good morning ${userName}`);
// }
// setTimeout(askUserQuestion, 5000);
// setInterval(askUserQuestion2, 2000);
// greetUser();

// fetch("https://jsonplaceholder.typicode.com/posts/1")
//   .then((response) => response.json())
//   .then((json) => console.log(json));

// async function getUsers() {
//   try {
//     const response = await fetch("https://jsonplaceholder.typicode.com/users", {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     const data = await response.json();
//     console.log(data);
//   } catch (error) {
//     console.log(error.message);
//   }
// }

async function createUser() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      body: JSON.stringify({
        title: "Post-1",
        body: "this is the body of this request",
        userId: 2,
      }),
    });

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.log(error.message);
  }
}

createUser();
