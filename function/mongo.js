import dotenv from "dotenv";
import mongodb from "mongodb";
const MongoClient = mongodb.MongoClient;
import { subject } from "./variable.js";
dotenv.config();
const uri = process.env.uri;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//manage connection mongodb
let con = async () => {
  if (client.isConnected()) {
  } else {
    await client.connect();
  }
};

//write new document
let write = async (datarr, files) => {
  await con();
  const db = client.db(datarr[0]);
  const dbco = db.collection(datarr[1]);
  await dbco.updateOne(
    { _id: datarr[2] },
    { $set: { [datarr[3]]: files } },
    { upsert: true }
  );
  await newitems(datarr).then();
  return true;
};

//read function for list
let read = async (arr) => {
  try {
    arr.shift();
    if (arr.length === 1) {
      return subject[arr[0]];
    } else {
      // read from database
      await con();
      const db = client.db(arr[0]);
      // types
      const dbo = db.collection(arr[1]);
      if (arr.length === 2) {
        const types = await dbo
          .find({}, { _id: 1 })
          .map(function (item) {
            return item._id;
          })
          .toArray();
        return types;
      } else {
        let doc = await dbo.findOne({ _id: arr[2] });

        if (arr.length === 3) {
          let nums = Object.keys(doc).filter((item) => item != "_id");

          return nums;
        } // return media ids
        else if (arr.length === 4) {
          return doc[arr[3]];
        }
      }
    }
  } catch (err) {
    return ["1"];
  }
};

//create new list
let newitems = async (newItem) => {
  await con();
  const db = client.db("new");
  const dbco = db.collection("new");
  let newArr = [];

  if (!newItem) {
    let doc = await dbco.findOne({ _id: "new" });

    doc.arr.forEach((element) => {
      let text = element.slice(1);

      text[0] = subject[element[0]][element[1]];
      text = text.toString();

      newArr.push([
        {
          text: text.replaceAll(",", " "),
          callback_data: "get," + element.toString(),
        },
      ]);
    });
    newArr.push([{ text: "<<back", callback_data: "get,32" }]);
    return newArr;
  } else {
    dbco.updateOne({ _id: "new" }, { $pop: { arr: 1 } });
    dbco.updateOne(
      { _id: "new" },
      { $push: { arr: { $each: [newItem], $position: 0 } } }
    );
    return;
  }
};

//granting permission

let grantpermission = async (id, arr) => {
  await con();
  const db = client.db("permission");
  const dbco = db.collection(id.toString());
  dbco.updateOne(
    { _id: arr[0] },
    { $push: { [arr[1]]: arr[2] } },
    { upsert: true }
  );
  retrieve(id, arr).then((val) => {
    write(arr, val);
  });
  return true;
};

//check permission
let permission = async (id, arr) => {
  await con();
  const db = client.db("permission");
  const dbco = db.collection(id.toString());
  const doc = await dbco.findOne({ _id: arr[0] });

  if (doc) {
    let check = doc[arr[1]];

    if (check) {
      if (check.indexOf(arr[2]) != -1) {
        return true;
      }
    }

    return false;
  }
  return false;
};
// create temporary memory untill given permission
let copy = async (arr, files, id) => {
  await con();
  const db = client.db("copy");
  const dbco = db.collection(id.toString());
  if (!(await dbco.findOne({ arr: arr }))) {
    dbco.insertOne({ arr: arr, files: files });
    return true;
  }
  return false;
};

// retrive from temporary file after given permisssion
let retrieve = async (id, arr) => {
  await con();
  const db = client.db("copy");
  const dbco = db.collection(id.toString());
  let doc = await dbco.findOne({ arr: arr });
  return doc.files;
};

export { write, read, grantpermission, permission, copy, newitems };
