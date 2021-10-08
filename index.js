import express from "express";
import { bot } from "./function/bot/bot.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World");
});

// respond to api request webhook
app.post("/bot", (req, res) => {
  console.log("555");
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

// global variables

// import bot from "../index";
