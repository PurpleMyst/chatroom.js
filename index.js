/* jshint node: true, esnext: true */
"use strict";

/* Express initialization */
const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const cookieParser = require("cookie-parser");
app.use(cookieParser());

/* Express constants */
const port = process.env.PORT || 8080;
const path = "/";

/* Actual variables for the chatroom */
const userIDs = new Map();
const messagesToShow = new Map();

/* Chatroom functions */
const randomId = () => {
  const letters = "0123456789ABCDEF";

  let result = "";
  for (let i = 0; i < 16; ++i) {
    result += letters[Math.floor(Math.random() * letters.length)];
  }
  return result;
};

const validateUser = (req, res) => {
  const username = req.body.username;

  if (username === undefined) {
    return false;
  } else if (userIDs.has(username)) {
    return req.cookies["X-Chat-Id"] === userIDs.get(username);
  } else {
    const userID = randomId();

    userIDs.set(username, userID);
    messagesToShow.set(username, []);

    res.cookie("X-Chat-Id", userID);
    return true;
  }
};

/* Express routing */
app.get(path, (req, res) => {
  const validAuthentication = validateUser(req, res);

  if (validAuthentication) {
    const username = req.body.username;
    const messages = messagesToShow.get(username);

    res.send({success: true, users: Array.from(userIDs.keys()), messages});
    messages.splice(0, messages.length); /* clear the messages list */
  } else {
    res.status(400);
    res.send({success: false, error: "Invalid authentication"});
  }
});

app.post(path, (req, res) => {
  const validAuthentication = validateUser(req, res);

  if (validAuthentication) {
    const message = req.body.message;
    if (message === undefined) {
      res.status(400);
      res.send({success: false, error: "No message specified."});
    } else {
      for (let [username, toShow] of messagesToShow.entries()) {
        if (username !== req.body.username) {
          toShow.push([req.body.username, message]);
        }
      }
      res.send({success: true});
    }
  } else {
    res.status(400);
    res.send({success: false, error: "Invalid authentication"});
  }
});

app.put(path, (req, res) => {
  const validAuthentication = validateUser(req, res);

  if (validAuthentication) {
    res.send({success: true});
  } else {
    res.status(400);
    res.send({success: false, error: "Invalid authentication"});
  }
});


app.delete(path, (req, res) => {
  const validAuthentication = validateUser(req, res);

  if (validAuthentication) {
    const username = req.body.username;

    userIDs.delete(username);
    messagesToShow.delete(username);

    res.send({success: true});
  } else {
    res.status(400);
    res.send({success: false, error: "Invalid authentication"});
  }
});

app.listen(port);
