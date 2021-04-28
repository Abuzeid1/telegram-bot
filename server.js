require('dotenv').config()

let mongo = require("./mongo.js")
const express = require("express");
const app = express();
const bodyParser = require('body-parser'); 

//telegrambot
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.token;
const bot = new TelegramBot(token);

//new 
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true
  })
);
 
app.post('/bot' , (req, res) => {
  res.set('Cache-control', 'public, max-age=86400')
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// command global variable 
var command ;
var filearr = []
let msd;
//(query)
bot.on('callback_query', (query)=>{
  
  const data = query.data;
  const chatId = query.message.chat.id;
  let msgId = query.message.message_id
  const datarr = data.split(",")
  
  command = datarr
  
  if(data ==="0" || data==="get"){bot.editMessageReplyMarkup({inline_keyboard : mongo.start("get")},{chat_id: chatId, message_id: msgId})
  }//new button
  else if(data=== "new"){
    mongo.new().then((val)=>{
      
      bot.editMessageReplyMarkup({inline_keyboard: val},{chat_id: chatId, message_id: msgId})
    })
  }//add commands
  else if(data==="add"){
    bot.editMessageReplyMarkup({inline_keyboard : mongo.start(data)},{chat_id: chatId, message_id: msgId})
  }else if(datarr[0]==="add"){
      if(datarr.length===2){
        datarr.shift()
        
        mongo.list(data,datarr).then((value)=>{
          value.splice(value.length-1, (0), [{text:"another", callback_data:"addx," + datarr.toString()}])
         
          bot.editMessageReplyMarkup({inline_keyboard :value},{chat_id: chatId, message_id: msgId})
        })
      
      }else if(datarr.length===3){
        datarr.shift()
        mongo.count(datarr).then((value)=>{
          let mark = mongo.inline(data, [value.toString()])
          mark.splice(mark.length-1, (0), [{text:"another", callback_data:"addx," + datarr.toString()}])
          bot.editMessageReplyMarkup({inline_keyboard :mark},{chat_id: chatId, message_id: msgId})
        })
      }else if(datarr.length===4){
      bot.editMessageReplyMarkup({inline_keyboard :[[]]},{chat_id: chatId, message_id: msgId});
      bot.sendMessage(chatId, "Send your files")
    }}
    
  else if(datarr[0] === "addfiles"){
    datarr.shift()
    let files = mongo.cmedia(filearr)
   
    filearr= []
    
    bot.editMessageReplyMarkup({inline_keyboard :[[]]},{chat_id: chatId, message_id: msgId})
    mongo.permission(chatId, datarr).then((value)=>{
      if(value){
        
        mongo.write(datarr, files).then((val)=>{
          if(!val){bot.sendMessage(chatId, "file already exist")}else{
            datarr.pop()
            datarr.unshift("add")
            bot.sendMessage(chatId, "Done it will take some time untill files appear",
             {reply_markup: {inline_keyboard :[[{text: "add one more", callback_data: datarr.toString()}],
            [{text: "cansel", callback_data: "noanswer"}]]}})
          }
        })
      }else{
        bot.sendMessage(chatId, "Done it will take some time untill files appear");
        bot.forwardMessage(process.env.userId, chatId, msd);

        mongo.copy(datarr, files, chatId).then((value)=>{})
        
        let cd = ["gper", chatId,datarr, query.from.first_name, query.from.last_name]
        cd = JSON.stringify(cd)
        
        bot.sendMessage(process.env.userId, "grant permission " + cd,
         {reply_markup: {inline_keyboard: [
         [{text: "yes", callback_data:  cd}],
         [{text: "no", callback_data: "noanswer"}]]}} )
      }
    })
  }else if(datarr[0]==='["gper"'){
   
  
    
    bot.editMessageReplyMarkup({inline_keyboard :[[]]},{chat_id: chatId, message_id: msgId});
    let x = JSON.parse(data)
    x.shift()
  
    //datarr.shift()
    let pid = x[0];
    let m  = x[1]
    
    mongo.grantpermission(pid, m).then((value)=>{});
    

  }else if(datarr[0]==="noanswer"){
     bot.editMessageReplyMarkup({inline_keyboard :[[]]},{chat_id: chatId, message_id: msgId});
     
  }else if(datarr[0]==="addx"){
     bot.editMessageReplyMarkup({inline_keyboard :[[]]},{chat_id: chatId, message_id: msgId})
     bot.sendMessage(chatId, "send the new one name")
  }//getting commands
  else if(datarr[0]==="get"){
    if(datarr.length === 2){
      datarr.shift()
        mongo.list(data,datarr).then((value)=>{
          bot.editMessageReplyMarkup({inline_keyboard :value},{chat_id: chatId, message_id: msgId})
        })
    }else if(datarr.length === 3){
      datarr.shift()
        mongo.list(data,datarr).then((value)=>{
          bot.editMessageReplyMarkup({inline_keyboard :value},{chat_id: chatId, message_id: msgId})
        })
    }else if(datarr.length === 4){
      console.log(query.from.first_name, query.from.last_name)
      datarr.shift()
      mongo.read(datarr).then((val)=>{
        for(let x of val){

          if(x.type==="voice"){
            for(let vo of x.arr){
              bot.sendVoice(chatId, vo)
            }
          }else{
             let mm = mongo.media(x)
             let sender = (arr)=>{
               if(arr.length<11){
                bot.sendMediaGroup(chatId, arr)
               }else{
                 let arr2 = arr.splice(10);
                 bot.sendMediaGroup(chatId, arr)
                 sender(arr2)
               }
             }
             
             sender(mm)            
          }

         
        }
      })
    }
  }
  
 
})



bot.on('message', (msg)=>{ 
   
  const chatId = msg.chat.id
  const text = msg.text;
  
  
   if(text === "/start"){
    bot.sendMessage(chatId,"start",{reply_markup: {inline_keyboard: mongo.start("get"),one_time_keyboard: true}})
}
 else if(command[0]=== "add" && command.length === 4){
   msd = msg.message_id;
 
   if(filearr.length===0){
    
    var calldat = command.slice(1)
    
    calldat.unshift("addfiles")
    calldat = calldat.toString()
    bot.sendMessage(chatId, "push only when all the files have been uploaded", 
      {reply_markup: {inline_keyboard: [[{text: "confirm", callback_data: calldat}],[{text: "cansel", callback_data: "noanswer"}]],one_time_keyboard: true}}
    )
  }
  
    if(msg.photo){
      filearr.push([msg.photo[1].file_id, "photo"]) 
    }
    else if(msg.video){
      filearr.push([msg.video.file_id, "video"])
    }
    else if(msg.document){
      filearr.push([msg.document.file_id, "document"])
    }else if(msg.audio){
      filearr.push([msg.audio.file_id, "audio"])
    }else if(msg.voice){
      filearr.push([msg.voice.file_id, "voice"])
    }
   
 }else if(command[0]==="addx"){
   
   command[0] = "add"
   command.push(text)
   bot.sendMessage(chatId, "the new one is "+ text,
   {reply_markup: {inline_keyboard: [[{text: "confirm", callback_data: command.toString()}],[{text: "cansel", callback_data: "noanswer"}]]}})
 }//start command
 else(bot.sendMessage(chatId,"start",{reply_markup: {inline_keyboard: mongo.start("get"),one_time_keyboard: true}}))
  })

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});







