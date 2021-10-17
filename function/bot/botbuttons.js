import { bot } from "./bot.js";
import { write, read, writeLog } from "../mongo.js";
import { grantpermission, permission, copy } from "../permission.js";
import { createMedia, list } from "../markup.js";
import { sendMediaFiles, sendMsg, editMarkup, empty } from "./botfunctions.js";
import { user, userdata, msd } from "./bot.js";
import { subject } from "../variable.js";

//common used functions
// edit markup

let botbuttons = (query) => {
  const data = query.data;
  const chatId = query.message.chat.id;
  let msgId = query.message.message_id;
  const datarr = data.split(",");

  //user file data mangement
  if (datarr[0] === "add" || datarr[0] === "addx") {
    user[chatId] = datarr;
  }

  // user interface list
  if (datarr[0] === "add" || datarr[0] === "get") {
    // sending files

    if (datarr.length === 5 && datarr[0] === "get") {
      let name =
        query.from.first_name || "" + "  " + query.from.last_name || "";
      let year = datarr[1];
      let arrsubject = subject[datarr[1] * 1][datarr[2] * 1] || datarr[2];
      let arrtype = datarr[3];
      let number = datarr[4];
      const logData = ["data", name, year, arrsubject, arrtype, number];
      writeLog(name, year, arrsubject, arrtype, number);

      console.log(logData);

      sendMsg(chatId, datarr[4]);
      read(datarr).then((val) => {
        sendMediaFiles(val, chatId);
      });
    }

    // numbers list
    else if (datarr.length === 4 && datarr[0] === "add") {
      read(datarr).then((value) => {
        value = [value.length, value.length + 1, value.length + 2];
        editMarkup(list(data, value), chatId, msgId);
      });

      //request to send files
    } else if (datarr.length === 5 && datarr[0] === "add") {
      empty(chatId, msgId);
      sendMsg(chatId, "Send your files");
      // buttons list
    } else {
      read(datarr).then((value) => {
        editMarkup(list(data, value), chatId, msgId);
      });
    }
  }

  // adding files to database
  else if (datarr[0] === "addfiles") {
    datarr.shift();
    let files = createMedia(userdata[chatId]);
    delete user[chatId];
    delete userdata[chatId];
    empty(chatId, msgId);

    // permission check
    permission(chatId, datarr).then((value) => {
      if (value) {
        write(datarr, files).then((val) => {
          let mo = datarr.slice(0);
          mo.pop();
          mo.unshift("add");
          sendMsg(chatId, "Done it will take some time untill files appear", [
            [{ text: "add one more", callback_data: mo.toString() }],
            [{ text: "cancel", callback_data: "noanswer" }],
          ]);
        });

        //notification  msg to admin

        sendMsg(
          process.env.userId,
          `new data
          Subject: ${subject[41][datarr[1] * 1]}
          Type: ${datarr[2]}
          Number: ${datarr[3]}
          Name: ${query.from.first_name}  ${query.from.last_name}
          UserID: ${chatId}
        `
        );
      } else {
        // asking for permission from admin
        sendMsg(chatId, "Done it will take some time untill files appear");

        let xz = `g,${chatId},${datarr.toString()}`;
        bot.forwardMessage(process.env.userId, chatId, msd[chatId]);
        delete msd[chatId];

        sendMsg(
          process.env.userId,
          `grant permission
          Subject: ${subject[41][datarr[1] * 1]}
          Type: ${datarr[2]}
          Number: ${datarr[3]}
          Name: ${query.from.first_name}  ${query.from.last_name}
          UserID: ${chatId}
          `,
          [
            [{ text: "yes", callback_data: xz }],
            [{ text: "no", callback_data: "noanswer" }],
          ]
        );

        copy(datarr, files, chatId).then((value) => {});
        sendMediaFiles(files, process.env.userId);
      }
    });
  }

  //admin grant permission command
  else if (datarr[0] === "g") {
    empty(chatId, msgId);
    let pid = datarr[1];
    let m = datarr.slice(2);

    grantpermission(pid, m).then((value) => {});
    //no answer reply
  } else if (datarr[0] === "noanswer") {
    empty(chatId, msgId);
    delete user[chatId];
    delete userdata[chatId];
  } else if (datarr[0] === "addx") {
    empty(chatId, msgId);
    sendMsg(chatId, "send the new one");
  } //send list
};

export { botbuttons };
