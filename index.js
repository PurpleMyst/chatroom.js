/* jshint node: true, esnext: true */
"use strict";

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());

const port = process.env.PORT || 8080;
const path = "/";

app.listen(port);
