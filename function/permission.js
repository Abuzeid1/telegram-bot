//check permission
import { write } from "./mongo.js";
import { client } from "../index.js";
//manage connection mongodb
let con = async () => {
  if (client.isConnected()) {
  } else {
    await client.connect();
  }
};

let permission = async (id, arr) => {
  await con();
  const dbo = client.db("data").collection("permission");
  const doc = await dbo.findOne({
    id: id.toString(),
    year: arr[0],
    subject: arr[1],
    type: arr[2],
  });

  if (doc) {
    return true;
  }
  return false;
};

// grant new permission
let grantpermission = async (id, arr) => {
  await con();
  const dbo = client.db("data").collection("permission");
  dbo.insertOne({
    id: id,
    year: arr[0],
    subject: arr[1],
    type: arr[2],
  });

  retrieve(id, arr);
  return true;
};
// create temporary memory untill given permission
let copy = async (arr, files, id) => {
  await con();
  const dbo = client.db("data").collection("await");
  dbo.insertOne({
    id: id.toString(),
    year: arr[0],
    subject: arr[1],
    type: arr[2],
    number: arr[3],
    arr: files,
  });
};

// retrive from temporary file after given permisssion
let retrieve = async (id, arr) => {
  await con();

  const dbo = client.db("data").collection("await");
  await dbo
    .findOne({
      id: id,
      year: arr[0],
      subject: arr[1],
      type: arr[2],
      number: arr[3],
    })
    .then((el) => {
      write(arr, el.arr);
    });

  // write(arr, await doc.arr);
};

export { grantpermission, permission, copy };
