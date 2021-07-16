require('dotenv').config()

let mongo = require("./mongo.js")
const express = require("express");
const TelegramBot = require('node-telegram-bot-api');
const variable = require("./variable.js")
const token = process.env.token;
const bot = new TelegramBot(token);
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
 
// respond to api request
app.post('/bot' , (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// global variables
let user = {};
let userdata = {};
let msd;



//common used functions
//start function 
let start = (chatId, msgId)=>{
  let arr = mongo.inline("get,41", variable.subject["41"], true)
 
  
  arr.push([{text:"3rd year 2nd term", callback_data:"get,32" }])
  // console.log(arr)
  if(msgId){bot.editMessageReplyMarkup({inline_keyboard : arr},{chat_id: chatId, message_id: msgId})
  }else{
    bot.sendMessage(chatId,"Enjoy", {reply_markup:{inline_keyboard: arr}})
  }
}
// start(14, 15)
//empty markup function
let empty = (chatId, msgId) =>{
  bot.editMessageReplyMarkup({inline_keyboard : [[]]},{chat_id: chatId, message_id: msgId})
}
//list commands 
bot.on('callback_query', (query)=>{
  
  const data = query.data;
  const chatId = query.message.chat.id;
  let msgId = query.message.message_id
  const datarr = data.split(",")
  
  //user 
  if (datarr[0]==="add" || datarr[0]=== "addx"){user[chatId] = datarr}

  //start command
  if(data ==="add" || data==="get,41" || data ==="get"){start(chatId, msgId)}

  else if(datarr[0]==="add"){
    if(datarr.length===2){
      bot.editMessageReplyMarkup({inline_keyboard: mongo.inline("add,42", variable.subject["41"])}, {chat_id: chatId, message_id: msgId})
    }
      else if(datarr.length===3){
        datarr.shift()
        mongo.list(data,datarr).then((value)=>{
          value.splice(value.length-1, (0), [{text:"another", callback_data:"addx," + datarr.toString()}])
          bot.editMessageReplyMarkup({inline_keyboard :value},{chat_id: chatId, message_id: msgId})
        })
      //add number
      }else if(datarr.length===4){
        datarr.shift()
        mongo.count(datarr).then((value)=>{
          let mark = mongo.inline(data, [value.toString()])
          mark.splice(mark.length-1, (0), [{text:"another", callback_data:"addx," + datarr.toString()}])
          bot.editMessageReplyMarkup({inline_keyboard :mark},{chat_id: chatId, message_id: msgId})
        })
        //add file
      }else if(datarr.length===5){
      empty(chatId, msgId)
      bot.sendMessage(chatId, "Send your files")
    }}
  // adding files to database
  else if(datarr[0] === "addfiles"){
    datarr.shift()
    let files = mongo.cmedia(userdata[chatId])
    delete user[chatId]
    delete userdata[chatId]
    bot.editMessageReplyMarkup({inline_keyboard :[[]]},{chat_id: chatId, message_id: msgId})
    // permission check

    mongo.permission(chatId, datarr).then((value)=>{
      if(value){
        mongo.write(datarr, files).then((val)=>{
            let mo = datarr.slice(0)
            mo.pop()
            mo.unshift("add")
            bot.sendMessage(chatId, "Done it will take some time untill files appear",
             {reply_markup: {inline_keyboard :[[{text: "add one more", callback_data: mo.toString()}],
            [{text: "cancel", callback_data: "noanswer"}]]}})
          })

        //notification  msg to telegram
        let useinforr = [ chatId,datarr, query.from.first_name, query.from.last_name]
        let userinfo = JSON.stringify(useinforr)
        bot.sendMessage(process.env.userId, userinfo)
        
      }else{
        // asking for permission msg telegram
        bot.sendMessage(chatId, "Done it will take some time untill files appear");
        
        let xz =  `g,${chatId},${datarr.toString()}`
        bot.forwardMessage(process.env.userId, chatId, msd);
        bot.sendMessage(process.env.userId, "grant permission " + xz + query.from.first_name +"  "+ query.from.last_name,
         {reply_markup: {inline_keyboard: [
         [{text: "yes", callback_data:  xz}],
         [{text: "no", callback_data: "noanswer"}]]}} )
         mongo.copy(datarr, files, chatId).then((value)=>{})  

         for(let x of files){
          if(x.type==="voice"){
            for(let vo of x.arr){
              bot.sendVoice(process.env.userId, vo)}

          }else{
             let mm = mongo.media(x)
             let sender = (arr)=>{
               if(arr.length<11){
                bot.sendMediaGroup(process.env.userId, arr)

               }else{
                 let arr2 = arr.splice(10);
                 bot.sendMediaGroup(process.env.userId, arr)
                 sender(arr2)}}
            sender(mm)}}}
    })} 

  // granting permission command
  else if(datarr[0]==='g'){
    empty(chatId, msgId)
    let pid = datarr[1];
    let m  = datarr.slice(2)
    console.log(m)
    mongo.grantpermission(pid, m).then((value)=>{});
    //no answer reply 
  }else if(datarr[0]==="noanswer"){
     empty(chatId, msgId)
     delete user[chatId];
     delete userdata[chatId];
     
  }else if(datarr[0]==="addx"){
     empty(chatId, msgId)
     bot.sendMessage(chatId, "send the new one")
  }//send list
  else if(datarr[0]==="get"){
     if(datarr.length === 5){
      console.log("username  " + query.from.first_name, query.from.last_name)
      console.log("data " + data)
      datarr.shift()
      bot.sendMessage(chatId, datarr[3])

      mongo.read(datarr).then((val)=>{
        
        for(let x of val){
          if(x.type==="voice"){
            for(let vo of x.arr){
              bot.sendVoice(chatId, vo)}

          }else{
           
             let mm = mongo.media(x)
             let sender = (arr)=>{
               if(arr.length<11){bot.sendMediaGroup(chatId, arr)
               }else{
                 let arr2 = arr.splice(10);
                 bot.sendMediaGroup(chatId, arr)
                 sender(arr2)}}
             sender(mm)}}})
       }
       else if(datarr[1]==="32" && datarr.length === 2){

       bot.editMessageReplyMarkup({inline_keyboard :mongo.inline("get,32", variable.subject["32"])},{chat_id: chatId, message_id: msgId})
      }else{
        datarr.shift()
        mongo.list(data,datarr).then((value)=>{
          bot.editMessageReplyMarkup({inline_keyboard :value},{chat_id: chatId, message_id: msgId})
        })
      }
    
    }
    
    })









// on msg reply
bot.on('message', (msg)=>{ 
  const chatId = msg.chat.id
  const text = msg.text;
  let command

  if(user != {}){command = user[chatId]}
  
  if(text === "/start"){
   start(chatId)
  //receiving files
  }else if(text === "/latest"){
    mongo.new().then((val)=>{
      bot.sendMessage(chatId,"Latest", {reply_markup: {inline_keyboard: val}})
    })
  }else if(text === "/add"){
    bot.sendMessage(chatId,"add", {reply_markup:{ inline_keyboard : mongo.inline("add,41", variable.subject["41"], true)}})
  }else if(text === "/info"){ 
      bot.sendMessage(chatId, variable.info)
  }
  else if(command != undefined && command[0]=== "add" && command.length === 5){
    let filearr = []
    if(userdata[chatId] != undefined){filearr = userdata[chatId]}
    msd = msg.message_id;

    if(filearr.length===0){
     var calldat = command.slice(1)
     calldat.unshift("addfiles")
     calldat = calldat.toString()
     bot.sendMessage(chatId, "push only when all the files have been uploaded", 
       {reply_markup: {inline_keyboard: [[{text: "confirm", callback_data: calldat}],
       [{text: "cancel", callback_data: "noanswer"}]],one_time_keyboard: true}}
     )}
   
     if(msg.photo){filearr.push([msg.photo[1].file_id, "photo"]) 
    }else if(msg.video){filearr.push([msg.video.file_id, "video"])
    }else if(msg.document){filearr.push([msg.document.file_id, "document"])
    }else if(msg.audio){filearr.push([msg.audio.file_id, "audio"])
    }else if(msg.voice){filearr.push([msg.voice.file_id, "voice"])}
     userdata[chatId] = filearr
    //receiving text
  }else if(command != undefined && command[0]==="addx"){
    command[0] = "add"
    command.push(text)
    bot.sendMessage(chatId, "the new one is "+ text,
    {reply_markup: {inline_keyboard: [[{text: "confirm", callback_data: command.toString()}],[{text: "cancel", callback_data: "noanswer"}]]}})
    delete user[chatId]
  }

 //start command
 else{start(chatId)}
  })

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});







