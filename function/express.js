import express from "express";
import { bot } from "./bot/bot.js";
const app = express();
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World");
});

// respond to api request webhook
app.post("/bot", (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

export { app };
// global variables

// import bot from "../index";
