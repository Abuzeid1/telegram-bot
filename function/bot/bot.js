import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import { botbuttons } from "./botbuttons.js";
import { botcommands } from "./botcommands.js";

dotenv.config();
const token = process.env.token;
const bot =
  process.env.local === "true"
    ? new TelegramBot(token, { polling: true })
    : new TelegramBot(token);

let user = {};
let userdata = {};
let msd = {};

bot.on("message", botcommands);
bot.on("callback_query", botbuttons);
setInterval(() => {
  console.log({ user, userdata, msd });
}, 2000);
console.log({ user, userdata, msd });
export { bot, user, userdata, msd };
