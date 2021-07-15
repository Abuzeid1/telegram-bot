
require('dotenv').config()
const {MongoClient} = require("mongodb")
const uri = process.env.uri
const client = new MongoClient(uri, {
  useNewUrlParser: true,useUnifiedTopology: true,});


  
  
//manage connection mongodb
let con =  async ()=>{
  if (client.isConnected()){
  }else{await client.connect()}}

// list creator
module.exports.inline = (com,arr)=>{
  let markup = [[]]
  let div 
  if(arr.length>0){div=1}
  if(arr.length>4){div=2}
  if(arr.length>8){div=3}
  if(arr.length>12){div=4}
  if(!com){com =""}
  
    let x = 0;
    let counter = 0;
    for(let n of arr){
      if(counter%div===0 && counter!=0){
        markup.push([])
        x += 1
      }
      counter += 1
      markup[x].push({text:n,callback_data:com+","+n})
    }
 

  if(com != "get,41"){com = com.split(",")
    com.pop()
    com = com.toString()
    if(com===""){com ="0"}
    markup.push([{text:"<< Back",callback_data:com}])}
  return markup
}

//start menu
// module.exports.start = (com)=>{
//     let arr = this.inline(com, variable.subject["32"])
//     return arr
//   }
// console.log(this.start())

//buttons of the lists type && number

module.exports.list =async (com, datarr)=>{
  console.log(datarr  )
  await con()
const db = client.db(datarr[0]);
const dbo =  db.collection(datarr[1].toString());
  //nums
if(datarr[2]){
  const doc =  await dbo.findOne({_id: datarr[2]})
  let nums = Object.keys(doc).filter(item => item != "_id")
  return  this.inline(com, nums)
  //types
}else{
  const types = await dbo.find({},{_id:1}).map(function(item){ return item._id; }).toArray();
  console.log(types)
  return  this.inline(com, types)
}}

//media group

module.exports.media = (obj)=>{
  let group = []; 
  for(let n of obj.arr){
     group.push({type: obj.type, media: n})
  }
  return group
}

//construct media group
module.exports.cmedia =(arr)=>{
  let resultarr=[];
  for(let n of arr){
   let index =  resultarr.findIndex((el)=>{return el.type == n[1]})
   if(index === -1){
     resultarr.push({arr: [n[0]], type: n[1]})
   }else{
    resultarr[index].arr.push( n[0])
   }
  }
  return resultarr
}



//write new document
module.exports.write = async(datarr, files) => {
  
    await con()
    const db =   client.db(datarr[0]);
    const dbco =  db.collection(datarr[1]);
      await dbco.updateOne({_id: datarr[2]},{$set: { [datarr[3]]: files}}, {upsert: true})
      await this.new(datarr).then()
      return true
    
  }
  // this.write(["47", "10", "6", "13"], [8,2,3,4,5,6,7,8,9,10,11])
//read document
module.exports.read = async(arr)=>{
  await con();
  const db =  client.db(arr[0]);
  const dbco = db.collection(arr[1])
  let doc = await dbco.findOne({_id: arr[2]})
  return doc[arr[3]]
}

// update new arr

module.exports.new= async(xmo)=>{
  
  await con()
  const db =   client.db("new");
  const dbco =  db.collection("new");
  let farr = []
 
  if(!xmo){
    let doc = await dbco.findOne({_id: "new"})
    
    for(let n of doc.arr){
      let x = n.toString()
      farr.push([{text: x.replaceAll(",", " "), callback_data:"get," +x}])
    }
    farr.push([{text: "<<back", callback_data:"get"}])
    return farr
  }
  else{
      dbco.updateOne({_id: "new"},{$pop:{arr: 1}})
      dbco.updateOne({_id: "new"},{$push: {arr:{$each: [xmo],$position: 0}}})
      return
      }}




//granting permission

module.exports.grantpermission = async(id , arr)=>{
  await con()
  const db = client.db("permission");
  const dbco =  db.collection(id.toString());
  dbco.updateOne({_id: arr[0]},{$push: {[arr[1]]: arr[2]}},{upsert: true})
  this.retrieve(id, arr).then((val)=>{this.write(arr, val)})
  return true
}
//checking permission

module.exports.permission =async(id, arr)=>{
  await con()
  const db = client.db("permission");
  const dbco =  db.collection(id.toString());
  const doc = await dbco.findOne({_id: arr[0]});
  console.log(doc)
  if(doc){
    let  check = doc[arr[1]];
    
    if(check){
      if(check.indexOf(arr[2]) != -1){return true}
    }
    
    return false
  }
  return false
}


module.exports.count=async (arr)=>{
  await con();
  const db = await client.db(arr[0]);
  const dbco =  db.collection(arr[1]);
  let doc =await  dbco.findOne({_id: arr[2]})
  if(doc){return Object.keys(doc).length}
  return "1"
}

// console.log(this.count(["32", "pharmacology", "Data"]))

module.exports.copy = async(arr, files, id)=>{
  await con();
  const db =  client.db("copy");
    const dbco = db.collection(id.toString())
    if(! await dbco.findOne({arr: arr})){dbco.insertOne({arr: arr, files: files})
      return true
    }
    return false
}
 

module.exports.retrieve = async(id , arr)=>{
  await con();
  const db =  client.db("copy");
  const dbco = db.collection(id.toString())
  let doc = await dbco.findOne({arr: arr})
  return doc.files
}





