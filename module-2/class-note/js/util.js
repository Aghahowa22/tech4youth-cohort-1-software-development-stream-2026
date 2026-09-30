// Export a function
export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-GB");
}

export function askUserQuestion(user) {
  return console.log(`how are you doing`);
}
export function askUserQuestion2(user) {
  return console.log(`how are you doing  ${user}`);
}
