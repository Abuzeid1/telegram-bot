import { sendMsg } from "./botfunctions.js";
import { subject, info } from "../variable.js";
import { list } from "../markup.js";
import { newitems } from "../mongo.js";
import { user, userdata, msd } from "./bot.js";

let botcommands = (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  let command;

  if (user != {}) {
    command = user[chatId];
  }

  if (text === "/start") {
    sendMsg(chatId, "get", list("get,41", subject["41"]));
    //receiving files
  } else if (text === "/latest") {
    newitems().then((val) => {
      sendMsg(chatId, "Latest", val);
    });
  } else if (text === "/add") {
    sendMsg(chatId, "add", list("add,41", subject["41"]));
  } else if (text === "/info") {
    sendMsg(chatId, info);
  } else if (text === "/old") {
    sendMsg(chatId, "get", list("get,32", subject["32"]));
  } else if (
    command != undefined &&
    command[0] === "add" &&
    command.length === 5
  ) {
    let filearr = [];
    if (userdata[chatId] != undefined) {
      filearr = userdata[chatId];
    }

    msd[chatId] = msg.message_id;

    if (filearr.length === 0) {
      var calldat = command.slice(1);
      calldat.unshift("addfiles");
      calldat = calldat.toString();
      sendMsg(chatId, "push only when all the files have been uploaded", [
        [{ text: "confirm", callback_data: calldat }],
        [{ text: "cancel", callback_data: "noanswer" }],
      ]);
    }

    if (msg.photo) {
      filearr.push([msg.photo[1].file_id, "photo"]);
    } else if (msg.video) {
      filearr.push([msg.video.file_id, "video"]);
    } else if (msg.document) {
      filearr.push([msg.document.file_id, "document"]);
    } else if (msg.audio) {
      filearr.push([msg.audio.file_id, "audio"]);
    } else if (msg.voice) {
      filearr.push([msg.voice.file_id, "voice"]);
    }

    userdata[chatId] = filearr;

    //receiving text
  } else if (command != undefined && command[0] === "addx") {
    command[0] = "add";
    command.push(text);

    sendMsg(chatId, "the new one is " + text, [
      [{ text: "confirm", callback_data: command.toString() }],
      [{ text: "cancel", callback_data: "noanswer" }],
    ]);
    delete user[chatId];
  }

  //start command
  else {
    sendMsg(chatId, "get", list("get,32", subject["32"]));
  }
};

export { botcommands };
