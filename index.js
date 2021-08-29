require('dotenv').config()

const mongo = require("./function/mongo.js")
const variable = require("./function/variable.js")
const markup = require("./function/markup.js")

const express = require("express");
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.token;
const bot = new TelegramBot(token, { polling: true });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/',(req, res) => {
  res.send("Hello World")
})

// respond to api request webhook
app.post('/bot', (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// global variables
let user = {};
let userdata = {};
let msd;

//common used functions
// edit markup 
let editMarkup = (markup, chatId, msgId) => {
  bot.editMessageReplyMarkup({ inline_keyboard: markup }, { chat_id: chatId, message_id: msgId })
}
//send message 
let sendMsg = (chatId, text, markup) => {
  if (markup) {
    bot.sendMessage(chatId, text, { reply_markup: { inline_keyboard: markup } })
  } else {
    bot.sendMessage(chatId, text)
  }
}
// send media files function
sendMediaFiles = (arr, chatId) => {
  arr.forEach(item => {
    if (item.type === "voice") {
      item.arr.forEach(element => {
        bot.sendVoice(chatId, element)
      })

    } else {

      let mediaIds = markup.media(item)
      let sender = (arr) => {
        if (arr.length < 11) {
          bot.sendMediaGroup(chatId, arr)

        } else {
          let arr2 = arr.splice(10);
          bot.sendMediaGroup(chatId, arr)
          sender(arr2)
        }
      }
      sender(mediaIds)
    }
  });
}
// start(14, 15)
//empty markup function
let empty = (chatId, msgId) => {
  editMarkup([[]], chatId, msgId)
}


//list commands 
bot.on('callback_query', (query) => {

  const data = query.data;
  const chatId = query.message.chat.id;
  let msgId = query.message.message_id
  const datarr = data.split(",")
  
  console.log(data)
  //user file data for 
  if (datarr[0] === "add" || datarr[0] === "addx") { user[chatId] = datarr }


  // user interface list 
  if (datarr[0] === "add" || datarr[0] === 'get') {

    // sending files 


    if (datarr.length === 5 && datarr[0] === 'get') {

      console.log({ firstname: query.from.first_name, lastname: query.from.last_name, data: data })

      sendMsg(chatId, datarr[4])
      mongo.read(datarr).then((val) => {
        sendMediaFiles(val, chatId);
      })
    }

    // numbers list 
    else if (datarr.length === 4 && datarr[0] === 'add') {


      mongo.read(datarr).then((value) => {
        value = [value.length, value.length + 1, value.length + 2]
        editMarkup(markup.list(data, value), chatId, msgId)
      })

      //request to send files
    } else if (datarr.length === 5 && datarr[0] === "add") {

      empty(chatId, msgId)
      sendMsg(chatId, "Send your files")
      // buttons list
    } else {

      mongo.read(datarr).then((value) => {

        editMarkup(markup.list(data, value), chatId, msgId)
      })
    }

  }

  // adding files to database
  else if (datarr[0] === "addfiles") {
    datarr.shift()
    let files = markup.createMedia(userdata[chatId])
    delete user[chatId]
    delete userdata[chatId]
    empty(chatId, msgId)

    // permission check
    mongo.permission(chatId, datarr).then((value) => {
      if (value) {
        mongo.write(datarr, files).then((val) => {
          let mo = datarr.slice(0)
          mo.pop()
          mo.unshift("add")
          sendMsg(chatId, "Done it will take some time untill files appear", [[{ text: "add one more", callback_data: mo.toString() }],
          [{ text: "cancel", callback_data: "noanswer" }]])

        })

        //notification  msg to admin
        let useinforr = [chatId, datarr, query.from.first_name, query.from.last_name]
        let userinfo = JSON.stringify(useinforr)
        sendMsg(process.env.userId, userinfo)

      } else {
        // asking for permission from admin
        sendMsg(chatId, "Done it will take some time untill files appear")

        let xz = `g,${chatId},${datarr.toString()}`
        bot.forwardMessage(process.env.userId, chatId, msd);

        sendMsg(process.env.userId, "grant permission " + xz + query.from.first_name + "  " + query.from.last_name, [
          [{ text: "yes", callback_data: xz }],
          [{ text: "no", callback_data: "noanswer" }]])


        mongo.copy(datarr, files, chatId).then((value) => { })
        sendMediaFiles(files, process.env.userId);
      }
    }
    )
  }

  //admin grant permission command
  else if (datarr[0] === 'g') {
    empty(chatId, msgId)
    let pid = datarr[1];
    let m = datarr.slice(2)

    mongo.grantpermission(pid, m).then((value) => { });
    //no answer reply 
  } else if (datarr[0] === "noanswer") {
    empty(chatId, msgId)
    delete user[chatId];
    delete userdata[chatId];

  } else if (datarr[0] === "addx") {
    empty(chatId, msgId)
    sendMsg(chatId, "send the new one")

  }//send list
})









// on msg reply
bot.on('message', (msg) => {
  const chatId = msg.chat.id
  const text = msg.text;
  let command

  if (user != {}) { command = user[chatId] }

  if (text === "/start") {
    sendMsg(chatId, "get", markup.list("get,32", variable.subject["32"]))
    //receiving files
  } else if (text === "/latest") {
    mongo.new().then((val) => {
      sendMsg(chatId, "Latest", val)

    })
  } else if (text === "/add") {
    sendMsg(chatId, "add", markup.list("add,32", variable.subject["32"]))

  } else if (text === "/info") {
    sendMsg(chatId, variable.info)
  }
  else if (command != undefined && command[0] === "add" && command.length === 5) {
    let filearr = []
    if (userdata[chatId] != undefined) { filearr = userdata[chatId] }
    msd = msg.message_id;

    if (filearr.length === 0) {
      var calldat = command.slice(1)
      calldat.unshift("addfiles")
      calldat = calldat.toString()
      sendMsg(chatId, "push only when all the files have been uploaded", [[{ text: "confirm", callback_data: calldat }],
      [{ text: "cancel", callback_data: "noanswer" }]])
    }

    if (msg.photo) {
      filearr.push([msg.photo[1].file_id, "photo"])
    } else if (msg.video) {
      filearr.push([msg.video.file_id, "video"])
    } else if (msg.document) {
      filearr.push([msg.document.file_id, "document"])
    } else if (msg.audio) {
      filearr.push([msg.audio.file_id, "audio"])
    } else if (msg.voice) { filearr.push([msg.voice.file_id, "voice"]) }
    userdata[chatId] = filearr
    //receiving text
  } else if (command != undefined && command[0] === "addx") {
    command[0] = "add"
    command.push(text)

    sendMsg(chatId, "the new one is " + text, [[{ text: "confirm", callback_data: command.toString() }], [{ text: "cancel", callback_data: "noanswer" }]])
    delete user[chatId]

  }

  //start command
  else { sendMsg(chatId, "get", markup.list("get,32", variable.subject["32"])) }
})

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});







