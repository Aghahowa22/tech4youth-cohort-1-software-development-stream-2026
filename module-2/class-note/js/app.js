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

function getPosts() {
  fetch("https://jsonplaceholder.typicode.com/posts")
    .then((response) => response.json())
    .then((json) => console.log(json))
    .catch(function (error) {
      console.log("Something went wrong:", error.message); // runs on failure
    });
}

getPosts();
