require('dotenv').config()
const {MongoClient} = require("mongodb")
const uri = process.env.uri
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let con =  async ()=>{
  if (client.isConnected()){

  }else{
     await client.connect()
  }
}


module.exports.inline = (com, arr, div)=>{
  arr.sort()
  let markup = [[]]
  if(!com){com =""}
  if(div){
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
  }else{
    for(let n of arr){
    markup.push([{text:n,callback_data:com+","+n}])
  }}

  if(com != "get"){com = com.split(",")
    com.pop()
    com = com.toString()
    if(com===""){com ="0"}
    
      markup.push([{text:"<< Back",callback_data:com}])}
    
    
  return markup
}

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

//buttons of the lists type && number

module.exports.list =async (com, datarr)=>{
  
    await con()
  const db = client.db(datarr[0]);
    //nums
  if(datarr[1]){
    const dbco =  db.collection(datarr[1]);
    const nums =  await dbco.find({},{_id:1}).map(function(item){ return item._id; }).toArray();
    return  this.inline(com, nums, 3)
    //types
  }else{
    const types = await db.listCollections().map(function(item){ return item.name; }).toArray();
    return  this.inline(com, types)
  }
  }

//add new document
module.exports.write = async(datarr, files) => {
  
    await con()
    const db =   client.db(datarr[0]);
    const dbco =  db.collection(datarr[1]);
    let doc =await  dbco.findOne({_id: datarr[2]})
    
    if(!doc){
      await dbco.insertOne({_id: datarr[2],arr: files})
      await this.new(datarr).then()
      return true
    }else{

      }
      return false
  }
//  this.write(["47", "10", "6"], [1,2,3,4,5,6,7,8,9,10,11])

//new 

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
      }
}



module.exports.permission =async(id, arr)=>{
  
  await con()
  const db = client.db("permission");
  const dbco =  db.collection(id.toString());
  const doc = await dbco.findOne({_id: arr[0]});
  
  if(doc){
    let  check = doc.arr;
    if(check.indexOf(arr[1]) != -1){
      return true
    }
    return false
  }
  return false
}
//granting permission

module.exports.grantpermission = async(id , arr)=>{
  await con()
  const db = client.db("permission");
  const dbco =  db.collection(id.toString());
  const doc = await dbco.findOne({_id: arr[0]});
  if(doc){
      dbco.updateOne({_id: arr[0]},{$push: {arr: arr[1]}} )
  }else{  
    await dbco.insertOne({_id: arr[0], arr: [arr[1]]})
  }
  this.retrieve(id, arr).then((val)=>{this.write(arr, val)})
  return true
}


module.exports.start =(com)=>{
  let subjects = ['bacteriology', 'clinical', 'parasitology', 'pathology', 'pharmacology', 'poultry', 'virology']
  let arr = this.inline(com, subjects, 2)
  if(com ==="get"){arr.push([{text: "add", callback_data: "add"}, {text: "new", callback_data: "new"}])};
  return arr
}

module.exports.count=async (arr)=>{
 try {
  await con();
  const db = await client.db(arr[0]);
  const dbco =  db.collection(arr[1]);
  let c = await dbco.countDocuments()
  return c+1
}finally{
  }
}



module.exports.copy = async(arr, files, id)=>{
  await con();
  const db =  client.db("copy");
    const dbco = db.collection(id.toString())
    if(! await dbco.findOne({arr: arr})){
      dbco.insertOne({arr: arr, files: files})
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

module.exports.read = async(arr)=>{

  await con();
  const db =  client.db(arr[0]);
  const dbco = db.collection(arr[1])
  let doc = await dbco.findOne({_id: arr[2]})
  return doc.arr
}


