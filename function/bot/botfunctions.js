import { bot } from "./bot.js";
import { media } from "../markup.js";

let editMarkup = (markup, chatId, msgId) => {
  bot.editMessageReplyMarkup(
    { inline_keyboard: markup },
    { chat_id: chatId, message_id: msgId }
  );
};
//send message
let sendMsg = (chatId, text, markup) => {
  if (markup) {
    bot.sendMessage(chatId, text, {
      reply_markup: { inline_keyboard: markup },
    });
  } else {
    bot.sendMessage(chatId, text);
  }
};
// send media files function
let sendMediaFiles = (arr, chatId) => {
  arr.forEach((item) => {
    if (item.type === "voice") {
      item.arr.forEach((element) => {
        bot.sendVoice(chatId, element);
      });
    } else {
      let mediaIds = media(item);
      let sender = (arr) => {
        if (arr.length < 11) {
          bot.sendMediaGroup(chatId, arr);
        } else {
          let arr2 = arr.splice(10);
          bot.sendMediaGroup(chatId, arr);
          sender(arr2);
        }
      };
      sender(mediaIds);
    }
  });
};
// start(14, 15)
//empty markup function
let empty = (chatId, msgId) => {
  editMarkup([[]], chatId, msgId);
};

export { sendMediaFiles, sendMsg, editMarkup, empty };
