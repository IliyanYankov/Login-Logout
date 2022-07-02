const express = require("express");
const http = require("http");
const bcrypt = require("bcrypt");
const path = require("path");
const bodyParser = require("body-parser");
const userDB = require("./data");
const port = 4000;

const app = express();
const server = http.createServer(app);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "./")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./index.html"));
});

app.post("/registration.html", async (req, res) => {
  try {
    console.log("here");
    let foundUser = userDB.find((data) => {
      return req.body.email == data.email;
    });

    if (!foundUser) {
      let hashPassword = await bcrypt.hash(req.body.password, 10);
      console.log(hashPassword);

      let newUser = {
        id: Date.now(),
        username: req.body.username,
        email: req.body.email,
        password: hashPassword,
      };
      userDB.push(newUser);
      console.log("User List", userDB);
      res.send(
        "<div align ='center'><h2>Registration successful</h2></div><br><br><div align='center'><a href='./login.html'>login</a></div><br><br><div align='center'><a href='./registration.html'>Register another user</a></div>"
      );
    } else {
      res.send(
        "<div align ='center'><h2>Email already used</h2></div><br><br><div align='center'><a href='./registration.html'>Register again</a></div>"
      );
    }
  } catch {
    res.send("Iternal server error");
  }
});

app.post("/login.html", async (req, res) => {
  try {
    let foundUser = userDB.find((data) => req.body.email === data.email);
    console.log("foundUser");
    if (foundUser) {
      let submittedPass = req.body.password;
      let storedPass = foundUser.password;

      const passwordMatch = await bcrypt.compare(submittedPass, storedPass);

      console.log(passwordMatch);

      if (passwordMatch) {
        let username = foundUser.username;
        res.send(
          `<div align ='center'><h2>login successful</h2></div><br><br><br><div align ='center'><h3>Hello ${username}</h3></div><br><br><div align='center'><a href='./login.html'>logout</a></div>`
        );
      } else {
        res.send(
          "<div align ='center'><h2>Invalid email or password</h2></div><br><br><div align ='center'><a href='./login.html'>login again</a></div>"
        );
      }
    } else {
      let fakePass = `$2b$$10$ifgfgfgfgfgfgfggfgfgfggggfgfgfga`;
      await bcrypt.compare(req.body.password, fakePass);

      res.send(
        "<div align ='center'><h2>Invalid email or password</h2></div><br><br><div align='center'><a href='./login.html'>login again<a><div>"
      );
    }
  } catch {
    res.send("Internal server error");
  }
});

server.listen(port, function () {
  console.log("server is listening on port: 4000");
});
