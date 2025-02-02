const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// Sample route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Sample route
app.get("/user", (req, res) => {
  const json = {
    name: "Sooraj",
    age: 30,
  };
  res.json(json);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
